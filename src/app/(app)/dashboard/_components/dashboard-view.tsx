"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArrowRight,
  CircleCheck,
  Clock,
  FileText,
  PencilLine,
  Search,
  Trash2,
} from "lucide-react";
import {
  Button,
  Dialog,
  EmptyState,
  Input,
  Select,
  buttonStyles,
  iconSize,
  iconStroke,
  useToast,
} from "@/components/ui";
import { Container } from "@/components/layout/container";
import { routes } from "@/config/routes";
import { formatMoney } from "@/lib/format/currency";
import { formatDate } from "@/lib/format/date";
import { cn } from "@/lib/utils/cn";
import {
  SORT_OPTIONS,
  STATUS_FILTERS,
  filterByStatus,
  isInvoiceSort,
  matchesQuery,
  partitionArchived,
  selectAttentionDrafts,
  sortInvoices,
  statusCounts,
  totalsByCurrency,
  type InvoiceSort,
  type SavedInvoiceSummary,
  type StatusFilter,
} from "@/features/invoices/model";
import { deleteInvoices, setInvoicesArchived } from "@/features/invoices/actions";
import { DashboardHero, type DashboardStat } from "./dashboard-hero";
import { InvoiceMenu, StatusMenu } from "./invoice-actions";

const statIcon = { size: iconSize.sm, strokeWidth: iconStroke };

function shortDate(iso: string | null): string | null {
  if (!iso) return null;
  return formatDate(iso.slice(0, 10), "en-US", "short");
}

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

/**
 * One amount for a group of invoices, in its largest currency (amounts in
 * different currencies are never added up). `others` counts the rest.
 */
function groupTotal(invoices: SavedInvoiceSummary[], fallbackCurrency: string) {
  const [first, ...rest] = totalsByCurrency(invoices);
  return {
    value: formatMoney(first?.total ?? 0, first?.currency ?? fallbackCurrency),
    others: rest.length,
  };
}

const otherCurrencies = (others: number) =>
  others === 0 ? "" : ` · +${others} other ${others === 1 ? "currency" : "currencies"}`;

/** Client initial on a soft sky tile; the invoice icon when there's no client yet. */
function ClientTile({ name, className }: { name: string; className?: string }) {
  const initial = name.trim().charAt(0).toUpperCase();
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-pill bg-sky-50 text-label text-sky-700",
        className,
      )}
    >
      {initial || <FileText size={iconSize.sm} strokeWidth={iconStroke} />}
    </span>
  );
}

function InvoiceLink({ id, number }: { id: string; number: string }) {
  return (
    <Link
      href={routes.invoice(id)}
      className="block min-w-0 truncate text-body font-medium text-ink underline-offset-4 hover:underline"
    >
      {number}
    </Link>
  );
}

/** Number over client name, with the client tile. */
function InvoiceIdentity({ invoice }: { invoice: SavedInvoiceSummary }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <ClientTile name={invoice.clientName} />
      <div className="flex min-w-0 flex-col">
        <InvoiceLink id={invoice.id} number={invoice.number} />
        <span className="truncate text-caption text-muted">
          {invoice.clientName || "No client yet"}
        </span>
      </div>
    </div>
  );
}

/** Touch-sized row selector. The label is the accessible name; nothing visual. */
function RowSelect({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <label className="inline-flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center">
      <input
        type="checkbox"
        aria-label={label}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-5 cursor-pointer accent-ink"
      />
    </label>
  );
}

function InvoiceCard({
  invoice,
  selected,
  onToggle,
}: {
  invoice: SavedInvoiceSummary;
  selected: boolean;
  onToggle: (next: boolean) => void;
}) {
  const updated = shortDate(invoice.updatedAt);
  const due = shortDate(invoice.dueDate);
  return (
    <li
      className={cn(
        "flex min-w-0 flex-col gap-4 rounded-2xl border p-4 transition-[border-color,box-shadow] duration-150 ease-standard hover:shadow-soft",
        selected ? "border-sky-300 bg-sky-50" : "border-border bg-white",
      )}
    >
      <div className="flex min-w-0 items-center gap-1">
        <div className="min-w-0 flex-1">
          <InvoiceIdentity invoice={invoice} />
        </div>
        <StatusMenu invoice={invoice} />
      </div>
      <div className="flex items-end justify-between gap-3 border-t border-border pt-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="truncate text-h3 text-ink tabular-nums">
            {formatMoney(invoice.total, invoice.currency)}
          </p>
          <p className="truncate text-caption text-muted">
            {due ? `Due ${due}` : updated ? `Updated ${updated}` : "No due date"}
          </p>
        </div>
        <div className="-mr-2 flex shrink-0 items-center">
          <RowSelect checked={selected} onChange={onToggle} label={`Select ${invoice.number}`} />
          <InvoiceMenu invoice={invoice} />
        </div>
      </div>
    </li>
  );
}

