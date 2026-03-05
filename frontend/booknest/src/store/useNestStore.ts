import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NestStore {
  nestBooks: { [key: number]: boolean };  // bookId를 key로 하고, 서재 등록 여부를 value로 가지는 객체
  setNestStatus: (bookId: number, status: boolean) => void;
  getNestStatus: (bookId: number) => boolean;
  clearNestStatus: () => void;
}

const useNestStore = create<NestStore>()(
  persist(
    (set, get) => ({
      nestBooks: {},
      
      setNestStatus: (bookId: number, status: boolean) => {
        if (typeof status !== 'boolean') return; // Ignore if status is not boolean
        set((state) => ({
          nestBooks: {
            ...state.nestBooks,
            [bookId]: status,
          },
        }));
      },

      getNestStatus: (bookId: number) => {
        return get().nestBooks[bookId] || false;
      },

      clearNestStatus: () => {
        set({ nestBooks: {} });
      },
    }),
    {
      name: 'nest-storage',
      partialize: (state) => ({ nestBooks: state.nestBooks }),
    }
  )
);

export default useNestStore; 