import { html, svg, type SVGTemplateResult } from "lit";

export type Severity =
  "alarm" | "attention" | "offline" | "battery" | "unknown" | "ok";

const paths: Record<Severity, SVGTemplateResult> = {
  ok: svg`<circle cx="12" cy="12" r="9"></circle>
    <circle cx="12" cy="12" r="4"></circle>
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2"></path>`,
  alarm: svg`<path
    d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.3 1.5 1 2.5 2 3 0-3 0-5.5 1-8.5z"
  ></path>`,
  attention: svg`<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"></path>
    <path d="M12 8v4M12 16h.01"></path>`,
  offline: svg`<path
      d="M2 8.5a15 15 0 0 1 20 0M5.5 12a10 10 0 0 1 13 0M9 15.5a5 5 0 0 1 6 0"
    ></path>
    <path d="M3 3l18 18"></path>`,
  battery: svg`<rect x="3" y="7" width="16" height="10" rx="2"></rect>
    <path d="M22 11v2M7 10v4"></path>`,
  unknown: svg`<circle cx="12" cy="12" r="9"></circle>
    <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.2M12 17h.01"></path>`,
};

/** Stroke icons in currentColor; decorative, the status text carries meaning. */
export const icon = (severity: Severity) =>
  html`<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    ${paths[severity]}
  </svg>`;
