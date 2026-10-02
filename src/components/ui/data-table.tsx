import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type DataTableColumn<Row> = {
  key: string;
  header: string;
  cell: (row: Row) => ReactNode;
  align?: "start" | "end";
  /**
   * On phones, the primary column becomes each row's title, shown first and
   * without a label. Use it for the item or invoice name.
   */
  primary?: boolean;
  /** Desktop column width, e.g. "w-32". */
  className?: string;
};

type DataTableProps<Row> = {
  columns: DataTableColumn<Row>[];
  rows: Row[];
  getRowKey: (row: Row) => string;
  /** Accessible name / visible caption for the table. */
  caption: string;
  hideCaption?: boolean;
  /** Shown instead of the table when there are no rows (usually an EmptyState). */
  empty?: ReactNode;
  className?: string;
};

/**
 * Responsive table. Nothing is hidden on small screens:
 * - From 768px: a normal table.
 * - Below 768px: each row becomes a stacked block of label/value pairs, with
 *   the primary column as its title.
 */
export function DataTable<Row>({
  columns,
  rows,
  getRowKey,
  caption,
  hideCaption = false,
  empty,
  className,
}: DataTableProps<Row>) {
  if (!rows.length && empty) return <>{empty}</>;

  const primary = columns.find((column) => column.primary);
  const secondary = columns.filter((column) => column !== primary);

  return (
    <div className={cn("min-w-0", className)}>
      {/* Tablet and desktop */}
      <table className="hidden w-full border-collapse text-left md:table">
        <caption className={cn("pb-3 text-left text-label text-ink", hideCaption && "sr-only")}>
          {caption}
        </caption>
        <thead>
          <tr className="border-b border-border-strong">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  "px-3 py-3 text-caption font-medium text-muted first:pl-0 last:pr-0",
                  column.align === "end" && "text-right",
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)} className="border-b border-border last:border-0">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    "px-3 py-4 align-top text-body break-words text-foreground first:pl-0 last:pr-0",
                    column.align === "end" && "text-right tabular-nums",
                  )}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Phones */}
      <div className="md:hidden">
        <p className={cn("pb-3 text-label text-ink", hideCaption && "sr-only")}>{caption}</p>
        <ul className="flex flex-col divide-y divide-border border-y border-border">
          {rows.map((row) => (
            <li key={getRowKey(row)} className="flex flex-col gap-2 py-4">
              {primary ? (
                <div className="text-body font-medium break-words text-ink">
                  {primary.cell(row)}
                </div>
              ) : null}
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
                {secondary.map((column) => (
                  <div
                    key={column.key}
                    className="col-span-2 grid grid-cols-subgrid items-baseline"
                  >
                    <dt className="text-caption text-muted">{column.header}</dt>
                    <dd
                      className={cn(
                        "min-w-0 text-right text-body break-words text-foreground",
                        column.align === "end" && "tabular-nums",
                      )}
                    >
                      {column.cell(row)}
                    </dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
