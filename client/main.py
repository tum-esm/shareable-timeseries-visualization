import random
import time
from stv_client import STVClient


def rnd(min: float, max: float):
    assert min < max
    return (random.random() * (max - min)) + min


def example_procedure():
    # Modifying units and description does not require old data
    # to be removed. Only changing data_columns does.
    client = STVClient(
        database_name="airquality_course",
        table_name="test_data_new",
        data_columns=["ch4", "co2"],
        units={"ch4": "ppb", "co2": "ppm"},
        descriptions={"ch4": "The cows are at fault, for sure"},
        minimums={"ch4": 0, "co2": 0},
        decimal_placess={"co2": 1, "ch4": 3},
        detection_limits={"ch4": 0.01},
        print_stuff=True,
    )

    print("latest 10 records: ", client.get_latest_n_records(10))

    while True:
        try:
            for sensor_name in ["sensor-1", "sensor-2", "sensor-3"]:
                client.insert_data(
                    sensor_name, {"ch4": rnd(1.8, 1.95), "co2": rnd(414.0, 423.0)}
                )
            time.sleep(3)
        except KeyboardInterrupt:
            break

    del client


if __name__ == "__main__":
    example_procedure()
