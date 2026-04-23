import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 修复 Leaflet 图标问题
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  photos?: Array<{ id: number; thumbnailUrl: string }>;
}

const MapPage: React.FC = () => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuthStore();
  const mapRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // 初始化地图
    const newMap = L.map(mapRef.current).setView([39.9042, 116.4074], 12);

    // 添加底图
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(newMap);

    setMap(newMap);

    // 模拟数据
    const mockLocations: Location[] = [
      {
        id: 1,
        name: '北京故宫',
        latitude: 39.9163,
        longitude: 116.3972,
        photos: [
          { id: 1, thumbnailUrl: 'https://picsum.photos/200/200?random=1' },
          { id: 2, thumbnailUrl: 'https://picsum.photos/200/200?random=2' },
          { id: 3, thumbnailUrl: 'https://picsum.photos/200/200?random=3' },
        ],
      },
      {
        id: 2,
        name: '颐和园',
        latitude: 39.9997,
        longitude: 116.2755,
        photos: [
          { id: 4, thumbnailUrl: 'https://picsum.photos/200/200?random=4' },
          { id: 5, thumbnailUrl: 'https://picsum.photos/200/200?random=5' },
        ],
      },
      {
        id: 3,
        name: '长城',
        latitude: 40.4319,
        longitude: 116.5704,
        photos: [
          { id: 6, thumbnailUrl: 'https://picsum.photos/200/200?random=6' },
          { id: 7, thumbnailUrl: 'https://picsum.photos/200/200?random=7' },
          { id: 8, thumbnailUrl: 'https://picsum.photos/200/200?random=8' },
          { id: 9, thumbnailUrl: 'https://picsum.photos/200/200?random=9' },
        ],
      },
    ];

    setLocations(mockLocations);
    setIsLoading(false);

    // 清理函数
    return () => {
      newMap.remove();
    };
  }, []);

  useEffect(() => {
    if (!map || locations.length === 0) return;

    // 清除现有标记
    markersRef.current.forEach(marker => map!.removeLayer(marker));
    markersRef.current = [];

    // 添加新标记
    locations.forEach((location, index) => {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
      const color = colors[index % colors.length];

      // 创建自定义图标
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${location.photos?.length || 0}</div>`,
        iconSize: [20, 20],
      });

      const marker = L.marker([location.latitude, location.longitude], { icon })
        .addTo(map)
        .on('click', () => {
          setSelectedLocation(location);
        });

      markersRef.current.push(marker);
    });
  }, [map, locations]);

  const handleAddMarker = (e: any) => {
    // 这里可以实现添加新标记的逻辑
    console.log('添加标记:', e.latlng);
  };

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);
    map?.setView([location.latitude, location.longitude], 15);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 顶部导航栏 */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">旅行地图</h1>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium">
            我的足迹
          </button>
        </div>
      </div>

      {/* 地图容器 */}
      <div 
        ref={mapRef} 
        className="w-full h-screen pt-16 pb-24"
        style={{ minHeight: '500px' }}
      ></div>

      {/* 已标记地点列表 */}
      <div className="fixed bottom-24 left-0 right-0 bg-white border-t border-gray-200 z-30 px-4 py-3">
        <h2 className="text-sm font-medium mb-2">已标记地点</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {locations.map((location) => (
            <div
              key={location.id}
              onClick={() => handleLocationClick(location)}
              className="flex-shrink-0 w-20 flex flex-col items-center cursor-pointer"
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden mb-1">
                {location.photos && location.photos.length > 0 ? (
                  <img 
                    src={location.photos[0].thumbnailUrl} 
                    alt={location.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-xs">无照片</span>
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-800 truncate w-full text-center">
                {location.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 标记详情浮层 */}
      {selectedLocation && (
        <div className="fixed bottom-48 left-4 right-4 bg-white rounded-lg shadow-lg p-4 z-50">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-medium text-lg">{selectedLocation.name}</h3>
            <button 
              onClick={() => setSelectedLocation(null)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              ×
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {selectedLocation.photos?.slice(0, 9).map((photo) => (
              <div key={photo.id} className="aspect-square rounded-md overflow-hidden">
                <img 
                  src={photo.thumbnailUrl} 
                  alt={selectedLocation.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium">
              查看详情
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium">
              上传照片
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;
