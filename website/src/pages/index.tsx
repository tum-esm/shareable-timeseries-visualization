import React, { useEffect, useState } from 'react';
import DataSelector from '../components/data-selector';
import backend from '../utilities/backend';

const IndexPage = () => {
    const [databases, setDatabases] = useState<string[] | undefined>(undefined);
    const [databaseIndex, setDatabaseIndex] = useState<number | undefined>(undefined);

    const [tables, setTables] = useState<string[] | undefined>(undefined);
    const [tableIndex, setTableIndex] = useState<number | undefined>(undefined);

    const [columns, setColumns] = useState<
        | {
              key: string;
              type: 'string' | 'float';
          }[]
        | undefined
    >(undefined);
    const [data, setData] = useState<any | undefined>(undefined);

    console.log({ databaseIndex, tableIndex });

    async function loadDatabases() {
        setDatabases(await backend.getDatabases());
        setDatabaseIndex(0);
    }
    async function loadTables() {
        if (databases !== undefined && databaseIndex !== undefined) {
            setTables(await backend.getTables(databases[databaseIndex]));
            setTableIndex(0);
        }
    }
    async function loadColumns() {
        if (
            databases !== undefined &&
            databaseIndex !== undefined &&
            tables !== undefined &&
            tableIndex !== undefined
        ) {
            setColumns(await backend.getColumns(databases[databaseIndex], tables[tableIndex]));
            setData(await backend.getData(databases[databaseIndex], tables[tableIndex]));
        }
    }

    useEffect(() => {
        loadDatabases();
    }, []);

    useEffect(() => {
        loadTables();
    }, [databaseIndex]);

    useEffect(() => {
        loadColumns();
    }, [tableIndex]);

    return (
        <div className="w-full min-h-screen py-20 flex-col-center-top bg-slate-50">
            <main className="w-full max-w-3xl flex-col-left gap-y-6">
                <DataSelector
                    {...{
                        databases,
                        databaseIndex,
                        setDatabaseIndex,
                        tables,
                        tableIndex,
                        setTableIndex,
                        columns,
                    }}
                />
                <div>{JSON.stringify(columns)}</div>
                <div>{JSON.stringify(data)}</div>
            </main>
        </div>
    );
};

export default IndexPage;
