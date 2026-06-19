import Navbar from "@/components/Navbar";
import { useState } from "react";

const travelRecords = [
  { id: 1, date: "2024-10-15", location: "云南丽江", province: "云南", lat: 26.8206, lng: 100.2333, photos: ["https://picsum.photos/seed/lijiang1/300/300", "https://picsum.photos/seed/lijiang2/300/300", "https://picsum.photos/seed/lijiang3/300/300"] },
  { id: 2, date: "2024-10-18", location: "云南大理", province: "云南", lat: 25.6050, lng: 100.1841, photos: ["https://picsum.photos/seed/dali1/300/300", "https://picsum.photos/seed/dali2/300/300"] },
  { id: 3, date: "2024-07-10", location: "新疆伊犁", province: "新疆", lat: 43.9247, lng: 81.3280, photos: ["https://picsum.photos/seed/yili1/300/300", "https://picsum.photos/seed/yili2/300/300", "https://picsum.photos/seed/yili3/300/300", "https://picsum.photos/seed/yili4/300/300"] },
  { id: 4, date: "2024-07-15", location: "新疆喀什", province: "新疆", lat: 39.4750, lng: 75.9764, photos: ["https://picsum.photos/seed/kashgar1/300/300"] },
  { id: 5, date: "2023-05-20", location: "四川成都", province: "四川", lat: 30.5728, lng: 104.0668, photos: ["https://picsum.photos/seed/chengdu1/300/300", "https://picsum.photos/seed/chengdu2/300/300"] },
  { id: 6, date: "2023-05-25", location: "四川九寨沟", province: "四川", lat: 33.2098, lng: 103.9300, photos: ["https://picsum.photos/seed/jiuzhaigou1/300/300", "https://picsum.photos/seed/jiuzhaigou2/300/300", "https://picsum.photos/seed/jiuzhaigou3/300/300"] },
  { id: 7, date: "2023-11-10", location: "北京", province: "北京", lat: 39.9042, lng: 116.4074, photos: ["https://picsum.photos/seed/beijing1/300/300", "https://picsum.photos/seed/beijing2/300/300"] },
  { id: 8, date: "2022-03-08", location: "上海", province: "上海", lat: 31.2304, lng: 121.4737, photos: ["https://picsum.photos/seed/shanghai1/300/300"] },
];

const locations = ["山东", "广东", "四川", "北京", "上海", "云南", "新疆", "日本", "美国"];

const travelDiaries = [
  {
    id: 1,
    location: "云南丽江",
    date: "2024-10-15",
    title: "丽江古城漫步",
    content: "今天来到了美丽的丽江古城，这里的建筑风格独特，小桥流水人家的感觉让人流连忘返。晚上的古城灯火辉煌，别有一番风味。",
    photos: ["https://picsum.photos/seed/lijiang_diary1/800/600", "https://picsum.photos/seed/lijiang_diary2/800/600"],
    comments: [
      { id: 1, name: "游客A", content: "太美了！我也想去！", time: "2024-10-16", visible: true },
      { id: 2, name: "游客B", content: "古城夜景确实很美", time: "2024-10-17", visible: true },
    ],
  },
  {
    id: 2,
    location: "新疆伊犁",
    date: "2024-07-10",
    title: "那拉提草原之旅",
    content: "那拉提草原真是人间仙境！一望无际的草原上点缀着白色的毡房，远处是连绵的雪山，马儿在悠闲地吃草，这画面太美了！",
    photos: ["https://picsum.photos/seed/yili_diary1/800/600"],
    comments: [
      { id: 3, name: "旅行者C", content: "草原好美，下次一定要去！", time: "2024-07-12", visible: true },
    ],
  },
];

const provinceData = [
  { name: "云南", lat: 24.9798, lng: 101.3869, visited: true },
  { name: "新疆", lat: 41.3275, lng: 85.1587, visited: true },
  { name: "四川", lat: 30.6173, lng: 103.9520, visited: true },
  { name: "北京", lat: 39.9042, lng: 116.4074, visited: true },
  { name: "上海", lat: 31.2304, lng: 121.4737, visited: true },
  { name: "广东", lat: 23.8103, lng: 113.2644, visited: false },
  { name: "山东", lat: 36.4234, lng: 117.0009, visited: false },
  { name: "浙江", lat: 30.2741, lng: 120.1552, visited: false },
  { name: "江苏", lat: 32.0603, lng: 118.7969, visited: false },
  { name: "西藏", lat: 29.6540, lng: 91.1328, visited: false },
  { name: "青海", lat: 36.5612, lng: 101.7775, visited: false },
  { name: "甘肃", lat: 36.0611, lng: 103.8343, visited: false },
  { name: "陕西", lat: 34.2778, lng: 108.9463, visited: false },
  { name: "河南", lat: 34.7466, lng: 113.6253, visited: false },
  { name: "河北", lat: 38.0423, lng: 114.5025, visited: false },
  { name: "辽宁", lat: 41.8045, lng: 123.4328, visited: false },
  { name: "黑龙江", lat: 45.8038, lng: 126.5349, visited: false },
  { name: "吉林", lat: 43.8041, lng: 125.3216, visited: false },
];

