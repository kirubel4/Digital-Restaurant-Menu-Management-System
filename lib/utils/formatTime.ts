export function formatTime(input: Date | string) { const date = typeof input === "string" ? new Date(input) : input; return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }); }
