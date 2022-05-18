import time
from utils import STVClient


def example_procedure():
    stv_client = STVClient(
        schema={"sensor_id": "string", "x": "float", "y": "float"},
        database_name="airquality_course",
        table_name="test_data",
    )

    print("latest 10 records: ", stv_client.get_latest_n_records(10))

    time.sleep(3)

    stv_client.insert_data({"sensor_id": "sensor-1", "x": 40, "y": 100})
    stv_client.insert_data({"sensor_id": "sensor-2", "x": 40, "y": 120})

    time.sleep(3)

    stv_client.insert_data({"sensor_id": "sensor-1", "x": 45, "y": 80})
    stv_client.insert_data({"sensor_id": "sensor-2", "x": 45, "y": 130})

    time.sleep(3)

    stv_client.insert_data({"sensor_id": "sensor-1", "x": 50, "y": 70})
    stv_client.insert_data({"sensor_id": "sensor-2", "x": 50, "y": 150})

    del stv_client


if __name__ == "__main__":
    example_procedure()
