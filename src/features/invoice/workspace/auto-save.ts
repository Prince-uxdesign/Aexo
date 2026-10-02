/**
 * PHASE 11 — Debounced background saving, framework-free so it unit-tests in
 * Node without React or the DOM.
 *
 * Contract: the caller notifies on every edit (`notifyDirty`) and provides an
 * async `save`. The saver waits `delayMs` of quiet before saving (no save per
 * keystroke), runs one save at a time, re-runs once if edits landed
 * mid-flight, and fires immediately on `flush()` (tab hidden, back online).
 * Errors propagate to the caller's save wrapper, which reports them subtly.
 */

export type AutoSaveFn = () => Promise<unknown>;

export type AutoSaver = {
  /** An edit happened: (re)start the quiet window. Cheap to call per keystroke. */
  notifyDirty: () => void;
  /** Save right now if a save is scheduled or overdue. Used on hide/reconnect. */
  flush: () => void;
  /** Clear timers. In-flight saves still settle; their result is ignored. */
  dispose: () => void;
};

export function createAutoSaver({
  delayMs,
  save,
  onSettled,
}: {
  delayMs: number;
  save: AutoSaveFn;
  /** Runs after every save attempt so the caller can report Saving/Saved/Unable. */
  onSettled?: (ok: boolean) => void;
}): AutoSaver {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let inFlight = false;
  let pending = false;
  let disposed = false;

  const clearTimer = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const run = () => {
    timer = null;
    if (disposed || inFlight) {
      // Edits during a save are picked up right after it settles.
      if (!disposed && inFlight) pending = true;
      return;
    }
    inFlight = true;
    void save().then(
      () => {
        inFlight = false;
        onSettled?.(true);
        if (disposed) return;
        if (pending) {
          pending = false;
          timer = setTimeout(run, delayMs);
        }
      },
      () => {
        inFlight = false;
        onSettled?.(false);
        if (disposed) return;
        if (pending) {
          pending = false;
          timer = setTimeout(run, delayMs);
        }
      },
    );
  };

  return {
    notifyDirty() {
      if (disposed) return;
      if (inFlight) {
        pending = true;
        return;
      }
      clearTimer();
      timer = setTimeout(run, delayMs);
    },
    flush() {
      if (disposed || timer === null) return;
      run();
    },
    dispose() {
      disposed = true;
      clearTimer();
    },
  };
}
