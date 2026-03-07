import { create } from "zustand"; type NotificationState = { initialized: boolean }; export const useNotificationStore = create<NotificationState>(() => ({ initialized: true }));
