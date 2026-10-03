"use client";

import { useLayoutEffect } from "react";
import { REDUCED_MOTION } from "./motion";

/*
 * Drives the landing page's scroll motion (see "Landing page scroll motion"
 * in globals.css). Sections stay Server Components and only carry data
 * attributes; this one component watches them all:
 *
 * - `[data-reveal]` gets `data-revealed` the first time it scrolls into view.
 * - `[data-scene]` gets `--p` (0 → 1) while it is near the viewport:
 *   "through" (default) over its whole pass, "enter" from entering at the
 *   bottom until its top reaches 40% of the screen, "exit" from the top of the
 *   page until it has scrolled away (the hero).
 *
 * Nodes added later (e.g. switching tabs) are picked up by a MutationObserver.
 */

const clamp = (value: number) => Math.min(1, Math.max(0, value));

function progress(el: HTMLElement, viewport: number) {
  const rect = el.getBoundingClientRect();
  switch (el.dataset.scene) {
    case "exit":
      return clamp(-rect.top / rect.height);
    case "enter":
      return clamp((viewport - rect.top) / (viewport * 0.6));
    default:
      return clamp((viewport - rect.top) / (viewport + rect.height));
  }
}

export function ScrollMotion() {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-motion-root]");
    if (!root) return;
    if (window.matchMedia(REDUCED_MOTION).matches) {
      delete root.dataset.motion;
      return;
    }
    // Client-side navigations don't run the boot script, so set it here too.
    root.dataset.motion = "";

    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "");
          reveal.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
    );

    const active = new Set<HTMLElement>();
    let frame = 0;
    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      for (const el of active) el.style.setProperty("--p", progress(el, viewport).toFixed(4));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const scenes = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) active.add(el);
          else active.delete(el);
        }
        schedule();
      },
      { rootMargin: "25% 0px" },
    );

    const track = (node: Element) => {
      if (node.matches("[data-reveal]:not([data-revealed])")) reveal.observe(node);
      if (node.matches("[data-scene]")) scenes.observe(node);
      node
        .querySelectorAll("[data-reveal]:not([data-revealed])")
        .forEach((el) => reveal.observe(el));
      node.querySelectorAll("[data-scene]").forEach((el) => scenes.observe(el));
    };
    track(root);

    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (node instanceof Element) track(node);
        });
      }
    });
    mutations.observe(root, { childList: true, subtree: true });

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      reveal.disconnect();
      scenes.disconnect();
      mutations.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
      delete root.dataset.motion;
    };
  }, []);

  return null;
}
