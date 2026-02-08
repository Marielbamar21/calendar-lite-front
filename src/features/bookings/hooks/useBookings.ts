import { useCallback, useEffect, useState } from "react";
import type { Booking } from "../../../services/booking";
import {
  fetchBookingsByRoom,
  type PaginatedBookingsResponse,
} from "../../../services/rooms";
import { formatApiError } from "../../../utils/formatApiError";

const DEFAULT_LIMIT = 10;

export interface UseBookingsOptions {
  roomId: number | null | undefined;
  initialPage?: number;
  limit?: number;
  from?: string;
  to?: string;
}

export interface UseBookingsResult {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number | undefined;
  totalPages: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  refetch: () => Promise<void>;
}

export function useBookings(options: UseBookingsOptions): UseBookingsResult {
  const {
    roomId,
    initialPage = 1,
    limit = DEFAULT_LIMIT,
    from,
    to,
  } = options;
  const [page, setPage] = useState(initialPage);
  const [limitState, setLimitState] = useState<number | undefined>(limit);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (roomId == null) {
      setBookings([]);
      setTotal(0);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const now = new Date();
      const defaultFrom = from ?? new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const defaultTo = to ?? new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString();
      const res: PaginatedBookingsResponse = await fetchBookingsByRoom({
        roomId,
        from: defaultFrom,
        to: defaultTo,
        page,
        limit: limitState,
      });
      setBookings(res.data ?? []);
      setTotal(res.total ?? 0);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Failed to load bookings";
      setError(formatApiError(raw));
      setBookings([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [roomId, page, limitState, from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const refetch = useCallback(async () => {
    await load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / (limitState ?? 1)));

  const setPageSafe = useCallback((newPage: number) => {
    setPage(Math.max(1, newPage));
  }, []);

  const setLimit = useCallback((newLimit: number) => {
    setLimitState(Math.max(1, newLimit));
    setPage(1);
  }, []);

  return {
    bookings,
    isLoading,
    error,
    total,
    page,
    limit: limitState ?? undefined,
    totalPages,
    setPage: setPageSafe,
    setLimit,
    refetch,
  };
}
