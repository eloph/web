import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: {
    id: number;
    email: string;
    nickname: string;
    bio?: string;
    avatar_url?: string;
  } | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname: string, bio?: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '登录失败');
          }

          const data = await response.json();
          set({
            user: { id: data.userId, email, nickname: '' }, // 实际应用中应该从后端获取完整用户信息
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '登录失败',
            isLoading: false,
          });
        }
      },
      
      register: async (email, password, nickname, bio) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, nickname, bio }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '注册失败');
          }

          const data = await response.json();
          set({
            user: { id: data.userId, email, nickname, bio },
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '注册失败',
            isLoading: false,
          });
        }
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },
      
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
