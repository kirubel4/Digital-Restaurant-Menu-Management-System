import { create } from "zustand"; type AuthState = { initialized: boolean }; export const useAuthStore = create<AuthState>(() => ({ initialized: true }));
