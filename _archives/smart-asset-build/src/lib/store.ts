import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppStore {
  theme: 'light' | 'dark';
  demoMode: boolean;
  toggleTheme: () => void;
  setDemoMode: (enabled: boolean) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      demoMode: true,
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light',
      })),
      setDemoMode: (enabled) => set({ demoMode: enabled }),
    }),
    {
      name: 'app-store',
      partialize: (state) => ({ theme: state.theme, demoMode: state.demoMode }),
    }
  )
);
