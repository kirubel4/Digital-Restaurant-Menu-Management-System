import { create } from "zustand"; type MenuState = { initialized: boolean }; export const useMenuStore = create<MenuState>(() => ({ initialized: true }));
