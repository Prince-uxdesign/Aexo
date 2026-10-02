import { describe, expect, it } from "vitest";
import { getTemplate, templates } from "./index";
import type { TemplateId } from "../model/types";

const ids: TemplateId[] = ["classic", "modern", "accent", "compact"];

describe("templates", () => {
  it("resolves every template id to a distinct named template", () => {
    const names = ids.map((id) => getTemplate(id).name);
    expect(new Set(names).size).toBe(ids.length);
    for (const name of names) expect(name.length).toBeGreaterThan(0);
  });

  it("falls back to Classic for unknown ids", () => {
    expect(getTemplate("nope" as TemplateId).id).toBe("classic");
  });

  it("offers the four templates in a stable order", () => {
    expect(templates.map((t) => t.id)).toEqual(ids);
  });
});
