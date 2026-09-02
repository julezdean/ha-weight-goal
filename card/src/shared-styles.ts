import { css } from "lit";

/**
 * Bits of CSS every section needs. Everything colour related goes through the
 * Home Assistant theme variables, with a fallback only so the cards stay
 * legible on a theme that does not define one of them.
 */
export const sharedStyles = css`
  :host {
    display: block;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .muted {
    color: var(--secondary-text-color, #727272);
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 14px;
    background: var(--secondary-background-color, #f2f2f2);
    font-size: 12px;
    line-height: 1.4;
    white-space: nowrap;
  }
  .chip ha-icon {
    --mdc-icon-size: 15px;
  }
  button.control {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 44px;
    padding: 0 14px;
    border: none;
    border-radius: 10px;
    background: var(--secondary-background-color, #f2f2f2);
    color: var(--primary-text-color, #212121);
    font: inherit;
    font-size: 14px;
    cursor: pointer;
  }
  button.control.primary {
    background: var(--primary-color, #03a9f4);
    color: var(--text-primary-color, #fff);
  }
  button.control:disabled {
    opacity: 0.5;
    cursor: default;
  }
  button.control:focus-visible,
  input:focus-visible,
  summary:focus-visible {
    outline: 2px solid var(--primary-color, #03a9f4);
    outline-offset: 2px;
  }
  input {
    min-height: 44px;
    box-sizing: border-box;
    padding: 0 10px;
    border: 1px solid var(--divider-color, #e0e0e0);
    border-radius: 10px;
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color, #212121);
    font: inherit;
    font-size: 14px;
  }
  input:disabled {
    opacity: 0.6;
  }
  @media (prefers-reduced-motion: reduce) {
    * {
      transition: none !important;
      animation: none !important;
    }
  }
`;
