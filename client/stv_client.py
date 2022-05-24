from datetime import datetime
import mysql.connector
import os
import json
import cerberus

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

SCHEMA_FORMAT = {
    "database_name": {"type": "string", "minlength": 1},
    "table_name": {
        "type": "string",
        "forbidden": ["column_meta_data"],
        "regex": "^[a-zA-Z0-9_]{1,64}$",
    },
    "data_columns": {
        "type": "list",
        "schema": {
            "type": "string",
            "forbidden": ["id", "date", "hour", "sensor"],
            "regex": "^[a-zA-Z0-9_]{1,64}$",
        },
    },
}

META_DATA_SCHEMA = lambda data_columns: {
    "units": {
        "type": "dict",
        "require_all": True,
        "schema": {
            c: {
                "type": "string",
                "nullable": True,
                "regex": "^.{1,64}$",
            }
            for c in data_columns
        },
    },
    "descriptions": {
        "type": "dict",
        "require_all": True,
        "schema": {
            c: {
                "type": "string",
                "nullable": True,
                "regex": "^.{1,256}$",
            }
            for c in data_columns
        },
    },
    "minimums": {
        "type": "dict",
        "require_all": True,
        "schema": {c: {"type": "number", "nullable": True} for c in data_columns},
    },
    "detection_limits": {
        "type": "dict",
        "require_all": True,
        "schema": {
            c: {"type": "number", "nullable": True, "min": 0} for c in data_columns
        },
    },
    "decimal_placess": {
        "type": "dict",
        "require_all": True,
        "schema": {
            c: {
                "type": "integer",
                "nullable": True,
                "min": 0,
                "max": 4,
            }
            for c in data_columns
        },
    },
}

DATA_SCHEMA = lambda data_columns: {
    "data": {
        "type": "dict",
        "require_all": True,
        "schema": {c: {"type": "number", "nullable": True} for c in data_columns},
    }
}


def include_none_keys(a: dict, keys):
    return {**{key: None for key in keys}, **a}


def meta_to_str(m):
    if m is None:
        return "null"
    elif isinstance(m, str):
        return f"'{m}'"
    else:
        return f"{m}"


def get_utc_time():
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
    return date, hour


class STVClient:
    def __init__(
        self,
        database_name: str,
        table_name: str,
        data_columns: list[str],
        units: dict[str, str] = {},
        descriptions: dict[str, str] = {},
        minimums: dict[str, float] = {},
        detection_limits: dict[str, float] = {},
        decimal_placess: dict[str, int] = {},
        print_stuff: bool = False,
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

        self.meta_data = {
            "units": units,
            "descriptions": descriptions,
            "minimums": minimums,
            "detection_limits": detection_limits,
            "decimal_placess": decimal_placess,
        }
        for m in self.meta_data.keys():
            self.meta_data[m] = include_none_keys(self.meta_data[m], self.data_columns)
        self.__validate_meta_data_format()

        self.print_stuff = print_stuff

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

        self.__update_meta_data()

    def __validate_schema_format(self):
        v = cerberus.Validator(SCHEMA_FORMAT)
        assert v.validate(
            {
                "database_name": self.database_name,
                "table_name": self.table_name,
                "data_columns": self.data_columns,
            }
        ), f"schema invalid: {v.errors}"
        for c in self.data_columns:
            assert self.data_columns.count(c) == 1, f"duplicate data_column {c}"

    def __validate_meta_data_format(self):
        v = cerberus.Validator(META_DATA_SCHEMA(self.data_columns))
        assert v.validate(self.meta_data), f"meta_data invalid: {v.errors}"

    def __validate_data_format(self, data: dict[str, float]):
        v = cerberus.Validator(DATA_SCHEMA(self.data_columns))
        assert v.validate({"data": data}), f"data invalid: {v.errors}"

    def __drop_table(self):
        if input("schema has changed! drop the existing table? (y) ").startswith("y"):
            cursor = self.connection.cursor()
            cursor.execute(f"DROP TABLE {self.table_name}", ())
            cursor.execute(
                f"DELETE FROM column_meta_data WHERE table_name='{self.table_name}'", ()
            )
            self.connection.commit()
            print(f"table {self.table_name} dropped")
        else:
            raise Exception("table has to be dropped on schema change")

    def __create_table(self):
        """
        Creates the required table based on the give schema.
        """
        cursor = self.connection.cursor()
        sql_statement = (
            f"CREATE TABLE {self.table_name} ( "
            + "    ID INT NOT NULL AUTO_INCREMENT, "
            + "    date INT NOT NULL, "
            + "    hour FLOAT NOT NULL, "
            + "    sensor VARCHAR(64) NOT NULL, "
            + f"   {' ,'.join([f'{c} FLOAT NULL' for c in self.data_columns])}, "
            + "    PRIMARY KEY (ID)"
            + "); "
        )
        cursor.execute(sql_statement, ())
        for column_name in self.data_columns:
            sql_statement = (
                f"INSERT INTO column_meta_data "
                + f"(table_name, column_name, unit, description, minimum, detection_limit, decimal_places) "
                + " VALUES (%s, %s, %s, %s, %s, %s, %s)"
            )
            print("sql_statement:", sql_statement)
            cursor.execute(
                sql_statement,
                (self.table_name, column_name, None, None, None, None, None),
            )

        self.connection.commit()
        print(f"table {self.table_name} created: {sql_statement}")

    def __update_meta_data(self):
        cursor = self.connection.cursor()
        for c in self.data_columns:
            for m in self.meta_data.keys():
                sql_statement = (
                    f"UPDATE column_meta_data SET "
                    + f"{m[:-1]}={meta_to_str(self.meta_data[m][c])} "
                    + f"WHERE table_name='{self.table_name}' AND column_name='{c}'"
                )
                print(sql_statement)
                cursor.execute(sql_statement, ())
        self.connection.commit()

    def __table_exists(self):
        cursor = self.connection.cursor()
        cursor.execute("SHOW TABLES", ())
        return self.table_name in [r[0] for r in cursor.fetchall()]

    def __table_schemas_match(self):
        try:
            cursor = self.connection.cursor()
            cursor.execute(f"DESCRIBE {self.database_name}.{self.table_name}")
            columns = cursor.fetchall()
            assert len(columns) == 4 + len(self.data_columns)
            assert columns[0] == ("ID", b"int", "NO", "PRI", None, "auto_increment")
            assert columns[1][:3] == ("date", b"int", "NO")
            assert columns[2][:3] == ("hour", b"float", "NO")
            assert columns[3][:3] == ("sensor", b"varchar(64)", "NO")
            for index, column_name in enumerate(self.data_columns):
                assert columns[4 + index][:3] == (column_name, b"float", "YES")
            return True
        except AssertionError as e:
            print(e)
            return False

    def insert_data(self, sensor_name: str, data: dict):
        data = include_none_keys(data, self.data_columns)
        assert isinstance(sensor_name, str), "sensor_name is not a string"
        assert len(sensor_name) <= 64, "sensor_name is longer than 64 characters"

        self.__validate_data_format(data)
        date, hour = get_utc_time()

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
            if self.print_stuff:
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
