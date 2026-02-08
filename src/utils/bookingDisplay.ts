const STATUS_LABELS: Record<string, string> = {
  in_progress: "In Progress",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
  pending: "Pending",
};
export function formatBookingStatus(status: unknown): string {
  if (status == null) return "—";
  const s = String(status).trim();
  if (s === "") return "—";
  const normalized = s.toLowerCase().replace(/\s+/g, "_");
  return STATUS_LABELS[normalized] ?? s;
}
