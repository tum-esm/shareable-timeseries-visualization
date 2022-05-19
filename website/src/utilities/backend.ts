const API = 'http://localhost:9999/.netlify/functions';

const backend = {
    getDatabases: async (): Promise<any> => {
        const response = await fetch(API + `/list-databases`);
        if (response.ok) {
            return response.json();
        } else {
            throw 'request failed';
        }
    },
    getTables: async (database: string): Promise<any> => {
        const response = await fetch(API + `/list-database-tables?database=${database}`);
        if (response.ok) {
            return response.json();
        } else {
            throw 'request failed';
        }
    },
    getColumns: async (database: string, table: string): Promise<any> => {
        const response = await fetch(
            API + `/list-table-columns?database=${database}&table=${table}`
        );
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
