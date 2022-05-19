import random
import time
from stv_client import STVClient


def rnd(min: int, max: int):
    assert min < max
    return (random.random() * (max - min)) + min


def example_procedure():
    client = STVClient(
        database_name="airquality_course",
        table_name="test_data",
        data_columns=["y1", "y2"],
    )

    print("latest 10 records: ", client.get_latest_n_records(10))

    while True:
        try:
            for sensor_name in ["sensor-1", "sensor-2", "sensor-3"]:
                client.insert_data(
                    sensor_name, {"y1": rnd(90, 110), "y2": rnd(1.7, 1.95)}
                )
            time.sleep(3)
        except KeyboardInterrupt:
            break

    del client


if __name__ == "__main__":
    example_procedure()
