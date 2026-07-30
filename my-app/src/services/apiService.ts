import { supabase } from "@/utils/supabase";

const USE_LOCAL_BACKEND = import.meta.env.VITE_USE_LOCAL_BACKEND === 'true';
const LOCAL_API_URL = import.meta.env.VITE_LOCAL_API_URL;
const EVN_API_BASE = import.meta.env.DEV ? '/api/evn' : 'https://cskh-api.cpc.vn/api';

const frontendForecastCache: Record<string, any> = {};

const DA_NANG_DIEN_LUC = [
  { name: 'Điện lực Hải Châu', code: 'PP0100' },
  { name: 'Điện lực Thanh Khê', code: 'PP0900' },
  { name: 'Điện lực Sơn Trà - Ngũ Hành Sơn', code: 'PP0500' },
  { name: 'Điện lực Liên Chiểu', code: 'PP0300' },
  { name: 'Điện lực Cẩm Lệ', code: 'PP0700' },
  { name: 'Điện lực Hòa Vang', code: 'PP0800' }
];

export const apiService = {
  getDienLuc: async () => {
    try {
      const res = await fetch(`${LOCAL_API_URL}/dienluc`);
      const data = await res.json();
      return { data, error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  getPhuongXa: async (dienLuc: string) => {
    try {
      const res = await fetch(`${LOCAL_API_URL}/phuongxa?dienLuc=${encodeURIComponent(dienLuc)}`);
      const data = await res.json();
      return { data, error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  getTram: async (dienLuc: string, phuongXa?: string) => {
    try {
      let url = `${LOCAL_API_URL}/tram?dienLuc=${encodeURIComponent(dienLuc)}`;
      if (phuongXa) url += `&phuongXa=${encodeURIComponent(phuongXa)}`;
      
      const res = await fetch(url);
      const data = await res.json();
      return { data, error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  search: async (params: { dienLuc: string, phuongXa?: string, tram: string[], date: string[] }) => {
    try {
      const res = await fetch(`${LOCAL_API_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      return { data, error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  getWeatherToday: async () => {
    try {
      // Vì Zalo Simulator chặn gọi API nội bộ bằng giao thức HTTP, ta sẽ gọi thẳng qua HTTPS
      const lat = 16.0544;
      const lon = 108.2022;
      const apiKey = "7f02a3e77d8dfd7337128b6618c12c7e";

      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=vi`;
      const res = await fetch(url);

      if (!res.ok) throw new Error("Weather API not available");
      const data = await res.json();

      const weatherData = {
        temp: Math.round(data.main.temp),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        city: "Đà Nẵng"
      };

      return { data: weatherData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getForecast: async (dateString: string, phuongXa?: string) => {
    try {
      // dateString format: DD/MM/YYYY. Need to convert to YYYY-MM-DD
      const [dd, mm, yyyy] = dateString.split('/');
      const isoDate = `${yyyy}-${mm}-${dd}`;

      // Sử dụng bộ nhớ đệm Frontend kết hợp phuongXa
      const cacheKey = `${isoDate}_${phuongXa || 'default'}`;
      if (frontendForecastCache[cacheKey]) {
        return { data: frontendForecastCache[cacheKey], error: null };
      }

      let lat = 16.0544;
      let lon = 108.2022;

      // 1. Get coordinates directly from Frontend to bypass Local IP issue on real devices
      if (phuongXa) {
        try {
          const query = `${phuongXa}, Da Nang`;
          const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=vi&format=json`;
          const geoRes = await fetch(geoUrl);
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            if (geoData && geoData.results && geoData.results.length > 0) {
              lat = geoData.results[0].latitude;
              lon = geoData.results[0].longitude;
            }
          }
        } catch (e) {
          console.warn("Geocoding failed", e);
        }
      }

      // 2. Fetch forecast
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Asia%2FBangkok&start_date=${isoDate}&end_date=${isoDate}`;
      const res = await fetch(url);

      if (!res.ok) throw new Error("Weather forecast not available");
      const data = await res.json();

      if (data && data.daily && data.daily.time && data.daily.time.length > 0) {
        const forecastData = {
          maxTemp: Math.round(data.daily.temperature_2m_max[0]),
          minTemp: Math.round(data.daily.temperature_2m_min[0]),
          weatherCode: data.daily.weathercode[0]
        };
        // Lưu vào cache để tái sử dụng
        frontendForecastCache[cacheKey] = forecastData;
        return { data: forecastData, error: null };
      }
      return { data: null, error: "No data" };
    } catch (error) {
      return { data: null, error };
    }
  }
};
