import Navbar from "@/components/Navbar";
import { useState, useEffect, useRef } from "react";
import * as echarts from 'echarts';
import { ChevronLeft, ChevronRight, MapPin, Calendar, Camera, MessageCircle, Lock, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// 虚拟旅行数据
const travelRecords = [
  { id: 1, date: "2024-10-15", location: "云南丽江", province: "云南", lat: 26.8206, lng: 100.2333, photos: ["https://picsum.photos/seed/lijiang1/300/300", "https://picsum.photos/seed/lijiang2/300/300", "https://picsum.photos/seed/lijiang3/300/300"], description: "丽江古城，小桥流水人家" },
  { id: 2, date: "2024-10-18", location: "云南大理", province: "云南", lat: 25.6050, lng: 100.1841, photos: ["https://picsum.photos/seed/dali1/300/300", "https://picsum.photos/seed/dali2/300/300"], description: "大理洱海，风花雪月" },
  { id: 3, date: "2024-07-10", location: "新疆伊犁", province: "新疆", lat: 43.9247, lng: 81.3280, photos: ["https://picsum.photos/seed/yili1/300/300", "https://picsum.photos/seed/yili2/300/300", "https://picsum.photos/seed/yili3/300/300", "https://picsum.photos/seed/yili4/300/300"], description: "那拉提草原，人间仙境" },
  { id: 4, date: "2024-07-15", location: "新疆喀什", province: "新疆", lat: 39.4750, lng: 75.9764, photos: ["https://picsum.photos/seed/kashgar1/300/300"], description: "喀什古城，丝路风情" },
  { id: 5, date: "2023-05-20", location: "四川成都", province: "四川", lat: 30.5728, lng: 104.0668, photos: ["https://picsum.photos/seed/chengdu1/300/300", "https://picsum.photos/seed/chengdu2/300/300"], description: "成都火锅，悠闲生活" },
  { id: 6, date: "2023-05-25", location: "四川九寨沟", province: "四川", lat: 33.2098, lng: 103.9300, photos: ["https://picsum.photos/seed/jiuzhaigou1/300/300", "https://picsum.photos/seed/jiuzhaigou2/300/300", "https://picsum.photos/seed/jiuzhaigou3/300/300"], description: "九寨沟，童话世界" },
  { id: 7, date: "2023-11-10", location: "北京", province: "北京", lat: 39.9042, lng: 116.4074, photos: ["https://picsum.photos/seed/beijing1/300/300", "https://picsum.photos/seed/beijing2/300/300"], description: "故宫长城，历史名城" },
  { id: 8, date: "2022-03-08", location: "上海", province: "上海", lat: 31.2304, lng: 121.4737, photos: ["https://picsum.photos/seed/shanghai1/300/300"], description: "外滩夜景，现代都市" },
  { id: 9, date: "2022-08-15", location: "山东青岛", province: "山东", lat: 36.0671, lng: 120.3826, photos: ["https://picsum.photos/seed/qingdao1/300/300", "https://picsum.photos/seed/qingdao2/300/300"], description: "青岛海滨，啤酒之城" },
  { id: 10, date: "2021-04-20", location: "浙江杭州", province: "浙江", lat: 30.2741, lng: 120.1552, photos: ["https://picsum.photos/seed/hangzhou1/300/300"], description: "西湖美景，人间天堂" },
  { id: 11, date: "2021-09-10", location: "江苏苏州", province: "江苏", lat: 31.2990, lng: 120.5853, photos: ["https://picsum.photos/seed/suzhou1/300/300", "https://picsum.photos/seed/suzhou2/300/300"], description: "苏州园林，古典之美" },
  { id: 12, date: "2020-06-05", location: "广东广州", province: "广东", lat: 23.1291, lng: 113.2644, photos: ["https://picsum.photos/seed/guangzhou1/300/300"], description: "广州美食，岭南文化" },
];

// 日历组件
function Calendar({ year, month, onDateClick, travelDates }) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const hasTravelRecord = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return travelDates.includes(dateStr);
  };

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="bg-white rounded-lg p-3">
      <div className="flex justify-between items-center mb-3">
        <button 
          onClick={() => onDateClick(year, month - 1)}
          className="text-[#89800c] hover:bg-[#dbe08c] rounded p-1"
        >
          ◀
        </button>
        <span className="font-bold text-gray-800">{year}年{month + 1}月</span>
        <button 
          onClick={() => onDateClick(year, month + 1)}
          className="text-[#89800c] hover:bg-[#dbe08c] rounded p-1"
        >
          ▶
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-500 mb-1">
        {["日", "一", "二", "三", "四", "五", "六"].map((day) => (
          <div key={day} className="font-medium">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => day && onDateClick(year, month, day)}
            className={`h-8 rounded flex items-center justify-center text-sm transition-colors ${
              day 
                ? hasTravelRecord(day)
                  ? "bg-[#dbe08c] text-[#89800c] font-bold"
                  : "text-gray-700 hover:bg-gray-100"
                : "invisible"
            }`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}

// ECharts 地图组件
function ChinaMap({ records, onMarkerClick, selectedLocation }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // 初始化图表
    chartInstance.current = echarts.init(chartRef.current);

    // 中国地图配置
    const option = {
      title: {
        text: '我的旅行足迹',
        left: 'center',
        top: 10,
        textStyle: {
          color: '#89800c',
          fontSize: 18,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: function(params) {
          if (params.seriesType === 'scatter') {
            const record = records.find(r => r.location === params.name);
            if (record) {
              return `${params.name}<br/>${record.date}<br/>${record.description}`;
            }
          }
          return params.name;
        }
      },
      geo: {
        map: 'china',
        roam: true,
        zoom: 1.2,
        center: [104, 36],
        label: {
          show: true,
          color: '#666',
          fontSize: 10
        },
        itemStyle: {
          areaColor: '#f3f3f3',
          borderColor: '#999',
          borderWidth: 0.5
        },
        emphasis: {
          itemStyle: {
            areaColor: '#dbe08c',
            borderColor: '#89800c',
            borderWidth: 2
          },
          label: {
            show: true,
            color: '#89800c',
            fontWeight: 'bold'
          }
        }
      },
      series: [
        {
          name: '旅行地点',
          type: 'scatter',
          coordinateSystem: 'geo',
          data: records.map(record => ({
            name: record.location,
            value: [record.lng, record.lat, record.photos.length],
            itemStyle: {
              color: selectedLocation === record.location ? '#89800c' : '#dbe08c',
              borderColor: '#89800c',
              borderWidth: 2
            },
            symbolSize: record.photos.length * 8 + 15
          })),
          symbol: 'circle',
          symbolSize: 20,
          label: {
            show: true,
            formatter: '{b}',
            position: 'right',
            color: '#89800c',
            fontSize: 12
          },
          emphasis: {
            itemStyle: {
              color: '#89800c'
            },
            label: {
              show: true,
              fontWeight: 'bold'
            }
          }
        },
        {
          name: '旅行路线',
          type: 'lines',
          coordinateSystem: 'geo',
          data: records.slice(0, -1).map((record, index) => ({
            fromName: record.location,
            toName: records[index + 1].location,
            coords: [[record.lng, record.lat], [records[index + 1].lng, records[index + 1].lat]]
          })),
          lineStyle: {
            color: '#89800c',
            width: 2,
            opacity: 0.6,
            curveness: 0.2
          },
          effect: {
            show: true,
            period: 4,
            trailLength: 0.2,
            symbol: 'arrow',
            symbolSize: 6,
            color: '#dbe08c'
          }
        }
      ]
    };

    chartInstance.current.setOption(option);

    // 点击事件
    chartInstance.current.on('click', function(params) {
      if (params.seriesType === 'scatter') {
        const record = records.find(r => r.location === params.name);
        if (record) {
          onMarkerClick(record);
        }
      }
    });

    // 窗口大小变化时重新渲染
    const handleResize = () => {
      chartInstance.current && chartInstance.current.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current && chartInstance.current.dispose();
    };
  }, [records, selectedLocation, onMarkerClick]);

  // 加载中国地图数据
  useEffect(() => {
    fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
      .then(response => response.json())
      .then(data => {
        echarts.registerMap('china', data);
        if (chartInstance.current) {
          chartInstance.current.setOption({
            geo: { map: 'china' }
          });
        }
      })
      .catch(error => console.error('加载地图数据失败:', error));
  }, []);

  return (
    <div 
      ref={chartRef} 
      className="w-full h-[500px] bg-white rounded-xl shadow-lg"
    />
  );
}

// 照片详情弹窗
function PhotoModal({ record, onClose }) {
  if (!record) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#dbe08c] p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#89800c]">{record.location}</h2>
          <button 
            onClick={onClose}
            className="text-[#89800c] hover:bg-[#d1d678] rounded-full p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex gap-4 text-sm text-gray-500 mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {record.date}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {record.province}
            </span>
          </div>
          
          <p className="text-gray-700 leading-relaxed mb-4">{record.description}</p>
          
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-1">
              <Camera className="w-4 h-4" />
              照片 ({record.photos.length})
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {record.photos.map((photo, index) => (
                <img 
                  key={index}
                  src={photo} 
                  alt={`照片${index + 1}`}
                  className="w-full h-32 rounded-lg object-cover hover:scale-105 transition-transform cursor-pointer"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Travel() {
  const { user } = useAuth();
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const travelDates = travelRecords.map(r => r.date);
  const visitedProvinces = [...new Set(travelRecords.map(r => r.province))];

  const handleDateClick = (year, month, day = null) => {
    if (day !== null) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const record = travelRecords.find(r => r.date === dateStr);
      if (record) {
        setSelectedRecord(record);
        setSelectedLocation(record.location);
      }
    } else {
      if (month < 0) {
        setCurrentYear(year - 1);
        setCurrentMonth(11);
      } else if (month > 11) {
        setCurrentYear(year + 1);
        setCurrentMonth(0);
      } else {
        setCurrentYear(year);
        setCurrentMonth(month);
      }
    }
  };

  const handleMarkerClick = (record) => {
    setSelectedRecord(record);
    setSelectedLocation(record.location);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-4 p-4">
            {/* 左侧栏切换按钮 */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="fixed left-4 top-20 z-50 bg-[#dbe08c] text-[#89800c] p-2 rounded-full shadow-lg hover:bg-[#d1d678] transition-colors"
              title={sidebarOpen ? "隐藏日历" : "显示日历"}
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>

            {/* 左侧日历栏 */}
            {sidebarOpen && (
              <div className="w-52 flex-shrink-0 transition-all duration-300">
                <div className="bg-[#dbe08c]/30 rounded-xl shadow-lg p-4 sticky top-20">
                  <Calendar 
                    year={currentYear}
                    month={currentMonth}
                    onDateClick={handleDateClick}
                    travelDates={travelDates}
                  />
                  
                  <div className="mt-4 bg-white rounded-lg p-3">
                    <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-[#89800c]" />
                      已去省份
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {visitedProvinces.map(province => (
                        <span 
                          key={province}
                          onClick={() => {
                            const record = travelRecords.find(r => r.province === province);
                            if (record) {
                              setSelectedRecord(record);
                              setSelectedLocation(record.location);
                            }
                          }}
                          className="px-2 py-1 bg-[#dbe08c] text-[#89800c] text-xs rounded cursor-pointer hover:bg-[#89800c] hover:text-white transition-colors"
                        >
                          {province}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 bg-white rounded-lg p-3">
                    <h3 className="font-bold text-gray-800 mb-2">统计</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>📍 去过 {visitedProvinces.length} 个省份</p>
                      <p>📸 共 {travelRecords.reduce((sum, r) => sum + r.photos.length, 0)} 张照片</p>
                      <p>✈️ {travelRecords.length} 次旅行</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 右侧地图和内容 */}
            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? '' : 'ml-12'}`}>
              {/* ECharts 地图 */}
              <ChinaMap 
                records={travelRecords}
                onMarkerClick={handleMarkerClick}
                selectedLocation={selectedLocation}
              />

              {/* 照片列表 */}
              <div className="mt-4 bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-[#89800c]" />
                  旅行照片 ({travelRecords.reduce((sum, r) => sum + r.photos.length, 0)})
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {travelRecords.map(record => (
                    record.photos.map((photo, index) => (
                      <div
                        key={`${record.id}-${index}`}
                        onClick={() => handleMarkerClick(record)}
                        className={`relative rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#89800c] transition-all hover:scale-105 ${
                          selectedLocation === record.location ? 'ring-2 ring-[#89800c]' : ''
                        }`}
                      >
                        <img src={photo} alt="" className="w-full h-24 object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1">
                          {record.location}
                        </div>
                      </div>
                    ))
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 照片详情弹窗 */}
      <PhotoModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
    </div>
  );
}