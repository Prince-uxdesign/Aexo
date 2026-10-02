import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { Divider } from "@/components/ui";
import { ActionsDemo } from "./_components/actions-demo";
import { DisplayDemo } from "./_components/display-demo";
import { FormsDemo } from "./_components/forms-demo";
import { OverlaysDemo } from "./_components/overlays-demo";
import { Section } from "./_components/section";
import { StatesDemo } from "./_components/states-demo";
import { SaveGateDemo } from "./_components/save-gate-demo";
import { TemplatesDemo } from "./_components/templates-demo";
import { ColorTokens, RadiusAndShadow, TypeScale } from "./_components/token-swatches";

export const metadata: Metadata = { title: "Design system" };

const sections = [
  { id: "color", title: "Color", content: <ColorTokens /> },
  { id: "type", title: "Typography", content: <TypeScale /> },
  { id: "shape", title: "Radius & elevation", content: <RadiusAndShadow /> },
  { id: "actions", title: "Actions", content: <ActionsDemo /> },
  { id: "forms", title: "Forms", content: <FormsDemo /> },
  { id: "overlays", title: "Menus, dialogs & toasts", content: <OverlaysDemo /> },
  { id: "display", title: "Display", content: <DisplayDemo /> },
  { id: "states", title: "Loading, empty & error", content: <StatesDemo /> },
  { id: "templates", title: "Invoice templates", content: <TemplatesDemo /> },
  { id: "save-gate", title: "Saving without an account", content: <SaveGateDemo /> },
];

/**
 * Development-only reference for tokens and components. Use it to check
 * responsive behaviour and component states. Returns 404 in production builds.
 */
export default function FoundationPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main id="main" className="py-section">
      <Container className="flex flex-col gap-12 lg:gap-16">
        <header className="flex max-w-reading flex-col gap-3">
          <p className="text-label text-muted">Phase 1 · Development only</p>
          <h1 className="text-display text-ink">Design system</h1>
          <p className="text-body-lg text-muted">
            Tokens and components from the Aexo design guide. Every product screen is built from
            these.
          </p>
        </header>

        {sections.map((section, index) => (
          <div key={section.id} className="flex flex-col gap-12 lg:gap-16">
            {index > 0 ? <Divider /> : null}
            <Section title={section.title}>{section.content}</Section>
          </div>
        ))}
      </Container>
    </main>
  );
}
