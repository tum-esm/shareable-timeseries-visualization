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

db = databases.Database(
    f"mysql://{MYSQL_URL}:{MYSQL_PASSWORD}@{MYSQL_URL}:{MYSQL_PORT}?ssl-mode=REQUIRED",
    echo=True,
)


async def run_sql_query(query):
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


@app.on_event("startup")
async def startup():
    await db.connect()


@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()


@app.get("/schema")
async def get_schema():
    result_rows = await run_sql_query(
        "SELECT table_schema, table_name, column_name, data_type, is_nullable, ORDINAL_POSITION "
        + "FROM information_schema.columns WHERE "
        + "    (table_schema != 'information_schema' AND table_name != 'column_meta_data') AND "
        + "    ( "
        + "        (column_name = 'ID' AND column_key = 'PRI' AND extra = 'auto_increment') "
        + "        OR "
        + "        (column_name != 'ID' AND column_key = '' AND extra = '') "
        + "    ) ORDER BY ORDINAL_POSITION;",
    )
    schema = {}
    for (
        database_name,
        table_name,
        column_name,
        column_type,
        is_nullable,
        position,
    ) in result_rows:
        if database_name not in schema.keys():
            schema[database_name] = {}
        if table_name not in schema[database_name].keys():
            schema[database_name][table_name] = []
        schema[database_name][table_name].append(
            (column_name, column_type, is_nullable == "YES")
        )

    clean_schema = {}

    for database_name in schema.keys():
        for table_name in schema[database_name].keys():
            try:
                columns = schema[database_name][table_name]
                assert len(columns) > 4

                def get_column_by_name(column_name):
                    result = list(
                        filter(
                            lambda c: c[0] == column_name,
                            columns,
                        )
                    )
                    return None if (len(result) == 0) else result[0]

                assert get_column_by_name("ID") == ("ID", "int", False)
                assert get_column_by_name("date") == ("date", "int", False)
                assert get_column_by_name("hour") == ("hour", "float", False)
                assert get_column_by_name("sensor") == ("sensor", "varchar", False)

                data_columns = list(
                    filter(
                        lambda c: c[0] not in ["ID", "date", "hour", "sensor"],
                        columns,
                    )
                )
                assert all([c[1] == "float" for c in data_columns])

                # assert all([c[2] for c in data_columns])
                if database_name not in clean_schema.keys():
                    clean_schema[database_name] = {}
                clean_schema[database_name][table_name] = [c[0] for c in data_columns]
            except (AssertionError, KeyError) as e:
                pass

    return clean_schema


@app.get("/data")
async def get_data(database: str = None, table: str = None):
    validate_query_params(database, table)

    result_rows_1 = await run_sql_query(
        f"SELECT date, hour FROM {database}.{table} "
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
        f"SELECT * FROM {database}.{table} WHERE ("
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
        + f"FROM {database}.column_meta_data WHERE "
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
