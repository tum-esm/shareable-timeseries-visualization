import time

SQL_HOST = "0.0.0.0"
SQL_USER = "somebody"
SQL_PASSWORD = "super-secret-password"
SQL_DATABASE = "database-name"
SQL_TABLE = "table-name"

SCHEMA = {"sensor_id": "string", "x": "float", "y": "float"}

for key, schema_type in SCHEMA.items():
    allowed_types = ["string", "int", "float"]
    assert isinstance(key, str), "schema key has to be a string"
    assert schema_type in allowed_types, f"allowed schema datatypes: {allowed_types}"


def data_format_is_valid(data):
    assert isinstance(data, dict)
    for key in data.keys():
        assert key in SCHEMA.keys(), f'unknown key "{key}" in data'
    for key, schema_type in SCHEMA.items():
        assert key in data.keys(), f'missing key "{key}" in data'
        if schema_type == "string":
            assert isinstance(data[key], str)
        if schema_type == "int":
            assert isinstance(data[key], int)
        if schema_type == "float":
            assert isinstance(data[key], int | float)


def insert_data(connection, data, create_table_if_necessary=True):
    assert data_format_is_valid(data)

    try:
        # TODO: insert data with mysql
        pass
    except AssertionError:  # TODO: table not exists error
        # if create_table_if_necessary:
        #     create table from schema
        #     insert again with(create_table_if_necessary=False)
        # else:
        #     table is missing
        pass
    except:
        # error in sql connection
        pass


def main():
    # TODO: Set up MySQL connection
    connection = None

    # TODO: Assert connection successful
    # TODO: Assert database exists

    insert_data(connection, {"sensor_id": "sensor-1", "x": 40, "y": 100})
    insert_data(connection, {"sensor_id": "sensor-2", "x": 40, "y": 120})

    time.sleep(5)

    insert_data(connection, {"sensor_id": "sensor-1", "x": 45, "y": 80})
    insert_data(connection, {"sensor_id": "sensor-2", "x": 45, "y": 130})

    time.sleep(5)

    insert_data(connection, {"sensor_id": "sensor-1", "x": 50, "y": 70})
    insert_data(connection, {"sensor_id": "sensor-2", "x": 50, "y": 150})

    # TODO: Close connection


if __name__ == "__main__":
    main()
