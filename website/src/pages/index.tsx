import { reduce, uniq } from 'lodash';
import React, { useEffect, useState } from 'react';
import DataSelector from '../components/data-selector';
import PlotPanel from '../components/plot-panel';
import SensorSelector from '../components/sensor-selector';
import TimeSelector from '../components/time-selector';
import backend from '../utilities/backend';
import { TYPES, CONSTANTS } from '../utilities/constants';
import transformTimeseries from '../utilities/utility-functions';
import ReloadSelector from '../components/reload-selector';

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
    const [autoReload, setAutoReload] = useState(false);
    const [isReloading, setIsReloading] = useState(false);

    useEffect(() => {
        if (autoReload) {
            const interval = setInterval(function () {
                loadData();
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [autoReload, dbSchema, selectedDb, selectedTable]);

    async function loadDatabaseSchema() {
        try {
            setDbSchema(await backend.getSchema());
        } catch {
            setServerError(true);
        }
    }
    async function loadData() {
        console.log('loading data');
        if (
            dbSchema !== undefined &&
            selectedDb !== undefined &&
            selectedTable !== undefined
        ) {
            setIsReloading(true);
            try {
                const _rawData = await backend.getData(selectedDb, selectedTable);
                const _metaData = await backend.getMetaData(selectedDb, selectedTable);
                const { newMaxTime, newData } = transformTimeseries.mergeTimeColumns(
                    _rawData,
                    dbSchema[selectedDb][selectedTable]
                );
                setAllData(newData);
                setMaxTime(newMaxTime);
                setMetaData(_metaData);
                setIsReloading(false);
            } catch {
                setServerError(true);
                setIsReloading(false);
            }
        }
    }

    useEffect(() => {
        if (allData === undefined) {
            setSelectedSensors({});
        } else {
            const uniqueSensorNames = uniq(allData.map((d) => d['sensor']));

            setSelectedSensors(
                reduce(
                    uniqueSensorNames,
                    (prev, curr, index) => ({ ...prev, [curr]: true }),
                    {}
                )
            );
            if (uniqueSensorNames.length > 12) {
                alert('Too many sensor, only plotting the first 12.');
            }
        }
    }, [allData]);

    useEffect(() => {
        loadDatabaseSchema();
    }, []);

    useEffect(() => {
        setAutoReload(false);
        setAllData(undefined);
        setMaxTime(undefined);
        setMetaData(undefined);
        loadData();
    }, [dbSchema, selectedDb, selectedTable]);

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
                    'hidden md:flex flex-col w-full items-start max-w-5xl gap-y-6 ' +
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
                                <div className="flex flex-row items-end w-full">
                                    <DataSelector
                                        {...{
                                            dbSchema,
                                            selectedDb,
                                            setSelectedDb,
                                            selectedTable,
                                            setSelectedTable,
                                            isReloading,
                                        }}
                                    />
                                    <div className="flex-grow" />
                                    {stateIsComplete && (
                                        <TimeSelector
                                            {...{
                                                selectedTime,
                                                setSelectedTime,
                                            }}
                                        />
                                    )}
                                </div>
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
                                                <div className="flex flex-row items-start w-full">
                                                    <SensorSelector
                                                        {...{
                                                            selectedSensors,
                                                            setSelectedSensors,
                                                        }}
                                                    />
                                                    <div className="flex-grow" />
                                                    <ReloadSelector
                                                        {...{
                                                            maxTime,
                                                            autoReload,
                                                            setAutoReload,
                                                            triggerManualReload:
                                                                loadData,
                                                            isReloading,
                                                        }}
                                                    />
                                                </div>
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

/*

<div className="flex-grow" />
            {props.maxTime !== undefined && (
                <>
                    <div className="text-sm h-7 text-slate-900">
                        <span className="opacity-60">Newest data:</span>{' '}
                        {props.maxTime.date},{' '}
                        {transformTimeseries.renderTimeLabel(props.maxTime.hour)} (UTC)
                    </div>
                    <_RefreshButton onClick={props.triggerRefresh} />
                </>
            )}
            
            */
