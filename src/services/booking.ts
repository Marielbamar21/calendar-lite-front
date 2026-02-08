import { getToken } from "./auth";
import { getApiBase, apiRequest } from "./api";

const BOOKINGS_BASE = `${getApiBase()}/api/v1/bookings`;

export interface Booking {
  id: number;
  userId: number;
  roomId: number;
  title: string;
  start_at: string;
  end_at: string;
  createdAt: string;
  updatedAt: string;
  status:
    | "in_progress"
    | "cancelled"
    | "completed"
    | "pending";
}

export async function deleteBooking(bookingId: number): Promise<{ message: string }> {
  const url = `${BOOKINGS_BASE}/${bookingId}`;
  return apiRequest<{ message: string }>(url, {
    method: "DELETE",
    token: getToken(),
  });
}
