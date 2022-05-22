import React from 'react';
import transformTimeseries from '../utilities/transform-timeseries';
import icons from '../assets/icons';

function _Select(props: {
    label: string;
    options: string[];
    selectedValue: string | undefined;
    setSelectedValue(s: string | undefined): void;
}) {
    const { options, selectedValue, setSelectedValue } = props;
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700">{props.label}</label>
            <select
                name="location"
                className="block w-full py-2 pl-3 pr-10 mt-1 text-base rounded-md border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={selectedValue}
                onChange={(e: any) =>
                    setSelectedValue(e.target.value !== '-' ? e.target.value : undefined)
                }
            >
                <option value={undefined}>-</option>
                {options.map((v, i) => (
                    <option key={v} value={v}>
                        {v}
                    </option>
                ))}
            </select>
        </div>
    );
}

function _RefreshButton(props: { onClick(): void }) {
    return (
        <button
            name="location"
            className="p-1.5 text-base bg-white border rounded-md border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-800"
            onClick={props.onClick}
        >
            <div className="w-5 h-5 p-0.5">{icons.refresh}</div>
        </button>
    );
}

const DataSelector = (props: {
    databaseSchema: { [key: string]: { [key: string]: string[] } };
    selectedDatabase: string | undefined;
    setSelectedDatabase(s: string | undefined): void;
    selectedTable: string | undefined;
    setSelectedTable(s: string | undefined): void;
    triggerRefresh(): void;
    maxTime: { date: number; hour: number } | undefined;
}) => {
    return (
        <div className="w-full flex-row-left-bottom gap-x-2">
            {Object.keys(props.databaseSchema).length > 0 && (
                <_Select
                    label="database"
                    options={Object.keys(props.databaseSchema)}
                    selectedValue={props.selectedDatabase}
                    setSelectedValue={props.setSelectedDatabase}
                />
            )}
            {Object.keys(props.databaseSchema).length == 0 && <div>No databases found</div>}
            {props.selectedDatabase !== undefined && (
                <>
                    {Object.keys(props.databaseSchema[props.selectedDatabase]).length > 0 && (
                        <>
                            <_Select
                                label="table"
                                options={Object.keys(props.databaseSchema[props.selectedDatabase])}
                                selectedValue={props.selectedTable}
                                setSelectedValue={props.setSelectedTable}
                            />
                        </>
                    )}
                    {Object.keys(props.databaseSchema[props.selectedDatabase]).length == 0 && (
                        <div>No tables found</div>
                    )}
                </>
            )}
            <div className="flex-grow" />
            {props.maxTime !== undefined && (
                <>
                    <div className="text-sm h-7 text-slate-900">
                        <span className="opacity-60">Newest data:</span> {props.maxTime.date},{' '}
                        {transformTimeseries.renderTimeLabel(props.maxTime.hour)} (UTC)
                    </div>
                    <_RefreshButton onClick={props.triggerRefresh} />
                </>
            )}
        </div>
    );
};

export default DataSelector;
