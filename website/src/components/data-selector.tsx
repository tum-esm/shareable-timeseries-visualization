import React from 'react';
import Select from './select';

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
                <Select
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
                        <Select
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
