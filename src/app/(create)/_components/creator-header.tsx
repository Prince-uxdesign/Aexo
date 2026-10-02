import { Logo } from "@/components/brand/logo";
import { AuthLink } from "@/components/layout/auth-link";
import { Container } from "@/components/layout/container";

/**
 * Header for the invoice creator (guide §14: 64px, canvas). Deliberately quiet:
 * the work is the form. It sticks from 1024px, where the preview sticks beside
 * it; on phones and tablets it scrolls away to give the form the screen.
 */
export function CreatorHeader() {
  return (
    <header className="border-b border-border bg-canvas lg:sticky lg:top-0 lg:z-40">
      <Container className="flex h-header items-center gap-3">
        <Logo />
        <div className="ml-auto flex items-center gap-2">
          <AuthLink />
        </div>
      </Container>
    </header>
  );
}
