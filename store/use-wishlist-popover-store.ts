import { create } from "zustand";

interface WishlistPopoverState {
  show: boolean;
  triggerShow: () => void;
  hide: () => void;
}

export const useWishlistPopoverStore = create<WishlistPopoverState>((set) => ({
  show: true,
  triggerShow: () => {
    set({ show: true });
    setTimeout(() => {
      set({ show: false });
    }, 3000);
  },
  hide: () => set({ show: false }),
}));
