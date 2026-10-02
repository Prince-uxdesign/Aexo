"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { Menu, MenuItem, MenuLabel, MenuSeparator, iconSize, iconStroke } from "@/components/ui";
import { routes } from "@/config/routes";
import { signOut } from "@/lib/auth/actions";

function initials(name: string | null, email: string) {
  const source = name?.trim() || email;
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (name ? (parts[1]?.[0] ?? "") : "")).toUpperCase() || "A";
}

/** Avatar button with the account menu (dropdown on desktop, sheet on phones). */
export function AccountMenu({ name, email }: { name: string | null; email: string }) {
  const router = useRouter();
  const [signingOut, startSignOut] = useTransition();

  return (
    <Menu
      label="Account"
      align="end"
      trigger={
        <button
          type="button"
          aria-label={`Account menu for ${name || email}`}
          className="flex size-11 items-center justify-center rounded-pill border border-border-strong bg-surface-alt text-label text-ink transition-colors duration-150 hover:bg-border"
        >
          {initials(name, email)}
        </button>
      }
    >
      <MenuLabel>
        <span className="block truncate text-label text-ink">{name || "Your account"}</span>
        <span className="block truncate">{email}</span>
      </MenuLabel>
      <MenuSeparator />
      <MenuItem
        icon={<LayoutDashboard size={iconSize.md} strokeWidth={iconStroke} />}
        onSelect={() => router.push(routes.dashboard)}
      >
        Dashboard
      </MenuItem>
      <MenuItem
        icon={<UserRound size={iconSize.md} strokeWidth={iconStroke} />}
        onSelect={() => router.push(routes.account)}
      >
        Account
      </MenuItem>
      <MenuItem
        icon={<LogOut size={iconSize.md} strokeWidth={iconStroke} />}
        disabled={signingOut}
        onSelect={() => startSignOut(() => signOut())}
      >
        {signingOut ? "Signing out…" : "Sign out"}
      </MenuItem>
    </Menu>
  );
}
