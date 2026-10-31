import { http, wrap, assertString } from '../utils/http.js';

const WMO = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Rime fog',
    51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
    56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    66: 'Light freezing rain', 67: 'Heavy freezing rain',
    71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow', 77: 'Snow grains',
    80: 'Slight showers', 81: 'Moderate showers', 82: 'Violent showers',
    85: 'Slight snow showers', 86: 'Heavy snow showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
};

const condition = code => WMO[code] ?? 'Unknown';

export function weather(city, days = 3) {
    return wrap('Search.weather', async () => {
        const q = assertString(city, 'city');
        const { data: geo } = await http.get('https://geocoding-api.open-meteo.com/v1/search', {
            params: { name: q, count: 1, language: 'en', format: 'json' }
        });
        const loc = geo.results?.[0];
        if (!loc) throw new Error('location not found');

        const { data: w } = await http.get('https://api.open-meteo.com/v1/forecast', {
            params: {
                latitude: loc.latitude,
                longitude: loc.longitude,
                current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m',
                daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset',
                timezone: 'auto',
                forecast_days: Math.min(Math.max(days, 1), 16)
            }
        });

        const c = w.current;
        return {
            location: {
                name: loc.name,
                country: loc.country,
                region: loc.admin1 ?? null,
                latitude: loc.latitude,
                longitude: loc.longitude,
                timezone: loc.timezone
            },
            current: {
                time: c.time,
                temperature: c.temperature_2m,
                feelsLike: c.apparent_temperature,
                humidity: c.relative_humidity_2m,
                precipitation: c.precipitation,
                windSpeed: c.wind_speed_10m,
                isDay: Boolean(c.is_day),
                condition: condition(c.weather_code)
            },
            daily: (w.daily?.time ?? []).map((date, i) => ({
                date,
                condition: condition(w.daily.weather_code[i]),
                max: w.daily.temperature_2m_max[i],
                min: w.daily.temperature_2m_min[i],
                precipitationChance: w.daily.precipitation_probability_max[i],
                sunrise: w.daily.sunrise[i],
                sunset: w.daily.sunset[i]
            }))
        };
    });
}