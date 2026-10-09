# Weather Prototype (OpenWeatherMap Live)

A live atmospheric station and weather forecasting prototype built with Next.js, React, and the **OpenWeatherMap API**.

## Features

- **Local Area Detection**: Automatically detects user coordinates via the browser's Geolocation API (`navigator.geolocation`).
- **City & Zip Search**: Search for any city or zip code worldwide (e.g. Brooklyn, 10001, London, Tokyo).
- **Live OpenWeatherMap Integration**: Fetches real-time atmospheric data:
  - Current temperature, feels like, high & low
  - Weather condition description and icons
  - 8 atmospheric metrics: Humidity, Wind (speed + cardinal compass direction), Visibility, Barometric Pressure, Cloudiness, Air Quality (AQI), Sunrise, and Sunset.
- **24-Hour Hourly Forecast Ribbon**: Visualizes the next 24 hours of conditions, temperatures, and precipitation probability (`pop %`).
- **5-Day Daily Outlook**: Detailed day-by-day temperature range and forecast overview.
- **Unit Conversion**: Instant toggle between Fahrenheit (°F) and Celsius (°C).
- **Dual-Layer Fetch Architecture**: Seamlessly handles server-side API requests via Next.js `/api/weather` and direct client-side fallback if running in offline or network-isolated server environments.

## API Key Configuration

The OpenWeatherMap API key is configured in `.env.local`:
```bash
OPENWEATHER_API_KEY=your_openweathermap_api_key_here
```

## Setup & Running

1. Run the local development server:
   ```bash
   npm run dev
   ```
2. Open [http://localhost:3000/prototypes/weather](http://localhost:3000/prototypes/weather) in your browser.
3. Allow browser geolocation when prompted to see weather in your immediate area!
