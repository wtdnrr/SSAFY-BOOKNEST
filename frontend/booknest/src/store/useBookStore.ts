import { create } from 'zustand';

interface Book {
  bookId: number;
  title: string;
  publishedDate: string;
  imageUrl: string;
  authors: string[];
  criticName?: string;
  endorsement?: string;
  rank?: number;
}

interface PurchaseUrls {
  aladinUrl: string;
  kyoboUrl: string;
  yes24Url: string;
}

interface LibraryBook {
  libraryName: string;
  availability: string;
  link: string;
}

interface BookStore {
  bestSellers: Book[];
  authorBooks: Book[];
  ageBooks: Book[];
  criticBooks: Book[];
  purchaseUrls: PurchaseUrls | null;
  libraryBooks: LibraryBook[] | null;
  loading: {
    bestSellers: boolean;
    authorBooks: boolean;
    ageBooks: boolean;
    criticBooks: boolean;
    purchaseUrls: boolean;
    libraryBooks: boolean;
  };
  error: {
    bestSellers: string | null;
    authorBooks: string | null;
    ageBooks: string | null;
    criticBooks: string | null;
    purchaseUrls: string | null;
    libraryBooks: string | null;
  };
  setBestSellers: (books: Book[]) => void;
  setAuthorBooks: (books: Book[]) => void;
  setAgeBooks: (books: Book[]) => void;
  setCriticBooks: (books: Book[]) => void;
  setPurchaseUrls: (urls: PurchaseUrls | null) => void;
  setLibraryBooks: (books: LibraryBook[] | null) => void;
  setLoading: (key: keyof BookStore['loading'], value: boolean) => void;
  setError: (key: keyof BookStore['error'], value: string | null) => void;
}

export const useBookStore = create<BookStore>((set) => ({
  bestSellers: [],
  authorBooks: [],
  ageBooks: [],
  criticBooks: [],
  purchaseUrls: null,
  libraryBooks: null,
  loading: {
    bestSellers: false,
    authorBooks: false,
    ageBooks: false,
    criticBooks: false,
    purchaseUrls: false,
    libraryBooks: false,
  },
  error: {
    bestSellers: null,
    authorBooks: null,
    ageBooks: null,
    criticBooks: null,
    purchaseUrls: null,
    libraryBooks: null,
  },
  setBestSellers: (books) => set({ bestSellers: books }),
  setAuthorBooks: (books) => set({ authorBooks: books }),
  setAgeBooks: (books) => set({ ageBooks: books }),
  setCriticBooks: (books) => set({ criticBooks: books }),
  setPurchaseUrls: (urls) => set({ purchaseUrls: urls }),
  setLibraryBooks: (books) => set({ libraryBooks: books }),
  setLoading: (key, value) =>
    set((state) => ({
      loading: { ...state.loading, [key]: value }
    })),
  setError: (key, value) =>
    set((state) => ({
      error: { ...state.error, [key]: value }
    })),
})); 