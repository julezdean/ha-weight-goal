/**
 * Finding the other entities of a goal from a single one the user picked.
 *
 * Three strategies, tried in order:
 *
 * 1. Registry + `translation_key`. The integration sets the translation key to
 *    its internal entity key, so this is an exact match.
 * 2. Registry + entity id suffix. Same set of entities, but the key is read
 *    from the object id. `weight` and `start_weight` both end in `weight`, so
 *    the longest match wins and the domain has to agree.
 * 3. Entity id prefix guessing, for the case where the registry has no device
 *    for the anchor. Purely string based, so it is the last resort.
 */

import { DOMAIN } from "../const";
import { localize } from "../localize";
import {
  ENTITY_KEYS,
  type EntityKey,
  type GoalContext,
  type HomeAssistant,
  type ResolvedEntities,
} from "../types";

const DOMAIN_OF_KEY = new Map<EntityKey, string>();
for (const [domain, keys] of Object.entries(ENTITY_KEYS)) {
  for (const key of keys) {
    DOMAIN_OF_KEY.set(key as EntityKey, domain);
  }
}

/** Longest first, so `start_weight` is tested before `weight`. */
const KEYS_BY_LENGTH = [...DOMAIN_OF_KEY.keys()].sort(
  (a, b) => b.length - a.length,
);

/** Sensors that make the best action target, most likely to exist first. */
const TARGET_PREFERENCE: EntityKey[] = ["status", "weight", "last_measurement"];

function keyFromEntityId(entityId: string): EntityKey | undefined {
  const separator = entityId.indexOf(".");
  if (separator < 0) {
    return undefined;
  }
  const domain = entityId.slice(0, separator);
  const objectId = entityId.slice(separator + 1);
  for (const key of KEYS_BY_LENGTH) {
    if (DOMAIN_OF_KEY.get(key) !== domain) {
      continue;
    }
    if (objectId === key || objectId.endsWith(`_${key}`)) {
      return key;
    }
  }
  return undefined;
}

function assign(
  found: ResolvedEntities,
  key: EntityKey | undefined,
  entityId: string,
): void {
  if (!key || found[key]) {
    return;
  }
  if (DOMAIN_OF_KEY.get(key) !== entityId.slice(0, entityId.indexOf("."))) {
    return;
  }
  found[key] = entityId;
}

function fromDevice(hass: HomeAssistant, deviceId: string): ResolvedEntities {
  const found: ResolvedEntities = {};
  for (const entry of Object.values(hass.entities ?? {})) {
    if (entry.device_id !== deviceId || entry.platform !== DOMAIN) {
      continue;
    }
    const key = (entry.translation_key as EntityKey | undefined) ?? undefined;
    if (key && DOMAIN_OF_KEY.has(key)) {
      assign(found, key, entry.entity_id);
    } else {
      assign(found, keyFromEntityId(entry.entity_id), entry.entity_id);
    }
  }
  return found;
}

/**
 * Rebuild the entity ids from the anchor's own object id.
 *
 * The integration pins every object id to `<slugified name>_<key>`, so
 * stripping the key off the anchor leaves the prefix that all siblings share.
 */
function fromPrefix(hass: HomeAssistant, anchor: string): ResolvedEntities {
  const found: ResolvedEntities = {};
  const key = keyFromEntityId(anchor);
  if (!key) {
    return found;
  }
  const objectId = anchor.slice(anchor.indexOf(".") + 1);
  const prefix = objectId.slice(0, objectId.length - key.length);
  for (const candidate of KEYS_BY_LENGTH) {
    const entityId = `${DOMAIN_OF_KEY.get(candidate)}.${prefix}${candidate}`;
    if (hass.states?.[entityId]) {
      found[candidate] = entityId;
    }
  }
  return found;
}

function displayName(
  hass: HomeAssistant,
  deviceId: string | undefined,
  entities: ResolvedEntities,
): string {
  const device = deviceId ? hass.devices?.[deviceId] : undefined;
  if (device) {
    const name = device.name_by_user || device.name;
    if (name) {
      return name;
    }
  }
  const anchor = entities.status ?? entities.weight;
  const friendly = anchor
    ? (hass.states?.[anchor]?.attributes?.friendly_name as string | undefined)
    : undefined;
  if (!friendly) {
    return localize(hass, "card.fallback_name");
  }
  // `has_entity_name` renders as "<device> <entity>"; keep the device part.
  const cut = friendly.lastIndexOf(" ");
  return cut > 0 ? friendly.slice(0, cut) : friendly;
}

export interface DiscoveryInput {
  entity?: string;
  device_id?: string;
  entities?: ResolvedEntities;
  name?: string;
}

/**
 * Resolve every entity of one goal.
 *
 * Explicit `entities` overrides always win, so a user can correct a wrong
 * guess or point the card at a hand built set of entities.
 */
export function discover(
  hass: HomeAssistant,
  config: DiscoveryInput,
): GoalContext {
  const anchor = config.entity;
  let deviceId = config.device_id;

  if (!deviceId && anchor) {
    deviceId = hass.entities?.[anchor]?.device_id ?? undefined;
  }

  let entities: ResolvedEntities = deviceId ? fromDevice(hass, deviceId) : {};

  if (!Object.keys(entities).length && anchor) {
    entities = fromPrefix(hass, anchor);
  }

  if (anchor) {
    assign(entities, keyFromEntityId(anchor), anchor);
  }

  for (const [key, entityId] of Object.entries(config.entities ?? {})) {
    if (entityId) {
      entities[key as EntityKey] = entityId;
    }
  }

  let target: string | undefined;
  for (const key of TARGET_PREFERENCE) {
    const candidate = entities[key];
    if (candidate) {
      target = candidate;
      break;
    }
  }

  return {
    entities,
    deviceId,
    name: config.name ?? displayName(hass, deviceId, entities),
    target,
  };
}
