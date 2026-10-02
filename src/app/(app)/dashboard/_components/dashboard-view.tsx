"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, FileText, Plus, Search, Trash2 } from "lucide-react";
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
  type InvoiceSort,
  type SavedInvoiceSummary,
  type StatusFilter,
} from "@/features/invoices/model";
import { deleteInvoices, setInvoicesArchived } from "@/features/invoices/actions";
import { InvoiceMenu, StatusMenu } from "./invoice-actions";

function shortDate(iso: string | null): string | null {
  if (!iso) return null;
  return formatDate(iso.slice(0, 10), "en-US", "short");
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-surface px-4 py-3">
      <p className="truncate text-caption text-muted">{label}</p>
      <p className="mt-0.5 text-h2 text-ink tabular-nums">{value}</p>
    </div>
  );
}

function InvoiceLink({ id, number }: { id: string; number: string }) {
  return (
    <Link
      href={routes.invoice(id)}
      className="min-w-0 truncate text-body font-medium text-ink underline-offset-4 hover:underline"
    >
      {number}
    </Link>
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
    <li className="flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-surface p-4">
      <div className="flex min-w-0 items-center gap-1">
        <RowSelect checked={selected} onChange={onToggle} label={`Select ${invoice.number}`} />
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
          <InvoiceLink id={invoice.id} number={invoice.number} />
          <StatusMenu invoice={invoice} />
        </div>
      </div>
      <p className="truncate text-body text-muted">{invoice.clientName || "No client yet"}</p>
      <div className="flex items-end justify-between gap-3 pt-1">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-body font-medium text-ink tabular-nums">
            {formatMoney(invoice.total, invoice.currency)}
          </p>
          <p className="text-caption text-muted">
            {due ? `Due ${due}` : "No due date"}
            {updated ? ` · Updated ${updated}` : null}
          </p>
        </div>
        <InvoiceMenu invoice={invoice} />
      </div>
    </li>
  );
}

/**
 * The dashboard list. Phones get one card per invoice, tablets get two
 * columns of cards, desktops get a table — selection, sorting and the archive
 * view work the same in all three. Search, filter and sort are client-side
 * over the recent invoices the server provided, so every keystroke is instant.
 */
