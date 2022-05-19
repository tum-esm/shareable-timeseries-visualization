from datetime import datetime
import mysql.connector
import os
import json

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))


class STVClient:
    def __init__(self, schema: dict, database_name: str, table_name: str):
        try:
            with open(os.path.join(PROJECT_DIR, "config.json")) as f:
                CONFIG = json.load(f)
                SQL_USER = CONFIG["sql"]["user"]
                SQL_PASSWORD = CONFIG["sql"]["password"]
                assert isinstance(SQL_USER, str)
                assert isinstance(SQL_PASSWORD, str)
        except (AssertionError, KeyError) as e:
            raise Exception(f"Unable to load config.json: {e}")

        self.schema = schema
        self.database_name = database_name
        self.table_name = table_name

        self.validate_schema_format()

        self.connection: mysql.connector.MySQLConnection = mysql.connector.connect(
            host="esm-mysql-public-do-user-7320955-0.b.db.ondigitalocean.com",
            port=25060,
            user=SQL_USER,
            password=SQL_PASSWORD,
            database=database_name,
        )
        if not self.table_exists():
            self.create_table()
        # TODO: drop and recreate table on schema change

    def validate_schema_format(self):
        reserved_keys = ["id", "date", "hour"]
        allowed_types = ["string", "float"]
        try:
            for key, data_type in self.schema.items():
                assert isinstance(key, str), "key has to be a string"
                assert all(
                    [c == "_" or ord(c) in range(ord("a"), ord("z") + 1) for c in key]
                ), "only lowercase letters and underscores allowed in keys"
                assert key not in reserved_keys, "the keys {reserved_keys} are reserved"
                assert data_type in allowed_types, f"allowed datatypes: {allowed_types}"
        except AssertionError as e:
            raise Exception(f"Invalid schema: {e}")

    def validate_data_format(self, data: dict):
        try:
            assert isinstance(data, dict), "pass data in dict format"
            assert sorted(data.keys()) == sorted(
                self.schema.keys()
            ), "data.keys != schema.keys"

            for key, data_type in self.schema.items():
                if data_type == "string":
                    assert isinstance(data[key], str), f"type(data[{key}]) != string"
                    assert len(data[key]) < 32, "len(data[{key}]) >= 31 characters"
                else:
                    assert isinstance(
                        data[key], int | float
                    ), f"type(data[{key}]) != number"
        except AssertionError as e:
            raise Exception(f"Invalid data format: {e}")

    def create_table(self):
        cursor = self.connection.cursor()
        sql_types = {"string": "VARCHAR(32)", "float": "FLOAT", "int": "INT"}
        columns = [f"{key} {sql_types[value]}" for key, value in self.schema.items()]
        sql_statement = (
            f"CREATE TABLE {self.table_name} ("
            + "ID INT NOT NULL AUTO_INCREMENT, "
            + "date INT NOT NULL, "
            + "hour FLOAT NOT NULL, "
            + f"{' ,'.join(columns)}"
            + ", PRIMARY KEY (ID));"
        )
        cursor.execute(sql_statement, ())
        self.connection.commit()
        print(f"table {self.table_name} created: {sql_statement}")

    def table_exists(self):
        cursor = self.connection.cursor()
        cursor.execute("SHOW TABLES", ())
        return self.table_name in [r[0] for r in cursor.fetchall()]

    def insert_data(self, data: dict):
        self.validate_data_format(data)
        now = datetime.now()
        date = now.strftime("%Y%m%d")
        hour = round(
            (
                now.hour
                + (now.minute / 60.0)
                + (now.second / 3600.0)
                + (now.microsecond / (3_600_000_000.0))
            ),
            6,
        )

        try:
            cursor = self.connection.cursor()
            keys = data.keys()
            values = [str(data[key]) for key in keys]
            sql_statement = (
                f"INSERT INTO {self.table_name} "
                + f"(date, hour, {', '.join(keys)})"
                + " VALUES "
                + f"({date}, {hour}, {', '.join(['%s']*len(keys))})"
            )
            print(
                f"SQL statement: \"{sql_statement.replace('%s', '{}').format(*values)}\""
            )
            cursor.execute(sql_statement, values)
            self.connection.commit()
            assert cursor.rowcount == 1, "Row could not be inserted - reason unknown"
        except Exception as e:
            raise Exception(f"Error when performing insert: {e}")

    def get_latest_n_records(self, n: int):
        cursor = self.connection.cursor()
        cursor.execute(
            f"SELECT * FROM {self.table_name} ORDER BY ID DESC LIMIT {n}", ()
        )
        return cursor.fetchall()

    def execute_sql_statement(self, sql_statement: str):
        cursor = self.connection.cursor()
        cursor.execute(sql_statement, ())
        return cursor.fetchall()

    def __del__(self):
        try:
            self.connection.close()
        except:
            pass
        del self
