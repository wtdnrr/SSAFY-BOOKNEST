import { create } from "zustand";

interface RecentSearch {
  query: string;
  timestamp: number;
}

interface RecentStore {
  recentSearches: RecentSearch[];
  addRecent: (query: string) => void;
  removeRecent: (query: string) => void;
  clearRecent: () => void;
}

export const useRecentStore = create<RecentStore>((set) => ({
  recentSearches: JSON.parse(localStorage.getItem("recentSearches") || "[]"),

  addRecent: (query: string) => {
    if (!query.trim()) return;

    set((state) => {
      const currentSearches = state.recentSearches;
      
      const updatedFullList = [
        { query, timestamp: Date.now() },
        ...currentSearches.filter((item) => item.query !== query),
      ];

      localStorage.setItem("recentSearches", JSON.stringify(updatedFullList));
      
      return { recentSearches: updatedFullList };
    });
  },

  removeRecent: (query: string) => {
    set((state) => {
      const currentSearches = state.recentSearches;

      const updatedFullList = currentSearches.filter(
        (item) => item.query !== query
      );

      localStorage.setItem("recentSearches", JSON.stringify(updatedFullList));

      return { recentSearches: updatedFullList };
    });
  },

  clearRecent: () => {
    localStorage.removeItem("recentSearches");
    set({ recentSearches: [] });
  },
}));
