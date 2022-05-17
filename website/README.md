The website that visualized time series data from any MySQL database. Static (= visitor has to enter connection data at runtime). Website-Client reads database structure dynamically and can visualize any table. Settings are stored in a cookie so that settings remain on page reload.

Based on GatsbyJS, TailwindCSS, D3, Redux.

<br/>
<br/>

**Ideas:**

Settings slide up/down. Settings (except for username and password) are saved in cookie. Use TailwindUI.

Filter by string columns: No text input but select menu from schema

On website load:

1. Prefill settings from cookies

Settings entry:

1. Host, user, password
2. Try to connect with host+user+password
3. Load schema
4. show select database-name: try to prefill from cookie
5. show select table-name: try to prefill from cookie

Plot entry:

1. Load plot settings from cookies
2. If invalid, reset plot settings (+ cookie)
3. Select x column (one for all plotted timeseries)
4. Possibly filter by string columns (one for all plotted timeseries)
5. for each plot, pass the plot component an render it.

Hierarchy:

```
React App (state: source description, MySQL-connection, table-schema)
    Settings (rendered if no MySQL-Client)
    Plotter (rendered if MySQL-Client, state: x column, filters, y columns)
        Plot (one for each y column)


Cookies (if invalid or modified, all the more specific cookies will be deleted):
Host
    Database Name
        Table Name
            X Column + Filters + Y Columns
```
