"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { iconSize, iconStroke } from "./icon";
import { IconButton } from "./icon-button";
import { Input, type InputProps } from "./input";

/** Input props minus `type` and `trailing` (the show/hide toggle sits there). */
export type PasswordInputProps = Omit<InputProps, "type" | "trailing">;

/**
 * Password field with a show/hide toggle, which matters most on phones where
 * typos are common. Pass `autoComplete="current-password"` on sign-in and
 * `"new-password"` on sign-up and reset, so password managers do the right thing.
 */
export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        className={cn("pr-13", className)}
      />
      <IconButton
        label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        icon={
          visible ? (
            <EyeOff size={iconSize.md} strokeWidth={iconStroke} />
          ) : (
            <Eye size={iconSize.md} strokeWidth={iconStroke} />
          )
        }
        size="sm"
        onClick={() => setVisible((value) => !value)}
        className="absolute top-1/2 right-1.5 -translate-y-1/2 text-muted hover:text-ink pointer-coarse:right-0.5 pointer-coarse:size-11"
      />
    </div>
  );
}
