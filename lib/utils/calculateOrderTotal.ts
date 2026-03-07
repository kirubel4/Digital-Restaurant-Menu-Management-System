export function calculateOrderTotal(subtotal: number, discount = 0) { return Math.max(subtotal - discount, 0); }
