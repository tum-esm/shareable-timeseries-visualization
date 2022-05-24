import React, { useEffect, useMemo, useRef, useState } from 'react';
import { min, max, uniq, reduce, mean, first } from 'lodash';
import * as d3 from 'd3';
import { plotCircles } from '../utilities/plot-d3-elements';
import icons from '../assets/icons';
import { CONSTANTS, TYPES } from '../utilities/constants';

function TableRow(props: { className: string; children: React.ReactNode }) {
    return (
        <div className={'w-full px-3 py-2 flex-row-right space-x-1 ' + props.className}>
            {props.children}
        </div>
    );
}

function TableCell(props: {
    className: string;
    children: React.ReactNode;
    header?: boolean;
    leader?: boolean;
}) {
    return (
        <div
            className={
                'text-right whitespace-nowrap ' +
                (props.header ? 'uppercase text-xs py-1 ' : 'text-sm ') +
                (props.leader ? 'font-bold ' : 'font-light ') +
                props.className
            }
        >
            {props.children}
        </div>
    );
}

export default function PlotPanel(props: {
    column_name: string;
    data: { [key: string]: number | string }[];
    metaData: {
        [key: string]: {
            unit: string | null;
            description: string | null;
            minimum: number | null;
            decimal_places: number | null;
            detection_limit: number | null;
        };
    };
    selectedSensors: { [key: string]: boolean };
    maxTime: { hour: number; date: number };
    selectedTime: TYPES.TimeBucket;
}) {
    const { column_name, data, metaData, selectedSensors, maxTime, selectedTime } =
        props;
    console.log({ props });
    const [descriptionIsVisible, setDescriptionIsVisible] = useState(false);

    const d3Container = useRef(null);
    const unit = metaData[column_name].unit || undefined;
    const description = metaData[column_name].description || undefined;
    const decimal_places: number = Math.floor(
        metaData[column_name].decimal_places || 3
    );
    const sensorNames: string[] = uniq(data.map((d): any => d['sensor'])).sort();

    function plotD3stuff(
        column_name: string,
        data: { [key: string]: number | string }[]
    ) {
        if (d3Container.current) {
            if (data.length > 0 && data[0][column_name] !== undefined) {
                const svg = d3.select(d3Container.current);
                plotCircles(svg, column_name, data, { decimal_places });
            }
        }
    }

    useEffect(() => {
        plotD3stuff(column_name, data);
    }, [d3Container.current, column_name, data]);

    function sensorStats(
        _data: { [key: string]: number | string }[],
        _sensorName: string
    ) {
        const _sensorData = _data.filter((d: any) => d['sensor'] === _sensorName);

        // the "current" value only considers the last 3 minutes
        const _currentValue = first(
            _sensorData
                .filter((d) => d['hour'] >= maxTime.hour - 0.05)
                .map((d): any => d[column_name])
        );
        const _stats = {
            current:
                _currentValue !== undefined
                    ? _currentValue.toFixed(decimal_places)
                    : '-',
            min: '-',
            mean: '-',
            max: '-',
        };
        const _xs = _sensorData.map((d): any => d[column_name]);
        if (_xs.length > 0) {
            _stats.min = min(_xs).toFixed(decimal_places);
            _stats.mean = mean(_xs).toFixed(decimal_places);
            _stats.max = max(_xs).toFixed(decimal_places);
        }

        return { [_sensorName]: _stats };
    }

    function timeStats(
        _data: { [key: string]: number | string }[],
        _time: TYPES.TimeBucket
    ) {
        const _timeData = _data.filter(
            (d) => d['hour'] >= maxTime.hour - CONSTANTS.HOUR_FRACTIONS[_time]
        );
        return {
            [_time]: reduce(
                sensorNames,
                (prev2, sensorName, _) => ({
                    ...prev2,
                    ...sensorStats(_timeData, sensorName),
                }),
                {}
            ),
        };
    }

    // @ts-ignore
    const statisticalValues: {
        [key in TYPES.TimeBucket]: {
            [key: string]: {
                current: string;
                min: string;
                mean: string;
                max: string;
            };
        };
    } = useMemo(
        () =>
            reduce(
                CONSTANTS.TIMES,
                (prev1, time, _) => ({ ...prev1, ...timeStats(data, time) }),
                {}
            ),
        [data]
    );

    return (
        <div
            className="grid w-full overflow-hidden bg-white border rounded-lg shadow-sm border-slate-300 gap-y-2"
            style={{ gridTemplateColumns: '1fr auto' }}
        >
            <div className="w-full p-3 flex-col-left-top">
                <div className="w-full p-1 flex-row-left-top gap-x-1">
                    <div className="text-xl">
                        <span className="font-semibold uppercase">{column_name}</span>
                        {unit !== undefined && (
                            <span className="ml-1 font-light">[{unit}]</span>
                        )}
                    </div>
                    {description !== undefined && (
                        <>
                            <button
                                className="flex-shrink-0 p-1 opacity-50 w-7 h-7 text-slate-700"
                                onClick={() =>
                                    setDescriptionIsVisible(!descriptionIsVisible)
                                }
                            >
                                {' '}
                                {icons.info}
                            </button>
                            {descriptionIsVisible && (
                                <div className="w-full py-1 text-sm text-slate-700 -ml-0.5">
                                    {description}
                                </div>
                            )}
                        </>
                    )}
                </div>
                <svg
                    className="relative z-0 my-4 no-selection"
                    ref={d3Container}
                    viewBox={`0 0 400 150`}
                />
            </div>
            <div
                className={
                    'flex-col items-center hidden font-mono divide-slate-300 lg:flex ' +
                    'bg-slate-75 rounded-r-lg h-full text-sm border-l border-slate-300'
                }
            >
                <TableRow className="mb-1 text-white rounded-tr-lg bg-slate-900">
                    {['current', 'min', 'mean', 'max'].map((t) => (
                        <TableCell
                            key={t}
                            header
                            leader={t === 'current'}
                            className="w-20"
                        >
                            {t}
                        </TableCell>
                    ))}
                </TableRow>
                {sensorNames.map((s, i) => (
                    <TableRow className="border-b border-slate-300 last:border-0">
                        <TableCell
                            leader
                            className={
                                (selectedSensors[s] ? 'opacity-100 ' : 'opacity-30 ') +
                                CONSTANTS.TEXT_COLORS[i]
                            }
                        >
                            {s}
                        </TableCell>
                        {['current', 'min', 'mean', 'max'].map((t) => (
                            <TableCell
                                leader={t === 'current'}
                                className={
                                    (selectedSensors[s]
                                        ? 'opacity-100 '
                                        : 'opacity-30 ') +
                                    CONSTANTS.TEXT_COLORS[i] +
                                    ' w-20 font-mono'
                                }
                            >
                                {/* @ts-ignore */}
                                {statisticalValues[selectedTime][s][t]}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </div>
        </div>
    );
}
