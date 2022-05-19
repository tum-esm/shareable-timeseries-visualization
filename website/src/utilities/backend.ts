const API = 'https://tueiesm-stv-api.netlify.app/.netlify/functions';

const backend = {
    getSchema: async (): Promise<any> => {
        const response = await fetch(API + `/get-database-schema`);
        if (response.ok) {
            return response.json();
        } else {
            throw 'request failed';
        }
    },
    getData: async (database: string, table: string): Promise<any> => {
        const response = await fetch(
            API + `/get-timeseries-data?database=${database}&table=${table}`
        );
        if (response.ok) {
            return response.json();
        } else {
            throw 'request failed';
        }
    },
};

export default backend;
