import { reduce, uniq } from 'lodash';
import React, { useEffect, useState } from 'react';
import DataSelector from '../components/data-selector';
import PlotPanel from '../components/plot-panel';
import SensorSelector from '../components/sensor-selector';
import backend from '../utilities/backend';
import transformTimeseries from '../utilities/transform-timeseries';

const IndexPage = () => {
    const [databaseSchema, setDatabaseSchema] = useState<
        { [key: string]: { [key: string]: string[] } } | undefined
    >(undefined);
    const [selectedDatabase, setSelectedDatabase] = useState<string | undefined>(undefined);
    const [selectedTable, setSelectedTable] = useState<string | undefined>(undefined);
    const [selectedSensors, setSelectedSensors] = useState<{ [key: string]: boolean }>({});
    const [data, setData] = useState<{ [key: string]: string | number }[] | undefined>(undefined);

    const [maxTime, setMaxTime] = useState<{ date: number; hour: number } | undefined>(undefined);

    async function loadDatabaseSchema() {
        setDatabaseSchema(await backend.getSchema());
    }
    async function loadData() {
        console.log('load data');
        setData(undefined);
        setMaxTime(undefined);
        if (
            databaseSchema !== undefined &&
            selectedDatabase !== undefined &&
            selectedTable !== undefined
        ) {
            const { newMaxTime, newData } = transformTimeseries.mergeTimeColumns(
                await backend.getData(selectedDatabase, selectedTable),
                databaseSchema[selectedDatabase][selectedTable]
            );
            setData(newData);
            setMaxTime(newMaxTime);
        }
    }

    useEffect(() => {
        if (data !== undefined) {
            setSelectedSensors(
                reduce(
                    uniq(data.map((d) => d['sensor'])),
                    (prev, curr, index) => ({ ...prev, [curr]: true }),
                    {}
                )
            );
        } else {
            setSelectedSensors({});
        }
    }, [data]);

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

    let selectedSensorCSS = '';
    if (data !== undefined && selectedSensors !== undefined) {
        const sensorNames = uniq(data.map((d) => d['sensor'])).sort();
        sensorNames.forEach((s, i) => {
            if (!selectedSensors[s]) {
                selectedSensorCSS += `circle-group-${i}-hidden `;
            }
        });
    }

    return (
        <div className="w-full min-h-screen px-4 py-20 flex-col-center-top bg-slate-50">
            <main
                className={'hidden md:flex flex-col w-full max-w-3xl gap-y-6 ' + selectedSensorCSS}
            >
                {databaseSchema !== undefined && (
                    <>
                        <DataSelector
                            {...{
                                databaseSchema,
                                selectedDatabase,
                                setSelectedDatabase,
                                selectedTable,
                                setSelectedTable,
                                triggerRefresh: loadData,
                                maxTime,
                            }}
                        />
                        {selectedDatabase !== undefined &&
                            selectedTable !== undefined &&
                            selectedSensors !== undefined &&
                            data !== undefined && (
                                <>
                                    {data.length === 0 && (
                                        <>
                                            <div className="w-full h-px bg-slate-300" />
                                            <div className="w-full text-lg text-center text-slate-700">
                                                table is empty
                                            </div>
                                        </>
                                    )}
                                    {data.length > 0 && (
                                        <>
                                            <SensorSelector
                                                {...{ selectedSensors, setSelectedSensors }}
                                            />
                                            <div className="w-full h-px bg-slate-300" />
                                            {databaseSchema[selectedDatabase][selectedTable].map(
                                                (column_name) => (
                                                    <PlotPanel
                                                        column_name={column_name}
                                                        data={data}
                                                    />
                                                )
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                    </>
                )}
            </main>
            <main className="md:hidden">Please view this page on a larger screen.</main>
        </div>
    );
};

export default IndexPage;
