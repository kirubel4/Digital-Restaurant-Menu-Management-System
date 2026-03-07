import { create } from "zustand"; type PromoState = { initialized: boolean }; export const usePromoStore = create<PromoState>(() => ({ initialized: true }));
