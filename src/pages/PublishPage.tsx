import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ArrowLeft, Check } from 'lucide-react';
import PinguSticker from '../components/PinguSticker';
import BearSticker from '../components/BearSticker';

interface Mood {
  id: number;
  name: string;
  emoji: string;
  color: string;
}

interface Photo {
  id: number;
  originalUrl: string;
  thumbnailUrl: string;
}

const PublishPage: React.FC = () => {
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const moods: Mood[] = [
    { id: 1, name: '开心', emoji: '😊', color: '#f59e0b' },
    { id: 2, name: '难过', emoji: '😢', color: '#3b82f6' },
    { id: 3, name: '平静', emoji: '😌', color: '#10b981' },
    { id: 4, name: '兴奋', emoji: '🤩', color: '#8b5cf6' },
    { id: 5, name: '疲惫', emoji: '😴', color: '#6b7280' },
    { id: 6, name: '感恩', emoji: '🙏', color: '#ec4899' },
  ];

  useEffect(() => {
    // 自动调整文本框高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // 限制最多20张照片
    if (photos.length + files.length > 20) {
      alert('最多只能上传20张照片');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // 初始化上传
        const initResponse = await fetch('/api/upload/init', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ filename: file.name, size: file.size }),
        });

        const initData = await initResponse.json();
        const { uploadId, presignedUrls, partSize } = initData;

        // 分片上传
        const parts = Math.ceil(file.size / partSize);
        const uploadPromises = [];

        for (let j = 0; j < parts; j++) {
          const start = j * partSize;
          const end = Math.min(start + partSize, file.size);
          const blob = file.slice(start, end);

          const uploadPromise = fetch(presignedUrls[j], {
            method: 'PUT',
            body: blob,
          });

          uploadPromises.push(uploadPromise);
          
          // 更新进度
          setUploadProgress(Math.round(((i * files.length) + (j + 1) / parts) / files.length * 100));
        }

        await Promise.all(uploadPromises);

        // 完成上传
        const completeResponse = await fetch('/api/upload/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ uploadId, filename: file.name }),
        });

        const completeData = await completeResponse.json();
        setPhotos(prev => [...prev, {
          id: completeData.photoId,
          originalUrl: completeData.originalUrl,
          thumbnailUrl: completeData.thumbnailUrl,
        }]);
      }
    } catch (error) {
      console.error('上传失败:', error);
      alert('上传失败，请重试');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      alert('请输入日记内容');
      return;
    }

    if (!selectedMood) {
      alert('请选择心情');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/diary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          mood_id: selectedMood.id,
          is_public: true,
          photos: photos.map(p => p.id),
        }),
      });

      if (!response.ok) {
        throw new Error('发布失败');
      }

      // 发布成功，跳转到首页
      navigate('/');
    } catch (error) {
      console.error('发布失败:', error);
      alert('发布失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 顶部导航栏 */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-full hover:bg-gray-100"
          style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-2">
          <PinguSticker size="small" />
          <h1 className="text-lg font-medium">发布日记</h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !content.trim() || !selectedMood}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Check size={24} className={content.trim() && selectedMood ? 'text-blue-600' : 'text-gray-400'} />
        </button>
      </div>

      {/* 上传进度条 */}
      {isUploading && (
        <div className="fixed top-16 left-0 right-0 bg-blue-100 z-50">
          <div className="h-1 bg-blue-600" style={{ width: `${uploadProgress}%` }}></div>
        </div>
      )}

      {/* 内容区域 */}
      <div className="pt-20 pb-24 px-4">
        {/* 文字编辑器 */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="记录你的旅行心情..."
          maxLength={5000}
          className="w-full border-none outline-none text-lg resize-none"
          style={{ minHeight: '200px' }}
        />

        <div className="text-right text-gray-500 text-sm mt-2">
          {content.length}/5000
        </div>

        {/* 心情选择 */}
        <div className="mt-8">
          <h2 className="text-lg font-medium mb-4">选择心情</h2>
          <div className="grid grid-cols-3 gap-4">
            {moods.map((mood) => (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood)}
                className={`flex flex-col items-center justify-center p-4 rounded-lg transition-colors ${selectedMood?.id === mood.id ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                style={{ minHeight: '80px' }}
              >
                <span className="text-3xl mb-2">{mood.emoji}</span>
                <span className="text-sm">{mood.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 照片上传 */}
        <div className="mt-8">
          <h2 className="text-lg font-medium mb-4">添加照片 ({photos.length}/20)</h2>
          <div className="grid grid-cols-4 gap-2">
            {photos.map((photo, index) => (
              <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden">
                <img
                  src={photo.thumbnailUrl}
                  alt={`照片 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setPhotos(prev => prev.filter(p => p.id !== photo.id))}
                  className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1"
                >
                  ×
                </button>
              </div>
            ))}
            {photos.length < 20 && (
              <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <span className="text-gray-400">+</span>
                <span className="text-xs text-gray-500 mt-1">添加照片</span>
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishPage;
