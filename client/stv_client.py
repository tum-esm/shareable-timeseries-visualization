from datetime import datetime
import sys
import mysql.connector
import os
import json

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))


class STVClient:
    def __init__(
        self,
        database_name: str,
        table_name: str,
        data_columns: list[str],
    ):
        try:
            with open(os.path.join(PROJECT_DIR, "config.json")) as f:
                CONFIG = json.load(f)
                SQL_USER = CONFIG["mysql_user"]
                SQL_PASSWORD = CONFIG["mysql_password"]
                assert isinstance(SQL_USER, str)
                assert isinstance(SQL_PASSWORD, str)
        except (AssertionError, KeyError) as e:
            raise Exception(f"Unable to load config.json: {e}")

        self.database_name = database_name
        self.table_name = table_name
        self.data_columns = data_columns
        self.__validate_schema_format()

        self.connection: mysql.connector.MySQLConnection = mysql.connector.connect(
            host="esm-mysql-public-do-user-7320955-0.b.db.ondigitalocean.com",
            port=25060,
            user=SQL_USER,
            password=SQL_PASSWORD,
            database=database_name,
        )
        if not self.__table_exists():
            self.__create_table()
        elif not self.__table_schemas_match():
            self.__drop_table()
            self.__create_table()

    def __validate_schema_format(self):
        """
        Checks, whether the given schema is valid.
        """
        reserved_keys = ["id", "date", "hour", "sensor"]
        allowed_ascii_values = (
            [ord("_")]
            + list(range(ord("a"), ord("z") + 1))
            + list(range(ord("0"), ord("9") + 1))
        )
        assert len(self.data_columns) > 0, "at least 1 column required"
        try:
            for d in self.data_columns:
                assert isinstance(d, str), "have to be a string"
                for c in d:
                    assert (
                        ord(c) in allowed_ascii_values
                    ), "only lowercase letters, underscores and numbers allowed"
                assert d not in reserved_keys, "the names {reserved_keys} are reserved"
        except AssertionError as e:
            raise Exception(f"Invalid column names: {e}")

    def __validate_data_format(self, data: dict[str, float]):
        """
        Checks, whether the data is in the correct format with respect to the
        given schema.
        """
        try:
            assert isinstance(data, dict), "pass data in dict format"
            for key, value in data.items():
                assert isinstance(value, float | int), "only floats allowed"
                assert key in self.data_columns, f'unknown key "{key}"'
            for key in self.data_columns:
                assert key in data.keys(), f'key "{key}" missing in data'
        except AssertionError as e:
            raise Exception(f"Invalid data format: {e}")

    def __drop_table(self):
        if input("schema has changed! drop the existing table? (y) ").startswith("y"):
            cursor = self.connection.cursor()
            cursor.execute(f"DROP TABLE {self.table_name}", ())
            self.connection.commit()
            print(f"table {self.table_name} dropped")
        else:
            raise Exception("schema has changed, table has to be dropped")

    def __create_table(self):
        """
        Creates the required table based on the give schema.
        """
        cursor = self.connection.cursor()
        columns = [f"{c} FLOAT NOT NULL" for c in self.data_columns]
        sql_statement = (
            f"CREATE TABLE {self.table_name} ("
            + "ID INT NOT NULL AUTO_INCREMENT, "
            + "date INT NOT NULL, "
            + "hour FLOAT NOT NULL, "
            + "sensor VARCHAR(64) NOT NULL, "
            + f"{' ,'.join(columns)}"
            + ", PRIMARY KEY (ID));"
        )
        cursor.execute(sql_statement, ())
        self.connection.commit()
        print(f"table {self.table_name} created: {sql_statement}")

    def __table_exists(self):
        """
        Checks, whether the respective table exists.
        """
        cursor = self.connection.cursor()
        cursor.execute("SHOW TABLES", ())
        return self.table_name in [r[0] for r in cursor.fetchall()]

    def __table_schemas_match(self):
        """
        Checks, whether the respective table has the correct columns.
        """
        try:
            cursor = self.connection.cursor()
            cursor.execute(f"DESCRIBE {self.database_name}.{self.table_name}")
            columns = cursor.fetchall()
            assert len(columns) == 4 + len(self.data_columns)
            assert columns[0] == ("ID", b"int", "NO", "PRI", None, "auto_increment")
            assert columns[1][:3] == ("date", b"int", "NO")
            assert columns[2][:3] == ("hour", b"float", "NO")
            assert columns[3][:3] == ("sensor", b"varchar(64)", "NO")
            _i = 4
            for c in self.data_columns:
                assert columns[_i][0] == c
                assert columns[_i][1] == b"float"
                _i += 1
            return True
        except AssertionError:
            return False

    def insert_data(self, sensor_name: str, data: dict):
        assert len(sensor_name) <= 64, "sensor_name is longer than 64 characters"

        self.__validate_data_format(data)
        now = datetime.utcnow()
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
                + f"(date, hour, sensor, {', '.join(keys)})"
                + " VALUES "
                + f"({date}, {hour}, '{sensor_name}', {', '.join(['%s']*len(keys))})"
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
