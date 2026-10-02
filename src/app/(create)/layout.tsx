import { CreatorHeader } from "./_components/creator-header";

/** Invoice creation. Public: no account needed to create an invoice (guide §16). */
export default function CreateLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <CreatorHeader />
      {children}
    </>
  );
}
