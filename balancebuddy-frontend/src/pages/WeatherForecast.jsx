import React, { useEffect, useState } from "react";

const WeatherForecast = () => {
    const [weather, setWeather] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("/weatherforecast")
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(setWeather)
            .catch((err) => {
                console.error("Weather fetch error:", err);
                setError("Could not load weather data.");
            });
    }, []);

    return (
        <div>
            <h2>Weather Forecast</h2>
            {error ? (
                <p style={{ color: "red" }}>{error}</p>
            ) : (
                <ul>
                    {weather.map((w, index) => (
                        <li key={index}>
                            {w.date} – {w.summary} – {w.temperatureC}°C
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default WeatherForecast;
