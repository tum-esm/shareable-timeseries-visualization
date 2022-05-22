import { reduce, uniq } from 'lodash';
import React, { useEffect, useState } from 'react';
import DataSelector from '../components/data-selector';
import PlotPanel from '../components/plot-panel';
import SensorSelector from '../components/sensor-selector';
import TimeSelector from '../components/time-selector';
import backend from '../utilities/backend';
import { TYPES, CONSTANTS } from '../utilities/constants';
import transformTimeseries from '../utilities/transform-timeseries';

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
    const [selectedTime, setSelectedTime] = useState<TYPES.TimeBucket>(
        CONSTANTS.TIMES[0]
    );
    const [allData, setAllData] = useState<
        { [key: string]: string | number }[] | undefined
    >(undefined);
    const [timeFramedData, setTimeFramedData] = useState<
        { [key: string]: string | number }[] | undefined
    >(undefined);

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
        setAllData(undefined);
        setTimeFramedData(undefined);
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
            setAllData(newData);
            setMaxTime(newMaxTime);
            setMetaData(await backend.getMetaData(selectedDatabase, selectedTable));
        }
    }

    useEffect(() => {
        if (allData !== undefined && maxTime !== undefined) {
            const hourFraction = {
                '10 minutes': 0.1666666,
                '30 minutes': 0.5,
                '2 hours': 2,
                '6 hours': 6,
                '24 hours': 24,
            };
            setTimeFramedData(
                allData.filter(
                    (d) => d['hour'] >= maxTime.hour - hourFraction[selectedTime]
                )
            );
        }
    }, [allData, selectedTime, maxTime]);

    useEffect(() => {
        if (allData === undefined) {
            setSelectedSensors({});
        } else {
            setSelectedSensors(
                reduce(
                    uniq(allData.map((d) => d['sensor'])),
                    (prev, curr, index) => ({ ...prev, [curr]: true }),
                    {}
                )
            );
        }
    }, [allData]);

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
    if (allData !== undefined && selectedSensors !== undefined) {
        const sensorNames = uniq(allData.map((d) => d['sensor'])).sort();
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
        timeFramedData !== undefined &&
        metaData !== undefined &&
        reduce(
            databaseSchema[selectedDatabase][selectedTable],
            (prev, curr, _) => prev && timeFramedData[0][curr] !== undefined,
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
                                {timeFramedData.length === 0 && (
                                    <>
                                        <div className="w-full h-px bg-slate-300" />
                                        <div className="w-full text-lg text-center text-slate-700">
                                            table is empty
                                        </div>
                                    </>
                                )}
                                {timeFramedData.length > 0 && (
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
                                                data={timeFramedData}
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
