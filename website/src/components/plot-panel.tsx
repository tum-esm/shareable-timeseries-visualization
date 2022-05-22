import React, { useEffect, useMemo, useRef, useState } from 'react';
import { min, max, uniq, reduce, mean, first } from 'lodash';
import * as d3 from 'd3';
import { plotCircles } from '../utilities/plot-d3-elements';
import icons from '../assets/icons';
import CONSTANTS from '../utilities/constants';

export default function PlotPanel(props: {
    column_name: string;
    data: { [key: string]: number | string }[];
    metaData: { [key: string]: { unit: string | null; description: string | null } };
    selectedSensors: { [key: string]: boolean };
}) {
    const { column_name, data, metaData, selectedSensors } = props;
    console.log({ props });
    const [descriptionIsVisible, setDescriptionIsVisible] = useState(false);

    const d3Container = useRef(null);

    function plotD3stuff(
        column_name: string,
        data: { [key: string]: number | string }[]
    ) {
        if (d3Container.current) {
            if (data.length > 0 && data[0][column_name] !== undefined) {
                const svg = d3.select(d3Container.current);
                plotCircles(svg, column_name, data);
            }
        }
    }

    useEffect(() => {
        plotD3stuff(column_name, data);
    }, [d3Container.current, column_name, data]);

    const unit = metaData[column_name]?.unit || undefined;
    const description = metaData[column_name]?.description || undefined;
    const sensorNames: string[] = uniq(data.map((d): any => d['sensor'])).sort();

    const statisticalValues = useMemo(
        () =>
            reduce(
                sensorNames,
                (
                    prev: {
                        [key: string]: {
                            current: number;
                            min: number;
                            mean: number;
                            max: number;
                        };
                    },
                    sensorName,
                    _
                ) => {
                    const _sensorData = data
                        .filter((d) => d['sensor'] === sensorName)
                        .map((d): any => d[column_name]);
                    return {
                        ...prev,
                        [sensorName]: {
                            current: first(_sensorData),
                            min: min(_sensorData),
                            mean: mean(_sensorData),
                            max: max(_sensorData),
                        },
                    };
                },
                {}
            ),
        [data]
    );

    return (
        <div className="w-full p-4 bg-white border rounded-lg shadow-sm border-slate-300 flex-col-center gap-y-2">
            <div className="w-full flex-row-left-top gap-x-1">
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
            <div className="w-full flex-row-left-top">
                <svg
                    className="relative z-0 flex-grow my-4 no-selection"
                    ref={d3Container}
                    viewBox={`0 0 400 150`}
                />
                <div className="flex-col items-center hidden pb-4 ml-4 font-mono text-sm divide-y divide-slate-300 lg:flex">
                    <div className="w-full py-0.5 flex-row-right gap-x-1">
                        {['current', 'min', 'mean', 'max'].map((t, j) => (
                            <div
                                className={
                                    'w-20 px-1 py-1  text-right ' +
                                    (j == 0 ? 'font-semibold' : 'text-light')
                                }
                            >
                                {t}
                            </div>
                        ))}
                    </div>
                    {sensorNames.map((s, i) => (
                        <div className={'py-1 text-right flex-row-right gap-x-1 '}>
                            <div
                                className={
                                    'px-1 py-1 font-semibold text-center whitespace-nowrap ' +
                                    CONSTANTS.TEXT_COLORS[i] +
                                    ' ' +
                                    (selectedSensors[s]
                                        ? 'opacity-100 '
                                        : 'opacity-30 ')
                                }
                            >
                                {s}
                            </div>
                            {['current', 'min', 'mean', 'max'].map((t, j) => (
                                <div
                                    className={
                                        'w-20 px-1 py-1 text-right font-mono ' +
                                        (selectedSensors[s]
                                            ? 'opacity-100 '
                                            : 'opacity-30 ') +
                                        (j == 0
                                            ? 'font-semibold ' +
                                              CONSTANTS.TEXT_COLORS[i]
                                            : 'text-light')
                                    }
                                >
                                    {/* @ts-ignore */}
                                    {statisticalValues[s][t].toFixed(3)}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
