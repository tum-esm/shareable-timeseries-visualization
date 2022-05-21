import React, { useEffect, useRef, useState } from 'react';
import { min, max } from 'lodash';
import * as d3 from 'd3';
import { plotCircles } from '../utilities/plot-d3-elements';
import icons from '../assets/icons';

export default function PlotPanel(props: {
    column_name: string;
    data: { [key: string]: number | string }[];
    metaData: { [key: string]: { unit: string | null; description: string | null } };
}) {
    const { column_name, data, metaData } = props;
    const minY: any = min(data.map((d) => d[column_name]));
    const maxY: any = max(data.map((d) => d[column_name]));

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
                <div className="flex-grow" />
                <div className="whitespace-nowrap">
                    <span className="opacity-60">min: </span>
                    {minY}
                </div>
                <div className="whitespace-nowrap">
                    <span className="opacity-60">max: </span>
                    {maxY}
                </div>
            </div>
            <div className="w-full">
                <svg
                    className="relative z-0 w-full no-selection"
                    ref={d3Container}
                    viewBox={`0 0 400 120`}
                />
            </div>
        </div>
    );
}
