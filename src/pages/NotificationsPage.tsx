import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

interface Notification {
  id: number;
  type: 'comment' | 'like' | 'system';
  content: string;
  user?: {
    nickname: string;
    avatar_url: string;
  };
  diary_id?: number;
  diary_title?: string;
  created_at: string;
  read: boolean;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    if (!token) return;

    // 模拟数据
    const mockNotifications: Notification[] = [
      {
        id: 1,
        type: 'comment',
        content: '评论了你的日记',
        user: {
          nickname: '旅行爱好者',
          avatar_url: '',
        },
        diary_id: 1,
        diary_title: '大理之旅',
        created_at: '2024-04-23T10:00:00Z',
        read: false,
      },
      {
        id: 2,
        type: 'like',
        content: '点赞了你的日记',
        user: {
          nickname: '背包客',
          avatar_url: '',
        },
        diary_id: 2,
        diary_title: '长城游记',
        created_at: '2024-04-23T09:30:00Z',
        read: false,
      },
      {
        id: 3,
        type: 'system',
        content: '欢迎使用旅行心情日记，开始记录你的旅行故事吧！',
        created_at: '2024-04-22T18:00:00Z',
        read: true,
      },
    ];

    setNotifications(mockNotifications);
    setIsLoading(false);
  }, [token]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) {
      return `${days}天前`;
    } else if (hours > 0) {
      return `${hours}小时前`;
    } else if (minutes > 0) {
      return `${minutes}分钟前`;
    } else {
      return '刚刚';
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-30 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">消息通知</h1>
        <button className="text-blue-600 text-sm font-medium">全部标为已读</button>
      </div>

      {/* 通知列表 */}
      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <p>暂无通知</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              className={`bg-white p-4 border-b border-gray-100 ${!notification.read ? 'bg-blue-50' : ''}`}
            >
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  {notification.user?.avatar_url ? (
                    <img src={notification.user.avatar_url} alt={notification.user.nickname} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-gray-500">
                      {notification.type === 'comment' ? '💬' : 
                       notification.type === 'like' ? '❤️' : '📢'}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium">
                      {notification.user?.nickname || '系统'}
                      <span className="text-gray-600 font-normal ml-1">{notification.content}</span>
                      {notification.diary_title && (
                        <span className="text-blue-600 font-normal ml-1">《{notification.diary_title}》</span>
                      )}
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(notification.created_at)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
