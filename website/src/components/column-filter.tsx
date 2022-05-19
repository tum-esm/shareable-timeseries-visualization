import { uniq } from 'lodash';
import React, { useEffect, useState } from 'react';

const FilterRow = (props: {
    filter: {
        key: string;
        value: string | undefined;
    };
    setValue(v: string): void;
    onRemove(): void;
    possibleValues: string[];
}) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        props.setValue(props.possibleValues[selectedIndex]);
        console.log(`new value: ${props.possibleValues[selectedIndex]}}`);
    }, [selectedIndex]);

    const changeValue = (delta: number) => () => {
        let newSelectedIndex = selectedIndex + delta;
        if (newSelectedIndex < 0) {
            newSelectedIndex += props.possibleValues.length;
        }
        if (newSelectedIndex >= props.possibleValues.length) {
            newSelectedIndex = 0;
        }
        setSelectedIndex(newSelectedIndex);
    };

    return (
        <div className="w-full text-sm flex-row-left gap-x-1">
            <span>
                Column <span className="font-semibold">"{props.filter.key}"</span> should equal
            </span>
            <div className="bg-white border divide-x rounded-md shadow-sm border-slate-300 flex-row-center divide-slate-300">
                <button onClick={changeValue(-1)} className="h-6 px-3">
                    {'<'}
                </button>
                <button onClick={changeValue(1)} className="h-6 px-3">
                    {'>'}
                </button>
                <span className="h-6 px-3 font-semibold leading-6">{props.filter.value}</span>
            </div>
            <div className="flex-grow h-px mx-1 bg-gray-300" />
            <button
                onClick={props.onRemove}
                className="h-6 px-3 bg-white border rounded-md shadow-sm border-slate-300"
            >
                remove filter
            </button>
        </div>
    );
};

const ColumnFilter = (props: {
    rawData: { [key: string]: string | number }[];
    setFilteredData(d: any): void;
    columns: { key: string; type: 'float' | 'string' }[];
}) => {
    const [filters, setFilters] = useState<{ key: string; value: string | undefined }[]>([]);
    const [freeColumns, setFreeColumns] = useState(
        props.columns.filter((c) => c.type === 'string').map((c) => c.key)
    );

    const removeFilter = (key: string) => () => {
        const newFilters = filters.filter((f) => f.key !== key);
        setFilters(newFilters);
        setFreeColumns(
            props.columns
                .filter((c) => c.type === 'string')
                .map((c) => c.key)
                .filter((k) => newFilters.filter((f) => f.key === k).length === 0)
        );
    };
    const addFilter = (key: string) => {
        setFilters([...filters, { key: key, value: undefined }]);
        setFreeColumns(freeColumns.filter((f) => f !== key));
    };
    const updateFilter = (key: string) => (value: string) => {
        setFilters(filters.map((f) => (f.key === key ? { key, value } : f)));
    };

    const getPossibleValues = (key: string): string[] => {
        return uniq(props.rawData.map((r: any) => r[key]));
    };

    useEffect(() => {
        let newFilteredData = JSON.parse(JSON.stringify(props.rawData));
        filters.forEach((f) => {
            if (f.value !== undefined) {
                newFilteredData = newFilteredData.filter((r) => r[f.key] === f.value);
            }
        });
        props.setFilteredData(newFilteredData);
    }, [filters]);

    return (
        <div className="w-full flex-col-left gap-y-1">
            {filters.map((f) => (
                <FilterRow
                    key={f.key}
                    filter={f}
                    possibleValues={getPossibleValues(f.key)}
                    setValue={updateFilter(f.key)}
                    onRemove={removeFilter(f.key)}
                />
            ))}
            {freeColumns.length > 0 && (
                <div className="w-full text-sm flex-row-left gap-x-2">
                    Filter data by column:{' '}
                    {freeColumns.map((c) => (
                        <button
                            key={c}
                            className="px-2 py-0 bg-white border border-gray-300 rounded-md shadow-sm"
                            onClick={() => addFilter(c)}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ColumnFilter;
