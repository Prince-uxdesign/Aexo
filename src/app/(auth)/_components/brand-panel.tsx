import { Logo } from "@/components/brand/logo";
import { InvoiceDocument } from "@/features/invoice/components/invoice-document";
import { sampleInvoice } from "@/features/invoice/model/sample";
import { AccountBenefits } from "./account-benefits";

const heading = "Create a free account to save and manage your invoices.";

/** From 1024px: the left half of the split layout. Stretches with the page, never shorter than the screen. */
export function BrandPanel() {
  return (
    <aside className="hidden min-h-dvh flex-col gap-10 self-stretch overflow-hidden border-r border-border bg-surface-alt p-10 lg:flex xl:p-12">
      <Logo className="self-start" />
      <div className="flex max-w-md flex-col gap-6">
        <p className="text-h1 text-ink">{heading}</p>
        <AccountBenefits />
      </div>
      {/* The page runs off the bottom edge, as in the landing hero. */}
      <div className="mt-auto -mb-24 w-[78%] max-w-md self-end xl:-mb-32">
        <InvoiceDocument
          invoice={sampleInvoice}
          template="modern"
          label="Example saved invoice"
          className="shadow-elevated"
        />
      </div>
    </aside>
  );
}

/**
 * Tablets (640–1023px): the same message as a band above the form, so a tall
 * portrait screen isn't mostly empty. Hidden on phones (the form comes first)
 * and on short landscape screens.
 */
export function BrandBand() {
  return (
    <div className="hidden border-b border-border bg-surface-alt sm:block lg:hidden short:hidden">
      <div className="mx-auto grid max-w-2xl grid-cols-[1fr_auto] items-center gap-8 px-gutter py-10 md:py-12">
        <div className="flex flex-col gap-5">
          <p className="text-h2 text-ink">{heading}</p>
          <AccountBenefits />
        </div>
        <div className="w-36 md:w-44">
          <InvoiceDocument
            invoice={sampleInvoice}
            template="modern"
            aspect="600 / 700"
            label="Example saved invoice"
            className="shadow-elevated"
          />
        </div>
      </div>
    </div>
  );
}
