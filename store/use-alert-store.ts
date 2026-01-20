import { create } from 'zustand';

type AlertType = 'error' | 'success';

interface AlertState {
  message: string | null;
  type: AlertType;
  isVisible: boolean;
  variant: 'inline' | 'floating';
  duration: number; // New field
  error: (message: string, variant?: 'inline' | 'floating', duration?: number) => void;
  success: (message: string, variant?: 'inline' | 'floating', duration?: number) => void;
  clear: () => void;
}

export const useAlert = create<AlertState>((set) => ({
  message: null,
  type: 'error',
  isVisible: false,
  variant: 'inline',
  duration: 5000, // Default 5s

  error: (message, variant = 'inline', duration = 5000) => 
    set({ message, type: 'error', isVisible: true, variant, duration }),
    
  success: (message, variant = 'inline', duration = 3000) => // Success defaults shorter
    set({ message, type: 'success', isVisible: true, variant, duration }),

  clear: () => set({ isVisible: false, message: null }),
}));