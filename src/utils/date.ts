export function formatDateTime(dateInput: string | Date | null | undefined): string {
  if (dateInput == null) return "—";
  if (typeof dateInput === "string" && dateInput.trim() === "") return "—";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return String(dateInput);
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date);
}