/** Drafts spotlight: each draft is one big link back into the editor. */
function DraftCard({ invoice }: { invoice: SavedInvoiceSummary }) {
  const updated = shortDate(invoice.updatedAt);
  return (
    <li className="min-w-0">
      <Link
        href={routes.invoiceEdit(invoice.id)}
        aria-label={`Continue editing ${invoice.number}`}
        className="group flex h-full min-w-0 items-center gap-3 rounded-xl bg-white p-4 shadow-soft transition-[translate,box-shadow] duration-150 ease-standard hover:-translate-y-px hover:shadow-float"
      >
        <ClientTile name={invoice.clientName} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-body font-medium text-ink">{invoice.number}</span>
          <span className="truncate text-caption text-muted">
            {invoice.clientName || "No client yet"}
            {updated ? ` · ${updated}` : null}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1 text-label text-sky-700">
          <span className="max-sm:sr-only">Continue</span>
          <ArrowRight
            size={iconSize.sm}
            strokeWidth={iconStroke}
            aria-hidden
            className="transition-transform duration-150 ease-standard group-hover:translate-x-0.5"
          />
        </span>
      </Link>
    </li>
  );
}

/** Status filter as pills with counts. Scrolls sideways on narrow screens. */
function StatusChips({
  value,
  onChange,
  counts,
  total,
}: {
  value: StatusFilter;
  onChange: (next: StatusFilter) => void;
  counts: Record<Exclude<StatusFilter, "all">, number>;
  total: number;
}) {
  // Cancelled only earns a chip once something is cancelled (or it's selected).
  const options = STATUS_FILTERS.filter(
    (option) => option.id !== "cancelled" || counts.cancelled > 0 || value === "cancelled",
  );
  return (
    <div className="-mx-gutter [scrollbar-width:none] overflow-x-auto px-gutter lg:mx-0 lg:px-0">
      <div role="group" aria-label="Filter by status" className="flex w-max items-center gap-1.5">
        {options.map((option) => {
          const active = option.id === value;
          const count = option.id === "all" ? total : counts[option.id];
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.id)}
              className={cn(
                "inline-flex min-h-10 items-center gap-2 rounded-pill px-3.5 text-label transition-colors duration-150 pointer-coarse:min-h-11",
                active ? "bg-ink text-white" : "bg-mist text-ink hover:bg-mist-strong",
              )}
            >
              {option.label}
              <span
                className={cn(
                  "min-w-5 rounded-pill px-1.5 text-center text-caption tabular-nums",
                  active ? "bg-white/16 text-white" : "bg-white text-muted",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * The dashboard. A sky banner with the money overview, a drafts spotlight,
 * then the list: one card per invoice on phones, two columns on tablets, a
 * table on desktops. Selection, sorting and the archive view work the same in
 * all three. Search, filter and sort are client-side over the recent invoices
 * the server provided, so every keystroke is instant.
 */
export function DashboardView({
  invoices,
  greeting,
  empty,
}: {
  invoices: SavedInvoiceSummary[];
  greeting: string;
  /** Shown instead of the list until the first invoice is saved. */
  empty: ReactNode;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<InvoiceSort>("updated");
  const [showArchived, setShowArchived] = useState(false);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkBusy, startBulk] = useTransition();

  const { active, archived } = useMemo(() => partitionArchived(invoices), [invoices]);
  const scope = showArchived ? archived : active;
  const hasInvoices = active.length > 0 || archived.length > 0;

  const visible = useMemo(
    () =>
      sortInvoices(
        filterByStatus(
          scope.filter((invoice) => matchesQuery(invoice, query)),
          filter,
        ),
        sort,
      ),
    [scope, query, filter, sort],
  );
  const counts = useMemo(() => statusCounts(active), [active]);
  const scopeCounts = useMemo(() => statusCounts(scope), [scope]);
  const attention = useMemo(() => selectAttentionDrafts(active), [active]);

  const overview = useMemo(() => {
    const fallback = invoices[0]?.currency ?? "USD";
    const awaiting = active.filter((i) => i.status === "sent" || i.status === "overdue");
    const paid = active.filter((i) => i.status === "paid");
    return {
      awaitingCount: awaiting.length,
      awaiting: groupTotal(awaiting, fallback),
      paidCount: paid.length,
      paid: groupTotal(paid, fallback),
    };
  }, [active, invoices]);

  // A new search, filter, sort or view starts with a clean selection.
  // (Stale ids from a server refresh are harmless: only visible ids count.)
  const clearSelection = () => setSelected(new Set());

  const toggleSelected = (id: string, next: boolean) =>
    setSelected((previous) => {
      const copy = new Set(previous);
      if (next) copy.add(id);
      else copy.delete(id);
      return copy;
    });

  const visibleIds = useMemo(() => visible.map((invoice) => invoice.id), [visible]);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));

  const selectedIds = useMemo(
    () => visibleIds.filter((id) => selected.has(id)),
    [visibleIds, selected],
  );

  const fail = (fallback: string) => (error: unknown) =>
    toast({
      title: error instanceof Error ? error.message : fallback,
      tone: "error",
    });

  const runBulkArchive = (archivedNext: boolean) => {
    if (selectedIds.length === 0) return;
    startBulk(async () => {
      try {
        const count = await setInvoicesArchived(selectedIds, archivedNext);
        setSelected(new Set());
        router.refresh();
        toast({
          title:
            count === 1
              ? archivedNext
                ? "Invoice archived."
                : "Invoice restored to your list."
              : archivedNext
                ? `${count} invoices archived.`
                : `${count} invoices restored to your list.`,
          tone: "success",
        });
      } catch (error) {
        fail("Could not update those invoices. Try again.")(error);
      }
    });
  };

  const runBulkDelete = () => {
    if (selectedIds.length === 0) return;
    startBulk(async () => {
      try {
        const count = await deleteInvoices(selectedIds);
        setSelected(new Set());
        setBulkConfirmOpen(false);
        router.refresh();
        toast({
          title: count === 1 ? "Invoice deleted." : `${count} invoices deleted.`,
          tone: "success",
        });
      } catch (error) {
        fail("Could not delete those invoices. Try again.")(error);
      }
    });
  };

  const changeFilter = (next: StatusFilter) => {
    setFilter(next);
    clearSelection();
  };

  const showAllDrafts = () => {
    setQuery("");
    setShowArchived(false);
    changeFilter("draft");
    document.getElementById("invoices-heading")?.scrollIntoView({ block: "start" });
  };

  const summary = !hasInvoices
    ? "Your invoices will live here. Let's make the first one."
    : overview.awaitingCount > 0
      ? `${overview.awaiting.value} is waiting on ${plural(overview.awaitingCount, "invoice")}.` +
        (counts.overdue > 0
          ? ` ${counts.overdue} ${counts.overdue === 1 ? "is" : "are"} overdue.`
          : "")
      : counts.draft > 0
        ? `Nothing waiting on payment. ${plural(counts.draft, "draft")} to finish.`
        : "You're all caught up. Nothing waiting on payment.";

  const stats: DashboardStat[] | undefined = hasInvoices
    ? [
        {
          label: "Outstanding",
          value: overview.awaiting.value,
          note:
            plural(overview.awaitingCount, "invoice") +
            (counts.overdue > 0 ? ` · ${counts.overdue} overdue` : "") +
            otherCurrencies(overview.awaiting.others),
          icon: <Clock {...statIcon} />,
        },
        {
          label: "Paid",
          value: overview.paid.value,
          note: plural(overview.paidCount, "invoice") + otherCurrencies(overview.paid.others),
          icon: <CircleCheck {...statIcon} />,
        },
        {
          label: "Drafts",
          value: String(counts.draft),
          note: counts.draft > 0 ? "Ready to finish" : "None open",
          icon: <PencilLine {...statIcon} />,
        },
        {
          label: "All invoices",
          value: String(active.length),
          note: archived.length > 0 ? `${archived.length} archived` : "In your account",
          icon: <FileText {...statIcon} />,
        },
      ]
    : undefined;

  const resultSummary = showArchived
    ? `Showing ${visible.length} of ${plural(archived.length, "archived invoice")}.`
    : visible.length === active.length
      ? `Showing all ${plural(active.length, "invoice")}.`
      : `Showing ${visible.length} of ${plural(active.length, "invoice")}.`;

  return (
    <main id="main" className="flex-1 pt-2 pb-12 sm:pt-3 md:pb-16">
      <Container className="flex flex-col gap-8 max-sm:px-2 md:gap-10">
        <DashboardHero
          greeting={greeting}
          summary={summary}
          stats={stats}
          showAction={hasInvoices}
        />

        {!hasInvoices ? (
          empty
        ) : (
          <div className="flex flex-col gap-8 max-sm:px-2 md:gap-10">
            {attention.length > 0 ? (
              <section
                aria-labelledby="attention-heading"
                className="flex flex-col gap-4 rounded-xl bg-mist p-4 sm:rounded-3xl sm:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                  <div className="flex flex-col gap-0.5">
                    <h2 id="attention-heading" className="text-h3 text-ink">
                      Pick up where you left off
                    </h2>
                    <p className="text-label font-normal text-muted">
                      Unfinished drafts, newest first.
                    </p>
                  </div>
                  {counts.draft > attention.length ? (
                    <button
                      type="button"
                      onClick={showAllDrafts}
                      className="inline-flex min-h-11 items-center text-label text-ink underline-offset-4 hover:underline"
                    >
                      View all {counts.draft} drafts
                    </button>
                  ) : null}
                </div>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {attention.map((invoice) => (
                    <DraftCard key={invoice.id} invoice={invoice} />
                  ))}
                </ul>
              </section>
            ) : null}

            <section aria-labelledby="invoices-heading" className="flex flex-col gap-4">
              <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
                <div className="flex flex-col gap-0.5">
                  <h2 id="invoices-heading" className="scroll-mt-24 text-h2 text-ink">
                    {showArchived ? "Archived invoices" : "Invoices"}
                  </h2>
                  <p aria-live="polite" className="text-label font-normal text-muted">
                    {resultSummary}
                  </p>
                </div>
                {archived.length > 0 || showArchived ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowArchived((previous) => !previous);
                      clearSelection();
                    }}
                    className="inline-flex min-h-11 items-center gap-1.5 text-label text-ink underline-offset-4 hover:underline"
                  >
                    <Archive size={iconSize.sm} strokeWidth={iconStroke} aria-hidden />
                    {showArchived ? "Back to invoices" : `View archived (${archived.length})`}
                  </button>
                ) : null}
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <StatusChips
                  value={filter}
                  onChange={changeFilter}
                  counts={scopeCounts}
                  total={scope.length}
                />
                <div className="flex min-w-0 flex-col gap-2 sm:flex-row lg:w-md lg:shrink-0 xl:w-lg">
                  <div className="min-w-0 flex-1">
                    <label htmlFor="invoice-search" className="sr-only">
                      Search invoices
                    </label>
                    <Input
                      id="invoice-search"
                      type="search"
                      value={query}
                      onChange={(event) => {
                        setQuery(event.target.value);
                        clearSelection();
                      }}
                      placeholder="Search number, client or email"
                      autoComplete="off"
                      className="rounded-pill"
                      leading={
                        <Search
                          size={iconSize.md}
                          strokeWidth={iconStroke}
                          aria-hidden
                          className="text-muted"
                        />
                      }
                    />
                  </div>
                  <div className="shrink-0 sm:w-48">
                    <label htmlFor="invoice-sort" className="sr-only">
                      Sort invoices
                    </label>
                    <Select
                      id="invoice-sort"
                      value={sort}
                      onChange={(event) => {
                        setSort(isInvoiceSort(event.target.value) ? event.target.value : "updated");
                        clearSelection();
                      }}
                      className="rounded-pill"
                      options={SORT_OPTIONS.map((option) => ({
                        value: option.id,
                        label: option.label,
                      }))}
                    />
                  </div>
                </div>
              </div>

              {visible.length === 0 ? (
                <div className="rounded-xl bg-mist sm:rounded-3xl">
                  <EmptyState
                    title={showArchived ? "No archived invoices match." : "No invoices match."}
                    description={
                      showArchived && archived.length === 0
                        ? "Archived invoices stay here until you restore or delete them."
                        : "Try a different search, status or sort."
                    }
                    action={
                      <button
                        type="button"
                        onClick={() => {
                          setQuery("");
                          setFilter("all");
                          clearSelection();
                          if (showArchived && archived.length === 0) setShowArchived(false);
                        }}
                        className={buttonStyles({ variant: "secondary" })}
                      >
                        {showArchived && archived.length === 0
                          ? "Back to invoices"
                          : "Clear search and filters"}
                      </button>
                    }
                  />
                </div>
              ) : (
                <>
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:hidden">
                    {visible.map((invoice) => (
                      <InvoiceCard
                        key={invoice.id}
                        invoice={invoice}
                        selected={selected.has(invoice.id)}
                        onToggle={(next) => toggleSelected(invoice.id, next)}
                      />
                    ))}
                  </ul>

                  <div className="hidden overflow-hidden rounded-2xl border border-border bg-white xl:block">
                    <table className="w-full border-collapse text-left">
                      <thead className="bg-mist">
                        <tr>
                          <th scope="col" className="w-14 py-1 pl-4">
                            <RowSelect
                              checked={allVisibleSelected}
                              onChange={(next) =>
                                setSelected(next ? new Set(visibleIds) : new Set())
                              }
                              label="Select all invoices shown"
                            />
                          </th>
                          {["Invoice", "Status", "Due", "Updated"].map((heading) => (
                            <th
                              key={heading}
                              scope="col"
                              className="px-4 py-3 text-label font-normal text-muted"
                            >
                              {heading}
                            </th>
                          ))}
                          <th
                            scope="col"
                            className="px-4 py-3 text-right text-label font-normal text-muted"
                          >
                            Amount
                          </th>
                          <th scope="col" className="w-16 px-4 py-3">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {visible.map((invoice) => {
                          const isSelected = selected.has(invoice.id);
                          return (
                            <tr
                              key={invoice.id}
                              className={cn(
                                "border-t border-border transition-colors duration-150",
                                isSelected ? "bg-sky-50" : "hover:bg-mist/60",
                              )}
                            >
                              <td className="py-1 pl-4">
                                <RowSelect
                                  checked={isSelected}
                                  onChange={(next) => toggleSelected(invoice.id, next)}
                                  label={`Select ${invoice.number}`}
                                />
                              </td>
                              <td className="max-w-80 px-4 py-3">
                                <InvoiceIdentity invoice={invoice} />
                              </td>
                              <td className="px-4 py-3">
                                <StatusMenu invoice={invoice} />
                              </td>
                              <td className="px-4 py-3 text-body whitespace-nowrap text-muted">
                                {shortDate(invoice.dueDate) ?? "—"}
                              </td>
                              <td className="px-4 py-3 text-body whitespace-nowrap text-muted">
                                {shortDate(invoice.updatedAt) ?? "—"}
                              </td>
                              <td className="px-4 py-3 text-right text-body font-medium whitespace-nowrap text-ink tabular-nums">
                                {formatMoney(invoice.total, invoice.currency)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <InvoiceMenu invoice={invoice} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>

            {selectedIds.length > 0 ? (
              <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-border bg-white px-4 py-3 shadow-float">
                <p aria-live="polite" className="text-label text-ink">
                  {selectedIds.length} selected
                </p>
                <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={bulkBusy}
                    onClick={() => setSelected(new Set())}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={bulkBusy}
                    onClick={() => runBulkArchive(!showArchived)}
                    leadingIcon={
                      <Archive size={iconSize.md} strokeWidth={iconStroke} aria-hidden />
                    }
                  >
                    {showArchived ? "Restore" : "Archive"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={bulkBusy}
                    onClick={() => setBulkConfirmOpen(true)}
                    leadingIcon={<Trash2 size={iconSize.md} strokeWidth={iconStroke} aria-hidden />}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ) : null}

            <Dialog
              open={bulkConfirmOpen}
              onClose={() => setBulkConfirmOpen(false)}
              size="sm"
              title={
                selectedIds.length === 1
                  ? "Delete this invoice?"
                  : `Delete ${selectedIds.length} invoices?`
              }
              description="This permanently deletes them. It can't be undone — archiving keeps them instead."
              footer={
                <>
                  <Button variant="secondary" onClick={() => setBulkConfirmOpen(false)}>
                    Keep them
                  </Button>
                  <Button
                    variant="destructive-solid"
                    loading={bulkBusy}
                    onClick={runBulkDelete}
                    leadingIcon={<Trash2 size={iconSize.md} strokeWidth={iconStroke} />}
                  >
                    Delete forever
                  </Button>
                </>
              }
            />
          </div>
        )}
      </Container>
    </main>
  );
}
