"use client";

import type { ReactNode } from "react";
import { Field } from "@/components/ui";
import { useFieldError, useFormActions } from "./form-context";

type FormFieldProps = {
  /** Validation path, e.g. "sender.email". */
  path: string;
  label: ReactNode;
  hint?: ReactNode;
  required?: boolean;
  id?: string;
  className?: string;
  children: ReactNode;
};

/**
 * <Field> connected to the invoice form: shows this field's error once the
 * person has left it (or tried to finish), never while they're still typing
 * their first attempt (CONVENTIONS: validate on blur or submit).
 */
export function FormField({ path, children, ...fieldProps }: FormFieldProps) {
  const error = useFieldError(path);
  const { touch } = useFormActions();

  return (
    // `contents` keeps the Field as the grid item while catching blur from any control inside.
    <div className="contents" onBlur={() => touch(path)}>
      <Field {...fieldProps} error={error}>
        {children}
      </Field>
    </div>
  );
}
