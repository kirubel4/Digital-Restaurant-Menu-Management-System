"use client";

import { create } from "zustand";
import {
  AppNotification,
  MenuAvailability,
  MenuItem,
  Order,
  OrderItem,
  OrderStatus,
  PaymentRecord,
  StaffMember,
  TableModel,
  TableStatus,
  UserRole,
} from "@/types/dashboard";

type DashboardState = {
  currentRole: UserRole;
  currentUserId: string;
  staff: StaffMember[];
  menu: MenuItem[];
  tables: TableModel[];
  orders: Order[];
  payments: PaymentRecord[];
  notifications: AppNotification[];
  setCurrentRole: (role: UserRole) => void;
  setCurrentUserId: (userId: string) => void;
  addStaff: (payload: Omit<StaffMember, "id">) => void;
  updateStaff: (id: string, payload: Partial<Omit<StaffMember, "id">>) => void;
  toggleStaffActive: (id: string) => void;
  addMenuItem: (payload: Omit<MenuItem, "id">) => void;
  updateMenuItem: (id: string, payload: Partial<Omit<MenuItem, "id">>) => void;
  toggleMenuItemActive: (id: string) => void;
  setMenuAvailability: (id: string, availability: MenuAvailability) => void;
  createOrder: (tableNumber: number, waiterId: string, items: OrderItem[], waiterNote?: string) => void;
  addItemsToOrder: (orderId: string, items: OrderItem[], waiterNote?: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, rejectNote?: string) => void;
  finalizePayment: (orderId: string, tip: number) => void;
  markNotificationsRead: (role: UserRole) => void;
};

