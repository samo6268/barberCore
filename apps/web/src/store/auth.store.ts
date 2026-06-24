import { create } from 'zustand';

interface User { id: string; firstName: string; lastName: string; phone?: string; email?: string; avatarUrl?: string; role: string; }

interface AuthStore {
  user: User | null;
  setUser: (u: User | null) => void;
  isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  isLoggedIn: () => !!get().user,
}));
