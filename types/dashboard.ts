export type UserRole = "manager" | "waiter" | "chef" | "cashier";

export type OrderStatus =
  | "pending"
  | "in_progress"
  | "ready"
  | "completed"
  | "rejected";

export type TableStatus =
  | "available"
  | "ordering"
  | "in_progress"
  | "ready_to_serve"
  | "finished"
  | "occupied"
  | "cleaning";

export type MenuCategory = "starter" | "main dish" | "dessert" | "drink";

export type MenuAvailability = "available" | "out_of_stock" | "limited";

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
  description?: string;
  category: string;
  price: number;
  availability: MenuAvailability;
  lowStock?: boolean;
  active: boolean;
  image?: string;
  spicy?: boolean;
  modifiers?: Array<{
    name: string;
    price: number;
  }>;
  special?: boolean;
};

export type OrderItem = {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type Order = {
  id: string;
  ticketNumber: number;
  tableNumber: number;
  waiterId: string;
  status: OrderStatus;
  items: OrderItem[];
  waiterNote?: string;
  rejectNote?: string;
  createdAt: string;
  updatedAt: string;
};

export type KitchenLayout = "grid" | "compact" | "kanban";

export type ChefSettings = {
  orderSoundEnabled: boolean;
  cookingTimeWarningMins: number;
  showElapsedTimer: boolean;
  displayMode: "light" | "dark";
  largeTextMode: boolean;
  autoRefreshIntervalSec: number;
  restaurantName: string;
  tableCount: number;
  kitchenLayout: KitchenLayout;
  notificationsEnabled: boolean;
};

export type TableModel = {
  id: string;
  tableNumber: number;
  status:
    | "available"
    | "ordering"
    | "in_progress"
    | "ready_to_serve"
    | "occupied"
    | "cleaning"
    | "finished";
  reserved: boolean;
  reservedFor?: string;
  reservationTime?: string;
  section: "main" | "window" | "patio" | "vip" | "bar";
  capacity: number;
  currentGuests: number;
  waiterId: string | null;
  orderStartTime?: string;
  lastAction?: string;
  needsAttention?: boolean;
  attentionReason?: string;
  needsCleaning?: boolean;
  specialRequests?: string;
};

export type PaymentRecord = {
  id: string;
  orderId: string;
  subtotal: number;
  tip: number;
  total: number;
  finalized: boolean;
  paidAt?: string;
  requestedAt?: string;
  items?: OrderItem[];
  label?: string;
};

export type AppNotification = {
  id: string;
  targetRole: UserRole;
  message: string;
  createdAt: string;
  read: boolean;
};
