import mysql.connector
from datetime import datetime, timedelta

from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.routing import Route
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware

connection: mysql.connector.MySQLConnection = mysql.connector.connect(
    host="esm-mysql-public-do-user-7320955-0.b.db.ondigitalocean.com",
    port=25060,
    user="public",
    password="AVNS_dCglpmL1fML93ap",
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
    if datapoint[1] != date:
        datapoint[1] = date
        datapoint[2] -= 24
    return datapoint


def get_schema(request):
    try:
        cursor = connection.cursor()
    except mysql.connector.errors.OperationalError:
        return JSONResponse({"message": "too many requests"}, status_code=500)
    cursor.execute(
        "SELECT table_schema, table_name, column_name, data_type "
        + "FROM information_schema.columns WHERE "
        + "    (table_schema != 'information_schema') AND (is_nullable = 'NO') AND "
        + "    ( "
        + "        (column_name = 'ID' AND column_key = 'PRI' AND extra = 'auto_increment') "
        + "        OR "
        + "        (column_name != 'ID' AND column_key = '' AND extra = '') "
        + "    );",
        (),
    )
    result_rows = cursor.fetchall()
    schema = {}
    for database_name, table_name, column_name, column_type in result_rows:
        if database_name not in schema.keys():
            schema[database_name] = {}
        if table_name not in schema[database_name].keys():
            schema[database_name][table_name] = {}
        schema[database_name][table_name][column_name] = column_type

    clean_schema = {}

    for database_name in schema.keys():
        for table_name in schema[database_name].keys():
            try:
                column_names = schema[database_name][table_name].keys()
                assert len(column_names) > 4
                assert schema[database_name][table_name]["ID"] == "int"
                assert schema[database_name][table_name]["date"] == "int"
                assert schema[database_name][table_name]["hour"] == "float"
                assert schema[database_name][table_name]["sensor"] == "varchar"
                data_column_names = list(
                    filter(
                        lambda c: c not in ["ID", "date", "hour", "sensor"],
                        column_names,
                    )
                )
                assert all(
                    [
                        schema[database_name][table_name][c] == "float"
                        for c in data_column_names
                    ]
                )
                if database_name not in clean_schema.keys():
                    clean_schema[database_name] = {}
                clean_schema[database_name][table_name] = data_column_names
            except (AssertionError, KeyError) as e:
                pass

    cursor.close()
    return JSONResponse(clean_schema)


def get_data(request):
    try:
        database_name = request.query_params["database"]
        table_name = request.query_params["table"]
        assert string_is_clean(database_name)
        assert string_is_clean(table_name)
    except KeyError:
        return JSONResponse(
            {"message": "missing or invalid query parameters"}, status_code=400
        )

    try:
        cursor = connection.cursor()
    except mysql.connector.errors.OperationalError:
        return JSONResponse({"message": "too many requests"}, status_code=500)

    try:
        cursor.execute(
            f"SELECT date, hour FROM {database_name}.{table_name} "
            + "ORDER BY date DESC, hour DESC LIMIT 1",
            (),
        )
        result_rows = cursor.fetchall()
    except mysql.connector.errors.ProgrammingError:
        cursor.close()
        return JSONResponse({"message": "invalid database/table"}, status_code=400)

    if len(result_rows) == 0:
        cursor.close()
        return JSONResponse([])

    # Starting with the newest measurement, return the newest 24 hours of data
    newest_date, newest_hour = result_rows[0]
    oldest_date = datetime.strftime(
        datetime.strptime(str(newest_date), "%Y%m%d") - timedelta(days=1), "%Y%m%d"
    )
    cursor.execute(
        f"SELECT * FROM {database_name}.{table_name} WHERE ("
        + f"  (date = {newest_date}) OR "
        + f"  ((date = {oldest_date}) AND (hour >= {newest_hour}))"
        + ") ORDER BY date DESC, hour DESC",
        (),
    )
    results = cursor.fetchall()
    cursor.close()
    return JSONResponse(
        list(map(lambda d: enforce_date_on_datapoint(newest_date, d), results))
    )


def get_meta_data(request):
    try:
        database_name = request.query_params["database"]
        table_name = request.query_params["table"]
        assert string_is_clean(database_name)
        assert string_is_clean(table_name)
    except KeyError:
        return JSONResponse(
            {"message": "missing or invalid query parameters"}, status_code=400
        )

    assert string_is_clean(database_name)
    assert string_is_clean(table_name)

    try:
        cursor = connection.cursor()
    except mysql.connector.errors.OperationalError:
        return JSONResponse({"message": "too many requests"}, status_code=500)

    try:
        cursor.execute(
            "SELECT column_name, unit, description "
            + f"FROM {database_name}.column_meta_data WHERE "
            + f"table_name='{table_name}'",
            (),
        )
        result_rows = cursor.fetchall()
        cursor.close()
    except mysql.connector.errors.ProgrammingError:
        cursor.close()
        return JSONResponse({"message": "invalid database/table"}, status_code=400)

    meta_data = {}
    for column_name, unit, description in result_rows:
        if unit == "null":
            unit = None
        if description == "null":
            description = None
        meta_data[column_name] = {"unit": unit, "description": description}
    return JSONResponse(meta_data)


app = Starlette(
    routes=[
        Route("/schema", get_schema),
        Route("/data", get_data),
        Route("/meta-data", get_meta_data),
    ],
    middleware=[Middleware(CORSMiddleware, allow_origins=["*"])],
)
