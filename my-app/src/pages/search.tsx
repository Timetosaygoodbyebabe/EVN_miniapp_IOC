import React, { useState, useEffect } from "react";
import { Page, Header, Icon, useNavigate, useLocation } from "zmp-ui";
import { apiService } from "@/services/apiService";

const ResultItem = ({ data }: any) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate("/detail", { state: { data } })}
      className="relative overflow-hidden bg-white border border-gray-200 shadow-sm rounded-[24px] p-6 flex justify-between items-center w-full cursor-pointer mb-5 hover:bg-gray-50 group"
    >
      <div className="flex flex-col gap-2 pr-4">
        <span className="text-[22px] font-black text-[var(--text-muted)] leading-tight">{data.tenTram || data.maTram || "Không rõ tên trạm"}</span>
        <span className="text-[14px] text-[var(--text-muted)] font-semibold">{data.tuNgay}</span>
      </div>
      <div className="flex items-center text-[var(--text-muted)] transition-transform duration-300 group-hover:translate-x-1">
        <Icon icon="zi-chevron-right" style={{ fontSize: '20px' }} />
      </div>
    </div>
  );
};

const SearchPage = () => {
  const location = useLocation();
  const { dienLuc, phuongXa, tram, date } = location.state || {};

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setIsSearching(true);
      
      const { data, error } = await apiService.search({ dienLuc, phuongXa, tram, date });

      if (data && !error) {
        // Parse ngày DD/MM/YYYY để sắp xếp từ mới nhất đến cũ nhất
        const sortedData = [...data].sort((a, b) => {
          const parseDate = (dateStr: string) => {
            if (!dateStr) return 0;
            const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
            if (match) {
              return new Date(`${match[3]}-${match[2]}-${match[1]}`).getTime();
            }
            return 0;
          };
          return parseDate(b.tuNgay) - parseDate(a.tuNgay);
        });
        setSearchResults(sortedData);
      } else {
        setSearchResults([]);
      }
      setIsSearching(false);
    };

    fetchResults();
  }, [dienLuc, phuongXa, tram, date]);

  return (
    <Page className="relative w-full h-full min-h-screen !p-0 bg-white pb-safe !overflow-hidden">
      <Header title="Kết quả tra cứu" showBackIcon={true} />


      <div className="relative z-10 w-full h-full overflow-y-auto flex flex-col p-4 text-[var(--text-main)] pt-24 custom-scrollbar pb-32">
        <h2 className="text-[24px] font-bold tracking-tight mb-6 text-[var(--text-muted)]">
          Kết quả tìm thấy ({isSearching ? "..." : searchResults.length})
        </h2>
        
        {isSearching ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="flex flex-col">
            {searchResults.length > 0 ? searchResults.map((item, idx) => (
              <ResultItem key={idx} data={item} />
            )) : (
              <div className="bg-white rounded-2xl p-6 text-center text-[var(--text-muted)] font-medium text-[18px] shadow-sm border border-gray-200 mt-4">
                Không tìm thấy lịch cúp điện nào phù hợp với thông tin tra cứu.
              </div>
            )}
          </div>
        )}
      </div>
    </Page>
  );
};

export default SearchPage;








