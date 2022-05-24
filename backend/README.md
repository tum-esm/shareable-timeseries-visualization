# STV Backend

Serving three routes: **`/schema`**, **`/data`** and **`/meta-data`**

<br/>

## Responses

`/schema`:

```json
{
    "airquality_course": {
        "sensor_node": ["no2"],
        "sensor_node_verbose": [
            "no2",
            "co",
            "o3",
            "temperatur",
            "luftfeuchtigkeit"
        ]
    }
}
```

`/data?database=airquality_course&table=sensor_node_verbose`:

```json
[
    [880, 20220524, 14.2357, "node_1", 15.04, 0.41975, 35.28, 26.7313, 43.15],
    [879, 20220524, 14.2315, "node_1", 15.04, 0.41216, 35.28, 26.694, 43.2433]
]
```

`/meta-data?database=airquality_course&table=sensor_node_verbose`:

```json
{
    "co": {
        "unit": "mg/m³",
        "description": "Kohlenmonoxid"
    },
    "luftfeuchtigkeit": {
        "unit": "%rH",
        "description": null
    },
    "no2": {
        "unit": "µg/m³",
        "description": "Stickstoffdioxid"
    },
    "o3": {
        "unit": "µg/m³",
        "description": "Ozon"
    },
    "temperatur": {
        "unit": "°C",
        "description": null
    }
}
```

<br/>

## Setting up the MySQL instance

1. Create a new database for measurement data

```sql
CREATE DATABASE airquality_course;

CREATE TABLE airquality_course.column_meta_data (
    table_name varchar(64) not null,
    column_name varchar(64) not null,
    unit varchar(64) null,
    description varchar(256) null,
    min float null,
    detection_limit float null,
    primary key (table_name, column_name)
);
```

2. Set up a new user for that database

```sql
-- create mysql user
CREATE USER 'airquality_course_students'@'%'
IDENTIFIED WITH 'caching_sha2_password'
BY 'choose-a-good-password';

-- let this user only edit the respective database
REVOKE ALL PRIVILEGES ON *.* FROM 'airquality_course_students'@'%';
GRANT ALL PRIVILEGES ON airquality_course.* TO 'airquality_course_students'@'%';

-- optional
SHOW GRANTS FOR 'airquality_course_students'@'%';
```

3. Now, the user `airquality_course_students` can use the client with any table name inside the database `airquality_course`
