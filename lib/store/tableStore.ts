import { create } from "zustand"; type TableState = { initialized: boolean }; export const useTableStore = create<TableState>(() => ({ initialized: true }));
