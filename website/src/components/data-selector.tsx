import React from 'react';

function _Select(props: {
    label: string;
    options: string[];
    selectedValue: string | undefined;
    setSelectedValue(s: string | undefined): void;
    disabled: boolean;
}) {
    const { options, selectedValue, setSelectedValue } = props;
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700">
                {props.label}
            </label>
            <select
                name="location"
                className="block w-full py-2 pl-3 pr-10 mt-1 text-base rounded-md shadow-sm border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={selectedValue}
                onChange={(e: any) =>
                    props.disabled
                        ? {}
                        : setSelectedValue(
                              e.target.value !== '-' ? e.target.value : undefined
                          )
                }
                disabled={props.disabled}
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

const DataSelector = (props: {
    dbSchema: { [key: string]: { [key: string]: string[] } };
    selectedDb: string | undefined;
    setSelectedDb(s: string | undefined): void;
    selectedTable: string | undefined;
    setSelectedTable(s: string | undefined): void;
    isReloading: boolean;
}) => {
    return (
        <div className="flex-row-left-bottom gap-x-2">
            {Object.keys(props.dbSchema).length > 0 && (
                <_Select
                    label="database"
                    options={Object.keys(props.dbSchema)}
                    selectedValue={props.selectedDb}
                    setSelectedValue={props.setSelectedDb}
                    disabled={props.isReloading}
                />
            )}
            {Object.keys(props.dbSchema).length == 0 && <div>No databases found</div>}
            {props.selectedDb !== undefined && (
                <>
                    {Object.keys(props.dbSchema[props.selectedDb]).length > 0 && (
                        <>
                            <_Select
                                label="table"
                                options={Object.keys(props.dbSchema[props.selectedDb])}
                                selectedValue={props.selectedTable}
                                setSelectedValue={props.setSelectedTable}
                                disabled={props.isReloading}
                            />
                        </>
                    )}
                    {Object.keys(props.dbSchema[props.selectedDb]).length == 0 && (
                        <div>No tables found</div>
                    )}
                </>
            )}
        </div>
    );
};

export default DataSelector;