function getProvinceRecords(provinceName) {
  return travelRecords.filter(r => r.province === provinceName);
}

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

function MapWithMarkers({ records, onMarkerClick, selectedLocation, onProvinceClick, selectedProvince }) {
  const mapWidth = 600;
  const mapHeight = 350;
  
  const chinaCenterLat = 35.8617;
  const chinaCenterLng = 104.1954;
  const latScale = mapHeight / 40;
  const lngScale = mapWidth / 60;

  const getPosition = (lat, lng) => {
    const x = ((lng - (chinaCenterLng - 30)) * lngScale);
    const y = ((chinaCenterLat + 20 - lat) * latScale);
    return { x, y };
  };

  const visitedProvinces = [...new Set(records.map(r => r.province))];

  return (
    <div className="relative bg-white rounded-xl shadow-lg overflow-hidden" style={{ width: mapWidth, height: mapHeight }}>
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("https://picsum.photos/seed/chinamap/${mapWidth}/${mapHeight}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-br from-[#dbe08c]/10 to-[#89800c]/10"></div>
      
      {provinceData.map((province) => {
        const pos = getPosition(province.lat, province.lng);
        const isVisited = visitedProvinces.includes(province.name);
        const isSelected = selectedProvince === province.name;
        
        return (
          <div
            key={province.name}
            onClick={() => onProvinceClick(province.name)}
            className={`absolute cursor-pointer transition-all hover:scale-110 ${
              isSelected ? "scale-110" : ""
            }`}
            style={{ 
              left: pos.x - 20, 
              top: pos.y - 20,
              width: 40,
              height: 40,
            }}
          >
            <div className={`relative w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
              isVisited 
                ? isSelected 
                  ? "bg-[#89800c] text-white ring-2 ring-yellow-300" 
                  : "bg-[#dbe08c] text-[#89800c] border-2 border-[#89800c]" 
                : "bg-gray-200 text-gray-500 border border-gray-300"
            }`}>
              {province.name.slice(0, 2)}
            </div>
            {isVisited && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
        );
      })}
      
      {records.map((record) => {
        const pos = getPosition(record.lat, record.lng);
        return (
          <div
            key={record.id}
            onClick={() => onMarkerClick(record)}
            className={`absolute cursor-pointer transition-transform hover:scale-110 ${
              selectedLocation === record.location ? "scale-110" : ""
            }`}
            style={{ 
              left: pos.x - 25, 
              top: pos.y - 25,
              width: 50,
              height: 50,
            }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-[#89800c] rounded-full animate-ping opacity-30"></div>
              <div className="relative w-10 h-10 bg-[#dbe08c] rounded-full border-2 border-[#89800c] flex items-center justify-center">
                <span className="text-xs font-bold text-[#89800c]">{record.photos.length}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 -mt-4 ml-4 rounded overflow-hidden border-2 border-white shadow">
                <img src={record.photos[0]} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PhotoGallery({ photos, onPhotoClick }) {
  if (!photos || photos.length === 0) return null;
  
  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {photos.map((photo, index) => (
        <div
          key={index}
          onClick={() => onPhotoClick(photo)}
          className="w-24 h-24 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#89800c] transition-all hover:scale-105 shadow"
        >
          <img src={photo} alt={`照片${index + 1}`} className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
}

function DiaryDetail({ diary, onClose, onComment, comments, isLoggedIn, onShare }) {
  if (!diary) return null;

  const [newComment, setNewComment] = useState("");
  const [authorMode, setAuthorMode] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleAddComment = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    if (newComment.trim()) {
      onComment(diary.id, newComment);
      setNewComment("");
    }
  };

  const handleToggleComment = (commentId) => {
    if (authorMode) {
      alert(`评论 ${commentId} 已切换显示状态`);
    }
  };

  const handleShare = (platform) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    onShare(platform);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#dbe08c] p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#89800c]">{diary.title}</h2>
          <button 
            onClick={onClose}
            className="text-[#89800c] hover:bg-[#d1d678] rounded-full p-1"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex gap-4 text-sm text-gray-500 mb-4">
            <span>📍 {diary.location}</span>
            <span>📅 {diary.date}</span>
          </div>
          
          <p className="text-gray-700 leading-relaxed mb-4">{diary.content}</p>
          
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-2">照片</h3>
            <div className="flex gap-2 flex-wrap">
              {diary.photos.map((photo, index) => (
                <img 
                  key={index}
                  src={photo} 
                  alt={`照片${index + 1}`}
                  className="w-32 h-32 rounded-lg object-cover"
                />
              ))}
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-800">评论 ({comments.filter(c => c.visible).length})</h3>
              <button 
                onClick={() => setAuthorMode(!authorMode)}
                className={`text-sm px-3 py-1 rounded ${authorMode ? "bg-[#dbe08c] text-[#89800c]" : "bg-gray-100 text-gray-600"}`}
              >
                {authorMode ? "退出博主模式" : "博主模式"}
              </button>
            </div>
            
            <div className="space-y-3 mb-4">
              {comments.map((comment) => (
                comment.visible && (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded-lg flex justify-between">
                    <div>
                      <span className="font-medium text-gray-800">{comment.name}</span>
                      <span className="text-xs text-gray-500 ml-2">{comment.time}</span>
                      <p className="text-gray-600">{comment.content}</p>
                    </div>
                    {authorMode && (
                      <button 
                        onClick={() => handleToggleComment(comment.id)}
                        className="text-xs text-gray-400 hover:text-red-500"
                      >
                        隐藏
                      </button>
                    )}
                  </div>
                )
              ))}
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="发表评论..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbe08c]"
              />
              <button
                onClick={handleAddComment}
                className="px-4 py-2 bg-[#dbe08c] text-[#89800c] font-bold rounded-lg hover:bg-[#d1d678] transition-colors"
              >
                发表
              </button>
            </div>
            
            <div className="mt-4 flex gap-4">
              <button onClick={() => handleShare('QQ空间')} className="text-xs flex items-center gap-1 text-gray-500 hover:text-[#89800c]">
                <span>🔄</span> 转发到QQ空间
              </button>
              <button onClick={() => handleShare('微博')} className="text-xs flex items-center gap-1 text-gray-500 hover:text-red-500">
                <span>🔴</span> 分享到微博
              </button>
              <button onClick={() => handleShare('微信')} className="text-xs flex items-center gap-1 text-gray-500 hover:text-green-500">
                <span>💚</span> 分享到微信
              </button>
            </div>
          </div>
        </div>
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#dbe08c] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="font-bold text-gray-800 text-xl mb-2">需要登录</h3>
              <p className="text-gray-600 mb-6">请先登录后再进行操作</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <a
                  href="/login"
                  className="flex-1 px-4 py-2 bg-[#89800c] text-white font-bold rounded-lg hover:bg-[#6b6409] transition-colors text-center inline-block"
                >
                  去登录
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Travel() {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedDiary, setSelectedDiary] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [diaries, setDiaries] = useState(travelDiaries);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const travelDates = travelRecords.map(r => r.date);

  const handleDateClick = (year, month, day = null) => {
    if (day !== null) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const record = travelRecords.find(r => r.date === dateStr);
      if (record) {
        setSelectedRecord(record);
      }
    } else {
      setCurrentYear(year);
      setCurrentMonth(month);
    }
  };

  const handleMarkerClick = (record) => {
    setSelectedRecord(record);
    setSelectedLocation(record.location);
    setSelectedProvince(record.province);
  };

  const handlePhotoClick = (photo) => {
    const diary = diaries.find(d => d.photos.includes(photo));
    if (diary) {
      setSelectedDiary(diary);
    }
  };

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
    const record = travelRecords.find(r => r.location.includes(location));
    if (record) {
      setSelectedRecord(record);
    }
  };

  const handleProvinceClick = (provinceName) => {
    setSelectedProvince(prev => prev === provinceName ? null : provinceName);
    setSelectedLocation(null);
    setSelectedRecord(null);
  };

  const handleAddComment = (diaryId, content) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    setDiaries(prev => prev.map(d => {
      if (d.id === diaryId) {
        return {
          ...d,
          comments: [...d.comments, {
            id: Date.now(),
            name: "登录用户",
            content,
            time: new Date().toISOString().split('T')[0],
            visible: true,
          }]
        };
      }
      return d;
    }));
    const updatedDiary = diaries.find(d => d.id === diaryId);
    if (updatedDiary) {
      setSelectedDiary({
        ...updatedDiary,
        comments: [...updatedDiary.comments, {
          id: Date.now(),
          name: "登录用户",
          content,
          time: new Date().toISOString().split('T')[0],
          visible: true,
        }]
      });
    }
  };

  const handleShare = (platform) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    alert(`分享到${platform}功能演示中...`);
  };

  const filteredRecords = selectedProvince 
    ? travelRecords.filter(r => r.province === selectedProvince)
    : travelRecords;

  const visitedProvinces = [...new Set(travelRecords.map(r => r.province))];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="pt-16">
        
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-4 p-4">
            <div className="w-52 flex-shrink-0">
              <div className="bg-[#dbe08c]/30 rounded-xl shadow-lg p-4">
                <h3 className="font-bold text-[#89800c] mb-4 text-lg">我的日记</h3>
                
                <div className="mb-4">
                  <select
                    value={currentYear}
                    onChange={(e) => setCurrentYear(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#89800c] rounded-lg bg-white text-[#89800c] font-medium focus:outline-none focus:ring-2 focus:ring-[#dbe08c]"
                  >
                    {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map(year => (
                      <option key={year} value={year}>{year}年</option>
                    ))}
                  </select>
                </div>
                
                <Calendar 
                  year={currentYear} 
                  month={currentMonth} 
                  onDateClick={handleDateClick}
                  travelDates={travelDates}
                />
                
                <div className="mt-4">
                  <h4 className="font-bold text-[#89800c] mb-2">去过的省份</h4>
                  <div className="flex flex-wrap gap-2">
                    {visitedProvinces.map((province) => (
                      <button
                        key={province}
                        onClick={() => handleProvinceClick(province)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedProvince === province
                            ? "bg-[#89800c] text-white"
                            : "bg-white text-[#89800c] hover:bg-[#dbe08c]"
                        }`}
                      >
                        {province}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-bold text-[#89800c] mb-2">详细地点</h4>
                  <div className="flex flex-wrap gap-2">
                    {locations.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => handleLocationClick(loc)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedLocation === loc
                            ? "bg-[#89800c] text-white"
                            : "bg-white text-[#89800c] hover:bg-[#dbe08c]"
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-lg p-4">
                <div className="flex justify-center">
                  <MapWithMarkers 
                    records={travelRecords} 
                    onMarkerClick={handleMarkerClick}
                    selectedLocation={selectedLocation}
                    onProvinceClick={handleProvinceClick}
                    selectedProvince={selectedProvince}
                  />
                </div>
              </div>
              
              {selectedProvince && (
                <div className="mt-4 bg-[#dbe08c]/20 rounded-xl p-4">
                  <h4 className="font-bold text-[#89800c] mb-3">📍 {selectedProvince} - 旅行记录</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {filteredRecords.map((record) => (
                      <div 
                        key={record.id}
                        onClick={() => {
                          setSelectedRecord(record);
                          setSelectedLocation(record.location);
                        }}
                        className="bg-white p-3 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <p className="font-medium text-gray-800">{record.location}</p>
                        <p className="text-xs text-gray-500">{record.date}</p>
                        <p className="text-xs text-gray-400">{record.photos.length} 张照片</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedRecord && (
                <div className="mt-4 bg-white rounded-xl shadow-lg p-4">
                  <h3 className="font-bold text-gray-800 mb-2">📍 {selectedRecord.location}</h3>
                  <p className="text-sm text-gray-500 mb-4">{selectedRecord.date}</p>
                  <PhotoGallery 
                    photos={selectedRecord.photos} 
                    onPhotoClick={handlePhotoClick}
                  />
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex gap-4 mb-4">
                      <button
                        onClick={() => handleShare('QQ空间')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <span>🔄</span> 分享到QQ空间
                      </button>
                      <button
                        onClick={() => handleShare('微博')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <span>🔴</span> 分享到微博
                      </button>
                      <button
                        onClick={() => handleShare('微信')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <span>💚</span> 分享到微信
                      </button>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-bold text-gray-700 mb-3">留言评论</h4>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="写下你的评论..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbe08c]"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddComment(0, e.target.value);
                              e.target.value = '';
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            const input = document.querySelector('input[type="text"]');
                            if (input) {
                              handleAddComment(0, input.value);
                              input.value = '';
                            }
                          }}
                          className="px-4 py-2 bg-[#dbe08c] text-[#89800c] font-bold rounded-lg hover:bg-[#d1d678] transition-colors"
                        >
                          发表
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {selectedDiary && (
        <DiaryDetail 
          diary={selectedDiary}
          onClose={() => setSelectedDiary(null)}
          onComment={handleAddComment}
          comments={selectedDiary.comments}
          isLoggedIn={isLoggedIn}
          onShare={handleShare}
        />
      )}

      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#dbe08c] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="font-bold text-gray-800 text-xl mb-2">需要登录</h3>
              <p className="text-gray-600 mb-6">请先登录后再进行操作</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <a
                  href="/login"
                  className="flex-1 px-4 py-2 bg-[#89800c] text-white font-bold rounded-lg hover:bg-[#6b6409] transition-colors text-center inline-block"
                >
                  去登录
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}