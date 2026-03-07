import { create } from "zustand"; type OrderState = { initialized: boolean }; export const useOrderStore = create<OrderState>(() => ({ initialized: true }));
