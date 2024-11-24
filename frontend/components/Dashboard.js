import React, { useState } from 'react';
import axios from 'axios';

function Dashboard({ logs, onDeleteLog, onClearAll }) {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(false);

    const totalWaterUsage = logs.reduce((total, log) => total + log.waterUsed, 0);

    const fetchInsights = async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://127.0.0.1:5000/analyze', {
                logs: logs.map(({ activityType, waterUsed, dateTime }) => ({
                    activityType,
                    waterUsed,
                    dateTime,
                })),
            });
            setInsights(response.data);
        } catch (error) {
            console.error('Error fetching insights:', error);
            setInsights({ error: 'Failed to fetch insights. Please try again later.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Water Usage Dashboard</h2>
            <p>Total Water Used: {totalWaterUsage} liters</p>
            <button onClick={onClearAll}>Clear All</button>
            <button onClick={fetchInsights} disabled={loading}>
                {loading ? 'Fetching Insights...' : 'Get Insights'}
            </button>

            {insights && (
                <div>
                    <h3>Insights & Tips</h3>
                    {insights.error ? (
                        <p>{insights.error}</p>
                    ) : (
                        <ul>
                            {insights.tips.map((tip, index) => (
                                <li key={index}>{tip}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            <h3>Logs</h3>
            <ul>
                {logs.map((log) => (
                    <li key={log.id}>
                        {log.dateTime} - {log.activityType}: {log.waterUsed} liters
                        <button onClick={() => onDeleteLog(log.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Dashboard;
