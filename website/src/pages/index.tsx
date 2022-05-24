import { reduce, uniq } from 'lodash';
import React, { useEffect, useState } from 'react';
import DataSelector from '../components/data-selector';
import PlotPanel from '../components/plot-panel';
import SensorSelector from '../components/sensor-selector';
import TimeSelector from '../components/time-selector';
import backend from '../utilities/backend';
import { TYPES, CONSTANTS } from '../utilities/constants';
import transformTimeseries from '../utilities/utility-functions';

const IndexPage = () => {
    const [dbSchema, setDbSchema] = useState<TYPES.DB_SCHEMA | undefined>(undefined);
    const [allData, setAllData] = useState<TYPES.DATA | undefined>(undefined);
    const [metaData, setMetaData] = useState<TYPES.META_DATA | undefined>(undefined);
    const [maxTime, setMaxTime] = useState<TYPES.MAX_TIME | undefined>(undefined);

    const [selectedDb, setSelectedDb] = useState<string | undefined>(undefined);
    const [selectedTable, setSelectedTable] = useState<string | undefined>(undefined);
    const [selectedSensors, setSelectedSensors] = useState<TYPES.SELECTED_SENSORS>({});
    const [selectedTime, setSelectedTime] = useState<TYPES.TimeBucket>(
        CONSTANTS.TIMES[0]
    );

    const [serverError, setServerError] = useState(false);

    // TODO: How to deal with non 200 responses from backend?
    async function loadDatabaseSchema() {
        try {
            setDbSchema(await backend.getSchema());
        } catch {
            setServerError(true);
        }
    }
    async function loadData() {
        setAllData(undefined);
        setMaxTime(undefined);
        setMetaData(undefined);
        console.log('load data');
        if (
            dbSchema !== undefined &&
            selectedDb !== undefined &&
            selectedTable !== undefined
        ) {
            try {
                const _rawData = await backend.getData(selectedDb, selectedTable);
                const { newMaxTime, newData } = transformTimeseries.mergeTimeColumns(
                    _rawData,
                    dbSchema[selectedDb][selectedTable]
                );
                setAllData(newData);
                setMaxTime(newMaxTime);
                setMetaData(await backend.getMetaData(selectedDb, selectedTable));
            } catch {
                setServerError(true);
            }
        }
    }

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
        if (selectedDb === undefined) {
            setSelectedTable(undefined);
        }
    }, [selectedDb]);

    let selectedTimeCSS = `time-bucket-${selectedTime.replace(' ', '-')}`;
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
        dbSchema !== undefined &&
        selectedDb !== undefined &&
        selectedTable !== undefined &&
        selectedSensors !== undefined &&
        allData !== undefined &&
        maxTime !== undefined &&
        metaData !== undefined &&
        reduce(
            dbSchema[selectedDb][selectedTable],
            (prev, curr, _) => prev && allData[0][curr] !== undefined,
            true
        );

    return (
        <div className="w-full min-h-screen px-4 py-20 flex-col-center-top bg-slate-150">
            <main
                className={
                    'hidden md:flex flex-col items-center w-full max-w-5xl gap-y-6 ' +
                    selectedSensorCSS +
                    selectedTimeCSS
                }
            >
                {serverError && (
                    <div className="w-full max-w-md text-center">
                        Too many concurrent requests to the database. Please try again
                        in a few minutes.{' '}
                        <button
                            onClick={() => window.open('/', '_self')}
                            className="font-medium text-green-600 underline"
                        >
                            Reload now
                        </button>
                    </div>
                )}
                {!serverError && (
                    <>
                        {dbSchema === undefined && (
                            <div className="w-full text-center">loading schema ...</div>
                        )}
                        {dbSchema !== undefined && (
                            <>
                                <DataSelector
                                    {...{
                                        dbSchema,
                                        selectedDb,
                                        setSelectedDb,
                                        selectedTable,
                                        setSelectedTable,
                                        triggerRefresh: loadData,
                                        maxTime,
                                    }}
                                />
                                {selectedDb !== undefined &&
                                    selectedTable !== undefined &&
                                    !stateIsComplete && (
                                        <div className="w-full text-center">
                                            loading data ...
                                        </div>
                                    )}
                                {stateIsComplete && (
                                    <>
                                        {allData.length === 0 && (
                                            <>
                                                <div className="w-full h-px bg-slate-300" />
                                                <div className="w-full text-lg text-center text-slate-700">
                                                    table is empty
                                                </div>
                                            </>
                                        )}
                                        {allData.length > 0 && (
                                            <>
                                                <div className="w-full h-px bg-slate-300" />
                                                <SensorSelector
                                                    {...{
                                                        selectedSensors,
                                                        setSelectedSensors,
                                                    }}
                                                />
                                                <TimeSelector
                                                    {...{
                                                        selectedTime,
                                                        setSelectedTime,
                                                    }}
                                                />
                                                <div className="w-full h-px bg-slate-300" />
                                                {dbSchema[selectedDb][
                                                    selectedTable
                                                ].map((column_name, index) => (
                                                    <PlotPanel
                                                        key={index}
                                                        column_name={column_name}
                                                        data={allData}
                                                        metaData={metaData}
                                                        selectedSensors={
                                                            selectedSensors
                                                        }
                                                        maxTime={maxTime}
                                                        selectedTime={selectedTime}
                                                    />
                                                ))}
                                            </>
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
