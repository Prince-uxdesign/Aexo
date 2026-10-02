import { describe, expect, it } from "vitest";
import {
  filterByStatus,
  isInvoiceSort,
  isInvoiceStatus,
  isShareRpcMissing,
  isShareToken,
  matchesQuery,
  partitionArchived,
  rowToShareState,
  rowToSharedInvoice,
  rowToSummary,
  selectAttentionDrafts,
  sortInvoices,
  statusCounts,
  type SavedInvoiceSummary,
} from "./model";

function summary(overrides: Partial<SavedInvoiceSummary> = {}): SavedInvoiceSummary {
  return {
    id: "1",
    number: "INV-0001",
    status: "draft",
    currency: "USD",
    total: 250,
    clientName: "Harbor & Pine Co.",
    clientEmail: "hello@harborpine.co",
    senderName: "Lumen Studio",
    issueDate: "2026-10-02",
    dueDate: "2026-11-01",
    archived: false,
    updatedAt: "2026-10-02T10:00:00Z",
    createdAt: "2026-10-02T09:00:00Z",
    ...overrides,
  };
}

describe("isInvoiceStatus", () => {
  it("accepts the five manual statuses and nothing else", () => {
    for (const status of ["draft", "sent", "paid", "overdue", "cancelled"]) {
      expect(isInvoiceStatus(status)).toBe(true);
    }
    expect(isInvoiceStatus("pending")).toBe(false);
    expect(isInvoiceStatus(null)).toBe(false);
    expect(isInvoiceStatus(undefined)).toBe(false);
  });
});

describe("rowToSummary", () => {
  it("falls back safely on hostile rows (never throws, never blank id)", () => {
    const parsed = rowToSummary({
      id: "abc",
      number: "",
      status: "bogus",
      currency: "usd",
      total: "99.99",
      client_name: null,
      sender_name: undefined,
      issue_date: null,
      due_date: "",
      updated_at: "2026-10-02T10:00:00Z",
      created_at: "2026-10-02T09:00:00Z",
    });
    expect(parsed.number).toBe("Untitled invoice");
    expect(parsed.status).toBe("draft");
    expect(parsed.currency).toBe("USD");
    expect(parsed.total).toBe(99.99);
    expect(parsed.clientName).toBe("");
  });

  it("treats non-finite totals as 0", () => {
    expect(rowToSummary({ id: "x", total: NaN } as never).total).toBe(0);
  });
});

describe("matchesQuery", () => {
  const invoice = summary();

  it("matches invoice number, client and business name", () => {
    expect(matchesQuery(invoice, "INV-0001")).toBe(true);
    expect(matchesQuery(invoice, "harbor")).toBe(true);
    expect(matchesQuery(invoice, "LUMEN")).toBe(true);
  });

  it("matches the client email", () => {
    expect(matchesQuery(invoice, "hello@harborpine.co")).toBe(true);
    expect(matchesQuery(invoice, "HARBORPINE")).toBe(true);
  });

  it("ignores case and surrounding spaces, and empty means all", () => {
    expect(matchesQuery(invoice, "  pine  ")).toBe(true);
    expect(matchesQuery(invoice, "")).toBe(true);
    expect(matchesQuery(invoice, "acme")).toBe(false);
  });
});

describe("filterByStatus", () => {
  const invoices = [
    summary({ id: "1", status: "draft" }),
    summary({ id: "2", status: "sent" }),
    summary({ id: "3", status: "paid" }),
  ];

  it("returns everything for All and narrows otherwise", () => {
    expect(filterByStatus(invoices, "all")).toHaveLength(3);
    expect(filterByStatus(invoices, "sent").map((i) => i.id)).toEqual(["2"]);
    expect(filterByStatus(invoices, "overdue")).toHaveLength(0);
  });
});

describe("statusCounts", () => {
  it("counts every status, including zeroes", () => {
    expect(
      statusCounts([
        summary({ status: "draft" }),
        summary({ status: "draft" }),
        summary({ status: "paid" }),
      ]),
    ).toEqual({ draft: 2, sent: 0, paid: 1, overdue: 0, cancelled: 0 });
  });
});

describe("selectAttentionDrafts", () => {
  const invoices = [
    summary({ id: "1", status: "paid" }),
    summary({ id: "2", status: "draft" }),
    summary({ id: "3", status: "sent" }),
    summary({ id: "4", status: "draft" }),
    summary({ id: "5", status: "draft" }),
    summary({ id: "6", status: "draft" }),
  ];

  it("returns only drafts, newest first, capped at three", () => {
    expect(selectAttentionDrafts(invoices).map((i) => i.id)).toEqual(["2", "4", "5"]);
    expect(selectAttentionDrafts(invoices, 2).map((i) => i.id)).toEqual(["2", "4"]);
  });

  it("returns empty when nothing needs attention", () => {
    expect(selectAttentionDrafts([summary({ status: "paid" })])).toEqual([]);
    expect(selectAttentionDrafts([])).toEqual([]);
  });
});

