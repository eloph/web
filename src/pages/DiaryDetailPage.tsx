import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ArrowLeft, Heart, MessageCircle, Send } from 'lucide-react';

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

interface Comment {
  id: number;
  user_id: number;
  diary_id: number;
  parent_id: number | null;
  content: string;
  created_at: string;
  nickname: string;
  avatar_url: string;
}

const DiaryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [diary, setDiary] = useState<Diary | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id || !token) return;

    const fetchDiary = async () => {
      try {
        // 这里应该调用获取日记详情的API，暂时使用模拟数据
        setDiary({
          id: parseInt(id),
          user_id: 1,
          content: '这是一篇完整的旅行日记，记录了我在云南大理的美好时光。大理的风景真的太美了，苍山洱海，风花雪月，让人流连忘返。这次旅行让我感受到了大自然的魅力，也让我更加珍惜生活中的美好瞬间。',
          mood_id: 1,
          mood_name: '开心',
          mood_emoji: '😊',
          mood_color: '#f59e0b',
          is_public: true,
          created_at: '2024-04-20T12:00:00Z',
          nickname: '旅行者小明',
          avatar_url: '',
        });

        // 模拟评论数据
        setComments([
          {
            id: 1,
            user_id: 2,
            diary_id: parseInt(id),
            parent_id: null,
            content: '看起来真的很开心呢！',
            created_at: '2024-04-20T13:00:00Z',
            nickname: '旅行爱好者',
            avatar_url: '',
          },
          {
            id: 2,
            user_id: 1,
            diary_id: parseInt(id),
            parent_id: 1,
            content: '是的，大理真的很美，推荐你也去看看！',
            created_at: '2024-04-20T13:30:00Z',
            nickname: '旅行者小明',
            avatar_url: '',
          },
        ]);
      } catch (error) {
        console.error('获取日记详情失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiary();
  }, [id, token]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentText.trim() || !token) return;

    setIsSubmitting(true);

    try {
      // 这里应该调用创建评论的API，暂时使用模拟数据
      const newComment: Comment = {
        id: comments.length + 1,
        user_id: user?.id || 1,
        diary_id: parseInt(id || '0'),
        parent_id: null,
        content: commentText,
        created_at: new Date().toISOString(),
        nickname: user?.nickname || '用户',
        avatar_url: user?.avatar_url || '',
      };

      setComments(prev => [...prev, newComment]);
      setCommentText('');
    } catch (error) {
      console.error('发表评论失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !diary) {
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
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-full hover:bg-gray-100"
          style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-medium">日记详情</h1>
        <div className="w-11"></div> {/* 占位，保持标题居中 */}
      </div>

      {/* 内容区域 */}
      <div className="pt-20 pb-24 px-4">
        {/* 日记内容 */}
        <div className="mb-8">
          {/* 用户信息 */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              {diary.avatar_url ? (
                <img src={diary.avatar_url} alt={diary.nickname} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-gray-500 text-lg">{diary.nickname.charAt(0)}</span>
              )}
            </div>
            <div>
              <div className="font-medium">{diary.nickname}</div>
              <div className="text-xs text-gray-500">{formatDate(diary.created_at)}</div>
            </div>
            <div className="ml-auto flex items-center gap-1" style={{ color: diary.mood_color }}>
              <span className="text-xl">{diary.mood_emoji}</span>
              <span className="text-sm">{diary.mood_name}</span>
            </div>
          </div>

          {/* 日记文字 */}
          <div className="text-gray-800 text-lg mb-6">
            {diary.content}
          </div>

          {/* 照片网格 */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {Array(4).fill(0).map((_, index) => (
              <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={`https://picsum.photos/400/400?random=${diary.id + index}`} 
                  alt={`照片 ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* 互动栏 */}
          <div className="flex items-center justify-between text-gray-500 border-t border-b border-gray-100 py-3">
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 hover:text-blue-600">
                <Heart size={20} />
                <span>12</span>
              </button>
              <button className="flex items-center gap-2 hover:text-blue-600">
                <MessageCircle size={20} />
                <span>{comments.length}</span>
              </button>
            </div>
            <button className="hover:text-blue-600">分享</button>
          </div>
        </div>

        {/* 留言区域 */}
        <div>
          <h2 className="text-lg font-medium mb-4">留言 ({comments.length})</h2>
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className={`${comment.parent_id ? 'pl-8' : ''}`}>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    {comment.avatar_url ? (
                      <img src={comment.avatar_url} alt={comment.nickname} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-gray-500">{comment.nickname.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{comment.nickname}</span>
                        <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    <div className="mt-1 flex items-center gap-4">
                      <button className="text-xs text-gray-500 hover:text-blue-600">回复</button>
                      <button className="text-xs text-gray-500 hover:text-blue-600">点赞</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 留言输入框 */}
          <form onSubmit={handleSubmitComment} className="mt-6">
            <div className="flex items-end gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.nickname} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-gray-500">{user?.nickname?.charAt(0) || 'U'}</span>
                )}
              </div>
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="写下你的评论..."
                  rows={2}
                  className="w-full border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !commentText.trim()}
                className="bg-blue-600 text-white rounded-full p-3 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DiaryDetailPage;
