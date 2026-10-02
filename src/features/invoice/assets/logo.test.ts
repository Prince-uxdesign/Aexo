import { describe, expect, it } from "vitest";
import {
  LOGO_ACCEPTED_TYPES,
  LOGO_MAX_DIMENSION,
  LOGO_MAX_INPUT_BYTES,
  LOGO_MAX_OUTPUT_BYTES,
  validateLogoFile,
} from "./logo";

describe("validateLogoFile", () => {
  it("accepts PNG, JPG, WebP and SVG within the size cap", () => {
    for (const type of LOGO_ACCEPTED_TYPES) {
      expect(validateLogoFile({ type, size: 120_000 })).toBeNull();
    }
  });

  it("rejects anything else with a human message naming the formats", () => {
    const message = validateLogoFile({ type: "image/gif", size: 10_000 });
    expect(message).toMatch(/PNG, JPG, SVG or WebP/);
    expect(validateLogoFile({ type: "application/pdf", size: 10_000 })).not.toBeNull();
    expect(validateLogoFile({ type: "", size: 10_000 })).not.toBeNull();
  });

  it("rejects empty and oversized files", () => {
    expect(validateLogoFile({ type: "image/png", size: 0 })).toMatch(/empty/);
    expect(validateLogoFile({ type: "image/png", size: LOGO_MAX_INPUT_BYTES + 1 })).toMatch(/8 MB/);
    expect(validateLogoFile({ type: "image/png", size: LOGO_MAX_INPUT_BYTES })).toBeNull();
  });
});

describe("logo budgets", () => {
  it("downscales to a document-sensible size and caps stored payloads", () => {
    expect(LOGO_MAX_DIMENSION).toBeLessThanOrEqual(1024);
    // The stored logo must stay far below typical localStorage quotas (~5 MB).
    expect(LOGO_MAX_OUTPUT_BYTES).toBeLessThanOrEqual(1024 * 1024);
  });
});
