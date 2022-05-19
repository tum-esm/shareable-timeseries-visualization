import React, { useEffect, useState } from 'react';
import DataSelector from '../components/data-selector';
import PlotPanel from '../components/plot-panel';
import backend from '../utilities/backend';
import transformTimeseries from '../utilities/transform-timeseries';

const IndexPage = () => {
    const [databaseSchema, setDatabaseSchema] = useState<
        { [key: string]: { [key: string]: string[] } } | undefined
    >(undefined);
    const [selectedDatabase, setSelectedDatabase] = useState<string | undefined>(undefined);
    const [selectedTable, setSelectedTable] = useState<string | undefined>(undefined);
    const [data, setData] = useState<{ [key: string]: string | number }[] | undefined>(undefined);

    async function loadDatabaseSchema() {
        setDatabaseSchema(await backend.getSchema());
    }
    async function loadData() {
        if (
            databaseSchema !== undefined &&
            selectedDatabase !== undefined &&
            selectedTable !== undefined
        ) {
            setData(
                transformTimeseries.timeLabels(
                    await backend.getData(selectedDatabase, selectedTable)
                )
            );
        } else {
            setData(undefined);
        }
    }

    useEffect(() => {
        loadDatabaseSchema();
    }, []);

    useEffect(() => {
        loadData();
    }, [selectedTable]);

    useEffect(() => {
        if (selectedDatabase === undefined) {
            setSelectedTable(undefined);
        }
    }, [selectedDatabase]);

    return (
        <div className="w-full min-h-screen py-20 flex-col-center-top bg-slate-50">
            <main className="w-full max-w-3xl flex-col-left gap-y-6">
                {databaseSchema !== undefined && (
                    <>
                        <DataSelector
                            {...{
                                databaseSchema,
                                selectedDatabase,
                                setSelectedDatabase,
                                selectedTable,
                                setSelectedTable,
                            }}
                        />
                        <div className="w-full h-px bg-slate-300" />
                        {selectedDatabase !== undefined &&
                            selectedTable !== undefined &&
                            data !== undefined &&
                            databaseSchema[selectedDatabase][selectedTable].map((column_name) => (
                                <PlotPanel column_name={column_name} data={data} />
                            ))}
                        <div>{JSON.stringify(data)}</div>
                    </>
                )}
            </main>
        </div>
    );
};

export default IndexPage;
