import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Heart, MessageCircle } from 'lucide-react';
import PinguSticker from '../components/PinguSticker';
import BearSticker from '../components/BearSticker';

interface Diary {
  id: number;
  user_id: number;
  content: string;
  mood_id: number;
  mood_name: string;
  mood_emoji: string;
  mood_color: string;
  is_public: boolean;
  created_at: string;
  nickname: string;
  avatar_url: string;
}

const HomePage: React.FC = () => {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { token } = useAuthStore();
  const observerRef = useRef<HTMLDivElement>(null);

  const fetchDiaries = async (pageNum: number, refresh = false) => {
    if (!token) return;

    try {
      const response = await fetch(`/api/diary?page=${pageNum}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取日记失败');
      }

      const data = await response.json();
      
      if (refresh) {
        setDiaries(data);
      } else {
        setDiaries(prev => [...prev, ...data]);
      }

      setHasMore(data.length === 10);
    } catch (error) {
      console.error('获取日记失败:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDiaries(1, true);
  }, [token]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasMore, isLoading]);

  useEffect(() => {
    if (page > 1) {
      fetchDiaries(page);
    }
  }, [page]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setPage(1);
    fetchDiaries(1, true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PinguSticker size="small" />
          <h1 className="text-xl font-bold">旅行心情日记</h1>
        </div>
        <div className="flex items-center gap-3">
          <BearSticker size="small" color="white" />
          <button className="p-2 rounded-full hover:bg-gray-100" style={{ minWidth: '44px', minHeight: '44px' }}>
            <Heart size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100" style={{ minWidth: '44px', minHeight: '44px' }}>
            <MessageCircle size={20} />
          </button>
        </div>
      </div>

      {/* 下拉刷新 */}
      {isRefreshing && (
        <div className="py-4 flex justify-center items-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* 日记列表 */}
      <div className="space-y-4 px-4 py-2">
        {diaries.map((diary) => (
          <Link to={`/diary/${diary.id}`} key={diary.id} className="block">
            <div className="bg-white rounded-lg shadow-sm p-4">
              {/* 用户信息 */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  {diary.avatar_url ? (
                    <img src={diary.avatar_url} alt={diary.nickname} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-gray-500">{diary.nickname.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <div className="font-medium">{diary.nickname}</div>
                  <div className="text-xs text-gray-500">{formatDate(diary.created_at)}</div>
                </div>
                <div className="ml-auto flex items-center gap-1" style={{ color: diary.mood_color }}>
                  <span>{diary.mood_emoji}</span>
                  <span className="text-sm">{diary.mood_name}</span>
                </div>
              </div>

              {/* 日记内容 */}
              <div className="text-gray-800 mb-3">
                {diary.content.length > 100 ? (
                  <>{diary.content.substring(0, 100)}... <span className="text-blue-600">展开</span></>
                ) : (
                  diary.content
                )}
              </div>

              {/* 照片网格 */}
              <div className="grid grid-cols-3 gap-1 mb-3">
                {Array(3).fill(0).map((_, index) => (
                  <div key={index} className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                    <img 
                      src={`https://picsum.photos/200/200?random=${diary.id + index}`} 
                      alt={`照片 ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* 互动栏 */}
              <div className="flex items-center justify-between text-gray-500 text-sm border-t border-gray-100 pt-3">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1 hover:text-blue-600">
                    <Heart size={16} />
                    <span>12</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-blue-600">
                    <MessageCircle size={16} />
                    <span>3</span>
                  </button>
                </div>
                <button className="hover:text-blue-600">分享</button>
              </div>
            </div>
          </Link>
        ))}

        {/* 加载更多 */}
        {isLoading && diaries.length === 0 && (
          <div className="py-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {hasMore && (
          <div ref={observerRef} className="py-4 flex justify-center items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!hasMore && diaries.length > 0 && (
          <div className="py-4 text-center text-gray-500 text-sm">
            没有更多内容了
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
