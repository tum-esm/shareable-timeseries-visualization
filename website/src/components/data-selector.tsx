import React from 'react';
import Select from './select';

const DataSelector = (props: {
    databases: string[] | undefined;
    databaseIndex: number | undefined;
    setDatabaseIndex(i: number): void;
    tables: string[] | undefined;
    tableIndex: number | undefined;
    setTableIndex(i: number): void;
    columns: any;
}) => {
    return (
        <div className="w-full flex-row-left gap-x-2">
            {props.databases === undefined && 'loading databases'}
            {props.databases !== undefined &&
                (props.databases.length > 0 ? (
                    <Select
                        label="database"
                        options={props.databases}
                        selectedIndex={props.databaseIndex}
                        setSelectedIndex={props.setDatabaseIndex}
                    />
                ) : (
                    <div>No databases found</div>
                ))}
            {props.tables !== undefined &&
                (props.tables.length > 0 ? (
                    <Select
                        label="table"
                        options={props.tables}
                        selectedIndex={props.tableIndex}
                        setSelectedIndex={props.setTableIndex}
                    />
                ) : (
                    <div>No tables found</div>
                ))}
        </div>
    );
};

export default DataSelector;
