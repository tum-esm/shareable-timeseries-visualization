import { Handler } from '@netlify/functions';
import * as mysql from 'mysql';

const handler: Handler = (event, context, callback) => {
    var connection = mysql.createConnection({
        host: 'esm-mysql-public-do-user-7320955-0.b.db.ondigitalocean.com',
        port: 25060,
        user: 'public',
        password: 'AVNS_dCglpmL1fML93ap',
        database: event.queryStringParameters['database'],
    });
    connection.connect();

    const fail = (error: any) => {
        connection.end();
        callback(error.message, {
            statusCode: 400,
            body: JSON.stringify({ error }),
        });
    };
    const success = (results: any) => {
        connection.end();
        callback(undefined, {
            statusCode: 200,
            body: JSON.stringify(results),
        });
    };

    connection.query(
        `SELECT date, hour FROM ${event.queryStringParameters['table']} ORDER BY date DESC, hour DESC LIMIT 1`,
        function (error, results: any[], fields) {
            if (error) {
                fail(error);
            } else {
                if (results.length == 0) {
                    success([]);
                } else {
                    const last_date = results[0]['date'];
                    const last_hour = results[0]['hour'];
                    const query =
                        `SELECT * FROM ${event.queryStringParameters['table']} ` +
                        `WHERE (` +
                        `  ((date = ${last_date})     AND (hour >= ${last_hour - 2}))` +
                        `  OR` +
                        `  ((date = ${last_date - 1}) AND (hour >= ${last_hour + 22}))` +
                        `) ` +
                        `ORDER BY date DESC, hour DESC`;
                    connection.query(query, function (error, results: any[], fields) {
                        if (error) {
                            fail(error);
                        } else {
                            success(results);
                        }
                    });
                }
            }
        }
    );
};

export { handler };
