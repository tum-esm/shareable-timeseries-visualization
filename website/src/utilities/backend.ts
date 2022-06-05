import { TYPES } from './constants';

const API_URL = process.env.GATSBY_API_URL;

const backend = {
    getSchema: async (): Promise<any> => {
        const response = await fetch(API_URL + `/schema`);
        if (response.ok) {
            return (await response.json())['schema'];
        } else {
            if (response.status == 404) {
                throw 'database is offline';
            } else {
                throw 'request failed';
            }
        }
    },
    getData: async (database: string, table: string): Promise<any> => {
        const response = await fetch(
            API_URL + `/data?database=${database}&table=${table}`
        );
        if (response.ok) {
            return await response.json();
        } else {
            throw 'request failed';
        }
    },
    getMetaData: async (database: string, table: string): Promise<TYPES.META_DATA> => {
        const response = await fetch(
            API_URL + `/meta-data?database=${database}&table=${table}`
        );
        if (response.ok) {
            return await response.json();
        } else {
            throw 'request failed';
        }
    },
};

export default backend;