const nowIso = () => new Date().toISOString();
const makeId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 8)}`;

const seedStaff: StaffMember[] = [
  { id: "manager_1", name: "Ava Manager", email: "manager@resto.com", role: "manager", active: true },
  { id: "waiter_1", name: "Leo Waiter", email: "waiter@resto.com", role: "waiter", active: true },
  { id: "chef_1", name: "Mina Chef", email: "chef@resto.com", role: "chef", active: true },
  { id: "cashier_1", name: "Noah Cashier", email: "cashier@resto.com", role: "cashier", active: true },
];

const seedMenu: MenuItem[] = [
  { id: "m1", name: "Bruschetta", category: "starter", price: 8, availability: "available", active: true },
  { id: "m2", name: "Caesar Salad", category: "starter", price: 9, availability: "available", active: true },
  { id: "m3", name: "Grilled Salmon", category: "main dish", price: 22, availability: "available", active: true },
  { id: "m4", name: "Ribeye Steak", category: "main dish", price: 30, availability: "out_of_stock", active: true },
  { id: "m5", name: "Tiramisu", category: "dessert", price: 7, availability: "available", active: true },
  { id: "m6", name: "Lemonade", category: "drink", price: 4, availability: "available", active: true },
  { id: "m7", name: "Sparkling Water", category: "drink", price: 3, availability: "available", active: false },
];

const seedTables: TableModel[] = Array.from({ length: 12 }, (_, idx) => ({
  id: `t${idx + 1}`,
  tableNumber: idx + 1,
  status: idx < 2 ? "in_progress" : idx === 2 ? "ready_to_serve" : "available",
}));

const seedOrders: Order[] = [
  {
    id: "o1",
    tableNumber: 1,
    waiterId: "waiter_1",
    status: "in_progress",
    items: [
      { menuItemId: "m1", name: "Bruschetta", quantity: 1, unitPrice: 8 },
      { menuItemId: "m3", name: "Grilled Salmon", quantity: 2, unitPrice: 22 },
    ],
    waiterNote: "No onions on salmon",
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: "o2",
    tableNumber: 2,
    waiterId: "waiter_1",
    status: "ready",
    items: [
      { menuItemId: "m2", name: "Caesar Salad", quantity: 2, unitPrice: 9 },
      { menuItemId: "m6", name: "Lemonade", quantity: 2, unitPrice: 4 },
    ],
    waiterNote: "Dressing on the side",
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "o3",
    tableNumber: 3,
    waiterId: "waiter_1",
    status: "completed",
    items: [{ menuItemId: "m5", name: "Tiramisu", quantity: 2, unitPrice: 7 }],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
  },
];

const seedPayments: PaymentRecord[] = [
  { id: "p1", orderId: "o3", subtotal: 14, tip: 3, total: 17, finalized: false },
];

const updateTableFromOrderStatus = (status: OrderStatus): TableStatus => {
  switch (status) {
    case "pending":
      return "ordering";
    case "in_progress":
      return "in_progress";
    case "ready":
      return "ready_to_serve";
    case "completed":
      return "finished";
    case "rejected":
      return "ordering";
    default:
      return "available";
  }
};

const calcOrderSubtotal = (items: OrderItem[]) => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

export const useDashboardStore = create<DashboardState>((set, get) => ({
  currentRole: "manager",
  currentUserId: "manager_1",
  staff: seedStaff,
  menu: seedMenu,
  tables: seedTables,
  orders: seedOrders,
  payments: seedPayments,
  notifications: [],

  setCurrentRole: (role) => {
    const userByRole = get().staff.find((staff) => staff.role === role && staff.active);
    set({ currentRole: role, currentUserId: userByRole?.id ?? get().currentUserId });
  },

  setCurrentUserId: (userId) => set({ currentUserId: userId }),

  addStaff: (payload) => set((state) => ({ staff: [...state.staff, { id: makeId("staff"), ...payload }] })),

  updateStaff: (id, payload) =>
    set((state) => ({ staff: state.staff.map((staff) => (staff.id === id ? { ...staff, ...payload } : staff)) })),

  toggleStaffActive: (id) =>
    set((state) => ({
      staff: state.staff.map((staff) => (staff.id === id ? { ...staff, active: !staff.active } : staff)),
    })),

  addMenuItem: (payload) => set((state) => ({ menu: [...state.menu, { id: makeId("menu"), ...payload }] })),

  updateMenuItem: (id, payload) =>
    set((state) => ({ menu: state.menu.map((item) => (item.id === id ? { ...item, ...payload } : item)) })),

  toggleMenuItemActive: (id) =>
    set((state) => ({ menu: state.menu.map((item) => (item.id === id ? { ...item, active: !item.active } : item)) })),

  setMenuAvailability: (id, availability) =>
    set((state) => {
      const target = state.menu.find((item) => item.id === id);
      if (!target || target.availability === availability) {
        return state;
      }

      const message = `${target.name} is now ${availability === "out_of_stock" ? "out of stock" : "available"}.`;

      return {
        menu: state.menu.map((item) => (item.id === id ? { ...item, availability } : item)),
        notifications: [
          {
            id: makeId("notif"),
            targetRole: "waiter",
            message,
            createdAt: nowIso(),
            read: false,
          },
          ...state.notifications,
        ],
      };
    }),

  createOrder: (tableNumber, waiterId, items, waiterNote) =>
    set((state) => {
      const order: Order = {
        id: makeId("order"),
        tableNumber,
        waiterId,
        status: "pending",
        items,
        waiterNote,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };

      return {
        orders: [order, ...state.orders],
        tables: state.tables.map((table) =>
          table.tableNumber === tableNumber ? { ...table, status: "ordering" } : table,
        ),
      };
    }),

  addItemsToOrder: (orderId, items, waiterNote) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              items: [...order.items, ...items],
              waiterNote: waiterNote ?? order.waiterNote,
              updatedAt: nowIso(),
            }
          : order,
      ),
    })),

  updateOrderStatus: (orderId, status, rejectNote) =>
    set((state) => {
      const target = state.orders.find((order) => order.id === orderId);
      if (!target) {
        return state;
      }

      const updatedOrders = state.orders.map((order) =>
        order.id === orderId ? { ...order, status, rejectNote, updatedAt: nowIso() } : order,
      );

      const updatedTables = state.tables.map((table) =>
        table.tableNumber === target.tableNumber
          ? { ...table, status: updateTableFromOrderStatus(status) }
          : table,
      );

      const subtotal = calcOrderSubtotal(target.items);
      const paymentExists = state.payments.some((payment) => payment.orderId === orderId);
      const paymentToAdd =
        status === "completed" && !paymentExists
          ? [
              ...state.payments,
              {
                id: makeId("payment"),
                orderId,
                subtotal,
                tip: 0,
                total: subtotal,
                finalized: false,
              },
            ]
          : state.payments;

      return {
        orders: updatedOrders,
        tables: updatedTables,
        payments: paymentToAdd,
      };
    }),

  finalizePayment: (orderId, tip) =>
    set((state) => {
      const order = state.orders.find((item) => item.id === orderId);
      return {
        payments: state.payments.map((payment) =>
          payment.orderId === orderId
            ? {
                ...payment,
                tip,
                total: Number((payment.subtotal + tip).toFixed(2)),
                finalized: true,
                paidAt: nowIso(),
              }
            : payment,
        ),
        tables: state.tables.map((table) =>
          order && table.tableNumber === order.tableNumber ? { ...table, status: "available" } : table,
        ),
      };
    }),

  markNotificationsRead: (role) =>
    set((state) => ({
      notifications: state.notifications.map((item) =>
        item.targetRole === role ? { ...item, read: true } : item,
      ),
    })),
}));

export const roleFromPath = (pathname: string): UserRole => {
  if (pathname.startsWith("/waiter")) return "waiter";
  if (pathname.startsWith("/chef")) return "chef";
  if (pathname.startsWith("/cashier")) return "cashier";
  return "manager";
};

export const roleTitle = (role: UserRole) => role.charAt(0).toUpperCase() + role.slice(1);

export const currency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export const humanTime = (isoDate: string) =>
  new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" }).format(new Date(isoDate));

export const formatDateTime = (isoDate: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));

export const orderStatusColorMap: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  in_progress: "bg-blue-100 text-blue-700",
  ready: "bg-emerald-100 text-emerald-700",
  completed: "bg-slate-100 text-slate-700",
  rejected: "bg-rose-100 text-rose-700",
};

export const tableStatusColorMap: Record<TableStatus, string> = {
  available: "bg-emerald-100 text-emerald-700",
  ordering: "bg-amber-100 text-amber-700",
  in_progress: "bg-blue-100 text-blue-700",
  ready_to_serve: "bg-teal-100 text-teal-700",
  finished: "bg-slate-100 text-slate-700",
};

export const readableStatus = (value: string) => value.replace(/_/g, " ");
