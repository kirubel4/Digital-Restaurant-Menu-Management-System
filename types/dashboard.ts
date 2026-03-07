export type UserRole = "manager" | "waiter" | "chef" | "cashier";

export type OrderStatus = "pending" | "in_progress" | "ready" | "completed" | "rejected";

export type TableStatus = "available" | "ordering" | "in_progress" | "ready_to_serve" | "finished";

export type MenuCategory = "starter" | "main dish" | "dessert" | "drink";

export type MenuAvailability = "available" | "out_of_stock";

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
};

export type MenuItem = {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  availability: MenuAvailability;
  active: boolean;
};

export type OrderItem = {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type Order = {
  id: string;
  tableNumber: number;
  waiterId: string;
  status: OrderStatus;
  items: OrderItem[];
  waiterNote?: string;
  rejectNote?: string;
  createdAt: string;
  updatedAt: string;
};

export type TableModel = {
  id: string;
  tableNumber: number;
  status: TableStatus;
};

export type PaymentRecord = {
  id: string;
  orderId: string;
  subtotal: number;
  tip: number;
  total: number;
  finalized: boolean;
  paidAt?: string;
};

export type AppNotification = {
  id: string;
  targetRole: UserRole;
  message: string;
  createdAt: string;
  read: boolean;
};