export function DashboardView({
  invoices,
  greeting,
}: {
  invoices: SavedInvoiceSummary[];
  greeting: string;
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
  const awaiting = counts.sent + counts.overdue;
  const attention = useMemo(() => selectAttentionDrafts(active), [active]);

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

  const showAllDrafts = () => {
    setQuery("");
    setFilter("draft");
    clearSelection();
    document.getElementById("invoice-results")?.scrollIntoView({ block: "nearest" });
  };

  const resultSummary = showArchived
    ? `Showing ${visible.length} of ${archived.length} archived invoice${archived.length === 1 ? "" : "s"}.`
    : visible.length === active.length
      ? `Showing all ${active.length} invoices.`
      : `Showing ${visible.length} of ${active.length} invoices.`;

  return (
    <main id="main" className="flex-1 py-6 md:py-8">
      <Container className="flex flex-col gap-6 md:gap-8">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-h2 text-ink">{greeting}</h1>
            <p className="text-body text-muted">
              {active.length === 0 && archived.length === 0
                ? "Track and manage your invoices."
                : `${active.length} saved invoice${active.length === 1 ? "" : "s"}.`}
            </p>
          </div>
          <Link href={routes.createInvoice} className={buttonStyles()}>
            <Plus size={iconSize.md} strokeWidth={iconStroke} aria-hidden />
            Create invoice
          </Link>
        </div>

        {active.length > 0 || archived.length > 0 ? (
          <>
            {!showArchived ? (
              <>
                <div
                  className="grid grid-cols-2 gap-3 sm:grid-cols-4"
                  role="group"
                  aria-label="Invoice overview"
                >
                  <Stat label="Total" value={active.length} />
                  <Stat label="Drafts" value={counts.draft} />
                  <Stat label="Awaiting payment" value={awaiting} />
                  <Stat label="Paid" value={counts.paid} />
                </div>

                {attention.length > 0 ? (
                  <section
                    aria-labelledby="attention-heading"
                    className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4 sm:p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                      <h2 id="attention-heading" className="text-h3 text-ink">
                        Needs attention
                      </h2>
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
                    <p className="text-body text-muted">
                      Unfinished drafts — continue where you left off.
                    </p>
                    <ul className="mt-2 flex flex-col">
                      {attention.map((invoice) => (
                        <li
                          key={invoice.id}
                          className="flex items-center justify-between gap-3 border-t border-border py-2.5 first:border-t-0 first:pt-1 last:pb-0"
                        >
                          <div className="flex min-w-0 flex-col gap-0.5">
                            <InvoiceLink id={invoice.id} number={invoice.number} />
                            <p className="truncate text-caption text-muted">
                              {invoice.clientName || "No client yet"}
                              {shortDate(invoice.updatedAt)
                                ? ` · Updated ${shortDate(invoice.updatedAt)}`
                                : null}
                            </p>
                          </div>
                          <Link
                            href={routes.invoiceEdit(invoice.id)}
                            aria-label={`Continue editing ${invoice.number}`}
                            className="inline-flex min-h-11 shrink-0 items-center text-label text-ink underline-offset-4 hover:underline"
                          >
                            Continue
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="min-w-0 flex-1">
                <label htmlFor="invoice-search" className="mb-1.5 block text-label text-ink">
                  Search
                </label>
                <Input
                  id="invoice-search"
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    clearSelection();
                  }}
                  placeholder="Invoice number, client or email…"
                  autoComplete="off"
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
              <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row">
                <div className="min-w-0 sm:w-44 sm:shrink-0">
                  <label htmlFor="invoice-status" className="mb-1.5 block text-label text-ink">
                    Status
                  </label>
                  <Select
                    id="invoice-status"
                    value={filter}
                    onChange={(event) => {
                      setFilter(event.target.value as StatusFilter);
                      clearSelection();
                    }}
                    options={STATUS_FILTERS.map((option) => ({
                      value: option.id,
                      label: option.label,
                    }))}
                  />
                </div>
                <div className="min-w-0 sm:w-52 sm:shrink-0">
                  <label htmlFor="invoice-sort" className="mb-1.5 block text-label text-ink">
                    Sort
                  </label>
                  <Select
                    id="invoice-sort"
                    value={sort}
                    onChange={(event) => {
                      setSort(isInvoiceSort(event.target.value) ? event.target.value : "updated");
                      clearSelection();
                    }}
                    options={SORT_OPTIONS.map((option) => ({
                      value: option.id,
                      label: option.label,
                    }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <p
                id="invoice-results"
                aria-live="polite"
                className="scroll-mt-24 text-label font-normal text-muted"
              >
                {resultSummary}
              </p>
              {archived.length > 0 || showArchived ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowArchived((previous) => !previous);
                    clearSelection();
                  }}
                  className="inline-flex min-h-11 items-center text-label text-ink underline-offset-4 hover:underline"
                >
                  {showArchived ? "Back to invoices" : `View archived (${archived.length})`}
                </button>
              ) : null}
            </div>

            {visible.length === 0 ? (
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

                <div className="hidden overflow-hidden rounded-lg border border-border bg-surface xl:block">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-border">
                        <th scope="col" className="w-14 px-2 py-3 pl-4">
                          <RowSelect
                            checked={allVisibleSelected}
                            onChange={(next) => setSelected(next ? new Set(visibleIds) : new Set())}
                            label="Select all invoices shown"
                          />
                        </th>
                        {["Invoice", "Client", "Status", "Due", "Updated"].map((heading) => (
                          <th
                            key={heading}
                            scope="col"
                            className="px-4 py-3 text-label font-medium text-muted"
                          >
                            {heading}
                          </th>
                        ))}
                        <th
                          scope="col"
                          className="px-4 py-3 text-right text-label font-medium text-muted"
                        >
                          Amount
                        </th>
                        <th scope="col" className="px-4 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((invoice) => (
                        <tr key={invoice.id} className="border-b border-border last:border-0">
                          <td className="px-2 py-1.5 pl-4">
                            <RowSelect
                              checked={selected.has(invoice.id)}
                              onChange={(next) => toggleSelected(invoice.id, next)}
                              label={`Select ${invoice.number}`}
                            />
                          </td>
                          <td className="max-w-44 px-4 py-3">
                            <InvoiceLink id={invoice.id} number={invoice.number} />
                          </td>
                          <td className="max-w-52 truncate px-4 py-3 text-body text-muted">
                            {invoice.clientName || "—"}
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {selectedIds.length > 0 ? (
              <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-border bg-surface px-4 py-3 shadow-elevated">
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
          </>
        ) : (
          <div className="rounded-xl border border-border bg-surface">
            <EmptyState
              title="No invoices yet."
              description="Create your first invoice and it will appear here, ready to send, track and get paid."
              icon={<FileText size={iconSize.lg} strokeWidth={iconStroke} aria-hidden />}
              action={
                <Link href={routes.createInvoice} className={buttonStyles()}>
                  <Plus size={iconSize.md} strokeWidth={iconStroke} aria-hidden />
                  Create invoice
                </Link>
              }
            />
          </div>
        )}
      </Container>
    </main>
  );
}