describe("isShareToken", () => {
  it("accepts UUID-shaped tokens and rejects internal ids and junk", () => {
    expect(isShareToken("a8098c1a-f86e-11da-bd1a-00112444be1e")).toBe(true);
    expect(isShareToken("1")).toBe(false);
    expect(isShareToken("INV-0001")).toBe(false);
    expect(isShareToken("")).toBe(false);
    expect(isShareToken(null)).toBe(false);
    expect(isShareToken("a8098c1a-f86e-11da-bd1a-00112444be1")).toBe(false);
  });
});

describe("rowToShareState", () => {
  it("reads the link state and treats missing columns as unavailable", () => {
    expect(
      rowToShareState({
        share_token: "a8098c1a-f86e-11da-bd1a-00112444be1e",
        sharing_enabled: true,
      }),
    ).toEqual({ token: "a8098c1a-f86e-11da-bd1a-00112444be1e", enabled: true });
    expect(rowToShareState({ share_token: null, sharing_enabled: false })).toEqual({
      token: null,
      enabled: false,
    });
    expect(rowToShareState({})).toEqual({ token: null, enabled: false });
  });
});

describe("rowToSharedInvoice", () => {
  const data = {
    number: "INV-0001",
    issueDate: "2026-10-02",
    currency: "USD",
    locale: "en-US",
    sender: { name: "Lumen Studio" },
    recipient: { name: "Harbor & Pine" },
    items: [{ id: "1", name: "Design", quantity: 1, unitPrice: 100 }],
    template: "classic",
  };

  it("returns the document and drops everything else", () => {
    const shared = rowToSharedInvoice({
      number: "INV-0001",
      data,
      // Even if the query leaked these, they must not reach the page.
      user_id: "some-user",
      id: "some-internal-id",
    } as never);
    expect(shared?.number).toBe("INV-0001");
    expect(shared?.data).toEqual(data);
    expect(shared).not.toHaveProperty("user_id");
    expect(shared).not.toHaveProperty("id");
  });

  it("returns null for missing or item-less documents", () => {
    expect(rowToSharedInvoice({ number: "x", data: null })).toBeNull();
    expect(rowToSharedInvoice({ number: "x", data: { ...data, items: "nope" } })).toBeNull();
  });
});

describe("isShareRpcMissing", () => {
  it("detects a missing RPC so the reader can fall back, and nothing else", () => {
    expect(isShareRpcMissing({ code: "PGRST202", message: "Could not find the function" })).toBe(
      true,
    );
    expect(isShareRpcMissing({ code: "42883", message: "function does not exist" })).toBe(true);
    expect(
      isShareRpcMissing({ message: "Could not find the function public.get_shared_invoice" }),
    ).toBe(true);
    expect(isShareRpcMissing({ code: "42501", message: "permission denied" })).toBe(false);
    expect(isShareRpcMissing({ code: "XX000", message: "connection failed" })).toBe(false);
    expect(isShareRpcMissing(null)).toBe(false);
  });
});

describe("sortInvoices", () => {
  const invoices = [
    summary({
      id: "a",
      total: 300,
      createdAt: "2026-09-01T09:00:00Z",
      updatedAt: "2026-09-05T09:00:00Z",
    }),
    summary({
      id: "b",
      total: 100,
      createdAt: "2026-10-01T09:00:00Z",
      updatedAt: "2026-10-02T09:00:00Z",
    }),
    summary({
      id: "c",
      total: 200,
      createdAt: "2026-08-01T09:00:00Z",
      updatedAt: "2026-10-03T09:00:00Z",
    }),
  ];

  it("orders every supported way without mutating the input", () => {
    expect(sortInvoices(invoices, "updated").map((i) => i.id)).toEqual(["c", "b", "a"]);
    expect(sortInvoices(invoices, "newest").map((i) => i.id)).toEqual(["b", "a", "c"]);
    expect(sortInvoices(invoices, "oldest").map((i) => i.id)).toEqual(["c", "a", "b"]);
    expect(sortInvoices(invoices, "highest").map((i) => i.id)).toEqual(["a", "c", "b"]);
    expect(sortInvoices(invoices, "lowest").map((i) => i.id)).toEqual(["b", "c", "a"]);
    expect(invoices.map((i) => i.id)).toEqual(["a", "b", "c"]);
  });

  it("accepts only known sort ids", () => {
    expect(isInvoiceSort("highest")).toBe(true);
    expect(isInvoiceSort("random")).toBe(false);
    expect(isInvoiceSort(null)).toBe(false);
  });
});

describe("partitionArchived", () => {
  it("splits the working view from the recoverable archive", () => {
    const { active, archived } = partitionArchived([
      summary({ id: "1" }),
      summary({ id: "2", archived: true }),
      summary({ id: "3", archived: true }),
    ]);
    expect(active.map((i) => i.id)).toEqual(["1"]);
    expect(archived.map((i) => i.id)).toEqual(["2", "3"]);
  });
});
