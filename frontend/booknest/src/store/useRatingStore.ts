import { create } from 'zustand';

interface RatingState {
  userRatings: Record<number, number>;
  setUserRating: (bookId: number, rating: number) => void;
}

const useRatingStore = create<RatingState>((set) => ({
  userRatings: {},

  setUserRating: (bookId: number, rating: number) => {
    set((state) => ({
      userRatings: {
        ...state.userRatings,
        [bookId]: rating
      }
    }));
  }
}));

export default useRatingStore; 