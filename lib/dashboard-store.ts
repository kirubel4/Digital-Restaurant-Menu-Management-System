"use client";

import { create } from "zustand";
import {
  AppNotification,
  ChefSettings,
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

type AddTablePayload = Pick<
  TableModel,
  "section" | "capacity" | "reserved" | "reservationTime" | "reservedFor"
>;

type DashboardState = {
  currentRole: UserRole;
  currentUserId: string;
  staff: StaffMember[];
  menu: MenuItem[];
  tables: TableModel[];
  orders: Order[];
  payments: PaymentRecord[];
  notifications: AppNotification[];
  ticketCounter: number;
  chefSettings: ChefSettings;
  setCurrentRole: (role: UserRole) => void;
  setCurrentUserId: (userId: string) => void;
  addStaff: (payload: Omit<StaffMember, "id">) => string;
  updateStaff: (id: string, payload: Partial<Omit<StaffMember, "id">>) => void;
  toggleStaffActive: (id: string) => void;
  addMenuItem: (payload: Omit<MenuItem, "id">) => void;
  updateMenuItem: (id: string, payload: Partial<Omit<MenuItem, "id">>) => void;
  toggleMenuItemActive: (id: string) => void;
  removeMenuItem: (id: string) => void;
  setMenuAvailability: (id: string, availability: MenuAvailability) => void;
  bulkSetMenuAvailability: (ids: string[], availability: MenuAvailability) => void;
  setMenuLowStock: (id: string, lowStock: boolean) => void;
  addTable: (payload: AddTablePayload) => TableModel;
  assignTablesToWaiter: (waiterId: string, tableIds: string[]) => void;
  assignSingleTable: (tableId: string, waiterId: string | null) => void;
  createOrder: (
    tableNumber: number,
    waiterId: string,
    items: OrderItem[],
    waiterNote?: string,
  ) => void;
  addItemsToOrder: (
    orderId: string,
    items: OrderItem[],
    waiterNote?: string,
  ) => void;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    rejectNote?: string,
  ) => void;
  finalizePayment: (paymentId: string) => void;
  addTipToFinalizedPayment: (paymentId: string, tip: number) => void;
  requestPayment: (
    orderId: string,
    options?: { items?: OrderItem[]; label?: string },
  ) => void;
  markNotificationsRead: (role: UserRole) => void;
  resetTicketCounter: () => void;
  updateChefSettings: (payload: Partial<ChefSettings>) => void;
};

