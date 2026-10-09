import { NextRequest, NextResponse } from "next/server";

// Helper to map OpenWeatherMap icon code to emoji
function getWeatherEmoji(iconCode: string, id: number): string {
  if (id >= 200 && id < 300) return "⛈️"; // Thunderstorm
  if (id >= 300 && id < 400) return "🌦️"; // Drizzle
  if (id >= 500 && id < 600) return "🌧️"; // Rain
  if (id >= 600 && id < 700) return "❄️"; // Snow
  if (id >= 700 && id < 800) return "🌫️"; // Atmosphere (fog, mist, haze)
  if (id === 800) return iconCode.endsWith("n") ? "🌙" : "☀️"; // Clear
  if (id === 801) return iconCode.endsWith("n") ? "☁️" : "⛅"; // Few clouds
  if (id > 801) return "☁️"; // Clouds
  return "🌤️";
}

// Convert wind degrees to cardinal direction
function degToCompass(num: number): string {
  const val = Math.floor((num / 22.5) + 0.5);
  const arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return arr[val % 16];
}

// AQI mapping from OpenWeatherMap (1-5)
const AQI_DESCRIPTIONS: Record<number, string> = {
  1: "Good (1/5)",
  2: "Fair (2/5)",
  3: "Moderate (3/5)",
  4: "Poor (4/5)",
  5: "Very Poor (5/5)",
};

