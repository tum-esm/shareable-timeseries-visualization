import os
from datetime import datetime, timedelta

import databases
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MYSQL_URL = os.environ.get("MYSQL_URL")
MYSQL_USER = os.environ.get("MYSQL_USER")
MYSQL_PASSWORD = os.environ.get("MYSQL_PASSWORD")
MYSQL_PORT = 25060
assert isinstance(MYSQL_URL, str)
assert isinstance(MYSQL_USER, str)
assert isinstance(MYSQL_PASSWORD, str)

CONNECTION_STRING = (
    f"mysql://{MYSQL_USER}:{MYSQL_PASSWORD}@"
    + f"{MYSQL_URL}:{MYSQL_PORT}?ssl-mode=REQUIRED"
)
db = databases.Database(CONNECTION_STRING, echo=True)

EXPECTED_META_COLUMNS = [
    ["column_name", "varchar", "NO", "PRI"],
    ["decimal_places", "int", "YES", ""],
    ["description", "varchar", "YES", ""],
    ["minimum", "float", "YES", ""],
    ["table_name", "varchar", "NO", "PRI"],
    ["unit", "varchar", "YES", ""],
]

EXPECTED_DATA_COLUMNS = [
    ["ID", "int", "NO", "PRI"],
    ["date", "int", "NO", ""],
    ["hour", "float", "NO", ""],
    ["sensor", "varchar", "NO", ""],
]


async def run_sql_query(query):
    # TODO: Return 404 if database is offline
    try:
        return await db.fetch_all(query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"sql_query_failed: {e}")


def validate_query_params(database: str, table: str):
    try:
        assert string_is_clean(database)
        assert string_is_clean(table)
    except AssertionError:
        raise HTTPException(
            status_code=400, detail="missing or invalid query parameters"
        )


def string_is_clean(string: str):
    for character in string:
        if character == "_":
            continue
        if ord(character) >= ord("a") and ord(character) <= ord("z"):
            continue
        if ord(character) >= ord("A") and ord(character) <= ord("Z"):
            continue
        if ord(character) >= ord("0") and ord(character) <= ord("9"):
            continue
        return False
    return True


def enforce_date_on_datapoint(date: int, datapoint: tuple):
    new_datapoint = list(datapoint)
    if new_datapoint[1] != date:
        new_datapoint[1] = date
        new_datapoint[2] -= 24
    return new_datapoint


def unique(xs: list):
    new_xs = []
    for x in xs:
        if x not in new_xs:
            new_xs.append(x)
    return new_xs


@app.on_event("startup")
async def startup():
    await db.connect()


@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()


