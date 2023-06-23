**⚠️ Deprecated in favor of https://github.com/tum-esm/signal**

---

# Shareable Timeseries Visualisation

The python-client can be used to upload data to a MySQL instance. The website can be used to inspect all of this data in real-time.

<br/>

## ⚙️ How to use the python-client to upload data

**1.** Get your own database and credentials from Moritz Makowski

**2.** Put the credentials in a file `config.json` (format of `config.example.json`)

**3.** Fill the database using the `STVClient` (see `/client/main.py`)

```python
from stv_client import STVClient

client = STVClient(
    database_name="your_database_name",
    table_name="any_table_name",
    data_columns=["ch4", "co2"],
    units={"ch4": "ppb", "co2": "ppm"},
    descriptions={"ch4": "The cows are at fault, for sure"},
    minimums={"ch4": 0, "co2": 0},
    decimal_places={"ch4": 3, "co2": 1},
    print_stuff=True,
)

client.insert_data("sensor-1", {"ch4": 1.815, "co2": 418.0})
client.insert_data("sensor-2", {"ch4": 1.845, "co2": 415.0})
client.insert_data("sensor-3", {"ch4": 1.900, "co2": 420.0})

print("latest 10 records: ", client.get_latest_n_records(10))

# Don't forget this line, it will close the SQL connection
del client
```

**4.** View and share the plots on the website (our instance: https://tueiesm-stv-api.netlify.app/)

![](/docs/website-demo.png)

**5.** Properly embed the client into your codebase using [Git Submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules). An example can be found here: https://github.com/tum-esm/airquality_station/tree/WebUI-extended. `/no-gui.py` makes use of the stv-client.

<br/>

## 🏛 Architecture

### I. Upload data from the python-client

![](/docs/architecture-part-1.png)

_Tables will only be created/altered when the schema is new or changes._

<br/>

### II. Discover available database tables

_Triggered on every website load._

![](/docs/architecture-part-2.png)

<br/>

### III. Fetch data and meta-data for a given database and table

_`/meta-data` fetched on every table-select, `/data` fetched on every table-select, and click of the refresh button._

![](/docs/architecture-part-3.png)

<br/>

## 🔒 Security

_All of the uploaded data is publicly available._

The python-client uses a MySQL user, that has all privileges on all tables in the respective database and no privileges on any other databases.

The backend uses a MySQL user, that is allowed to read anything from all databases associated with this project.

When fetching data or meta-data, we don't have to look out for SQL injections since the backend only has read permissions on the public tables anyways - no other permissions that could be exploited.

<br/>

## 💾 Setting up your own MySQL instance

`/backend/README.md` includes: 1. Example responses from the backend, 2. Commands how to set up the MySQL instance.
