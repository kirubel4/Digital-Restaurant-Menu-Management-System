export type Role = "WAITER" | "CHEF" | "CASHIER" | "MANAGER"; export type User = { id: string; name: string; role: Role }; export type Session = { user: User | null };
