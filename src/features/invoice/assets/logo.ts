/**
 * PHASE 10 — Invoice visual assets: the home for logo (and later asset)
 * handling, so future features extend this instead of restructuring the app.
 *
 * Pipeline: validate → decode → downscale → data URL. The logo keeps
 * travelling with the invoice data (existing architecture: drafts on this
 * device, saved rows in the database) — no parallel storage mechanism.
 * Downscaling keeps those payloads small: a phone photo becomes a <200 KB
 * PNG instead of a multi-MB quota failure.
 *
 * Pure where possible: `validateLogoFile` is unit-tested. The canvas steps
 * need a browser and stay in `processLogoFile`.
 */

export const LOGO_ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
] as const;

/** Read cap: anything bigger is almost certainly not a logo. */
export const LOGO_MAX_INPUT_BYTES = 8 * 1024 * 1024;

/** Longest side of the stored image. 640px is plenty for a 40-unit document logo. */
export const LOGO_MAX_DIMENSION = 640;

/** Stored payload cap: keeps device drafts and database rows small. */
export const LOGO_MAX_OUTPUT_BYTES = 512 * 1024;

export type LogoAsset = {
  /** PNG data URL (transparency preserved), ready for invoice data. */
  src: string;
  fileName: string;
};

export function formatAcceptHint(): string {
  return "PNG, JPG, SVG or WebP";
}

/**
 * Human-readable problem with a file, or null when it can be processed.
 * Takes a narrow shape (not File) so it runs in unit tests.
 */
export function validateLogoFile(file: { type: string; size: number }): string | null {
  if (!(LOGO_ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
    return `Use a ${formatAcceptHint()} image.`;
  }
  if (file.size <= 0) {
    return "That file looks empty. Try another image.";
  }
  if (file.size > LOGO_MAX_INPUT_BYTES) {
    return "That image is over 8 MB. Try a smaller version of your logo.";
  }
  return null;
}

function loadImage(objectUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("decode"));
    image.src = objectUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // PNG keeps logo transparency (JPEG would flatten it onto black/white).
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("encode"))), "image/png");
  });
}

function readAsDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read"));
    reader.readAsDataURL(blob);
  });
}

/**
 * Validate, decode and downscale an uploaded logo. Rejects with a
 * human-readable message for every failure (bad type, corrupt file,
 * oversized output) — the caller shows it as-is.
 */
export async function processLogoFile(file: File): Promise<LogoAsset> {
  const invalid = validateLogoFile(file);
  if (invalid) throw new Error(invalid);

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl).catch(() => {
      throw new Error("We couldn't read that image. Try another file.");
    });
    const { naturalWidth: width, naturalHeight: height } = image;
    if (!width || !height) throw new Error("We couldn't read that image. Try another file.");

    const scale = Math.min(1, LOGO_MAX_DIMENSION / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser couldn't process that image. Try another one.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await canvasToBlob(canvas).catch(() => {
      throw new Error("We couldn't process that image. Try another file.");
    });
    if (blob.size > LOGO_MAX_OUTPUT_BYTES) {
      throw new Error("That logo is still over 512 KB after resizing. Try a simpler image.");
    }
    const src = await readAsDataURL(blob);
    return { src, fileName: file.name };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
