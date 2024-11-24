import React, { useState } from 'react';

function WaterLogForm({ onAddLog }) {
    const [activityType, setActivityType] = useState('');
    const [timeSpent, setTimeSpent] = useState('');
    const [frequency, setFrequency] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [tips, setTips] = useState([]);
    const [totalUsage, setTotalUsage] = useState(0);

    const handleAddLog = async () => {
        // Input validation
        if (!activityType) {
            setErrorMessage('Please select an activity type.');
            return;
        }
        if ((activityType === 'Showering' || activityType === 'Gardening') && !timeSpent) {
            setErrorMessage('Please enter time spent for this activity.');
            return;
        }
        if ((activityType !== 'Showering' && activityType !== 'Gardening') && !frequency) {
            setErrorMessage('Please enter frequency for this activity.');
            return;
        }

        setErrorMessage('');

        const calculatedWaterUsed =
            activityType === 'Showering' || activityType === 'Gardening'
                ? parseFloat(timeSpent) * (activityType === 'Showering' ? 7.9 : 20)
                : parseFloat(frequency) * (activityType === 'Dishwashing' ? 15 : activityType === 'Laundry' ? 50 : activityType === 'Swimming' ? 50000 : 100);

        const newLog = {
            id: Date.now(),
            dateTime: new Date().toLocaleString(),
            activityType,
            waterUsed: calculatedWaterUsed,
        };

        onAddLog(newLog);

        try {
            const response = await fetch('http://127.0.0.1:5000/generate-tips', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ [activityType]: frequency || timeSpent }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch tips from the server');
            }

            const data = await response.json();
            setTips(data.tips);
            setTotalUsage(data.total_water_usage);
        } catch (error) {
            setErrorMessage('Error fetching tips: ' + error.message);
        }

        setActivityType('');
        setTimeSpent('');
        setFrequency('');
    };

    return (
        <div>
            <h3>Enter Water Usage Log</h3>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

            <label>
                Activity Type:
                <select value={activityType} onChange={(e) => setActivityType(e.target.value)}>
                    <option value="">Select Activity</option>
                    <option value="Showering">Showering</option>
                    <option value="Dishwashing">Dishwashing</option>
                    <option value="Laundry">Laundry</option>
                    <option value="Swimming">Swimming</option>
                    <option value="Car Washing">Car Washing</option>
                    <option value="Gardening">Gardening</option>
                </select>
            </label>

            {(activityType === 'Showering' || activityType === 'Gardening') && (
                <label>
                    Time Spent (minutes):
                    <input type="number" value={timeSpent} onChange={(e) => setTimeSpent(e.target.value)} min="1" />
                </label>
            )}

            {(activityType !== 'Showering' && activityType !== 'Gardening') && (
                <label>
                    Frequency (times per week):
                    <input type="number" value={frequency} onChange={(e) => setFrequency(e.target.value)} min="1" />
                </label>
            )}

            <button onClick={handleAddLog}>Add Log</button>

            {tips.length > 0 && (
                <div>
                    <h4>Suggested Tips:</h4>
                    <ul>
                        {tips.map((tip, index) => (
                            <li key={index}>{tip}</li>
                        ))}
                    </ul>
                    <p>Total water usage so far: {totalUsage} liters</p>
                </div>
            )}
        </div>
    );
}

export default WaterLogForm;
