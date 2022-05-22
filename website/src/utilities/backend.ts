import CONSTANTS from './constants';

const backend = {
    getSchema: async (): Promise<any> => {
        const response = await fetch(CONSTANTS.API + `/schema`);
        if (response.ok) {
            return response.json();
        } else {
            throw 'request failed';
        }
    },
    getData: async (database: string, table: string): Promise<any> => {
        const response = await fetch(CONSTANTS.API + `/data?database=${database}&table=${table}`);
        if (response.ok) {
            return response.json();
        } else {
            throw 'request failed';
        }
    },
    getMetaData: async (database: string, table: string): Promise<any> => {
        const response = await fetch(
            CONSTANTS.API + `/meta-data?database=${database}&table=${table}`
        );
        if (response.ok) {
            return response.json();
        } else {
            throw 'request failed';
        }
    },
};

export default backend;
