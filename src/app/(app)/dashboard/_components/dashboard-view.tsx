"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileText, Plus, Search } from "lucide-react";
import { EmptyState, Input, Select, buttonStyles, iconSize, iconStroke } from "@/components/ui";
import { Container } from "@/components/layout/container";
import { routes } from "@/config/routes";
import { formatMoney } from "@/lib/format/currency";
import { formatDate } from "@/lib/format/date";
import {
  STATUS_FILTERS,
  filterByStatus,
  matchesQuery,
  selectAttentionDrafts,
  statusCounts,
  type SavedInvoiceSummary,
  type StatusFilter,
} from "@/features/invoices/model";
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

function InvoiceCard({ invoice }: { invoice: SavedInvoiceSummary }) {
  const updated = shortDate(invoice.updatedAt);
  const due = shortDate(invoice.dueDate);
  return (
    <li className="flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-surface p-4">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <InvoiceLink id={invoice.id} number={invoice.number} />
        <StatusMenu invoice={invoice} />
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
 * columns of cards, desktops get a table. Search and filter are client-side
 * over the recent invoices the server provided.
 */
export function DashboardView({
  invoices,
  greeting,
}: {
  invoices: SavedInvoiceSummary[];
  greeting: string;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");

  const visible = useMemo(
    () =>
      filterByStatus(
        invoices.filter((invoice) => matchesQuery(invoice, query)),
        filter,
      ),
    [invoices, query, filter],
  );
  const counts = useMemo(() => statusCounts(invoices), [invoices]);
  const awaiting = counts.sent + counts.overdue;
  const attention = useMemo(() => selectAttentionDrafts(invoices), [invoices]);

  const showAllDrafts = () => {
    setQuery("");
    setFilter("draft");
    document.getElementById("invoice-results")?.scrollIntoView({ block: "nearest" });
  };

  return (
    <main id="main" className="flex-1 py-6 md:py-8">
      <Container className="flex flex-col gap-6 md:gap-8">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-h2 text-ink">{greeting}</h1>
            <p className="text-body text-muted">
              {invoices.length === 0
                ? "Track and manage your invoices."
                : `${invoices.length} saved invoice${invoices.length === 1 ? "" : "s"}.`}
            </p>
          </div>
          <Link href={routes.createInvoice} className={buttonStyles()}>
            <Plus size={iconSize.md} strokeWidth={iconStroke} aria-hidden />
            Create invoice
          </Link>
        </div>

        {invoices.length > 0 ? (
          <>
            <div
              className="grid grid-cols-2 gap-3 sm:grid-cols-4"
              role="group"
              aria-label="Invoice overview"
            >
              <Stat label="Total" value={invoices.length} />
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

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="min-w-0 flex-1">
                <label htmlFor="invoice-search" className="mb-1.5 block text-label text-ink">
                  Search
                </label>
                <Input
                  id="invoice-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Invoice number or client…"
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
              <div className="sm:w-56 sm:shrink-0">
                <label htmlFor="invoice-status" className="mb-1.5 block text-label text-ink">
                  Status
                </label>
                <Select
                  id="invoice-status"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value as StatusFilter)}
                  options={STATUS_FILTERS.map((option) => ({
                    value: option.id,
                    label: option.label,
                  }))}
                />
              </div>
            </div>

            <p
              id="invoice-results"
              aria-live="polite"
              className="scroll-mt-24 text-label font-normal text-muted"
            >
              {visible.length === invoices.length
                ? `Showing all ${invoices.length} invoices.`
                : `Showing ${visible.length} of ${invoices.length} invoices.`}
            </p>

            {visible.length === 0 ? (
              <EmptyState
                title="No invoices match."
                description="Try a different search or status."
                action={
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setFilter("all");
                    }}
                    className={buttonStyles({ variant: "secondary" })}
                  >
                    Clear search and filters
                  </button>
                }
              />
            ) : (
              <>
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
                  {visible.map((invoice) => (
                    <InvoiceCard key={invoice.id} invoice={invoice} />
                  ))}
                </ul>

                <div className="hidden overflow-hidden rounded-lg border border-border bg-surface lg:block">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-border">
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
