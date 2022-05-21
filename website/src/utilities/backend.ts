// cloud run container of the startlette server in /backend
const API = 'https://stv-backend-iwtvwmhnyq-ew.a.run.app';

const backend = {
    getSchema: async (): Promise<any> => {
        const response = await fetch(API + `/schema`);
        if (response.ok) {
            return response.json();
        } else {
            throw 'request failed';
        }
    },
    getData: async (database: string, table: string): Promise<any> => {
        const response = await fetch(API + `/data?database=${database}&table=${table}`);
        if (response.ok) {
            return response.json();
        } else {
            throw 'request failed';
        }
    },
    getMetaData: async (database: string, table: string): Promise<any> => {
        const response = await fetch(API + `/meta-data?database=${database}&table=${table}`);
        if (response.ok) {
            return response.json();
        } else {
            throw 'request failed';
        }
    },
};

export default backend;
