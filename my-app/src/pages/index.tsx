import React, { useState, useEffect, useMemo } from "react";
import { Page, Icon, useNavigate } from "zmp-ui";
import { apiService } from "@/services/apiService";

const CustomSelect = ({ label, value, options, onChange, onClear, disabled, loading, placeholder, multiSelect = false, showSelectAll = false }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  const isAllSelected = multiSelect && value && options && value.length === options.length && options.length > 0;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange([...options]);
    }
  };

  const getDisplayText = () => {
    if (multiSelect) {
      if (!value || value.length === 0) return placeholder;
      if (isAllSelected) return "Tất cả";
      if (value.length === 1) return value[0];
      if (value.length <= 2) return value.join(', ');
      return `Đã chọn ${value.length} mục`;
    }
    return value || placeholder;
  };

  const handleOptionClick = (opt: string) => {
    if (multiSelect) {
      let newValues = [...(value || [])];
      if (newValues.includes(opt)) {
        newValues = newValues.filter((v: string) => v !== opt);
      } else {
        newValues.push(opt);
      }
      onChange(newValues);
    } else {
      onChange(opt);
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative overflow-hidden bg-white border border-gray-200 shadow-sm rounded-[24px] p-5 transition-all duration-500 ${disabled ? 'opacity-50 grayscale' : ''}`}>
      <label className="text-[11px] text-[var(--text-muted)] drop-shadow-sm font-semibold mb-2 flex justify-between items-center uppercase tracking-wider">
        <span>{label}</span>
        {loading && <span className="text-[var(--text-muted)] drop-shadow-sm normal-case">Đang tải...</span>}
      </label>

      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-[18px] font-medium text-[var(--text-main)] drop-shadow-md cursor-pointer"
      >
        <span className="truncate pr-2">{getDisplayText()}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          {((multiSelect && value && value.length > 0) || (!multiSelect && value)) && (
            <div
              onClick={(e) => { e.stopPropagation(); onClear(); if (!multiSelect) setIsOpen(false); }}
              className="w-5 h-5 flex items-center justify-center rounded-full bg-[var(--bg-active)] hover:bg-black/20 text-[var(--text-muted)] drop-shadow-sm transition-colors"
            >
              <Icon icon="zi-close" style={{ fontSize: '12px' }} />
            </div>
          )}
          <Icon icon="zi-chevron-down" style={{ fontSize: '16px', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
        </div>
      </div>

      <div
        className={`w-full transition-all duration-500 ease-in-out ${isOpen && !disabled ? 'max-h-48 mt-4 pt-3 border-t border-white/30 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
      >
        <div className="max-h-40 overflow-y-auto pr-1 custom-scrollbar">
          {showSelectAll && options && options.length > 0 && (
            <div
              onClick={handleSelectAll}
              className={`px-3 py-2.5 mb-1 text-[18px] rounded-lg cursor-pointer transition-colors ${isAllSelected ? 'bg-blue-50 border border-blue-200 font-bold text-blue-700' : 'text-blue-600 hover:bg-gray-100 font-bold'}`}
            >
              Chọn tất cả
            </div>
          )}
          {options && options.length > 0 ? options.map((opt: string, idx: number) => {
            const isSelected = multiSelect ? (value && value.includes(opt)) : value === opt;
            return (
              <div
                key={idx}
                onClick={() => handleOptionClick(opt)}
                className={`px-3 py-2.5 mb-1 text-[18px] rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-gray-50 border border-gray-200 font-bold text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)] hover:bg-gray-50'}`}
              >
                {opt}
              </div>
            )
          }) : (
            <div className="px-2 py-2.5 text-[18px] text-[var(--text-muted)] drop-shadow-sm text-center italic">Không có dữ liệu</div>
          )}
        </div>
      </div>
    </div>
  );
};

const CustomDatePicker = ({ label, value = [], onChange, disabled }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const handlePrevMonth = (e: any) => { e.stopPropagation(); setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)); };
  const handleNextMonth = (e: any) => { e.stopPropagation(); setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)); };

  const handleSelectDate = (day: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    let newValues = [...value];
    if (newValues.includes(dateStr)) {
      newValues = newValues.filter((v: string) => v !== dateStr);
    } else {
      newValues.push(dateStr);
    }
    onChange(newValues);
  };

  const getDisplayText = () => {
    if (!value || value.length === 0) return "Chọn ngày...";
    if (value.length === 1) return value[0].split('-').reverse().join('/');
    if (value.length <= 2) return value.map((v: string) => v.split('-').reverse().slice(0, 2).join('/')).join(', ');
    return `Đã chọn ${value.length} ngày`;
  };

  return (
    <div className={`relative overflow-hidden bg-white border border-gray-200 shadow-sm rounded-[24px] p-5 transition-all duration-500 ${disabled ? 'opacity-50 grayscale' : ''}`}>
      <label className="text-[11px] text-[var(--text-muted)] drop-shadow-sm font-semibold mb-2 block uppercase tracking-wider">{label}</label>

      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-[18px] font-medium text-[var(--text-main)] drop-shadow-md cursor-pointer"
      >
        <span>{getDisplayText()}</span>
        <div className="flex items-center gap-2">
          {value && value.length > 0 && (
            <div
              onClick={(e) => { e.stopPropagation(); onChange([]); setIsOpen(false); }}
              className="w-5 h-5 flex items-center justify-center rounded-full bg-[var(--bg-active)] hover:bg-black/20 text-[var(--text-muted)] drop-shadow-sm transition-colors"
            >
              <Icon icon="zi-close" style={{ fontSize: '12px' }} />
            </div>
          )}
          <Icon icon="zi-calendar" style={{ fontSize: '16px' }} />
        </div>
      </div>

      <div
        className={`w-full transition-all duration-500 ease-in-out ${isOpen && !disabled ? 'max-h-80 mt-4 pt-5 border-t border-white/30 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
      >
        <div className="flex justify-between items-center mb-4 px-2">
          <div onClick={handlePrevMonth} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/30 cursor-pointer"><Icon icon="zi-chevron-left" style={{ fontSize: '14px' }} /></div>
          <span className="text-[18px] font-semibold text-[var(--text-muted)] drop-shadow-md">
            Tháng {currentMonth.getMonth() + 1}, {currentMonth.getFullYear()}
          </span>
          <div onClick={handleNextMonth} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/30 cursor-pointer"><Icon icon="zi-chevron-right" style={{ fontSize: '14px' }} /></div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
            <div key={d} className="text-[11px] font-bold text-[var(--text-muted)] drop-shadow-sm">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
          {days.map((d, i) => {
            let isSelected = false;
            if (d) {
              const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              isSelected = value && value.includes(dateStr);
            }
            return (
              <div
                key={i}
                onClick={() => d && handleSelectDate(d)}
                className={`w-7 h-7 mx-auto flex items-center justify-center rounded-full text-[16px] transition-all
                  ${!d ? '' : 'cursor-pointer hover:bg-gray-100 text-[var(--text-muted)] font-medium'}
                  ${isSelected ? '!bg-blue-600 border border-blue-700 shadow-sm !text-white font-bold' : ''}
                `}
              >
                {d || ''}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

function HomePage() {
  const navigate = useNavigate();

  // Form states
  const [dienLuc, setDienLuc] = useState("");
  const [phuongXa, setPhuongXa] = useState("");
  const [tram, setTram] = useState<string[]>([]);
  const [date, setDate] = useState<string[]>([]);

  // DB options state
  const [dienLucList, setDienLucList] = useState<string[]>([]);
  const [phuongXaList, setPhuongXaList] = useState<string[]>([]);
  const [tramList, setTramList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDienLuc = async () => {
      setIsLoading(true);
      const { data, error } = await apiService.getDienLuc();
      if (data && !error) {
        setDienLucList(data as string[]);
      }
      setIsLoading(false);
    };
    fetchDienLuc();
  }, []);

  const handleDienLucChange = async (selected: string) => {
    setDienLuc(selected);
    setPhuongXa("");
    setTram([]);
    setPhuongXaList([]);
    setTramList([]);

    if (!selected) return;
    setIsLoading(true);
    const { data, error } = await apiService.getPhuongXa(selected);
    
    if (data && !error) {
      setPhuongXaList(data as string[]);
    }
    setIsLoading(false);
  };

  const handlePhuongXaChange = async (val: string) => {
    setPhuongXa(val);
    setTram([]);
    setTramList([]);

    if (!val) return;
    setIsLoading(true);
    const { data, error } = await apiService.getTram(dienLuc, val);
    
    if (data && !error) {
      setTramList(data as string[]);
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (!dienLuc || !phuongXa || !tram || tram.length === 0) {
      return;
    }
    const isAllTrams = tram.length === tramList.length;
    navigate("/search", { state: { dienLuc, phuongXa, tram: isAllTrams ? [] : tram, date } });
  };

  return (
    <Page className="relative w-full h-full min-h-screen !p-0 bg-white !overflow-hidden"
    >

      <div className="relative z-10 w-full h-full overflow-y-auto custom-scrollbar transform-gpu">
        <div className="w-full flex flex-col p-6 pb-10 text-[var(--text-main)] drop-shadow-md">

        <div className="flex flex-col gap-1 mt-9 mb-6">
          <h1 className="text-[28px] font-bold tracking-tight">Tra cứu</h1>
        </div>

        <div className="flex flex-col z-10 relative">
          <div className="flex flex-col gap-4">
            <CustomSelect
              label="Điện lực"
              value={dienLuc}
              options={dienLucList}
              onChange={handleDienLucChange}
              onClear={() => handleDienLucChange("")}
              disabled={isLoading && dienLucList.length === 0}
              loading={isLoading && !dienLuc}
              placeholder="Chọn điện lực..."
            />

            <CustomSelect
              label="Phường xã"
              value={phuongXa}
              options={phuongXaList}
              onChange={handlePhuongXaChange}
              onClear={() => handlePhuongXaChange("")}
              disabled={!dienLuc || isLoading}
              loading={isLoading && dienLuc && !phuongXa}
              placeholder="Chọn phường xã..."
            />

            <CustomSelect
              label="Tên trạm"
              value={tram}
              options={tramList}
              onChange={(val: string[]) => setTram(val)}
              onClear={() => setTram([])}
              disabled={!phuongXa || isLoading}
              loading={isLoading && phuongXa && tramList.length === 0}
              placeholder="Chọn tên trạm..."
              multiSelect={true}
              showSelectAll={true}
            />

            <CustomDatePicker
              label="Ngày tháng năm"
              value={date}
              onChange={(val: string[]) => setDate(val)}
              disabled={false}
            />

            <div className="w-full flex justify-center mt-6">
              <button
                onClick={handleSearch}
                className={`w-full max-w-[240px] rounded-full py-4 px-8 text-[18px] font-bold transition-all duration-300 ease-out flex justify-center items-center gap-2 relative overflow-hidden bg-blue-600 text-white shadow-md ${(!dienLuc || !phuongXa || !tram || tram.length === 0) ? 'cursor-not-allowed opacity-50' : 'hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0'}`}
              >
                <Icon icon="zi-search" style={{ fontSize: '16px' }} />
                Tra cứu
              </button>
            </div>
          </div>
        </div>

      </div>
      </div>
    </Page>
  );
}

export default HomePage;








