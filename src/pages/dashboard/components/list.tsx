import { DotLoader } from "react-spinners";
import type { Room } from "../../../services/rooms";
import type { Booking } from "../../../services/booking";
import type { ReactNode } from "react";

type RowItem = Room | Booking;

interface ListProps {
  isLoading: boolean;
  values: Room[] | Booking[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  headers: string[];
  data: string[];
  formatters?: Partial<Record<string, (value: unknown) => string>>;
  iconActions?: ReactNode | ((row: RowItem) => ReactNode);
}

export default function List({
  isLoading,
  values,
  page,
  limit,
  total,
  totalPages,
  setPage,
  headers,
  data,
  formatters,
  iconActions,
}: ListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[14rem] text-gray-500">
        <DotLoader color="rgb(100, 108, 255)" size={60} />
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-md border border-week-first">
        <table className="min-w-full divide-y divide-week-first">
          <thead className="bg-calendar-right">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-5 py-3 text-center text-base font-medium text-white"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-week-first bg-white dark:bg-gray-900">
            {values.length === 0 ? (
              <tr>
                <td
                  colSpan={data.length + (iconActions != null ? 1 : 0)}
                  className="px-5 py-8 text-center text-base text-gray-500"
                >
                  No items
                </td>
              </tr>
            ) : (
              values.map((row) => (
                <tr key={row.id}>
                  {data.map((key) => {
                    const val = (row as unknown as Record<string, unknown>)[
                      key
                    ];
                    const format = formatters?.[key];
                    const display = format
                      ? format(val)
                      : val == null
                        ? "—"
                        : typeof val === "object"
                          ? JSON.stringify(val)
                          : String(val);
                    return (
                      <td
                        key={`${row.id}-${key}`}
                        className="px-5 py-3 text-base text-center"
                      >
                        {display}
                      </td>
                    );
                  })}
                  {iconActions != null && (
                    <td className="px-5 py-3 text-base text-center">
                      <div className="flex justify-center items-center gap-1">
                        {typeof iconActions === "function"
                          ? iconActions(row as RowItem)
                          : iconActions}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="text-gray-600 dark:text-gray-400">
          Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of{" "}
          {total}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="rounded border border-gray-300 dark:border-gray-600 px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Previous
          </button>
          <span className="px-2">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className="rounded border border-gray-300 dark:border-gray-600 px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
