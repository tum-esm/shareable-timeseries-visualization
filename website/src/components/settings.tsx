import React from 'react';
import Button from './button';
import Input from './input';

const Settings = (props: {
    user: string;
    setUser(s: string): void;
    password: string;
    setPassword(s: string): void;
    database: string;
    setDatabase(s: string): void;
    table: string;
    setTable(s: string): void;

    isConnecting: boolean;
    settingsVisible: boolean;
    setSettingsVisible(b: boolean): void;
    onSubmitCredentials(): void;
}) => {
    return (
        <>
            <header
                className={
                    'fixed top-0 left-0 w-full bg-slate-800 p-6 text-slate-100 ' +
                    'transition-transform duration-200 z-50 shadow-lg ' +
                    (!props.settingsVisible ? '-translate-y-full' : '')
                }
            >
                <div className="flex-row-left-bottom gap-x-4">
                    <Input label="username" value={props.user} setValue={props.setUser} />
                    <Input
                        label="password"
                        value={props.password}
                        setValue={props.setPassword}
                        type="password"
                    />
                    <Input label="database" value={props.database} setValue={props.setDatabase} />
                    <Input label="table" value={props.table} setValue={props.setTable} />
                    <div className="flex-grow" />
                    <Button
                        text={props.isConnecting ? '...' : 'connect'}
                        disabled={props.isConnecting}
                        onClick={props.onSubmitCredentials}
                    />
                </div>
            </header>
            <div className="fixed top-0 left-0 z-40 flex items-center justify-center w-screen h-screen text-white bg-slate-950">
                <div className="text-center">
                    TUEIESM - Shareable Timeseries Visualization
                    <br />
                    <a
                        href="https://github.com/tum-esm/shareable-timeseries-visualization"
                        target="_blank"
                        className="font-medium text-blue-300 underline"
                    >
                        https://github.com/tum-esm/shareable-timeseries-visualization
                    </a>
                </div>
            </div>
        </>
    );
};

export default Settings;
