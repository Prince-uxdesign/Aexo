import { describe, expect, it } from "vitest";
import {
  buildInvoiceEmailHtml,
  buildInvoiceEmailText,
  defaultEmailMessage,
  defaultEmailSubject,
  escapeHtml,
  isValidEmailAddress,
  validateEmailCompose,
} from "./email";

const facts = {
  number: "INV-0007",
  senderName: "Lumen Studio",
  clientName: "Amara",
  totalFormatted: "$1,250.00",
  dueText: "due on Oct 30, 2026",
};

describe("isValidEmailAddress", () => {
  it("accepts normal addresses and rejects junk", () => {
    expect(isValidEmailAddress("client@example.com")).toBe(true);
    expect(isValidEmailAddress("  client@example.com  ")).toBe(true);
    expect(isValidEmailAddress("")).toBe(false);
    expect(isValidEmailAddress("not-an-email")).toBe(false);
    expect(isValidEmailAddress("a@b")).toBe(false);
    expect(isValidEmailAddress("a b@c.com")).toBe(false);
  });
});

describe("validateEmailCompose", () => {
  const valid = {
    to: "client@example.com",
    clientName: "Amara",
    subject: "Invoice INV-0007 from Lumen Studio",
    message: "Hi!",
  };

  it("passes a complete form", () => {
    expect(validateEmailCompose(valid)).toEqual({});
  });

  it("flags missing and invalid recipients", () => {
    expect(validateEmailCompose({ ...valid, to: "" }).to).toMatch(/email/i);
    expect(validateEmailCompose({ ...valid, to: "nope" }).to).toMatch(/doesn't look right/);
  });

  it("flags missing or overlong subjects and messages", () => {
    expect(validateEmailCompose({ ...valid, subject: "  " }).subject).toMatch(/subject/i);
    expect(validateEmailCompose({ ...valid, subject: "x".repeat(151) }).subject).toMatch(
      /under 150/,
    );
    expect(validateEmailCompose({ ...valid, message: "x".repeat(2001) }).message).toMatch(
      /under 2000/,
    );
  });

  it("allows an empty personal message", () => {
    expect(validateEmailCompose({ ...valid, message: "" })).toEqual({});
  });
});

describe("defaults", () => {
  it("builds a subject from the invoice", () => {
    expect(defaultEmailSubject(facts)).toBe("Invoice INV-0007 from Lumen Studio");
    expect(defaultEmailSubject({ number: "INV-1", senderName: "" })).toBe(
      "Invoice INV-1 from your invoice",
    );
  });

  it("builds a human, non-promotional message", () => {
    const message = defaultEmailMessage(facts);
    expect(message).toContain("Hi Amara,");
    expect(message).toContain("INV-0007");
    expect(message).toContain("$1,250.00");
    expect(message).not.toMatch(/!/);
    expect(message).not.toMatch(/promo|discount|offer|deal/i);
  });
});

describe("email templates", () => {
  const input = {
    message: "Hi Amara,\n\nHere's your invoice.",
    facts,
    viewUrl: "https://example.com/i/token-1",
  };

  it("escapes user content in the HTML email", () => {
    const html = buildInvoiceEmailHtml({
      ...input,
      message: '<script>alert("x")</script>\n\nSecond & "quoted"',
    });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("https://example.com/i/token-1");
    expect(html).toContain("INV-0007");
    expect(html).not.toContain("user_id");
  });

  it("renders the plain-text twin with the link", () => {
    const text = buildInvoiceEmailText(input);
    expect(text).toContain("https://example.com/i/token-1");
    expect(text).toContain("$1,250.00");
  });

  it("escapes quotes and ampersands", () => {
    expect(escapeHtml(`a&b<"c">'d'`)).toBe("a&amp;b&lt;&quot;c&quot;&gt;&#39;d&#39;");
  });
});
