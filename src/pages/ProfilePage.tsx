import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { LogOut, Camera } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [bio, setBio] = useState(user?.bio || '');

  const handleLogout = () => {
    logout();
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 这里应该调用上传头像的API，暂时使用模拟数据
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    // 这里应该调用更新用户信息的API
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-30 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">个人主页</h1>
        <button
          onClick={handleLogout}
          className="p-2 rounded-full hover:bg-gray-100"
          style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* 个人信息卡片 */}
      <div className="bg-white p-6 mb-4">
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt={nickname} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-gray-500 text-2xl">{nickname.charAt(0)}</span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <Camera size={16} />
            </label>
          </div>
          {isEditing ? (
            <div className="w-full max-w-xs">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full text-center text-xl font-bold mb-2 border-b border-gray-300 py-1"
              />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="介绍一下自己吧"
                rows={3}
                className="w-full text-center text-sm text-gray-600 border border-gray-300 rounded-lg p-2 mb-4"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-full text-sm font-medium"
                >
                  保存
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-full text-sm font-medium"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-1">{nickname}</h2>
              <p className="text-gray-600 text-sm mb-4">{bio || '这个人很懒，还没有填写个人简介'}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium"
              >
                编辑资料
              </button>
            </>
          )}
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-bold">12</div>
            <div className="text-sm text-gray-600">日记</div>
          </div>
          <div>
            <div className="text-xl font-bold">5</div>
            <div className="text-sm text-gray-600">地区</div>
          </div>
          <div>
            <div className="text-xl font-bold">8</div>
            <div className="text-sm text-gray-600">关注</div>
          </div>
        </div>
      </div>

      {/* 我的日记 */}
      <div className="bg-white p-4">
        <h3 className="text-lg font-medium mb-4">我的日记</h3>
        <div className="grid grid-cols-2 gap-2">
          {Array(6).fill(0).map((_, index) => (
            <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={`https://picsum.photos/300/300?random=${index}`} 
                alt={`日记 ${index + 1}`} 
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
