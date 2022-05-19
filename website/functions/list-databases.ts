import { Handler } from '@netlify/functions';
import * as mysql from 'mysql';

const handler: Handler = (event, context, callback) => {
    var connection = mysql.createConnection({
        host: 'esm-mysql-public-do-user-7320955-0.b.db.ondigitalocean.com',
        port: 25060,
        user: 'public',
        password: 'AVNS_dCglpmL1fML93ap',
    });
    connection.connect();

    connection.query('SHOW DATABASES', function (error, results: any[], fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            connection.end();
            callback(error.message, {
                statusCode: 500,
                body: JSON.stringify({ error }),
            });
        } else {
            connection.end();
            callback(undefined, {
                statusCode: 200,
                body: JSON.stringify(
                    results.map((r) => r.Database).filter((r) => r !== 'information_schema')
                ),
            });
        }
    });
};

export { handler };
