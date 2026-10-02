import { Container } from "@/components/layout/container";
import { Logo } from "@/components/brand/logo";

/** Public chrome for shared invoices: brand only, no account UI of any kind. */
export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="border-b border-border bg-canvas print:hidden">
        <Container className="flex h-header items-center">
          <Logo />
        </Container>
      </header>
      {children}
    </>
  );
}
