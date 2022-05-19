import { Handler } from '@netlify/functions';
import * as mysql from 'mysql';

const HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    'Content-Type': 'application/json',
};

// TODO: Do databases-/tables-/columns-queries in one step
const handler: Handler = (event, context, callback) => {
    var connection = mysql.createConnection({
        host: 'esm-mysql-public-do-user-7320955-0.b.db.ondigitalocean.com',
        port: 25060,
        user: 'public',
        password: 'AVNS_dCglpmL1fML93ap',
        database: event.queryStringParameters['database'],
    });
    connection.connect();

    connection.query('SHOW TABLES', function (error, results: any[], fields) {
        if (error) {
            connection.end();
            callback(error.message, {
                statusCode: 500,
                body: JSON.stringify({ error }),
                headers: HEADERS,
            });
        } else {
            connection.end();
            callback(undefined, {
                statusCode: 200,
                body: JSON.stringify(
                    results.map((r) => r[`Tables_in_${event.queryStringParameters['database']}`])
                ),
                headers: HEADERS,
            });
        }
    });
};

export { handler };