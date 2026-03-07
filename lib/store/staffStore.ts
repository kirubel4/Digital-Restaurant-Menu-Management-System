import { create } from "zustand"; type StaffState = { initialized: boolean }; export const useStaffStore = create<StaffState>(() => ({ initialized: true }));
