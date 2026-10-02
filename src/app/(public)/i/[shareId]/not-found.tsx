import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { buttonStyles, EmptyState, iconSize, iconStroke } from "@/components/ui";
import { routes } from "@/config/routes";

/** Invalid, disabled, deleted or never-shared links all land here. */
export default function SharedInvoiceNotFound() {
  return (
    <main id="main" className="flex flex-1 items-center justify-center px-gutter py-12">
      <EmptyState
        titleAs="h1"
        icon={<FileQuestion size={iconSize.lg} strokeWidth={iconStroke} />}
        title="This invoice link doesn't work"
        description="The link may be mistyped, sharing may have been switched off, or the invoice may have been deleted. Ask the sender for a fresh link."
        action={
          <Link href={routes.home} className={buttonStyles()}>
            Go to Aexo
          </Link>
        }
      />
    </main>
  );
}
