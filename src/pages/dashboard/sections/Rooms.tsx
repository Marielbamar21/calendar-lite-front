import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DotLoader } from "react-spinners";
import toast from "react-hot-toast";
import { useRooms } from "../../../features/rooms/hooks/useRooms";
import { useBookings } from "../../../features/bookings/hooks/useBookings";
import List from "../components/list";
import Dialog from "../components/dialog";
import { createRoom } from "../../../services/rooms";
import { deleteBooking, type Booking } from "../../../services/booking";
import { createBookingForRoom, type Room } from "../../../services/rooms";
import {
  createRoomSchema,
  createBookingSchema,
  type CreateRoomFormData,
  type CreateBookingFormData,
} from "../../../schemas/schema";
import { BookOpenCheckIcon, TrashIcon, ArrowLeftIcon } from "lucide-react";
import { formatDateTime } from "../../../utils/date";
import { formatBookingStatus } from "../../../utils/bookingDisplay";
import { formatApiError } from "../../../utils/formatApiError";

export default function Rooms() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedRoomName, setSelectedRoomName] = useState<string>("");
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingSubmitError, setBookingSubmitError] = useState<string | null>(
    null,
  );
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dateRangeKind, setDateRangeKind] = useState<
    "today" | "week" | "custom"
  >("week");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const {
    rooms,
    isLoading,
    error,
    total,
    page,
    limit,
    totalPages,
    setPage,
    setLimit,
    refetch,
  } = useRooms({ initialPage: 1, limit: 10 });

  const { dateRangeFrom, dateRangeTo } = useMemo(() => {
    const now = new Date();
    if (dateRangeKind === "today") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999,
      );
      return {
        dateRangeFrom: start.toISOString(),
        dateRangeTo: end.toISOString(),
      };
    }
    if (dateRangeKind === "week") {
      const day = now.getDay();
      const start = new Date(now);
      start.setDate(now.getDate() - day);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return {
        dateRangeFrom: start.toISOString(),
        dateRangeTo: end.toISOString(),
      };
    }
    if (customFrom && customTo) {
      return { dateRangeFrom: customFrom, dateRangeTo: customTo };
    }
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return {
      dateRangeFrom: start.toISOString(),
      dateRangeTo: end.toISOString(),
    };
  }, [dateRangeKind, customFrom, customTo]);

  const {
    bookings,
    isLoading: bookingsLoading,
    error: bookingsError,
    total: bookingsTotal,
    page: bookingsPage,
    limit: bookingsLimit,
    totalPages: bookingsTotalPages,
    setPage: setBookingsPage,
    setLimit: setBookingsLimit,
    refetch: refetchBookings,
  } = useBookings({
    initialPage: 1,
    limit: 10,
    roomId: selectedRoomId ?? undefined,
    from: dateRangeFrom,
    to: dateRangeTo,
  });

  const defaultFormValues: CreateRoomFormData = { name: "" };
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateRoomFormData>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: defaultFormValues,
  });

  const defaultBookingValues: CreateBookingFormData = {
    title: "",
    roomId: selectedRoomId ?? 0,
    start_at: "",
    end_at: "",
  };
  const {
    register: registerBooking,
    handleSubmit: handleBookingSubmit,
    formState: { errors: bookingErrors, isSubmitting: isBookingSubmitting },
    reset: resetBooking,
    setValue: setBookingValue,
  } = useForm<CreateBookingFormData>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: defaultBookingValues,
  });

  useEffect(() => {
    if (selectedRoomId != null) {
      setBookingValue("roomId", selectedRoomId);
    }
  }, [selectedRoomId, setBookingValue]);

  useEffect(() => {
    if (bookingDialogOpen && selectedRoomId != null) {
      resetBooking({
        title: "",
        roomId: selectedRoomId,
        start_at: "",
        end_at: "",
      });
    }
  }, [bookingDialogOpen, selectedRoomId, resetBooking]);

  function closeDialog(open: boolean) {
    if (!open && isSubmitting) return;
    setDialogOpen(open);
    if (!open) {
      reset(defaultFormValues);
      setSubmitError(null);
    }
  }

  function closeBookingDialog(open: boolean) {
    if (!open && isBookingSubmitting) return;
    setBookingDialogOpen(open);
    if (!open) {
      resetBooking({
        title: "",
        roomId: selectedRoomId ?? 0,
        start_at: "",
        end_at: "",
      });
      setBookingSubmitError(null);
    }
  }

  async function onSubmitBooking(data: CreateBookingFormData) {
    if (selectedRoomId == null) return;
    setBookingSubmitError(null);
    try {
      await createBookingForRoom(selectedRoomId, {
        title: data.title,
        start_at: data.start_at,
        end_at: data.end_at,
      });
      toast.success("Booking created");
      closeBookingDialog(false);
      refetchBookings();
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Failed to create booking";
      const message = formatApiError(raw);
      setBookingSubmitError(message);
      toast.error(message);
    }
  }

  function closeDeleteConfirm(open: boolean) {
    if (!open && isDeleting) return;
    setDeleteConfirmOpen(open);
    if (!open) setBookingToDelete(null);
  }

  async function handleConfirmDelete() {
    if (bookingToDelete == null) return;
    setIsDeleting(true);
    try {
      await deleteBooking(bookingToDelete.id);
      toast.success("Booking deleted");
      closeDeleteConfirm(false);
      refetchBookings();
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Failed to delete booking";
      const message = formatApiError(raw);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }

  async function onSubmit(data: CreateRoomFormData) {
    setSubmitError(null);
    try {
      await createRoom({ name: data.name });
      toast.success("Room created");
      closeDialog(false);
      refetch();
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Failed to create room";
      const message = formatApiError(raw);
      setSubmitError(message);
      toast.error(message);
    }
  }

  return (
    <div className="space-y-4">
      {selectedRoomId == null ? (
        <>
          <div className="flex flex-wrap items-center justify-end gap-2 w-full">
            <Dialog
              title="Create room"
              open={dialogOpen}
              onOpenChange={closeDialog}
              trigger={
                <button
                  type="button"
                  className="!bg-calendar-ring text-white px-4 py-2 rounded-md"
                >
                  Create Room
                </button>
              }
            >
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                {submitError && (
                  <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                    {submitError}
                  </div>
                )}
                <div>
                  <label
                    htmlFor="room-name"
                    className="block text-sm font-medium text-calendar-ring mb-1"
                  >
                    Name *
                  </label>
                  <input
                    id="room-name"
                    type="text"
                    placeholder="Room name"
                    className="w-full border border-week-first rounded-md p-2"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => closeDialog(false)}
                    className="px-3 py-2 rounded-md border border-week-first hover:bg-week-first/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-3 py-2 rounded-md !bg-calendar-ring text-white disabled:opacity-50"
                  >
                    {isSubmitting ? "Creating…" : "Create"}
                  </button>
                </div>
              </form>
            </Dialog>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-semibold text-calendar-right">Rooms</h2>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">
                Per page
              </label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="border border-week-first rounded-md px-2 py-1 text-sm"
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {error}
              <button
                type="button"
                onClick={() => refetch()}
                className="ml-2 underline font-medium"
              >
                Retry
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center min-h-[14rem] text-gray-500">
              <DotLoader color="rgb(100, 108, 255)" size={60} />
            </div>
          ) : (
            <>
              <List
                values={rooms}
                headers={["Name", "Actions"]}
                data={["name"]}
                isLoading={isLoading}
                page={page}
                limit={limit ?? 0}
                total={total}
                totalPages={totalPages}
                setPage={setPage}
                setLimit={setLimit}
                iconActions={(row) => (
                  <div className="flex items-center gap-4">
                    <BookOpenCheckIcon
                      className="size-4 cursor-pointer hover:text-green-600"
                      onClick={() => {
                        const room = row as Room;
                        setSelectedRoomId(room.id);
                        setSelectedRoomName(room.name ?? "");
                      }}
                    />
                  </div>
                )}
              />
            </>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedRoomId(null);
                  setSelectedRoomName("");
                }}
                className="rounded-md p-1 border border-week-first hover:bg-week-first/10"
                aria-label="Back to rooms"
              >
                <ArrowLeftIcon className="size-4" />
              </button>
              <h2 className="text-xl font-semibold text-calendar-right">
                Bookings for room: {selectedRoomName || `#${selectedRoomId}`}
              </h2>
            </div>
            <Dialog
              title="Create booking"
              open={bookingDialogOpen}
              onOpenChange={closeBookingDialog}
              trigger={
                <button
                  type="button"
                  className="!bg-calendar-ring text-white px-4 py-2 rounded-md"
                >
                  Create booking
                </button>
              }
            >
              <form
                onSubmit={handleBookingSubmit(onSubmitBooking)}
                className="flex flex-col gap-4"
              >
                {bookingSubmitError && (
                  <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                    {bookingSubmitError}
                  </div>
                )}
                <input type="hidden" {...registerBooking("roomId")} />
                <div>
                  <label
                    htmlFor="booking-title"
                    className="block text-sm font-medium text-calendar-ring mb-1"
                  >
                    Title *
                  </label>
                  <input
                    id="booking-title"
                    type="text"
                    placeholder="Meeting title"
                    className="w-full border border-week-first rounded-md p-2"
                    {...registerBooking("title")}
                  />
                  {bookingErrors.title && (
                    <p className="mt-1 text-sm text-red-600">
                      {bookingErrors.title.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="booking-start"
                    className="block text-sm font-medium text-calendar-ring mb-1"
                  >
                    Start date & time *
                  </label>
                  <input
                    id="booking-start"
                    type="datetime-local"
                    className="w-full border border-week-first rounded-md p-2"
                    {...registerBooking("start_at")}
                  />
                  {bookingErrors.start_at && (
                    <p className="mt-1 text-sm text-red-600">
                      {bookingErrors.start_at.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="booking-end"
                    className="block text-sm font-medium text-calendar-ring mb-1"
                  >
                    End date & time *
                  </label>
                  <input
                    id="booking-end"
                    type="datetime-local"
                    className="w-full border border-week-first rounded-md p-2"
                    {...registerBooking("end_at")}
                  />
                  {bookingErrors.end_at && (
                    <p className="mt-1 text-sm text-red-600">
                      {bookingErrors.end_at.message}
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => closeBookingDialog(false)}
                    className="px-3 py-2 rounded-md border border-week-first hover:bg-week-first/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isBookingSubmitting}
                    className="px-3 py-2 rounded-md !bg-calendar-ring text-white disabled:opacity-50"
                  >
                    {isBookingSubmitting ? "Creating…" : "Create"}
                  </button>
                </div>
              </form>
            </Dialog>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Date range:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setDateRangeKind("today")}
                className={`px-3 py-1.5 rounded-md text-sm ${
                  dateRangeKind === "today"
                    ? "!bg-calendar-ring text-white"
                    : "border border-week-first hover:bg-week-first/10"
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDateRangeKind("week")}
                className={`px-3 py-1.5 rounded-md text-sm ${
                  dateRangeKind === "week"
                    ? "!bg-calendar-ring text-white"
                    : "border border-week-first hover:bg-week-first/10"
                }`}
              >
                This week
              </button>
              <button
                type="button"
                onClick={() => setDateRangeKind("custom")}
                className={`px-3 py-1.5 rounded-md text-sm ${
                  dateRangeKind === "custom"
                    ? "!bg-calendar-ring text-white"
                    : "border border-week-first hover:bg-week-first/10"
                }`}
              >
                Custom
              </button>
            </div>
            {dateRangeKind === "custom" && (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="datetime-local"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="border border-week-first rounded-md px-2 py-1 text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="datetime-local"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="border border-week-first rounded-md px-2 py-1 text-sm"
                />
              </div>
            )}
          </div>

          {bookingsError && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {bookingsError}
              <button
                type="button"
                onClick={() => refetchBookings()}
                className="ml-2 underline font-medium"
              >
                Retry
              </button>
            </div>
          )}

          <Dialog
            title="Delete booking"
            open={deleteConfirmOpen}
            onOpenChange={closeDeleteConfirm}
          >
            <div className="flex flex-col gap-4">
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to delete this booking? This action cannot
                be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => closeDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-3 py-2 rounded-md border border-week-first hover:bg-week-first/10 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-3 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                >
                  {isDeleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </Dialog>

          <List
            values={bookings}
            headers={["Title", "Start", "End", "Status", "Actions"]}
            data={["title", "start_at", "end_at", "status"]}
            iconActions={(row) => (
              <button
                type="button"
                onClick={() => {
                  setBookingToDelete(row as Booking);
                  setDeleteConfirmOpen(true);
                }}
                className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                aria-label="Delete booking"
              >
                <TrashIcon className="size-4" />
              </button>
            )}
            formatters={{
              start_at: (v) =>
                formatDateTime(v as string | Date | null | undefined),
              end_at: (v) =>
                formatDateTime(v as string | Date | null | undefined),
              status: (v) => formatBookingStatus(v),
            }}
            isLoading={bookingsLoading}
            page={bookingsPage}
            limit={bookingsLimit ?? 10}
            total={bookingsTotal}
            totalPages={bookingsTotalPages}
            setPage={setBookingsPage}
            setLimit={setBookingsLimit}
          />
        </div>
      )}
    </div>
  );
}
