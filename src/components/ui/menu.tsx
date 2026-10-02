"use client";

import {
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils/cn";

type MenuContextValue = { close: () => void };
const MenuContext = createContext<MenuContextValue | null>(null);

type TriggerProps = {
  id?: string;
  popoverTarget?: string;
  "aria-haspopup"?: "menu";
  "aria-controls"?: string;
  "aria-expanded"?: boolean;
};

export type MenuProps = {
  /** The button that opens the menu, e.g. an IconButton or Button. */
  trigger: ReactElement<TriggerProps>;
  /** Accessible name. Also shown as the sheet title on phones. */
  label: string;
  /** Desktop alignment relative to the trigger. */
  align?: "start" | "end";
  children: ReactNode;
  className?: string;
};

const ITEM_SELECTOR = '[role="menuitem"]:not([aria-disabled="true"])';
// Below this space the menu opens upwards (it scrolls if it still doesn't fit).
const MIN_SPACE_BELOW = 240;
const OFFSET = 8;

/**
 * Action menu ("More actions" on an invoice).
 *
 * - From 640px: a dropdown anchored to the trigger. It flips up near the bottom
 *   of the screen and stays inside the viewport.
 * - Below 640px: a bottom sheet with large touch targets and a dimmed backdrop.
 *
 * Built on the native popover API: outside click, Escape, top-layer stacking and
 * returning focus to the trigger come from the browser. Arrow keys, Home/End
 * and type-ahead move between items.
 */
export function Menu({ trigger, label, align = "start", children, className }: MenuProps) {
  const baseId = useId();
  const menuId = `menu-${baseId}`;
  const triggerId = trigger.props.id ?? `menu-trigger-${baseId}`;
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    // Position before the menu becomes visible, so it never flashes in the wrong place.
    const onBeforeToggle = (event: Event) => {
      if ((event as ToggleEvent).newState !== "open") return;
      const anchor = document.getElementById(triggerId)?.getBoundingClientRect();
      if (!anchor) return;
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      const spaceBelow = vh - anchor.bottom;
      const openUp = spaceBelow < MIN_SPACE_BELOW && anchor.top > spaceBelow;

      menu.style.setProperty("--menu-top", openUp ? "auto" : `${anchor.bottom + OFFSET}px`);
      menu.style.setProperty("--menu-bottom", openUp ? `${vh - anchor.top + OFFSET}px` : "auto");
      menu.style.setProperty("--menu-left", align === "start" ? `${anchor.left}px` : "auto");
      menu.style.setProperty("--menu-right", align === "end" ? `${vw - anchor.right}px` : "auto");
      menu.style.setProperty(
        "--menu-max-height",
        `${(openUp ? anchor.top : spaceBelow) - OFFSET * 2}px`,
      );
    };

    const onToggle = (event: Event) => {
      if ((event as ToggleEvent).newState === "open") {
        menu.querySelector<HTMLElement>(ITEM_SELECTOR)?.focus();
      }
      document
        .getElementById(triggerId)
        ?.setAttribute("aria-expanded", String((event as ToggleEvent).newState === "open"));
    };

    menu.addEventListener("beforetoggle", onBeforeToggle);
    menu.addEventListener("toggle", onToggle);
    return () => {
      menu.removeEventListener("beforetoggle", onBeforeToggle);
      menu.removeEventListener("toggle", onToggle);
    };
  }, [align, triggerId]);

  const close = () => menuRef.current?.hidePopover();

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = [...(menuRef.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? [])];
    if (!items.length) return;
    const index = items.indexOf(document.activeElement as HTMLElement);
    const focus = (i: number) => items[(i + items.length) % items.length]?.focus();

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focus(index + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focus(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focus(0);
        break;
      case "End":
        event.preventDefault();
        focus(items.length - 1);
        break;
      case "Tab":
        // Menus aren't part of the tab order: Tab closes and moves on.
        close();
        break;
      default:
        if (event.key.length === 1 && /\S/.test(event.key)) {
          const key = event.key.toLowerCase();
          const ordered = [...items.slice(index + 1), ...items.slice(0, index + 1)];
          ordered.find((item) => item.textContent?.trim().toLowerCase().startsWith(key))?.focus();
        }
    }
  };

  return (
    <MenuContext.Provider value={{ close }}>
      {cloneElement(trigger, {
        id: triggerId,
        popoverTarget: menuId,
        "aria-haspopup": "menu",
        "aria-controls": menuId,
        // Initial value only; the toggle listener keeps it in sync after that.
        "aria-expanded": false,
      })}
      <div
        ref={menuRef}
        id={menuId}
        popover="auto"
        data-sheet=""
        role="menu"
        aria-label={label}
        onKeyDown={onKeyDown}
        className={cn(
          "fixed w-full bg-surface text-foreground",
          "opacity-0 transition-[opacity,translate,overlay,display] transition-discrete duration-150 ease-standard",
          "open:translate-y-0 open:opacity-100 starting:open:opacity-0",
          // Phone: bottom sheet
          "inset-x-0 top-auto bottom-0 max-h-[80dvh] translate-y-4 overflow-y-auto rounded-t-xl px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-elevated starting:open:translate-y-4",
          // From 640px: anchored dropdown
          "sm:top-(--menu-top) sm:right-(--menu-right) sm:bottom-(--menu-bottom) sm:left-(--menu-left)",
          "sm:max-h-(--menu-max-height) sm:w-max sm:max-w-[min(20rem,calc(100vw-1rem))] sm:min-w-56",
          "sm:-translate-y-1 sm:rounded-md sm:border sm:border-border sm:p-1.5 sm:pb-1.5 sm:open:translate-y-0 sm:starting:open:-translate-y-1",
          className,
        )}
      >
        {/* Sheet title on phones; the dropdown is labelled by aria-label only. */}
        <p aria-hidden className="px-3 pt-2 pb-3 text-label text-muted sm:hidden">
          {label}
        </p>
        {children}
      </div>
    </MenuContext.Provider>
  );
}