const nowIso = () => new Date().toISOString();
const makeId = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 8)}`;

const seedStaff: StaffMember[] = [
  {
    id: "manager_1",
    name: "Ava Manager",
    email: "manager@resto.com",
    role: "manager",
    active: true,
  },
  {
    id: "waiter_1",
    name: "Leo Waiter",
    email: "waiter@resto.com",
    role: "waiter",
    active: true,
  },
  {
    id: "chef_1",
    name: "Mina Chef",
    email: "chef@resto.com",
    role: "chef",
    active: true,
  },
  {
    id: "cashier_1",
    name: "Noah Cashier",
    email: "cashier@resto.com",
    role: "cashier",
    active: true,
  },
];

const seedMenu: MenuItem[] = [
  // Starters
  {
    id: "m1",
    name: "Bruschetta",
    description: "Toasted bread topped with fresh tomatoes, garlic, and basil",
    category: "starter",
    price: 8,
    availability: "available",
    active: true,
    special: false,
    image: "/images/bruschetta.jpg",
    spicy: false,
    modifiers: [
      { name: "Add Mozzarella", price: 2 },
      { name: "Gluten-Free Bread", price: 1.5 },
    ],
  },
  {
    id: "m2",
    name: "Caesar Salad",
    description:
      "Crisp romaine lettuce with caesar dressing, croutons, and parmesan",
    category: "starter",
    price: 9,
    availability: "available",
    active: true,
    special: false,
    image: "/images/caesar-salad.jpg",
    spicy: false,
    modifiers: [
      { name: "Add Grilled Chicken", price: 4 },
      { name: "Add Shrimp", price: 6 },
      { name: "Anchovies", price: 1 },
    ],
  },

  // Main Dishes
  {
    id: "m3",
    name: "Grilled Salmon",
    description:
      "Fresh Atlantic salmon with lemon butter sauce and seasonal vegetables",
    category: "main dish",
    price: 22,
    availability: "available",
    active: true,
    special: false,
    image: "/images/grilled-salmon.jpg",
    spicy: false,
    modifiers: [
      { name: "Extra Sauce", price: 1 },
      { name: "Substitute Vegetables for Fries", price: 0 },
    ],
  },
  {
    id: "m4",
    name: "Ribeye Steak",
    description: "12oz prime ribeye, grilled to perfection with herb butter",
    category: "main dish",
    price: 30,
    availability: "out_of_stock",
    active: true,
    special: false,
    image: "/images/ribeye-steak.jpg",
    spicy: false,
    modifiers: [
      { name: "Rare", price: 0 },
      { name: "Medium Rare", price: 0 },
      { name: "Medium", price: 0 },
      { name: "Well Done", price: 0 },
      { name: "Add Grilled Mushrooms", price: 3 },
      { name: "Add Onion Rings", price: 4 },
    ],
  },

  // Desserts
  {
    id: "m5",
    name: "Tiramisu",
    description: "Classic Italian dessert with mascarpone and espresso",
    category: "dessert",
    price: 7,
    availability: "available",
    active: true,
    special: false,
    image: "/images/tiramisu.jpg",
    spicy: false,
    modifiers: [
      { name: "Add Chocolate Shavings", price: 1 },
      { name: "Extra Dusting of Cocoa", price: 0.5 },
    ],
  },

  // Drinks
  {
    id: "m6",
    name: "Lemonade",
    description: "Freshly squeezed lemons with a hint of mint",
    category: "drink",
    price: 4,
    availability: "available",
    active: true,
    special: false,
    image: "/images/lemonade.jpg",
    spicy: false,
    modifiers: [
      { name: "Add Strawberry", price: 1 },
      { name: "Add Raspberry", price: 1 },
      { name: "Less Sugar", price: 0 },
    ],
  },
  {
    id: "m7",
    name: "Sparkling Water",
    description: "Imported Italian sparkling mineral water",
    category: "drink",
    price: 3,
    availability: "available",
    active: false,
    image: "/images/sparkling-water.jpg",
    spicy: false,
    modifiers: [
      { name: "With Lemon", price: 0 },
      { name: "With Lime", price: 0 },
    ],
  },

  // Additional items to showcase features
  {
    id: "m8",
    name: "Spicy Chicken Wings",
    description: "Crispy wings tossed in our signature spicy buffalo sauce",
    category: "starter",
    price: 12,
    availability: "available",
    active: true,
    image: "/images/spicy-wings.jpg",
    spicy: true,
    modifiers: [
      { name: "Extra Spicy", price: 1 },
      { name: "Blue Cheese Dip", price: 1.5 },
      { name: "Celery Sticks", price: 1 },
    ],
  },
  {
    id: "m9",
    name: "Vegetarian Pizza",
    description: "Fresh vegetables, mushrooms, and olives on tomato sauce",
    category: "main dish",
    price: 18,
    availability: "available",
    active: true,
    image: "/images/veggie-pizza.jpg",
    spicy: false,
    modifiers: [
      { name: "Gluten-Free Crust", price: 3 },
      { name: "Extra Cheese", price: 2 },
      { name: "Add Pepperoni", price: 3 },
    ],
  },
  {
    id: "m10",
    name: "Chocolate Lava Cake",
    description:
      "Warm chocolate cake with a molten center, served with vanilla ice cream",
    category: "dessert",
    price: 9,
    availability: "available",
    active: true,
    image: "/images/lava-cake.jpg",
    spicy: false,
    modifiers: [
      { name: "Extra Ice Cream", price: 2 },
      { name: "Add Caramel Sauce", price: 1 },
    ],
  },
  {
    id: "m11",
    name: "Craft Beer",
    description: "Rotating selection of local craft beers",
    category: "drink",
    price: 7,
    availability: "available",
    active: true,
    image: "/images/craft-beer.jpg",
    spicy: false,
    modifiers: [
      { name: "IPA", price: 0 },
      { name: "Stout", price: 0 },
      { name: "Lager", price: 0 },
    ],
  },
  {
    id: "m12",
    name: "Seafood Pasta",
    description:
      "Linguine with shrimp, scallops, and mussels in white wine sauce",
    category: "main dish",
    price: 26,
    availability: "available",
    active: true,
    image: "/images/seafood-pasta.jpg",
    spicy: false,
    modifiers: [
      { name: "Add Lobster", price: 12 },
      { name: "Spicy Marinara", price: 0 },
      { name: "Gluten-Free Pasta", price: 2 },
    ],
  },
];

const seedTables: TableModel[] = [
  // Available tables
  {
    id: "t1",
    tableNumber: 1,
    status: "available",
    reserved: false,
    section: "main",
    capacity: 4,
    currentGuests: 0,
    waiterId: null,
  },
  {
    id: "t2",
    tableNumber: 2,
    status: "available",
    reserved: false,
    section: "main",
    capacity: 4,
    currentGuests: 0,
    waiterId: null,
  },
  {
    id: "t3",
    tableNumber: 3,
    status: "available",
    reserved: false,
    section: "main",
    capacity: 2,
    currentGuests: 0,
    waiterId: null,
  },
  {
    id: "t4",
    tableNumber: 4,
    status: "available",
    reserved: false,
    section: "window",
    capacity: 6,
    currentGuests: 0,
    waiterId: null,
  },

  // Reserved tables
  {
    id: "t5",
    tableNumber: 5,
    status: "available",
    reserved: true,
    reservedFor: "Smith Party",
    reservationTime: "19:30",
    section: "window",
    capacity: 8,
    currentGuests: 0,
    waiterId: null,
  },
  {
    id: "t6",
    tableNumber: 6,
    status: "available",
    reserved: true,
    reservedFor: "Johnson",
    reservationTime: "20:00",
    section: "window",
    capacity: 4,
    currentGuests: 0,
    waiterId: null,
  },

  // Tables with orders in progress
  {
    id: "t7",
    tableNumber: 7,
    status: "in_progress",
    reserved: false,
    section: "main",
    capacity: 4,
    currentGuests: 3,
    waiterId: "w1",
    orderStartTime: new Date(Date.now() - 45 * 60000).toISOString(), // 45 minutes ago
    lastAction: "Order sent to kitchen",
  },
  {
    id: "t8",
    tableNumber: 8,
    status: "in_progress",
    reserved: false,
    section: "patio",
    capacity: 6,
    currentGuests: 4,
    waiterId: "w2",
    orderStartTime: new Date(Date.now() - 25 * 60000).toISOString(), // 25 minutes ago
    lastAction: "Drinks served",
  },

  // Ready to serve
  {
    id: "t9",
    tableNumber: 9,
    status: "ready_to_serve",
    reserved: false,
    section: "main",
    capacity: 2,
    currentGuests: 2,
    waiterId: "w1",
    orderStartTime: new Date(Date.now() - 15 * 60000).toISOString(),
    lastAction: "Food ready for serving",
  },

  // Needing attention
  {
    id: "t10",
    tableNumber: 10,
    status: "in_progress",
    reserved: false,
    section: "patio",
    capacity: 4,
    currentGuests: 4,
    waiterId: "w2",
    needsAttention: true,
    attentionReason: "Water refill requested",
    orderStartTime: new Date(Date.now() - 55 * 60000).toISOString(),
  },

  // Recently cleared
  {
    id: "t11",
    tableNumber: 11,
    status: "available",
    reserved: false,
    section: "main",
    capacity: 4,
    currentGuests: 0,
    waiterId: null,
    needsCleaning: true,
  },

  // VIP section
  {
    id: "t12",
    tableNumber: 12,
    status: "available",
    reserved: true,
    reservedFor: "VIP - Anniversary",
    reservationTime: "21:00",
    section: "vip",
    capacity: 10,
    currentGuests: 0,
    waiterId: "w3",
    specialRequests: "Anniversary celebration - decorations requested",
  },
];

const seedOrders: Order[] = [
  {
    id: "o1",
    ticketNumber: 1,
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
    ticketNumber: 2,
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
    ticketNumber: 3,
    tableNumber: 3,
    waiterId: "waiter_1",
    status: "completed",
    items: [{ menuItemId: "m5", name: "Tiramisu", quantity: 2, unitPrice: 7 }],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
  },
];

const seedPayments: PaymentRecord[] = [
  {
    id: "p1",
    orderId: "o3",
    subtotal: 14,
    tip: 3,
    total: 17,
    finalized: false,
    requestedAt: nowIso(),
  },
];

const seedChefSettings: ChefSettings = {
  orderSoundEnabled: true,
  cookingTimeWarningMins: 20,
  showElapsedTimer: true,
  displayMode: "light",
  largeTextMode: false,
  autoRefreshIntervalSec: 15,
  restaurantName: "Resto HQ",
  tableCount: 12,
  kitchenLayout: "grid",
  notificationsEnabled: true,
};

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

const calcOrderSubtotal = (items: OrderItem[]) =>
  items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

export const useDashboardStore = create<DashboardState>((set, get) => ({
  currentRole: "manager",
  currentUserId: "manager_1",
  staff: seedStaff,
  menu: seedMenu,
  tables: seedTables,
  orders: seedOrders,
  payments: seedPayments,
  notifications: [],
  ticketCounter:
    Math.max(...seedOrders.map((order) => order.ticketNumber), 0) + 1,
  chefSettings: seedChefSettings,

  setCurrentRole: (role) => {
    const userByRole = get().staff.find(
      (staff) => staff.role === role && staff.active,
    );
    set({
      currentRole: role,
      currentUserId: userByRole?.id ?? get().currentUserId,
    });
  },

  setCurrentUserId: (userId) => set({ currentUserId: userId }),

  addStaff: (payload) => {
    const id = makeId("staff");
    set((state) => ({
      staff: [...state.staff, { id, ...payload }],
    }));
    return id;
  },

  updateStaff: (id, payload) =>
    set((state) => ({
      staff: state.staff.map((staff) =>
        staff.id === id ? { ...staff, ...payload } : staff,
      ),
    })),

  toggleStaffActive: (id) =>
    set((state) => ({
      staff: state.staff.map((staff) =>
        staff.id === id ? { ...staff, active: !staff.active } : staff,
      ),
    })),

  addMenuItem: (payload) =>
    set((state) => ({
      menu: [...state.menu, { id: makeId("menu"), ...payload }],
    })),

  updateMenuItem: (id, payload) =>
    set((state) => ({
      menu: state.menu.map((item) =>
        item.id === id ? { ...item, ...payload } : item,
      ),
    })),

  toggleMenuItemActive: (id) =>
    set((state) => ({
      menu: state.menu.map((item) =>
        item.id === id ? { ...item, active: !item.active } : item,
      ),
    })),

  removeMenuItem: (id) =>
    set((state) => ({
      menu: state.menu.filter((item) => item.id !== id),
    })),

  setMenuAvailability: (id, availability) =>
    set((state) => {
      const target = state.menu.find((item) => item.id === id);
      if (!target || target.availability === availability) {
        return state;
      }

      const message = `${target.name} is now ${availability === "out_of_stock" ? "out of stock" : "available"}.`;

      return {
        menu: state.menu.map((item) =>
          item.id === id ? { ...item, availability } : item,
        ),
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

  bulkSetMenuAvailability: (ids: string[], availability: MenuAvailability) =>
    set((state) => ({
      menu: state.menu.map((item) =>
        ids.includes(item.id) ? { ...item, availability } : item,
      ),
    })),

  setMenuLowStock: (id: string, lowStock: boolean) =>
    set((state) => ({
      menu: state.menu.map((item) =>
        item.id === id ? { ...item, lowStock } : item,
      ),
    })),

  addTable: (payload) => {
    let createdTable: TableModel | null = null;
    set((state) => {
      const highestNumber = state.tables.reduce(
        (max, table) => Math.max(max, table.tableNumber),
        0,
      );
      const reserved = payload.reserved ?? false;
      const table: TableModel = {
        id: makeId("table"),
        tableNumber: highestNumber + 1,
        status: "available",
        reserved,
        section: payload.section,
        capacity: payload.capacity,
        currentGuests: 0,
        waiterId: null,
        reservationTime: reserved ? payload.reservationTime : undefined,
        reservedFor: reserved ? payload.reservedFor : undefined,
      };
      createdTable = table;
      return { tables: [...state.tables, table] };
    });
    return createdTable!;
  },

  assignTablesToWaiter: (waiterId, tableIds) =>
    set((state) => ({
      tables: state.tables.map((table) => {
        if (tableIds.includes(table.id)) {
          return { ...table, waiterId };
        }
        if (table.waiterId === waiterId) {
          return { ...table, waiterId: null };
        }
        return table;
      }),
    })),

  assignSingleTable: (tableId, waiterId) =>
    set((state) => ({
      tables: state.tables.map((table) =>
        table.id === tableId ? { ...table, waiterId } : table,
      ),
    })),

  createOrder: (tableNumber, waiterId, items, waiterNote) =>
    set((state) => {
      const existingActiveOrder = state.orders.find(
        (order) =>
          order.tableNumber === tableNumber &&
          ["pending", "in_progress", "ready"].includes(order.status),
      );

      if (existingActiveOrder) {
        return state;
      }

      const order: Order = {
        id: makeId("order"),
        ticketNumber: state.ticketCounter,
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
        ticketCounter: state.ticketCounter + 1,
        tables: state.tables.map((table) =>
          table.tableNumber === tableNumber
            ? { ...table, status: "ordering" }
            : table,
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
      if (status === "rejected" && !rejectNote?.trim()) {
        return state;
      }

      const updatedOrders = state.orders.map((order) =>
        order.id === orderId
          ? { ...order, status, rejectNote, updatedAt: nowIso() }
          : order,
      );

      const updatedTables = state.tables.map((table) =>
        table.tableNumber === target.tableNumber
          ? { ...table, status: updateTableFromOrderStatus(status) }
          : table,
      );

      const subtotal = calcOrderSubtotal(target.items);
      const paymentExists = state.payments.some(
        (payment) => payment.orderId === orderId,
      );
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

  finalizePayment: (paymentId) =>
    set((state) => {
      const payment = state.payments.find((item) => item.id === paymentId);
      if (!payment) {
        return state;
      }
      const order = state.orders.find((item) => item.id === payment.orderId);
      const pendingSiblingExists = state.payments.some(
        (item) =>
          item.orderId === payment.orderId &&
          item.id !== paymentId &&
          !item.finalized,
      );

      return {
        payments: state.payments.map((payment) =>
          payment.id === paymentId
            ? {
                ...payment,
                finalized: true,
                paidAt: nowIso(),
              }
            : payment,
        ),
        tables: state.tables.map((table) =>
          order && !pendingSiblingExists && table.tableNumber === order.tableNumber
            ? { ...table, status: "available" }
            : table,
        ),
      };
    }),
  addTipToFinalizedPayment: (paymentId, tip) =>
    set((state) => {
      const normalizedTip = Math.max(0, Number(tip) || 0);
      return {
        payments: state.payments.map((payment) =>
          payment.id === paymentId && payment.finalized
            ? {
                ...payment,
                tip: normalizedTip,
                total: Number((payment.subtotal + normalizedTip).toFixed(2)),
              }
            : payment,
        ),
      };
    }),
  requestPayment: (orderId, options) =>
    set((state) => {
      const order = state.orders.find((item) => item.id === orderId);
      if (!order) {
        return state;
      }
      const requestExists = state.payments.some(
        (payment) => payment.orderId === orderId && !payment.finalized,
      );
      if (requestExists) {
        return state;
      }

      const billingItems =
        options?.items && options.items.length > 0 ? options.items : order.items;
      const subtotal = calcOrderSubtotal(billingItems);

      return {
        payments: [
          {
            id: makeId("payment"),
            orderId,
            subtotal,
            tip: 0,
            total: subtotal,
            finalized: false,
            requestedAt: nowIso(),
            items: billingItems,
            label: options?.label,
          },
          ...state.payments,
        ],
      };
    }),

  markNotificationsRead: (role) =>
    set((state) => ({
      notifications: state.notifications.map((item) =>
        item.targetRole === role ? { ...item, read: true } : item,
      ),
    })),

  resetTicketCounter: () => set({ ticketCounter: 1 }),

  updateChefSettings: (payload) =>
    set((state) => ({
      chefSettings: {
        ...state.chefSettings,
        ...payload,
      },
    })),
}));

export const roleFromPath = (pathname: string): UserRole => {
  if (pathname.startsWith("/waiter")) return "waiter";
  if (pathname.startsWith("/chef")) return "chef";
  if (pathname.startsWith("/cashier")) return "cashier";
  return "manager";
};

export const roleTitle = (role: UserRole) =>
  role.charAt(0).toUpperCase() + role.slice(1);

export const currency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value,
  );

export const humanTime = (isoDate: string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));

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
  occupied: "bg-amber-100 text-amber-700",
  cleaning: "bg-slate-100 text-slate-500",
};

export const readableStatus = (value: string) => value.replace(/_/g, " ");
