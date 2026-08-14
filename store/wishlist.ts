import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WishlistItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
};

interface WishlistState {
  items: WishlistItem[];
  isOpen: boolean;
  toggleItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  hasItem: (id: string) => boolean;
  setIsOpen: (isOpen: boolean) => void;
  toggleWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      toggleItem: (newItem) => set((state) => {
        const exists = state.items.some((item) => item.id === newItem.id);
        if (exists) {
          return { items: state.items.filter((item) => item.id !== newItem.id) };
        }
        return { items: [...state.items, newItem], isOpen: true }; // Apriamo il drawer quando aggiunge
      }),
      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      })),
      hasItem: (id) => get().items.some((item) => item.id === id),
      setIsOpen: (isOpen) => set({ isOpen }),
      toggleWishlist: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'isabel-wishlist-storage',
    }
  )
);