// Helper to build location query parameter for OpenWeatherMap (coordinates, zip code, or city)
function formatOpenWeatherLocationQuery(query: string): string {
  const trimmed = query.trim();

  // 1. Direct coordinates format: "40.7128, -74.0060"
  const coordsMatch = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (coordsMatch) {
    const lat = parseFloat(coordsMatch[1]);
    const lon = parseFloat(coordsMatch[2]);
    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      return `lat=${lat}&lon=${lon}`;
    }
  }

  // 2. US 5-digit zip or 5+4 zip: "10001" or "10001-1234"
  const usZipMatch = trimmed.match(/^(\d{5})(?:-\d{4})?$/);
  if (usZipMatch) {
    return `zip=${encodeURIComponent(usZipMatch[1])},US`;
  }

  // 3. Zip code with explicit country code: e.g. "10001, US" or "90210, USA" or "75001, FR"
  const zipWithCountryMatch = trimmed.match(/^([\w\s-]+),\s*([a-zA-Z]{2,3})$/);
  if (zipWithCountryMatch && /\d/.test(zipWithCountryMatch[1])) {
    const postal = zipWithCountryMatch[1].trim();
    let country = zipWithCountryMatch[2].trim().toUpperCase();
    if (country === "USA") country = "US";
    return `zip=${encodeURIComponent(postal)},${country}`;
  }

  // 4. Any numeric-only string (3 to 8 digits)
  if (/^\d{3,8}$/.test(trimmed)) {
    return `zip=${trimmed},US`;
  }

  // 5. Default to city query: e.g. "New York", "Brooklyn, NY"
  return `q=${encodeURIComponent(trimmed)}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const city = searchParams.get("city");
    const zip = searchParams.get("zip");
    const units = searchParams.get("units") || "imperial"; // imperial (°F) or metric (°C)

    // Retrieve API key from environment variable, fallback to query param
    let apiKey =
      process.env.OPENWEATHER_API_KEY ||
      process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ||
      searchParams.get("apiKey") ||
      "";

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing OpenWeatherMap API key. Add OPENWEATHER_API_KEY to .env.local or Vercel environment variables.",
        },
        { status: 401 }
      );
    }

    // Build query string for coordinates vs zip code vs city name
    let locationQuery = "";
    if (lat && lon) {
      locationQuery = `lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
    } else if (zip) {
      locationQuery = formatOpenWeatherLocationQuery(zip);
    } else if (city) {
      locationQuery = formatOpenWeatherLocationQuery(city);
    } else {
      // Default to New York if none provided
      locationQuery = "q=New%20York";
    }

    const fetchWithKey = async (key: string) => {
      const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?${locationQuery}&units=${units}&appid=${key}`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?${locationQuery}&units=${units}&appid=${key}`;
      return Promise.all([
        fetch(currentWeatherUrl, { next: { revalidate: 300 } }), // cache for 5 minutes
        fetch(forecastUrl, { next: { revalidate: 300 } }),
      ]);
    };

    let [currentRes, forecastRes] = await fetchWithKey(apiKey);

    if (!currentRes.ok) {
      const errData = await currentRes.json().catch(() => ({}));
      let message = errData.message || `OpenWeatherMap returned status ${currentRes.status}`;
      if (errData.message === "city not found") {
        message = "Location not found. Please verify the city name or zip code.";
      }
      return NextResponse.json(
        {
          success: false,
          error: `Failed to load current weather: ${message}`,
          statusCode: currentRes.status,
        },
        { status: currentRes.status }
      );
    }

    const currentData = await currentRes.json();
    let forecastData = forecastRes.ok ? await forecastRes.json() : null;

    // Fallback: If forecast query with zip failed, retry forecast by coordinates
    if (!forecastData && currentData.coord?.lat && currentData.coord?.lon) {
      try {
        const coordFcUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${currentData.coord.lat}&lon=${currentData.coord.lon}&units=${units}&appid=${apiKey}`;
        const coordFcRes = await fetch(coordFcUrl, { next: { revalidate: 300 } });
        if (coordFcRes.ok) {
          forecastData = await coordFcRes.json();
        }
      } catch {
        // ignore fallback failure
      }
    }

    // Optional Air Pollution API fetch if coordinates are available
    let aqiText = "Good";
    const resolvedLat = currentData.coord?.lat;
    const resolvedLon = currentData.coord?.lon;
    if (resolvedLat && resolvedLon) {
      try {
        const airUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${resolvedLat}&lon=${resolvedLon}&appid=${apiKey}`;
        const airRes = await fetch(airUrl, { next: { revalidate: 600 } });
        if (airRes.ok) {
          const airData = await airRes.json();
          const aqiLevel = airData.list?.[0]?.main?.aqi;
          if (aqiLevel && AQI_DESCRIPTIONS[aqiLevel]) {
            aqiText = AQI_DESCRIPTIONS[aqiLevel];
          }
        }
      } catch {
        // Air pollution is optional; ignore failure
      }
    }

    const weatherCondition = currentData.weather?.[0] || {
      id: 800,
      main: "Clear",
      description: "Clear sky",
      icon: "01d",
    };

    const emoji = getWeatherEmoji(weatherCondition.icon, weatherCondition.id);

    // Parse Hourly: map all available forecast slots across the multi-day forecast timeline
    const todayDateStr = new Date().toDateString();
    const hourly =
      forecastData?.list?.map((item: any) => {
        const date = new Date(item.dt * 1000);
        const timeStr = date.toLocaleTimeString("en-US", {
          hour: "numeric",
          hour12: true,
        });
        const dayStr =
          date.toDateString() === todayDateStr
            ? "Today"
            : date.toLocaleDateString("en-US", { weekday: "short" });
        const cond = item.weather?.[0] || {};
        return {
          time: timeStr,
          day: dayStr,
          temp: Math.round(item.main.temp),
          emoji: getWeatherEmoji(cond.icon || "01d", cond.id || 800),
          condition: cond.main || "Clear",
          pop: Math.round((item.pop || 0) * 100), // Probability of precipitation %
        };
      }) || [];

    // Parse 5-Day Daily Outlook by grouping forecast list items by day
    const dailyMap = new Map<
      string,
      {
        day: string;
        dateStr: string;
        high: number;
        low: number;
        condition: string;
        emoji: string;
        icon: string;
        id: number;
      }
    >();

    if (forecastData?.list) {
      for (const item of forecastData.list) {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
        const temp = item.main.temp;
        const cond = item.weather?.[0] || {};

        if (!dailyMap.has(dayKey)) {
          dailyMap.set(dayKey, {
            day: dayName,
            dateStr: dayKey,
            high: temp,
            low: temp,
            condition: cond.description || cond.main || "Clear",
            emoji: getWeatherEmoji(cond.icon || "01d", cond.id || 800),
            icon: cond.icon || "01d",
            id: cond.id || 800,
          });
        } else {
          const existing = dailyMap.get(dayKey)!;
          if (temp > existing.high) existing.high = temp;
          if (temp < existing.low) existing.low = temp;
          // Prefer midday condition description if around 12:00
          if (date.getHours() >= 11 && date.getHours() <= 14) {
            existing.condition = cond.description || cond.main;
            existing.emoji = getWeatherEmoji(cond.icon || "01d", cond.id || 800);
          }
        }
      }
    }

    const forecast = Array.from(dailyMap.values())
      .slice(0, 5)
      .map((item, index) => ({
        day: index === 0 ? "Today" : item.day,
        condition:
          item.condition.charAt(0).toUpperCase() + item.condition.slice(1),
        emoji: item.emoji,
        high: Math.round(item.high),
        low: Math.round(item.low),
      }));

    // Format sunrise & sunset
    const sunriseStr = currentData.sys?.sunrise
      ? new Date(currentData.sys.sunrise * 1000).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })
      : "—";

    const sunsetStr = currentData.sys?.sunset
      ? new Date(currentData.sys.sunset * 1000).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })
      : "—";

    return NextResponse.json({
      success: true,
      data: {
        city: currentData.name || "Unknown Location",
        country: currentData.sys?.country || "",
        coord: currentData.coord,
        condition:
          weatherCondition.description?.charAt(0).toUpperCase() +
          weatherCondition.description?.slice(1),
        emoji,
        temp: Math.round(currentData.main.temp),
        feelsLike: Math.round(currentData.main.feels_like),
        high: Math.round(currentData.main.temp_max),
        low: Math.round(currentData.main.temp_min),
        humidity: currentData.main.humidity,
        pressureInHg: +(currentData.main.pressure * 0.02953).toFixed(2), // convert hPa to inHg
        pressureHpa: currentData.main.pressure,
        windSpeed: Math.round(currentData.wind.speed),
        windDirection: degToCompass(currentData.wind.deg || 0),
        clouds: currentData.clouds?.all ?? 0,
        visibilityMiles: currentData.visibility
          ? +(currentData.visibility * 0.000621371).toFixed(1)
          : 10,
        sunrise: sunriseStr,
        sunset: sunsetStr,
        airQuality: aqiText,
        units,
        hourly,
        forecast,
        updatedAt: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
        }),
      },
    });
  } catch (err: any) {
    console.error("Weather API error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Internal server error fetching weather data",
      },
      { status: 500 }
    );
  }
}
