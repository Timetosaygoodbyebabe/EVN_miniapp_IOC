import React, { useState, useEffect, Component } from "react";
import { Page, Header, Icon, useLocation } from "zmp-ui";
import { apiService } from "@/services/apiService";

class ErrorBoundary extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <Page className="bg-white flex flex-col p-4 pt-20">
          <h1 className="text-red-500 font-bold text-xl mb-4">Lỗi giao diện</h1>
          <p className="text-gray-800 break-words">{this.state.error?.toString()}</p>
        </Page>
      );
    }
    return this.props.children;
  }
}

const DetailPage = () => {
  const location = useLocation();
  const { data } = location.state || {};

  if (!data) return (
    <ErrorBoundary>
      <Page className="relative w-full h-full min-h-screen bg-white">
        <Header title="Lỗi dữ liệu" showBackIcon={true} />
        <div className="w-full h-full flex flex-col items-center justify-center pt-24 text-gray-500 font-medium">
          Không tìm thấy dữ liệu. Vui lòng quay lại trang chủ!
        </div>
      </Page>
    </ErrorBoundary>
  );

  const [forecast, setForecast] = useState<any>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [forecastError, setForecastError] = useState(false);

  useEffect(() => {
    if (data && data.tuNgay) {
      setIsLoadingWeather(true);
      // Tìm định dạng DD/MM/YYYY trong chuỗi (VD: "04:00 ngày 21/04/2026")
      const match = data.tuNgay.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (match) {
        const datePart = match[0]; // "21/04/2026"
        const locationQuery = data.dienLuc ? data.dienLuc.replace('Điện lực ', '') : '';
        apiService.getForecast(datePart, locationQuery).then(res => {
          if (res.data && !res.error) {
            setForecast(res.data);
            setForecastError(false);
          } else {
            setForecastError(true);
          }
          setIsLoadingWeather(false);
        }).catch(() => {
          setForecastError(true);
          setIsLoadingWeather(false);
        });
      } else {
        setIsLoadingWeather(false);
      }
    } else {
      setIsLoadingWeather(false);
    }
  }, [data]);

  // Hàm chuyển đổi WMO Weather code thành Icon và mô tả
  const getWeatherInfo = (code: number) => {
    if (code === 0) return { icon: "☀️", text: "Trời trong xanh, nắng đẹp" };
    if (code === 1 || code === 2 || code === 3) return { icon: "⛅", text: "Có mây rải rác" };
    if (code === 45 || code === 48) return { icon: "🌫️", text: "Sương mù" };
    if (code >= 51 && code <= 67) return { icon: "🌧️", text: "Có mưa nhỏ / mưa phùn" };
    if (code >= 71 && code <= 77) return { icon: "🌧️", text: "Mưa lạnh / Rét đậm" };
    if (code >= 80 && code <= 82) return { icon: "🌧️", text: "Mưa rào" };
    if (code >= 95 && code <= 99) return { icon: "⛈️", text: "Mưa dông, sấm sét" };
    return { icon: "🌤️", text: "Trời đẹp" };
  };

  return (
    <Page className="relative w-full h-full min-h-screen !p-0 bg-white pb-safe !overflow-hidden">
      <Header title="Chi tiết lịch cúp điện" showBackIcon={true} />

      <div className="relative z-10 w-full h-full overflow-y-auto p-4 pt-24 pb-32 custom-scrollbar transform-gpu">
        <div className="flex flex-col gap-4 pb-10">

          {/* Header / Location Card */}
          <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm shrink-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Icon icon="zi-location" style={{ fontSize: '14px' }} />
              </div>
              <span className="text-[12px] font-extrabold text-blue-600 uppercase tracking-widest">Khu vực ảnh hưởng</span>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-start border-b border-gray-50 pb-3">
                <span className="text-gray-500 text-[18px] w-24 flex-shrink-0">Điện lực</span>
                <span className="font-bold text-gray-900 text-right">{data.dienLuc || "---"}</span>
              </div>
              <div className="flex justify-between items-start border-b border-gray-50 pb-3">
                <span className="text-gray-500 text-[18px] w-24 flex-shrink-0">Tên trạm</span>
                <span className="font-bold text-gray-900 text-right">{data.tenTram || "---"}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-500 text-[18px] w-24 flex-shrink-0">Mã trạm</span>
                <span className="font-bold text-gray-900 text-right">{data.maTram || "---"}</span>
              </div>
            </div>
          </div>

          {/* Weather Forecast Card */}
          {isLoadingWeather ? (
            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-5 shadow-sm relative overflow-hidden shrink-0 animate-pulse">
              <div className="flex items-center gap-2 mb-3 relative z-10">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                  <span className="text-[14px]">🌤️</span>
                </div>
                <span className="text-[12px] font-extrabold text-blue-300 uppercase tracking-widest">Đang tải dự báo...</span>
              </div>

              <div className="flex justify-between items-center relative z-10">
                <div className="flex flex-col gap-3">
                  <div className="h-5 bg-blue-200/60 rounded-md w-32"></div>
                  <div className="h-4 bg-blue-200/40 rounded-md w-48"></div>
                </div>
                <div className="w-12 h-12 bg-blue-200/50 rounded-full"></div>
              </div>
            </div>
          ) : forecast ? (
            <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm relative overflow-hidden shrink-0">
              <div className="absolute top-[-20px] right-[-20px] text-[80px] opacity-20">
                {getWeatherInfo(forecast.weatherCode).icon}
              </div>
              <div className="flex items-center gap-2 mb-3 relative z-10">
                <div className="w-7 h-7 rounded-full bg-blue-100/20 flex items-center justify-center text-[14px]">
                  🌤️
                </div>
                <span className="text-[12px] font-extrabold text-[var(--text-main)] drop-shadow-md uppercase tracking-widest">Dự báo thời tiết ngày cúp điện</span>
              </div>

              <div className="flex justify-between items-center relative z-10 text-[var(--text-main)] drop-shadow-md">
                <div className="flex flex-col">
                  <span className="text-[20px] font-black leading-tight">
                    {getWeatherInfo(forecast.weatherCode).text}
                  </span>
                  <span className="text-[var(--text-muted)] drop-shadow-sm text-[14px] font-medium mt-1">
                    Nhiệt độ: {forecast.minTemp}°C - {forecast.maxTemp}°C
                  </span>
                </div>
                <div className="text-[40px] drop-shadow-md">
                  {getWeatherInfo(forecast.weatherCode).icon}
                </div>
              </div>
            </div>
          ) : forecastError ? (
            <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm relative overflow-hidden shrink-0">
              <div className="flex items-center gap-2 mb-3 relative z-10">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-[14px]">
                  ☁️
                </div>
                <span className="text-[12px] font-extrabold text-[var(--text-main)] uppercase tracking-widest drop-shadow-md">Dự báo thời tiết ngày cúp điện</span>
              </div>
              <div className="flex justify-between items-center relative z-10">
                <span className="text-[var(--text-muted)] drop-shadow-sm text-[14px] font-medium mt-1">
                  Không thể tải dữ liệu thời tiết. Vui lòng kiểm tra kết nối mạng hoặc VPN/Proxy của bạn.
                </span>
              </div>
            </div>
          ) : null}

          {/* Time Card */}
          <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm shrink-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                <Icon icon="zi-clock-1" style={{ fontSize: '14px' }} />
              </div>
              <span className="text-[12px] font-extrabold text-orange-500 uppercase tracking-widest">Thời gian cúp điện</span>
            </div>

            <div className="flex items-stretch gap-4 relative ml-1">
              <div className="flex flex-col items-center mt-1.5 mb-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500 z-10 border-2 border-white shadow-sm"></div>
                <div className="w-0.5 bg-gray-100 flex-1 my-1"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-green-500 z-10 border-2 border-white shadow-sm"></div>
              </div>
              <div className="flex flex-col gap-4 flex-1">
                <div className="flex flex-col bg-gray-50 p-3 rounded-2xl border border-red-100 shadow-sm">
                  <span className="text-[12px] font-bold text-gray-400 uppercase mb-0.5">Bắt đầu cắt điện</span>
                  <span className="text-[16px] font-black text-red-600">{data.tuNgay}</span>
                </div>
                <div className="flex flex-col bg-gray-50 p-3 rounded-2xl border border-green-100 shadow-sm">
                  <span className="text-[12px] font-bold text-gray-400 uppercase mb-0.5">Dự kiến có điện</span>
                  <span className="text-[16px] font-black text-green-600">{data.denNgay}</span>
                </div>
              </div>
            </div>
          </div>



          {/* Reason Card */}
          {data.lyDo && (
            <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                  <Icon icon="zi-note" style={{ fontSize: '14px' }} />
                </div>
                <span className="text-[12px] font-extrabold text-purple-600 uppercase tracking-widest">Lý do & Chi tiết</span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-[15px] font-medium text-gray-700 leading-relaxed whitespace-pre-wrap">{data.lyDo}</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </Page>
  );
};

export default function DetailPageWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <DetailPage />
    </ErrorBoundary>
  );
}






