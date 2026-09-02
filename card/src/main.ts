import { CARD_TYPE, CARD_VERSION, REPOSITORY } from "./const";
import { localizeIn } from "./localize";

import "./cards/weight-goal-card";

/** Register in the card picker. */
window.customCards = window.customCards ?? [];

// The picker is populated at load time, before any `hass` is available, so
// this goes by the browser's language rather than the Home Assistant profile.
// Everywhere else the profile language wins.
const language = navigator.language || "en";

const entries = [
  {
    type: CARD_TYPE,
    name: localizeIn(language, "picker.card_name"),
    description: localizeIn(language, "picker.card_description"),
    preview: true,
    documentationURL: REPOSITORY,
  },
];

for (const entry of entries) {
  if (!window.customCards.some((card) => card.type === entry.type)) {
    window.customCards.push(entry);
  }
}

// eslint-disable-next-line no-console
console.info(
  `%c WEIGHT-GOAL-CARD %c ${CARD_VERSION} `,
  "color:#fff;background:#03a9f4;font-weight:700",
  "color:#03a9f4;background:#fff;font-weight:700",
);
