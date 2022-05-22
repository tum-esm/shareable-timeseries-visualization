import { reduce, uniq } from 'lodash';
import React, { useEffect, useState } from 'react';
import DataSelector from '../components/data-selector';
import PlotPanel from '../components/plot-panel';
import SensorSelector from '../components/sensor-selector';
import TimeSelector from '../components/time-selector';
import backend from '../utilities/backend';
import transformTimeseries from '../utilities/transform-timeseries';

type TimeBucket = '24 hours' | '6 hours' | '2 hours' | '30 minutes' | '10 minutes';

const IndexPage = () => {
    const [databaseSchema, setDatabaseSchema] = useState<
        { [key: string]: { [key: string]: string[] } } | undefined
    >(undefined);
    const [selectedDatabase, setSelectedDatabase] = useState<string | undefined>(
        undefined
    );
    const [selectedTable, setSelectedTable] = useState<string | undefined>(undefined);
    const [selectedSensors, setSelectedSensors] = useState<{ [key: string]: boolean }>(
        {}
    );
    const [selectedTime, setSelectedTime] = useState<TimeBucket>('10 minutes');
    const [data, setData] = useState<{ [key: string]: string | number }[] | undefined>(
        undefined
    );
    const [metaData, setMetaData] = useState<
        | { [key: string]: { unit: string | null; description: string | null } }
        | undefined
    >(undefined);

    const [maxTime, setMaxTime] = useState<{ date: number; hour: number } | undefined>(
        undefined
    );

    // TODO: How to deal with non 200 responses from backend?
    async function loadDatabaseSchema() {
        setDatabaseSchema(await backend.getSchema());
    }
    async function loadData() {
        setData(undefined);
        setMaxTime(undefined);
        setMetaData(undefined);
        console.log('load data');
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
            setMetaData(await backend.getMetaData(selectedDatabase, selectedTable));
        }
    }

    useEffect(() => {
        if (data === undefined) {
            setSelectedSensors({});
        } else {
            setSelectedSensors(
                reduce(
                    uniq(data.map((d) => d['sensor'])),
                    (prev, curr, index) => ({ ...prev, [curr]: true }),
                    {}
                )
            );
        }
    }, [data]);

    useEffect(() => {
        loadDatabaseSchema();
    }, []);

    useEffect(() => {
        loadData();
    }, [selectedTable]);

    useEffect(() => {
        setSelectedTable(undefined);
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

    const stateIsComplete =
        databaseSchema !== undefined &&
        selectedDatabase !== undefined &&
        selectedTable !== undefined &&
        selectedSensors !== undefined &&
        data !== undefined &&
        metaData !== undefined &&
        reduce(
            databaseSchema[selectedDatabase][selectedTable],
            (prev, curr, _) => prev && data[0][curr] !== undefined,
            true
        );

    return (
        <div className="w-full min-h-screen px-4 py-20 flex-col-center-top bg-slate-50">
            <main
                className={
                    'hidden md:flex flex-col w-full max-w-5xl gap-y-6 ' +
                    selectedSensorCSS
                }
            >
                {databaseSchema === undefined && (
                    <div className="w-full text-center">loading schema ...</div>
                )}
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
                            !stateIsComplete && (
                                <div className="w-full text-center">
                                    loading data ...
                                </div>
                            )}
                        {stateIsComplete && (
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
                                        <div className="w-full h-px bg-slate-300" />
                                        <SensorSelector
                                            {...{ selectedSensors, setSelectedSensors }}
                                        />
                                        <TimeSelector
                                            {...{ selectedTime, setSelectedTime }}
                                        />
                                        <div className="w-full h-px bg-slate-300" />
                                        {databaseSchema[selectedDatabase][
                                            selectedTable
                                        ].map((column_name, index) => (
                                            <PlotPanel
                                                key={index}
                                                column_name={column_name}
                                                data={data}
                                                metaData={metaData}
                                                selectedSensors={selectedSensors}
                                            />
                                        ))}
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
