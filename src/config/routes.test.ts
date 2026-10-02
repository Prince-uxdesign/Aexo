import { describe, expect, it } from "vitest";
import { routes } from "./routes";

describe("routes", () => {
  it("builds invoice deep links with encoding", () => {
    expect(routes.invoice("abc-123")).toBe("/invoices/abc-123");
    expect(routes.invoiceEdit("abc-123")).toBe("/invoices/abc-123/edit");
    expect(routes.invoicePrint("abc-123")).toBe("/invoices/abc-123/print");
    expect(routes.invoice("a/b")).toBe("/invoices/a%2Fb");
    expect(routes.sharedInvoice("token-1")).toBe("/i/token-1");
  });
});
