/**
 * Tap, hold and double tap, the way Home Assistant's own cards read them.
 *
 * The card does not carry out an action itself. It fires `hass-action` with
 * its config and which gesture happened, and Home Assistant looks up
 * `tap_action`, `hold_action` or `double_tap_action` in it — so every action
 * type, `confirmation` and browser_mod's `fire-dom-event` work exactly as they
 * do on a tile card, without this bundle knowing about any of them.
 *
 * `custom-card-helpers` has an action handler too, but it is a directive bound
 * to an old copy of the frontend's types, and a dependency for forty lines.
 */

import type { ActionConfig, ActionsConfig } from "../types";

export type ActionKind = "tap" | "hold" | "double_tap";

export const HOLD_MS = 500;

export const DOUBLE_TAP_MS = 250;

/** A finger that travels this far is scrolling, not pressing. */
const MOVE_TOLERANCE_PX = 10;

/** Whether the config sets any action at all; `none` counts as set. */
export function hasCardActions(config: ActionsConfig | undefined): boolean {
  return Boolean(
    config?.tap_action || config?.hold_action || config?.double_tap_action,
  );
}

/** Set, and something other than `none`. */
export function hasAction(action: ActionConfig | undefined): boolean {
  return action !== undefined && action.action !== "none";
}

/**
 * Whether some gesture on the card leads somewhere. An unset `tap_action`
 * next to a set `hold_action` still does: Home Assistant falls back to
 * more-info for it.
 */
export function isActionable(config: ActionsConfig | undefined): boolean {
  if (!hasCardActions(config)) {
    return false;
  }
  return (
    config!.tap_action === undefined ||
    hasAction(config!.tap_action) ||
    hasAction(config!.hold_action) ||
    hasAction(config!.double_tap_action)
  );
}

/** What is interactive in its own right and keeps its clicks. */
const INTERACTIVE = new Set([
  "A",
  "BUTTON",
  "INPUT",
  "SELECT",
  "TEXTAREA",
  "LABEL",
  "SUMMARY",
  "DETAILS",
  "FORM",
  // The chart answers a touch with its tooltip.
  "WG-CHART",
]);

/**
 * Whether an event started on something that handles it itself, up to the
 * element the gesture listener sits on. `composedPath()` because every
 * section is its own shadow root, so `event.target` is only ever the section.
 */
export function startedOnControl(event: Event, root: EventTarget): boolean {
  for (const node of event.composedPath()) {
    if (node === root) {
      return false;
    }
    if (node instanceof HTMLElement) {
      if (INTERACTIVE.has(node.tagName) || node.isContentEditable) {
        return true;
      }
      const role = node.getAttribute("role");
      if (role === "button" || role === "link" || role === "textbox") {
        return true;
      }
    }
  }
  return false;
}

interface GestureOptions {
  /** Off, every handler is a no-op and the sections keep their own clicks. */
  enabled: () => boolean;
  hold: () => boolean;
  doubleTap: () => boolean;
  fire: (action: ActionKind) => void;
}

/**
 * Pointer and key events on one element, turned into tap, hold and double
 * tap. The handlers are bound in the template of the element they listen on,
 * which is `currentTarget`, so a re-render that replaces it needs no rewiring.
 *
 * Nothing here calls `preventDefault` on a pointer event and the element gets
 * no `touch-action`, so a swipe that starts on the card still scrolls the
 * dashboard. The browser then sends `pointercancel`, which drops the gesture.
 */
export class GestureHandler {
  private _start?: { id: number; x: number; y: number };

  private _held = false;

  private _holdTimer?: ReturnType<typeof setTimeout>;

  private _tapTimer?: ReturnType<typeof setTimeout>;

  public constructor(private readonly _options: GestureOptions) {}

  /** Drops whatever is pending, for a card that leaves the page. */
  public reset(): void {
    this.cancel();
    clearTimeout(this._tapTimer);
    this._tapTimer = undefined;
  }

  public down = (event: PointerEvent): void => {
    if (!this._options.enabled() || !event.isPrimary || event.button !== 0) {
      return;
    }
    if (startedOnControl(event, event.currentTarget as EventTarget)) {
      this.cancel();
      return;
    }
    this._start = { id: event.pointerId, x: event.clientX, y: event.clientY };
    this._held = false;
    clearTimeout(this._holdTimer);
    if (this._options.hold()) {
      this._holdTimer = setTimeout(() => {
        this._held = true;
      }, HOLD_MS);
    }
  };

  public move = (event: PointerEvent): void => {
    const start = this._start;
    if (!start || event.pointerId !== start.id) {
      return;
    }
    if (
      Math.hypot(event.clientX - start.x, event.clientY - start.y) >
      MOVE_TOLERANCE_PX
    ) {
      this.cancel();
    }
  };

  public up = (event: PointerEvent): void => {
    const start = this._start;
    if (!start || event.pointerId !== start.id) {
      return;
    }
    const held = this._held;
    this.cancel();
    if (held) {
      // A hold is the whole gesture: the release that ends it is not a tap.
      this._options.fire("hold");
      return;
    }
    this._tap();
  };

  public cancel = (): void => {
    clearTimeout(this._holdTimer);
    this._holdTimer = undefined;
    this._start = undefined;
    this._held = false;
  };

  /** A long press on touch opens the context menu, which would eat the hold. */
  public contextMenu = (event: Event): void => {
    if (this._start && this._options.hold()) {
      event.preventDefault();
    }
  };

  public key = (event: KeyboardEvent): void => {
    // Only on the card itself: Enter in the weight field saves the weight.
    if (
      !this._options.enabled() ||
      event.composedPath()[0] !== event.currentTarget
    ) {
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      // Space would scroll the page otherwise.
      event.preventDefault();
      this._options.fire("tap");
    }
  };

  private _tap(): void {
    if (!this._options.doubleTap()) {
      this._options.fire("tap");
      return;
    }
    if (this._tapTimer !== undefined) {
      clearTimeout(this._tapTimer);
      this._tapTimer = undefined;
      this._options.fire("double_tap");
      return;
    }
    this._tapTimer = setTimeout(() => {
      this._tapTimer = undefined;
      this._options.fire("tap");
    }, DOUBLE_TAP_MS);
  }
}
