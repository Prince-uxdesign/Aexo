"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Drawer, IconButton, buttonStyles, iconSize, iconStroke } from "@/components/ui";
import { routes } from "@/config/routes";
import { AuthLink } from "@/components/layout/auth-link";
import { marketingNav } from "./nav-items";

const MENU_ID = "site-menu";

/** Menu button and full-screen (phone) / side panel (tablet) navigation. */
export function MobileNav({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <IconButton
        label="Open menu"
        icon={<Menu size={iconSize.md} strokeWidth={iconStroke} />}
        aria-expanded={open}
        aria-controls={MENU_ID}
        onClick={() => setOpen(true)}
        className={className}
      />

      <Drawer open={open} onClose={close} label="Menu">
        <div id={MENU_ID} className="flex min-h-full flex-1 flex-col">
          {/* Mirrors the site header so opening the menu doesn't shift the logo or button. */}
          <div className="flex h-header shrink-0 items-center justify-between border-b border-border px-gutter sm:px-6">
            <Logo />
            <IconButton
              label="Close menu"
              icon={<X size={iconSize.md} strokeWidth={iconStroke} />}
              onClick={close}
              className="-mr-2"
            />
          </div>

          <nav aria-label="Main" className="px-gutter pt-4 sm:px-6">
            <ul className="flex flex-col">
              {marketingNav.map((item) => (
                <li key={item.href} className="border-b border-border">
                  <Link
                    href={item.href}
                    onClick={close}
                    className="flex min-h-14 items-center justify-between gap-4 text-body-lg text-ink"
                  >
                    {item.label}
                    <ArrowRight
                      size={iconSize.md}
                      strokeWidth={iconStroke}
                      className="text-muted-soft"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto flex flex-col gap-3 px-gutter pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6">
            <Link
              href={routes.createInvoice}
              onClick={close}
              className={buttonStyles({ size: "lg", fullWidth: true })}
            >
              Create an Invoice
            </Link>
            <AuthLink variant="secondary" size="lg" fullWidth onClick={close} />
          </div>
        </div>
      </Drawer>
    </>
  );
}
