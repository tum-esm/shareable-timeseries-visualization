import React from 'react';

function _Select(props: {
    label: string;
    options: string[];
    selectedValue: string | undefined;
    setSelectedValue(s: string | undefined): void;
}) {
    const { options, selectedValue, setSelectedValue } = props;
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">{props.label}</label>
            <select
                name="location"
                className="block w-full py-2 pl-3 pr-10 mt-1 text-base border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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

const DataSelector = (props: {
    databaseSchema: { [key: string]: { [key: string]: string[] } };
    selectedDatabase: string | undefined;
    setSelectedDatabase(s: string | undefined): void;
    selectedTable: string | undefined;
    setSelectedTable(s: string | undefined): void;
}) => {
    return (
        <div className="w-full flex-row-left gap-x-2">
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
                        <_Select
                            label="table"
                            options={Object.keys(props.databaseSchema[props.selectedDatabase])}
                            selectedValue={props.selectedTable}
                            setSelectedValue={props.setSelectedTable}
                        />
                    )}
                    {Object.keys(props.databaseSchema[props.selectedDatabase]).length == 0 && (
                        <div>No tables found</div>
                    )}
                </>
            )}
        </div>
    );
};

export default DataSelector;
