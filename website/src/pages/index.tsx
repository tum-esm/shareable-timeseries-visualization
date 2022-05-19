import React, { useEffect, useState } from 'react';
import ColumnFilter from '../components/column-filter';
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
    const [rawData, setRawData] = useState<{ [key: string]: string | number }[] | undefined>(
        undefined
    );
    const [filteredData, setFilteredData] = useState<
        { [key: string]: string | number }[] | undefined
    >(undefined);

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
            setRawData(await backend.getData(databases[databaseIndex], tables[tableIndex]));
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
                {rawData !== undefined && columns !== undefined && (
                    <ColumnFilter
                        rawData={rawData}
                        setFilteredData={setFilteredData}
                        columns={columns}
                    />
                )}
                <div className="w-full h-px bg-slate-300" />
                <div>{JSON.stringify(filteredData)}</div>
            </main>
        </div>
    );
};

export default IndexPage;
