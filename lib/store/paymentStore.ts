import { create } from "zustand"; type PaymentState = { initialized: boolean }; export const usePaymentStore = create<PaymentState>(() => ({ initialized: true }));
