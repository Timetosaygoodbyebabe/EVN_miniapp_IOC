import { supabase } from "@/utils/supabase";

const USE_LOCAL_BACKEND = import.meta.env.VITE_USE_LOCAL_BACKEND === 'true';
const LOCAL_API_URL = import.meta.env.VITE_LOCAL_API_URL;

const frontendForecastCache: Record<string, any> = {};

export const apiService = {
  getDienLuc: async () => {
    if (USE_LOCAL_BACKEND) {
      try {
        const res = await fetch(`${LOCAL_API_URL}/dienluc`);
        const data = await res.json();
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    } else {
      const { data, error } = await supabase.from('lich_cup_dien_hoan_chinh').select('dienLuc');
      if (data && !error) {
        const unique = Array.from(new Set(data.map(item => item.dienLuc).filter(Boolean)));
        return { data: unique, error: null };
      }
      return { data: null, error };
    }
  },

  getPhuongXa: async (dienLuc: string) => {
    if (USE_LOCAL_BACKEND) {
      try {
        const res = await fetch(`${LOCAL_API_URL}/phuongxa?dienLuc=${encodeURIComponent(dienLuc)}`);
        const data = await res.json();
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    } else {
      const { data, error } = await supabase
        .from('lich_cup_dien_hoan_chinh')
        .select('phuongXa')
        .eq('dienLuc', dienLuc);
      if (data && !error) {
        const unique = Array.from(new Set(data.map(item => item.phuongXa).filter(Boolean)));
        return { data: unique, error: null };
      }
      return { data: null, error };
    }
  },

  getTram: async (dienLuc: string, phuongXa: string) => {
    if (USE_LOCAL_BACKEND) {
      try {
        const res = await fetch(`${LOCAL_API_URL}/tram?dienLuc=${encodeURIComponent(dienLuc)}&phuongXa=${encodeURIComponent(phuongXa)}`);
        const data = await res.json();
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    } else {
      const { data, error } = await supabase
        .from('lich_cup_dien_hoan_chinh')
        .select('tenTram')
        .eq('dienLuc', dienLuc)
        .eq('phuongXa', phuongXa);
      if (data && !error) {
        const unique = Array.from(new Set(data.map(item => item.tenTram).filter(Boolean)));
        return { data: unique, error: null };
      }
      return { data: null, error };
    }
  },

  search: async (params: { dienLuc: string, phuongXa: string, tram: string[], date: string[] }) => {
    if (USE_LOCAL_BACKEND) {
      try {
        const res = await fetch(`${LOCAL_API_URL}/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        });
        const data = await res.json();
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    } else {
      const { dienLuc, phuongXa, tram, date } = params;
      let query = supabase.from('lich_cup_dien_hoan_chinh').select('*');
      
      if (dienLuc) query = query.eq('dienLuc', dienLuc);
      if (phuongXa) query = query.eq('phuongXa', phuongXa);
      if (tram && tram.length > 0) query = query.in('tenTram', tram);

      if (date && date.length > 0) {
        const orFilter = date.map((d: string) => {
          const [yyyy, mm, dd] = d.split('-');
          // Trả lại ilike vì dữ liệu DB có thể có khoảng trắng ở đầu hoặc định dạng không chuẩn xác 100%
          return `tuNgay.ilike.%${dd}/${mm}/${yyyy}%`;
        }).join(',');
        query = query.or(orFilter);
      }

      // Giới hạn 100 kết quả để tránh nghẽn mạng nếu dữ liệu quá khủng
      query = query.limit(100);
      return await query;
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
      
      let url = `${LOCAL_API_URL}/weather/forecast?date=${isoDate}`;
      if (phuongXa) {
        url += `&phuongXa=${encodeURIComponent(phuongXa)}`;
      }
      
      const res = await fetch(url);
      
      if (!res.ok) throw new Error("Weather forecast backend not available");
      const data = await res.json();
      
      if (data && data.weatherCode !== undefined) {
        // Lưu vào cache để tái sử dụng
        frontendForecastCache[cacheKey] = data;
        return { data, error: null };
      }
      return { data: null, error: "No data" };
    } catch (error) {
      return { data: null, error };
    }
  }
};
