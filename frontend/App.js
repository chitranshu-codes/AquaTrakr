import React, { useState, useEffect } from 'react';
import WaterLogForm from './WaterLogForm';
import Dashboard from './Dashboard';
import './App.css';

function App() {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const savedLogs = JSON.parse(localStorage.getItem('waterUsageLogs')) || [];
        setLogs(savedLogs);
    }, []);

    const addLog = (log) => {
        const updatedLogs = [log, ...logs];
        setLogs(updatedLogs);
        localStorage.setItem('waterUsageLogs', JSON.stringify(updatedLogs));
    };

    const deleteLog = (id) => {
        const updatedLogs = logs.filter((log) => log.id !== id);
        setLogs(updatedLogs);
        localStorage.setItem('waterUsageLogs', JSON.stringify(updatedLogs));
    };

    const clearAllLogs = () => {
        setLogs([]);
        localStorage.removeItem('waterUsageLogs');
    };

    return (
        <div className="App">
            <h1>AquaTrakr</h1>
            <WaterLogForm onAddLog={addLog} />
            <Dashboard logs={logs} onDeleteLog={deleteLog} onClearAll={clearAllLogs} />
        </div>
    );
}

export default App;


