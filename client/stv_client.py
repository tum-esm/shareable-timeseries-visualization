import mysql.connector
import os
import json

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))


class STVClient:
    def __init__(self, schema: dict, database_name: str, table_name: str):
        with open(os.path.join(PROJECT_DIR, "config.json")) as f:
            CONFIG = json.load(f)
            SQL_USER = CONFIG["sql"]["user"]
            SQL_PASSWORD = CONFIG["sql"]["password"]
            assert isinstance(SQL_USER, str)
            assert isinstance(SQL_PASSWORD, str)

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

    def validate_schema_format(self):
        for key, data_type in self.schema.items():
            assert isinstance(key, str), "schema key has to be a string"
            assert all(
                [c == "_" or ord(c) in range(ord("a"), ord("z") + 1) for c in key]
            ), "only lowercase letters and underscores allowed in keys"
            assert "id" not in self.schema.keys(), '"id" not allowed as key'
            allowed_types = ["string", "int", "float"]
            assert data_type in allowed_types, f"allowed datatypes: {allowed_types}"

    def validate_data_format(self, data: dict):
        assert isinstance(data, dict), "data has to be in dict format"
        for key in data.keys():
            assert key in self.schema.keys(), f'unknown key "{key}" in data'
        for key, data_type in self.schema.items():
            assert key in data.keys(), f'missing key "{key}" in data'
            if data_type == "string":
                assert isinstance(data[key], str), f"data[{key}] should be a string"
                assert len(data[key]) < 32, "data[{key}] is longer than 31 character"
            if data_type == "int":
                assert isinstance(data[key], int), f"data[{key}] should be an integer"
            if data_type == "float":
                assert isinstance(
                    data[key], int | float
                ), f"data[{key}] should be a number"

    def create_table(self, table_name: str):
        cursor = self.connection.cursor()
        sql_types = {"string": "VARCHAR(32)", "float": "FLOAT", "int": "INT"}
        columns = [f"{key} {sql_types[value]}" for key, value in self.schema.items()]
        sql_statement = (
            f"CREATE TABLE {table_name} (ID INT NOT NULL AUTO_INCREMENT, "
            + f"{' ,'.join(columns)}"
            + ", PRIMARY KEY (ID));"
        )
        cursor.execute(sql_statement, ())
        self.connection.commit()
        print(f"table {table_name} created")

    def table_exists(self):
        cursor = self.connection.cursor()
        cursor.execute("SHOW TABLES", ())
        return self.table_name in [r[0] for r in cursor.fetchall()]

    def insert_data(self, data: dict):
        self.validate_data_format(data)

        try:
            cursor = self.connection.cursor()
            keys = data.keys()
            values = [str(data[key]) for key in keys]
            sql_statement = (
                f"INSERT INTO {self.table_name} "
                + f"({', '.join(keys)})"
                + " VALUES "
                + f"({', '.join(['%s']*len(keys))})"
            )
            print(
                f"sql statement: \"{sql_statement.replace('%s', '{}').format(*values)}\""
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
        self.connection.close()
        del self
