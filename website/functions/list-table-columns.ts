import { Handler } from '@netlify/functions';
import * as mysql from 'mysql';

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
        database: event.queryStringParameters['database'],
    });
    connection.connect();

    connection.query(
        `DESCRIBE ${event.queryStringParameters['database']}.${event.queryStringParameters['table']}`,
        function (error, results: any[], fields) {
            if (error) {
                connection.end();
                callback(error.message, {
                    statusCode: 500,
                    body: JSON.stringify({ error }),
                    headers: HEADERS,
                });
            } else {
                connection.end();
                const id_column_exists =
                    results[0]['Field'] === 'ID' &&
                    results[0]['Type'] === 'int' &&
                    results[0]['Null'] === 'NO' &&
                    results[0]['Key'] === 'PRI' &&
                    results[0]['Extra'] === 'auto_increment';
                const date_column_exists =
                    results[1]['Field'] === 'date' &&
                    results[1]['Null'] === 'NO' &&
                    results[1]['Type'] === 'int';
                const hour_column_exists =
                    results[2]['Field'] === 'hour' &&
                    results[2]['Null'] === 'NO' &&
                    results[2]['Type'] === 'float';
                if (id_column_exists && date_column_exists && hour_column_exists) {
                    const column_response = results
                        .map((r) => ({
                            key: r['Field'],
                            type: r['Type'].replace('varchar(32)', 'string'),
                        }))
                        .filter(
                            (r) => r['key'] !== 'ID' && r['key'] !== 'date' && r['key'] !== 'hour'
                        );
                    callback(undefined, {
                        statusCode: 200,
                        body: JSON.stringify(column_response),
                        headers: HEADERS,
                    });
                    return;
                } else {
                    callback(
                        'Table not in a valid state ("ID" and "hour" columns missing/invalid)',
                        {
                            statusCode: 400,
                            headers: HEADERS,
                        }
                    );
                }
            }
        }
    );
};

export { handler };
