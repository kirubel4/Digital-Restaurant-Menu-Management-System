export type PaymentMethod = "CASH" | "CARD" | "MOBILE" | "BANK"; export type PaymentRequest = { id: string; orderId: string; method?: PaymentMethod };
