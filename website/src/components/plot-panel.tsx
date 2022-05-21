import React, { useEffect, useRef } from 'react';
import { min, max } from 'lodash';
import * as d3 from 'd3';
import { plotCircles } from '../utilities/plot-d3-elements';

export default function PlotPanel(props: {
    column_name: string;
    data: { [key: string]: number | string }[];
}) {
    const { column_name, data } = props;
    const minY: any = min(data.map((d) => d[column_name]));
    const maxY: any = max(data.map((d) => d[column_name]));

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

    return (
        <div className="w-full p-4 bg-white border rounded-lg shadow-sm border-slate-300 flex-col-center gap-y-2">
            <div className="w-full flex-row-left gap-x-4">
                <div className="font-semibold uppercase">{column_name}</div>
                <div className="flex-grow" />
                <div className="">
                    <span className="opacity-60">min: </span>
                    {minY}
                </div>
                <div className="">
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
