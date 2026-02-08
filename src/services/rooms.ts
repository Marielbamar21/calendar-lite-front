import { getToken } from "./auth";
import {
  getApiBase,
  getAuthHeaders,
  parseApiError,
  apiRequest,
} from "./api";
import type { Booking } from "./booking";

const ROOMS_BASE = `${getApiBase()}/api/v1/rooms`;

export interface Room {
  id: number;
  name: string;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedRoomsResponse {
  data: Room[];
  total: number;
  page: number;
  limit: number;
}

export interface FetchRoomsParams {
  page: number;
  limit?: number;
}

export interface CreateRoomParams {
  name: string;
}

export interface UpdateRoomParams {
  name: string;
}

export interface PaginatedBookingsResponse {
  data: Booking[];
  total: number;
  page: number;
  limit: number;
}

export interface FetchBookingsByRoomParams {
  roomId: number;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface CreateBookingForRoomParams {
  title: string;
  start_at: string;
  end_at: string;
  status?: Booking["status"];
}

function normalizeBookingsResponse(
  raw: Record<string, unknown>,
  page: number,
  limit: number
): PaginatedBookingsResponse {
  const payload = raw.bookings as { rows?: Booking[]; count?: number } | undefined;
  const data = (payload?.rows ?? raw.data ?? raw.rows ?? []) as Booking[];
  const total = Number(
    payload?.count ?? raw.total ?? raw.count ?? raw.totalCount ?? data.length
  );
  return { data, total, page, limit };
}

export async function fetchBookingsByRoom(
  params: FetchBookingsByRoomParams
): Promise<PaginatedBookingsResponse> {
  const { roomId, from, to, page = 1, limit = 10 } = params;
  const url = new URL(`${ROOMS_BASE}/${roomId}/bookings`);
  if (from != null && from !== "") url.searchParams.set("from", from);
  if (to != null && to !== "") url.searchParams.set("to", to);
  const offset = (page - 1) * limit;
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));
  const raw = await apiRequest<Record<string, unknown>>(url.toString(), {
    method: "GET",
    token: getToken(),
  });
  return normalizeBookingsResponse(raw, page, limit);
}

export async function createBookingForRoom(
  roomId: number,
  params: CreateBookingForRoomParams
): Promise<{ message: string; booking: Booking }> {
  const url = `${ROOMS_BASE}/${roomId}/bookings`;
  const body = {
    title: params.title,
    start_at: params.start_at,
    end_at: params.end_at,
    ...(params.status != null && { status: params.status }),
  };
  return apiRequest<{ message: string; booking: Booking }>(url, {
    method: "POST",
    token: getToken(),
    body: JSON.stringify(body),
  });
}

function normalizeRoomsResponse(
  raw: Record<string, unknown>,
  page: number,
  limit: number
): PaginatedRoomsResponse {
  const roomsPayload = raw.rooms as { rows?: Room[]; count?: number } | undefined;
  const data = (roomsPayload?.rows ?? raw.data ?? raw.rows ?? []) as Room[];
  const total = Number(
    roomsPayload?.count ?? raw.total ?? raw.count ?? raw.totalCount ?? data.length
  );
  return { data, total, page, limit };
}

export async function fetchRooms(
  params: FetchRoomsParams
): Promise<PaginatedRoomsResponse> {
  const { page, limit = 10 } = params;
  let url = ROOMS_BASE;
  if (limit) {
    const offset = (page - 1) * limit;
    url = `${ROOMS_BASE}?limit=${limit}&offset=${offset}`;
  }
  const raw = await apiRequest<Record<string, unknown>>(url, {
    method: "GET",
    token: getToken(),
  });
  return normalizeRoomsResponse(raw, page, limit);
}

export async function fetchRoom(id: number | string): Promise<Room> {
  const url = `${ROOMS_BASE}/${id}`;
  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(getToken()),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(parseApiError(json, "Failed to load room"));
  }
  const room = (json as { room?: Room }).room ?? json;
  return room as Room;
}

export async function createRoom(
  params: CreateRoomParams
): Promise<{ message: string; room: Room }> {
  const body = { name: params.name };
  return apiRequest<{ message: string; room: Room }>(ROOMS_BASE, {
    method: "POST",
    token: getToken(),
    body: JSON.stringify(body),
  });
}

export async function updateRoom(
  id: number | string,
  params: UpdateRoomParams
): Promise<{ message: string; room: Room }> {
  const json = await apiRequest<{ message: string; room: Room }>(
    `${ROOMS_BASE}/${id}`,
    {
      method: "PUT",
      token: getToken(),
      body: JSON.stringify({ name: params.name }),
    }
  );
  return json;
}

export async function deleteRoom(
  id: number | string
): Promise<{ message: string; room: Room }> {
  return apiRequest<{ message: string; room: Room }>(`${ROOMS_BASE}/${id}`, {
    method: "DELETE",
    token: getToken(),
  });
}