type MenuItemProps = {
  children: ReactNode;
  onSelect?: () => void;
  icon?: ReactNode;
  /** Right-aligned hint, e.g. a keyboard shortcut. Hidden on phones. */
  shortcut?: string;
  destructive?: boolean;
  disabled?: boolean;
};

export function MenuItem({
  children,
  onSelect,
  icon,
  shortcut,
  destructive = false,
  disabled = false,
}: MenuItemProps) {
  const menu = useContext(MenuContext);

  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      onClick={() => {
        if (disabled) return;
        menu?.close();
        onSelect?.();
      }}
      onPointerMove={(event) => {
        // Hover moves focus, so mouse and keyboard highlight the same item.
        if (event.pointerType === "mouse" && !disabled) event.currentTarget.focus();
      }}
      className={cn(
        "flex w-full items-center gap-3 rounded-sm px-3 text-left outline-none",
        "min-h-12 text-body sm:min-h-10 sm:text-label sm:font-normal sm:pointer-coarse:min-h-11",
        "focus:bg-surface-alt active:bg-border",
        "[&>svg]:shrink-0",
        destructive ? "text-error-strong [&>svg]:text-error-strong" : "[&>svg]:text-muted",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      {icon}
      <span className="min-w-0 flex-1 break-words">{children}</span>
      {shortcut ? (
        <kbd className="hidden font-sans text-caption text-muted sm:inline">{shortcut}</kbd>
      ) : null}
    </button>
  );
}

export function MenuSeparator() {
  return <div role="separator" className="mx-3 my-1.5 h-px bg-border sm:mx-1.5" />;
}

/** Non-interactive heading for a group of items. */
export function MenuLabel({ children }: { children: ReactNode }) {
  return (
    <div role="presentation" className="px-3 pt-2 pb-1 text-caption text-muted">
      {children}
    </div>
  );
}
