import { Handler } from '@netlify/functions';
import * as mysql from 'mysql';
import { uniq } from 'lodash';

const HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    'Content-Type': 'application/json',
};

const handler: Handler = (event, context, callback) => {
    var connection = mysql.createConnection({
        host: 'esm-mysql-public-do-user-7320955-0.b.db.ondigitalocean.com',
        port: 25060,
        user: 'public',
        password: 'AVNS_dCglpmL1fML93ap',
    });
    connection.connect();

    connection.query(
        'SELECT table_schema, table_name, column_name, data_type ' +
            'FROM information_schema.columns ' +
            'WHERE ' +
            "    (table_schema != 'information_schema') " +
            '    AND ' +
            "    (is_nullable = 'NO') " +
            '    AND ( ' +
            "        (column_name = 'ID' AND column_key = 'PRI' AND extra = 'auto_increment') " +
            '        OR ' +
            "        (column_name != 'ID' AND column_key = '' AND extra = '') " +
            '    );',
        function (error, results: any[], fields) {
            // error will be an Error if one occurred during the query
            // results will contain the results of the query
            // fields will contain information about the returned results fields (if any)
            if (error) {
                connection.end();
                callback(error.message, {
                    statusCode: 500,
                    body: JSON.stringify({ error }),
                    headers: HEADERS,
                });
            } else {
                connection.end();
                console.log({ results });

                const database_names = uniq(results.map((r) => r['TABLE_SCHEMA']));
                console.log({ database_names });

                const tables = {};
                database_names.forEach((database_name) => {
                    tables[database_name] = {};
                    const table_names = uniq(
                        results
                            .filter((r) => r['TABLE_SCHEMA'] === database_name)
                            .map((r) => r['TABLE_NAME'])
                    );
                    table_names.forEach((table_name) => {
                        let column_results = results.filter(
                            (r) =>
                                r['TABLE_SCHEMA'] === database_name &&
                                r['TABLE_NAME'] === table_name
                        );
                        const column_exists = (
                            column_name: string,
                            data_type: 'int' | 'float' | 'varchar'
                        ) =>
                            column_results.filter(
                                (r) =>
                                    r['COLUMN_NAME'] === column_name && r['DATA_TYPE'] === data_type
                            ).length == 1;

                        if (
                            column_exists('ID', 'int') &&
                            column_exists('date', 'int') &&
                            column_exists('hour', 'float') &&
                            column_exists('sensor', 'varchar')
                        ) {
                            tables[database_name][table_name] = column_results
                                .filter(
                                    (r) =>
                                        !['ID', 'date', 'hour', 'sensor'].includes(
                                            r['COLUMN_NAME']
                                        ) && r['DATA_TYPE'] === 'float'
                                )
                                .map((c) => c['COLUMN_NAME']);
                        }
                    });
                });

                callback(undefined, {
                    statusCode: 200,
                    body: JSON.stringify(tables),
                    headers: HEADERS,
                });
            }
        }
    );
};

export { handler };
