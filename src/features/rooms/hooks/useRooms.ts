import { useCallback, useEffect, useState } from "react";
import {
  fetchRooms,
  type Room,
  type PaginatedRoomsResponse,
} from "../../../services/rooms";
import { formatApiError } from "../../../utils/formatApiError";

const DEFAULT_LIMIT = 10;

export interface UseRoomsOptions {
  initialPage?: number;
  limit?: number;
}

export interface UseRoomsResult {
  rooms: Room[];
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

export function useRooms(options: UseRoomsOptions = {}): UseRoomsResult {
  const { initialPage = 1, limit = DEFAULT_LIMIT } = options;
  const [page, setPage] = useState(initialPage);
  const [limitState, setLimitState] = useState<number | undefined>(limit);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res: PaginatedRoomsResponse = await fetchRooms({
        page,
        limit: limitState,
      });
      setRooms(res.data ?? []);
      setTotal(res.total ?? 0);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Failed to load rooms";
      setError(formatApiError(raw));
      setRooms([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, limitState]);

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
    rooms,
    isLoading,
    error,
    total,
    page,
    limit: limitState   || undefined,
    totalPages,
    setPage: setPageSafe,
    setLimit,
    refetch,
  };
}
