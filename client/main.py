import time
from stv_client import STVClient


def example_procedure():
    client = STVClient(
        schema={"sensor_id": "string", "x": "float", "y": "float"},
        database_name="airquality_course",
        table_name="test_data",
    )

    print("latest 10 records: ", client.get_latest_n_records(10))

    time.sleep(3)

    client.insert_data({"sensor_id": "sensor-1", "x": 40, "y": 100})
    client.insert_data({"sensor_id": "sensor-2", "x": 40, "y": 120})

    time.sleep(3)

    client.insert_data({"sensor_id": "sensor-1", "x": 45, "y": 80})
    client.insert_data({"sensor_id": "sensor-2", "x": 45, "y": 130})

    time.sleep(3)

    client.insert_data({"sensor_id": "sensor-1", "x": 50, "y": 70})
    client.insert_data({"sensor_id": "sensor-2", "x": 50, "y": 150})

    del client


if __name__ == "__main__":
    example_procedure()
