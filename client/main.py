import time
import mysql.connector
import json
import os

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
SCHEMA = {"sensor_id": "string", "x": "float", "y": "float"}

with open(os.path.join(PROJECT_DIR, "config.json")) as f:
    SQL_CONFIG = json.load(f)["sql"]
    SQL_USER = SQL_CONFIG["user"]
    SQL_PASSWORD = SQL_CONFIG["password"]
    SQL_DATABASE = SQL_CONFIG["database"]
    SQL_TABLE = SQL_CONFIG["table"]
    assert all(
        [isinstance(x, str) for x in [SQL_USER, SQL_PASSWORD, SQL_DATABASE, SQL_TABLE]]
    ), "config not in a valid format"


def validate_schema_format():
    for key, data_type in SCHEMA.items():
        assert isinstance(key, str), "schema key has to be a string"
        assert all(
            [c == "_" or ord(c) in range(ord("a"), ord("z") + 1) for c in key]
        ), "only lowercase letters and underscores allowed in keys"
        assert "id" not in SCHEMA.keys(), '"id" not allowed as key'
        allowed_types = ["string", "int", "float"]
        assert data_type in allowed_types, f"allowed datatypes: {allowed_types}"


def validate_data_format(data: dict):
    assert isinstance(data, dict), "data has to be in dict format"
    for key in data.keys():
        assert key in SCHEMA.keys(), f'unknown key "{key}" in data'
    for key, data_type in SCHEMA.items():
        assert key in data.keys(), f'missing key "{key}" in data'
        if data_type == "string":
            assert isinstance(data[key], str), f"data[{key}] should be a string"
            assert len(data[key]) < 32, "data[{key}] is longer than 31 character"
        if data_type == "int":
            assert isinstance(data[key], int), f"data[{key}] should be an integer"
        if data_type == "float":
            assert isinstance(data[key], int | float), f"data[{key}] should be a number"


def create_table(connection: mysql.connector.MySQLConnection):
    cursor = connection.cursor()
    sql_types = {"string": "VARCHAR(32)", "float": "FLOAT", "int": "INT"}
    columns = [f"{key} {sql_types[value]}" for key, value in SCHEMA.items()]
    sql_statement = (
        f"CREATE TABLE {SQL_TABLE} (ID INT NOT NULL AUTO_INCREMENT, "
        + f"{' ,'.join(columns)}"
        + ", PRIMARY KEY (ID));"
    )
    cursor.execute(sql_statement, ())
    connection.commit()
    print(f"table {SQL_TABLE} created")


def table_exists(connection: mysql.connector.MySQLConnection):
    cursor = connection.cursor()
    cursor.execute("SHOW TABLES", ())
    return SQL_TABLE in [r[0] for r in cursor.fetchall()]


def insert_data(connection: mysql.connector.MySQLConnection, data: dict):
    validate_data_format(data)

    try:
        cursor = connection.cursor()
        keys = data.keys()
        values = [str(data[key]) for key in keys]
        sql_statement = (
            f"INSERT INTO {SQL_TABLE} "
            + f"({', '.join(keys)})"
            + " VALUES "
            + f"({', '.join(['%s']*len(keys))})"
        )
        print(f"sql statement: \"{sql_statement.replace('%s', '{}').format(*values)}\"")
        cursor.execute(sql_statement, values)
        connection.commit()
        assert cursor.rowcount == 1, "Row could not be inserted - reason unknown"
    except Exception as e:
        raise Exception(f"Error when performing insert: {e}")


def read_latest_n_records(connection: mysql.connector.MySQLConnection, n: int):
    cursor = connection.cursor()
    cursor.execute(f"SELECT * FROM {SQL_TABLE} ORDER BY ID DESC LIMIT {n}", ())
    return cursor.fetchall()


def main():
    validate_schema_format()

    try:
        connection: mysql.connector.MySQLConnection = mysql.connector.connect(
            host="esm-mysql-public-do-user-7320955-0.b.db.ondigitalocean.com",
            port=25060,
            user=SQL_USER,
            password=SQL_PASSWORD,
            database=SQL_DATABASE,
        )
    except Exception as e:
        raise Exception(f"Could not connect to database: {e}")

    if not table_exists(connection):
        create_table(connection)

    print("latest 10 records: ", read_latest_n_records(connection, 10))

    insert_data(connection, {"sensor_id": "sensor-1", "x": 40, "y": 100})
    insert_data(connection, {"sensor_id": "sensor-2", "x": 40, "y": 120})

    time.sleep(5)

    insert_data(connection, {"sensor_id": "sensor-1", "x": 45, "y": 80})
    insert_data(connection, {"sensor_id": "sensor-2", "x": 45, "y": 130})

    time.sleep(5)

    insert_data(connection, {"sensor_id": "sensor-1", "x": 50, "y": 70})
    insert_data(connection, {"sensor_id": "sensor-2", "x": 50, "y": 150})

    connection.close()


if __name__ == "__main__":
    main()
