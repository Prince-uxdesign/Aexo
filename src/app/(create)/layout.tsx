import { CreatorHeader } from "./_components/creator-header";

/**
 * Invoice creation. Public: no account needed to create an invoice (guide §16).
 * Cool theme, like the landing page it's reached from and the signed-in
 * editor that shares its workspace.
 */
export default function CreateLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="theme-cool flex flex-1 flex-col bg-canvas">
      <CreatorHeader />
      {children}
    </div>
  );
}
