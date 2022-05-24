# Shareable Timeseries Visualisation

**1.** Get your own database + credentials from Moritz Makowski

**2.** Put the credentials in a file `config.json` (format of `config.example.json`)

**3.** Fill the database using the `STVClient`

```python
from stv_client import STVClient

client = STVClient(
    database_name="your_database_name",
    table_name="any_table_name",
    data_columns=["ch4", "co2"],
    units={"ch4": "ppb", "co2": "ppm"},
    descriptions={"ch4": "The cows are at fault, for sure"},
    print_stuff=True,
)

client.insert_data("sensor-1", {"ch4": 1.815, "co2": 418.0})
client.insert_data("sensor-2", {"ch4": 1.845, "co2": 415.0})
client.insert_data("sensor-3", {"ch4": 1.900, "co2": 420.0})

print("latest 10 records: ", client.get_latest_n_records(10))

del client
```

**5.** View and share the plots on [https://tueiesm-stv-api.netlify.app/](https://tueiesm-stv-api.netlify.app/)

<img width="1072" src="https://user-images.githubusercontent.com/29046316/169709670-1be64cc1-0823-49d1-917f-07f88204a1d3.png">
