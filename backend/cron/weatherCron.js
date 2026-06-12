const cron = require('node-cron');
const axios = require('axios');

// Global cache object in memory
global.weatherCache = {
  today: null,
  lastUpdated: null
};

// Da Nang Coordinates
const LAT = 16.0544;
const LON = 108.2022;

const fetchWeather = async () => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.warn("Missing OPENWEATHER_API_KEY. Skipping weather fetch.");
    return;
  }

  try {
    console.log("[Cron] Fetching weather from OpenWeatherMap...");
    const url = `https://api.openweathermap.org/data/2.5/weather?q=Da Nang,VN&appid=${apiKey}&units=metric&lang=vi`;
    
    const response = await axios.get(url);
    const data = response.data;
    
    global.weatherCache.today = {
      temp: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      city: "Đà Nẵng"
    };
    global.weatherCache.lastUpdated = new Date();
    
    console.log("[Cron] Weather updated:", global.weatherCache.today);
  } catch (error) {
    console.error("[Cron] Failed to fetch weather:", error.message);
  }
};

// Run immediately on startup
fetchWeather();

// Then run every 2 hours
cron.schedule('0 */2 * * *', fetchWeather);

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const getCoordinates = async (phuongXa) => {
  if (!phuongXa) return { lat: LAT, lon: LON };
  try {
    const query = `${phuongXa}, Da Nang`;
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=vi&format=json`;
    const res = await axios.get(url);
    if (res.data && res.data.results && res.data.results.length > 0) {
      return { lat: res.data.results[0].latitude, lon: res.data.results[0].longitude };
    }
  } catch (err) {
    console.error(`[Geocoding] Failed for ${phuongXa}:`, err.message);
  }
  return { lat: LAT, lon: LON };
};

// Cache for forecasts by date (YYYY-MM-DD): Map of Date -> Array of objects { lat, lon, data }
global.forecastCache = {};

const getForecastForDate = async (isoDate, phuongXa) => {
  if (!global.forecastCache[isoDate]) {
    global.forecastCache[isoDate] = [];
  }

  const { lat: reqLat, lon: reqLon } = await getCoordinates(phuongXa);
  const CACHE_RADIUS_KM = 5;

  const dateCaches = global.forecastCache[isoDate];
  for (let cachedPoint of dateCaches) {
    const distance = getDistanceFromLatLonInKm(reqLat, reqLon, cachedPoint.lat, cachedPoint.lon);
    if (distance <= CACHE_RADIUS_KM) {
      console.log(`[Forecast] Cache Hit! Distance: ${distance.toFixed(2)} km for ${phuongXa || "Da Nang"}`);
      return cachedPoint.data;
    }
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${reqLat}&longitude=${reqLon}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Asia%2FBangkok&start_date=${isoDate}&end_date=${isoDate}`;
    const response = await axios.get(url);
    const data = response.data;
    
    if (data && data.daily && data.daily.time && data.daily.time.length > 0) {
      const forecastData = {
        maxTemp: Math.round(data.daily.temperature_2m_max[0]),
        minTemp: Math.round(data.daily.temperature_2m_min[0]),
        weatherCode: data.daily.weathercode[0]
      };
      
      dateCaches.push({ lat: reqLat, lon: reqLon, data: forecastData });
      console.log(`[Forecast] Cache Miss. Fetched new data for ${phuongXa || "Da Nang"} at (${reqLat}, ${reqLon})`);
      return forecastData;
    }
    return null;
  } catch (error) {
    console.error(`[Forecast] Failed to fetch forecast for ${isoDate}:`, error.message);
    return null;
  }
};

module.exports = {
  getWeatherCache: () => global.weatherCache.today,
  getForecastForDate
};
