import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAutoSaver } from "./auto-save";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("createAutoSaver", () => {
  it("waits for quiet before saving (no save per keystroke)", async () => {
    const save = vi.fn(async () => {});
    const saver = createAutoSaver({ delayMs: 1500, save });
    saver.notifyDirty();
    await vi.advanceTimersByTimeAsync(500);
    saver.notifyDirty();
    await vi.advanceTimersByTimeAsync(1000);
    expect(save).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(500);
    expect(save).toHaveBeenCalledTimes(1);
    saver.dispose();
  });

  it("flushes a scheduled save immediately", async () => {
    const save = vi.fn(async () => {});
    const saver = createAutoSaver({ delayMs: 10_000, save });
    saver.notifyDirty();
    saver.flush();
    await vi.advanceTimersByTimeAsync(0);
    await Promise.resolve();
    expect(save).toHaveBeenCalledTimes(1);
    saver.dispose();
  });

  it("does nothing when idle, and stops after dispose", async () => {
    const save = vi.fn(async () => {});
    const saver = createAutoSaver({ delayMs: 100, save });
    saver.flush();
    saver.dispose();
    saver.notifyDirty();
    saver.flush();
    await vi.advanceTimersByTimeAsync(10_000);
    expect(save).not.toHaveBeenCalled();
  });

  it("re-runs once for edits that land mid-save", async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const save = vi.fn(() => gate);
    const saver = createAutoSaver({ delayMs: 100, save });
    saver.notifyDirty();
    await vi.advanceTimersByTimeAsync(100);
    expect(save).toHaveBeenCalledTimes(1);
    saver.notifyDirty();
    saver.notifyDirty();
    release();
    await gate;
    await vi.advanceTimersByTimeAsync(100);
    await gate;
    expect(save).toHaveBeenCalledTimes(2);
    saver.dispose();
  });

  it("reports failure through onSettled without unhandled rejections", async () => {
    const settled: boolean[] = [];
    const save = vi.fn(async () => {
      throw new Error("offline");
    });
    const saver = createAutoSaver({ delayMs: 50, save, onSettled: (ok) => settled.push(ok) });
    saver.notifyDirty();
    await vi.advanceTimersByTimeAsync(50);
    await Promise.resolve();
    expect(save).toHaveBeenCalledTimes(1);
    expect(settled).toEqual([false]);
    saver.dispose();
  });

  it("reports success through onSettled", async () => {
    const settled: boolean[] = [];
    const save = vi.fn(async () => {});
    const saver = createAutoSaver({ delayMs: 50, save, onSettled: (ok) => settled.push(ok) });
    saver.notifyDirty();
    await vi.advanceTimersByTimeAsync(50);
    await Promise.resolve();
    expect(settled).toEqual([true]);
    saver.dispose();
  });
});
