import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "video[controls]",
  "[contenteditable]:not([contenteditable='false'])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function getFocusableElements(container) {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute("disabled") && el.getClientRects().length > 0
  );
}

/**
 * Traps keyboard focus inside a modal while it is open and optionally
 * closes it on Escape.
 *
 * @param {object} containerRef      ref attached to the dialog element (needs tabIndex={-1})
 * @param {object} [options]
 * @param {Function} [options.onEscape] called when Escape is pressed; omit to ignore Escape
 * @param {boolean} [options.active]   set to false to disable the trap (e.g. modal not open)
 */
export default function useFocusTrap(containerRef, { onEscape, active = true } = {}) {
  // Keep the latest handler without re-running the effect on every render.
  const onEscapeRef = useRef(onEscape);

  useEffect(() => {
    onEscapeRef.current = onEscape;
  });

  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = document.activeElement;

    // Move focus into the dialog unless something inside already has it
    // (e.g. an input using autoFocus).
    if (!container.contains(previouslyFocused)) {
      const [first] = getFocusableElements(container);
      (first || container).focus();
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (typeof onEscapeRef.current !== "function") return;
        event.preventDefault();
        onEscapeRef.current(event);
        return;
      }

      if (event.key !== "Tab") return;

      const items = getFocusableElements(container);
      if (items.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const activeEl = document.activeElement;

      if (!container.contains(activeEl)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }

      if (event.shiftKey && (activeEl === first || activeEl === container)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeEl === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      // Return focus to whatever opened the modal.
      if (
        previouslyFocused &&
        previouslyFocused !== document.body &&
        document.contains(previouslyFocused) &&
        typeof previouslyFocused.focus === "function"
      ) {
        previouslyFocused.focus();
      }
    };
  }, [containerRef, active]);
}
