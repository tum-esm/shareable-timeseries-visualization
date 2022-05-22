import React, { useEffect, useRef, useState } from 'react';
import { min, max, uniq, last } from 'lodash';
import * as d3 from 'd3';
import { plotCircles } from '../utilities/plot-d3-elements';
import icons from '../assets/icons';
import CONSTANTS from '../utilities/constants';

export default function PlotPanel(props: {
    column_name: string;
    data: { [key: string]: number | string }[];
    metaData: { [key: string]: { unit: string | null; description: string | null } };
}) {
    const { column_name, data, metaData } = props;
    console.log({ props });
    const [descriptionIsVisible, setDescriptionIsVisible] = useState(false);

    const d3Container = useRef(null);

    function plotD3stuff(column_name: string, data: { [key: string]: number | string }[]) {
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
    const sensorNames = uniq(data.map((d) => d['sensor'])).sort();

    return (
        <div className="w-full p-4 bg-white border rounded-lg shadow-sm border-slate-300 flex-col-center gap-y-2">
            <div className="w-full flex-row-left-top gap-x-1">
                <div>
                    <span className="font-semibold uppercase">{column_name}</span>
                    {unit !== undefined && <span className="ml-1 font-light">[{unit}]</span>}
                </div>
                {description !== undefined && (
                    <>
                        <button
                            className="flex-shrink-0 w-6 h-6 p-1 text-slate-500"
                            onClick={() => setDescriptionIsVisible(!descriptionIsVisible)}
                        >
                            {' '}
                            {icons.info}
                        </button>
                        {descriptionIsVisible && (
                            <div className="w-full py-0.5 text-sm text-slate-500 -ml-0.5">
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
                        <div className="w-20 px-1 py-1 font-light text-right">min</div>
                        <div className="w-20 px-1 py-1 font-semibold text-right">current</div>
                        <div className="w-20 px-1 py-1 font-light text-right">max</div>
                    </div>
                    {sensorNames.map((s, i) => (
                        <div className="py-1 text-right flex-row-right gap-x-1">
                            <div
                                className={
                                    'px-1 py-1 font-semibold text-center whitespace-nowrap ' +
                                    CONSTANTS.TEXT_COLORS[i]
                                }
                            >
                                {s}
                            </div>
                            <div className="w-20 px-1 py-1 font-light text-right">
                                {min(
                                    data.filter((d) => d['sensor'] === s).map((d) => d[column_name])
                                ).toFixed(3)}
                            </div>
                            <div className="w-20 px-1 py-1 font-semibold text-right">
                                {last(data.filter((d) => d['sensor'] === s))?.[column_name].toFixed(
                                    3
                                )}
                            </div>
                            <div className="w-20 px-1 py-1 font-light text-right">
                                {max(
                                    data.filter((d) => d['sensor'] === s).map((d) => d[column_name])
                                ).toFixed(3)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