@app.get("/schema")
async def get_schema():
    all_schema_rows = await run_sql_query(
        "SELECT table_schema, table_name, column_name, data_type, is_nullable, column_key "
        + "FROM information_schema.columns WHERE table_schema LIKE 'stv_%' "
        + "ORDER BY ordinal_position;",
    )
    schema: dict[str, dict[str, list[str]]] = {}
    messages = []

    # 1. Gather all database names where the
    #    database has a valid meta data table
    database_names = unique(list(map(lambda r: r[0], all_schema_rows)))
    for database_name in database_names:
        try:
            meta_table_schema_rows = list(
                sorted(
                    list(
                        filter(
                            lambda r: r[0] == database_name
                            and r[1] == "column_meta_data",
                            all_schema_rows,
                        )
                    ),
                    key=lambda r: r[2],
                )
            )

            assert len(meta_table_schema_rows) == len(
                EXPECTED_META_COLUMNS
            ), "too many meta columns"
            for column_index in range(len(EXPECTED_META_COLUMNS)):
                for property_index in range(len((EXPECTED_META_COLUMNS[column_index]))):
                    a = meta_table_schema_rows[column_index][property_index + 2]
                    b = EXPECTED_META_COLUMNS[column_index][property_index]
                    assert (
                        a == b
                    ), f"meta column {column_index} propetry {property_index} invalid ({a}, {b})"

            # now we can assume the meta data table to be valid for this database
            schema[database_name] = {}

        except AssertionError as e:
            messages.append(f"Invalid database '{database_name}': {e}")
            continue

    # 2. For all valid databases gather all tables
    #    (and columns names) in a valid format
    for database_name in schema.keys():
        table_names = unique(
            [
                r[1]
                for r in all_schema_rows
                if (r[0] == database_name and r[1] != "column_meta_data")
            ]
        )
        for table_name in table_names:
            column_names = []
            try:
                data_table_schema_rows = list(
                    filter(
                        lambda r: r[0] == database_name and r[1] == table_name,
                        all_schema_rows,
                    )
                )

                # check the required columns (ID, date, hour, sensor)
                for i in range(len(EXPECTED_DATA_COLUMNS)):
                    for j in range(len(EXPECTED_DATA_COLUMNS[i])):
                        column_name = EXPECTED_DATA_COLUMNS[i][0]
                        assert (
                            data_table_schema_rows[i][2 + j]
                            == EXPECTED_DATA_COLUMNS[i][j]
                        ), f"column '{column_name}' is invalid "

                # at least one data column
                assert len(data_table_schema_rows) > len(
                    EXPECTED_DATA_COLUMNS
                ), "no data columns"

                # check the data columns (all nullable floats, no primary keys)
                for i in range(len(EXPECTED_DATA_COLUMNS), len(data_table_schema_rows)):
                    for index, label, expected_value in [
                        (3, "data_type", "float"),
                        (4, "is_nullable", "YES"),
                        (5, "column_key", ""),
                    ]:
                        column_name = data_table_schema_rows[i][2]
                        actual_value = data_table_schema_rows[i][index]
                        assert actual_value == expected_value, (
                            f"column '{column_name}' is invalid ({label}: "
                            + f"'{actual_value}' is not '{expected_value}'"
                        )
                    column_names.append(column_name)

            except AssertionError as e:
                messages.append(f"Invalid table '{database_name}'.'{table_name}': {e}")
                continue

            schema[database_name][table_name] = column_names

    # 3. Remove all databases without a valid table and
    #    rename databases from "stv_xxx" to "xxx"
    clean_schema = {k[4:]: v for k, v in schema.items() if len(v.keys()) > 0}

    return {"schema": clean_schema, "messages": messages}


@app.get("/data")
async def get_data(database: str = None, table: str = None):
    validate_query_params(database, table)

    result_rows_1 = await run_sql_query(
        f"SELECT date, hour FROM stv_{database}.{table} "
        + "ORDER BY date DESC, hour DESC LIMIT 1"
    )

    if len(result_rows_1) == 0:
        return []

    # Starting with the newest measurement, return the newest 24 hours of data
    newest_date, newest_hour = result_rows_1[0]
    oldest_date = datetime.strftime(
        datetime.strptime(str(newest_date), "%Y%m%d") - timedelta(days=1), "%Y%m%d"
    )
    result_rows_2 = await run_sql_query(
        f"SELECT * FROM stv_{database}.{table} WHERE ("
        + f"  (date = {newest_date}) OR "
        + f"  ((date = {oldest_date}) AND (hour >= {newest_hour}))"
        + ") ORDER BY date DESC, hour DESC"
    )
    return list(map(lambda d: enforce_date_on_datapoint(newest_date, d), result_rows_2))


@app.get("/meta-data")
async def get_meta_data(database: str = None, table: str = None):
    validate_query_params(database, table)

    result_rows = await run_sql_query(
        "SELECT column_name, unit, description, minimum, detection_limit, decimal_places "
        + f"FROM stv_{database}.column_meta_data WHERE "
        + f"table_name='{table}'"
    )

    meta_data = {}
    for row in result_rows:
        row = list(row)
        row[1:] = [None if x == "null" else x for x in row[1:]]
        meta_data[row[0]] = {
            "unit": row[1],
            "description": row[2],
            "minimum": row[3],
            "detection_limit": row[4],
            "decimal_places": row[5],
        }
    return meta_data
