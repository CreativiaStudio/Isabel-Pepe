import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
};

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (newItem) => set((state) => {
        const existingItem = state.items.find((item) => item.id === newItem.id);
        if (existingItem) {
          const newQuantity = existingItem.quantity + newItem.quantity;
          const clampedQuantity = newQuantity > existingItem.stock ? existingItem.stock : newQuantity;
          return {
            items: state.items.map((item) =>
              item.id === newItem.id
                ? { ...item, quantity: clampedQuantity }
                : item
            ),
            isOpen: true, // Apre il carrello in automatico
          };
        }
        // Se è nuovo, ci assicuriamo che la quantità non superi lo stock
        const clampedQuantity = newItem.quantity > newItem.stock ? newItem.stock : newItem.quantity;
        return { items: [...state.items, { ...newItem, quantity: clampedQuantity }], isOpen: true };
      }),
      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      })),
      updateQuantity: (id, quantity) => set((state) => {
        const item = state.items.find((i) => i.id === id);
        if (!item) return state;
        const clampedQuantity = Math.min(Math.max(1, quantity), item.stock);
        return {
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: clampedQuantity } : i
          ),
        };
      }),
      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setIsOpen: (isOpen) => set({ isOpen }),
    }),
    {
      name: 'isabel-cart-storage',
    }
  )
);
