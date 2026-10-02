"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button, FieldError, IconButton, iconSize, iconStroke } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { LOGO_ACCEPTED_TYPES, formatAcceptHint, processLogoFile } from "../../assets/logo";
import { useFormActions, useFormValue } from "../form-context";

/**
 * Logo picker: click or drop an image. The image is validated, downscaled in
 * the browser and kept with the invoice as a data URL, so the live preview,
 * drafts, saved invoices, shared links and future PDF/print output all see it.
 */
export function LogoField() {
  const logo = useFormValue((v) => v.logo);
  const { update } = useFormActions();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const labelId = useId();
  const hintId = useId();
  const errorId = useId();

  const readFile = (file: File | undefined) => {
    if (!file || processing) return;
    setProcessing(true);
    processLogoFile(file).then(
      (asset) => {
        setError(null);
        update({ logo: asset });
        setProcessing(false);
      },
      (failure: unknown) => {
        setError(failure instanceof Error ? failure.message : "Try another image.");
        setProcessing(false);
      },
    );
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    readFile(event.dataTransfer.files[0]);
  };

  return (
    <div
      role="group"
      aria-labelledby={labelId}
      aria-describedby={[hintId, error ? errorId : null].filter(Boolean).join(" ")}
      className="flex flex-col gap-2"
    >
      <p id={labelId} className="text-label text-ink">
        Logo <span className="font-normal text-muted">(optional)</span>
      </p>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-wrap items-center gap-x-4 gap-y-3 rounded-md border border-dashed p-3",
          "transition-colors duration-150 ease-standard",
          dragging ? "border-ink bg-surface-alt" : "border-border-strong",
          error && "border-error",
        )}
      >
        <div className="flex min-w-0 flex-1 basis-48 items-center gap-3">
          <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border bg-paper">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element -- local data URL preview
              <img src={logo.src} alt="" className="size-full object-contain p-1" />
            ) : (
              <ImagePlus size={iconSize.md} strokeWidth={iconStroke} className="text-muted-soft" />
            )}
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="truncate text-label text-ink">{logo ? logo.fileName : "Add your logo"}</p>
            <p id={hintId} className="text-caption text-muted">
              {logo
                ? "Shown at the top of your invoice."
                : `${formatAcceptHint()}, up to 8 MB. Drop it here or upload.`}
            </p>
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <Button
            variant="secondary"
            size="sm"
            loading={processing}
            onClick={() => inputRef.current?.click()}
          >
            {logo ? "Replace" : "Upload"}
          </Button>
          {logo ? (
            <IconButton
              label="Remove logo"
              variant="destructive"
              icon={<Trash2 size={iconSize.md} strokeWidth={iconStroke} />}
              onClick={() => {
                setError(null);
                update({ logo: null });
              }}
            />
          ) : null}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={LOGO_ACCEPTED_TYPES.join(",")}
          tabIndex={-1}
          aria-hidden
          className="sr-only"
          onChange={(event) => {
            readFile(event.target.files?.[0]);
            // Allow choosing the same file again after removing it.
            event.target.value = "";
          }}
        />
      </div>

      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}
