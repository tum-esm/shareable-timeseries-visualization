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
    [879, 20220524, 14.2315, "node_1", 15.04, 0.41216, 35.28, 26.694, 43.2433],
    [878, 20220524, 14.2276, "node_1", 15.04, 0.41055, 37.24, 26.6467, 43.24],
    [877, 20220524, 14.2232, "node_1", 15.04, 0.41055, 37.24, 26.6233, 43.19]
]
```

`/meta-data?database=airquality_course&table=sensor_node_verbose`:

```json
{
    "no2": {
        "unit": "µg/m³",
        "description": "Stickstoffdioxid",
        "minimum": 0.0,
        "detection_limit": 20.0,
        "decimal_places": null
    },
    "co": {
        "unit": "mg/m³",
        "description": "Kohlenmonoxid",
        "minimum": 0.0,
        "detection_limit": 1.0,
        "decimal_places": null
    },
    "o3": {
        "unit": "µg/m³",
        "description": "Ozon",
        "minimum": 0.0,
        "detection_limit": 35.0,
        "decimal_places": null
    },
    "temperatur": {
        "unit": "°C",
        "description": null,
        "minimum": null,
        "detection_limit": null,
        "decimal_places": 1
    },
    "luftfeuchtigkeit": {
        "unit": "%rH",
        "description": null,
        "minimum": 0.0,
        "detection_limit": null,
        "decimal_places": 1
    }
}
```

<br/>

## Setting up the MySQL instance

1. Create a new database for measurement data

```sql
CREATE DATABASE stv_airquality_course;

CREATE TABLE stv_airquality_course.column_meta_data (
    table_name varchar(64) not null,
    column_name varchar(64) not null,
    unit varchar(64) null,
    description varchar(256) null,
    minimum float null,
    detection_limit float null,
    decimal_places int null,
    primary key (table_name, column_name)
);
```

**IMPORTANT:** All databases in the MySQL instance associated with the stv-project have to be prefixed with `stv_`.

2. Set up a new user for that database

```sql
-- create mysql user
CREATE USER 'stv_airquality_course_students'@'%'
IDENTIFIED WITH 'caching_sha2_password'
BY 'choose-a-good-password-other-than-this-one';

-- let the client user only edit the respective database
GRANT ALL PRIVILEGES ON stv_airquality_course.* TO 'stv_airquality_course_students'@'%';

-- optional
SHOW GRANTS FOR 'stv_airquality_course_students'@'%';
```

3. Now, the user `stv_airquality_course_students` can use the client with any table name inside the database `stv_airquality_course`

4. Additionally, you will need a public user for the backend

```sql
-- create mysql user
CREATE USER 'stv_public'@'%'
IDENTIFIED WITH 'caching_sha2_password'
BY 'choose-a-good-password-other-than-this-one';

-- let the client user only edit the respective database
GRANT SELECT ON stv_airquality_course.* TO 'stv_public'@'%';
```
