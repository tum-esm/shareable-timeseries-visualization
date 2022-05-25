import requests
import threading

success = 0
total = 0

urls = [
    "http://0.0.0.0:8080/schema",
    "http://0.0.0.0:8080/data?database=airquality_course&table=sensor_node_verbose",
    "http://0.0.0.0:8080/meta-data?database=airquality_course&table=sensor_node_verbose",
]


def run():
    global success
    global total
    i = 0
    while True:
        result = requests.get(urls[i])
        i = (i + 1) % 3
        if result.status_code == 200:
            success += 1
        total += 1
        print(f"success: {success}/{total} cases")


ts = [threading.Thread(target=run) for i in range(10)]
for t in ts:
    t.start()
