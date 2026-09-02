/**
 * Getting the measurement series, from either of the two sources.
 *
 * `measurements` calls `weight_goal.get_measurements`, which returns exactly
 * the readings the integration counts: deleted and ignored ones are gone, and
 * every point carries where it came from. It is capped at the integration's
 * ring buffer (400 readings).
 *
 * `history` reads the recorder history of the weight sensor instead. It reaches
 * further back and is not capped, but it still contains readings that were
 * later deleted or ignored, because the recorder keeps its own copy.
 *
 * Results are cached per goal, per source and per range, so two cards on the
 * same dashboard cause one request rather than two.
 */

import { DOMAIN } from "../const";
import type { HomeAssistant, Measurement } from "../types";

interface CacheEntry {
  key: string;
  stamp: string;
  promise: Promise<Measurement[]>;
}

const cache = new Map<string, CacheEntry>();

/** How long a result stays usable when nothing signals a change. */
const MAX_AGE_MS = 5 * 60 * 1000;

interface GetMeasurementsResponse {
  entries?: Record<
    string,
    { name?: string; measurements?: Array<{ timestamp: string; weight: number; source?: string }> }
  >;
}

async function viaService(
  hass: HomeAssistant,
  target: string,
  days?: number,
): Promise<Measurement[]> {
  const result = await hass.callService(
    DOMAIN,
    "get_measurements",
    days ? { days } : {},
    { entity_id: target },
    false,
    true,
  );
  const response = (result?.response ?? {}) as GetMeasurementsResponse;
  const out: Measurement[] = [];
  for (const entry of Object.values(response.entries ?? {})) {
    for (const row of entry.measurements ?? []) {
      const t = Date.parse(row.timestamp);
      const v = Number(row.weight);
      if (Number.isFinite(t) && Number.isFinite(v)) {
        out.push({ t, v, source: row.source });
      }
    }
  }
  return out.sort((a, b) => a.t - b.t);
}

interface CompactState {
  s?: string;
  lu?: number;
  a?: Record<string, unknown>;
}

async function viaHistory(
  hass: HomeAssistant,
  entityId: string,
  days: number,
): Promise<Measurement[]> {
  const end = new Date();
  const start = new Date(end.getTime() - days * 86_400_000);
  const response = await hass.connection.sendMessagePromise<
    Record<string, CompactState[]>
  >({
    type: "history/history_during_period",
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    entity_ids: [entityId],
    minimal_response: true,
    no_attributes: true,
    significant_changes_only: false,
  });

  const rows = response?.[entityId] ?? [];
  const out: Measurement[] = [];
  for (const row of rows) {
    const v = Number(row.s);
    const t = typeof row.lu === "number" ? row.lu * 1000 : NaN;
    if (Number.isFinite(v) && Number.isFinite(t)) {
      out.push({ t, v });
    }
  }
  return out.sort((a, b) => a.t - b.t);
}

export interface FetchOptions {
  source: "measurements" | "history";
  /** Days of history to request. `undefined` means everything available. */
  days?: number;
  /** Action target; a sensor entity of the goal. */
  target?: string;
  /** The weight sensor, needed for the history source. */
  weightEntity?: string;
  /**
   * Anything that should invalidate the cache — normally the state of
   * `sensor.<name>_last_measurement` plus the goal parameters.
   */
  stamp: string;
}

export function fetchMeasurements(
  hass: HomeAssistant,
  options: FetchOptions,
): Promise<Measurement[]> {
  const anchor =
    options.source === "history" ? options.weightEntity : options.target;
  if (!anchor) {
    return Promise.resolve([]);
  }

  const key = `${options.source}|${anchor}|${options.days ?? "all"}`;
  const existing = cache.get(key);
  if (existing && existing.stamp === options.stamp) {
    return existing.promise;
  }

  const promise =
    options.source === "history"
      ? viaHistory(hass, anchor, options.days ?? 365)
      : viaService(hass, anchor, options.days);

  const entry: CacheEntry = { key, stamp: options.stamp, promise };
  cache.set(key, entry);

  // A failed request must not be cached, or the card never retries.
  promise.catch(() => {
    if (cache.get(key) === entry) {
      cache.delete(key);
    }
  });
  window.setTimeout(() => {
    if (cache.get(key) === entry) {
      cache.delete(key);
    }
  }, MAX_AGE_MS);

  return promise;
}

/** Test hook; also used when a card is removed from a dashboard. */
export function clearMeasurementCache(): void {
  cache.clear();
}
