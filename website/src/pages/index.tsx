import React, { useState } from 'react';
import Settings from '../components/settings';
var mysql = require('mysql');

const IndexPage = () => {
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [database, setDatabase] = useState('');
    const [table, setTable] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [settingsVisible, setSettingsVisible] = useState(true);

    function onSubmitCredentials() {
        setIsConnecting(true);
        var connection = mysql.createConnection({
            host: 'esm-mysql-public-do-user-7320955-0.b.db.ondigitalocean.com',
            port: 25060,
            user: user,
            password: password,
        });

        connection.connect();

        // TODO: set up mysql client
        // TODO: find table -> catch invalid table
        // TODO: fetch schema (column names and types)
    }

    return (
        <>
            <Settings
                {...{
                    user,
                    setUser,
                    password,
                    setPassword,
                    database,
                    setDatabase,
                    table,
                    setTable,
                }}
                {...{
                    isConnecting,
                    settingsVisible,
                    setSettingsVisible,
                    onSubmitCredentials,
                }}
            />
            <main className="flex items-center justify-center w-full min-h-screen py-20 bg-slate-100">
                main
            </main>
        </>
    );
};

export default IndexPage;
