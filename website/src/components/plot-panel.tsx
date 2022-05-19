import React from 'react';
import { min, max } from 'lodash';

export default function PlotPanel(props: {
    column_name: string;
    data: { [key: string]: number | string }[];
}) {
    const { column_name, data } = props;

    const minY: any = min(data.map((d) => d[column_name]));
    const maxY: any = max(data.map((d) => d[column_name]));

    const maxX: any = max(data.map((d) => d['hour']));
    const minX: any = maxX - 2;

    return (
        <div className="w-full p-4 bg-white border border-gray-300 rounded-lg shadow-sm flex-col-center gap-y-2">
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
            <div className="w-full h-8 bg-red-200"></div>
        </div>
    );
}
