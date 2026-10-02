import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { buttonStyles, EmptyState, iconSize, iconStroke } from "@/components/ui";
import { routes } from "@/config/routes";

export default function NotFound() {
  return (
    <main id="main" className="flex flex-1 items-center justify-center px-gutter">
      <EmptyState
        titleAs="h1"
        icon={<FileQuestion size={iconSize.lg} strokeWidth={iconStroke} />}
        title="Page not found"
        description="The link may be broken, or the page may have moved."
        action={
          <Link href={routes.home} className={buttonStyles()}>
            Go to Aexo
          </Link>
        }
      />
    </main>
  );
}
