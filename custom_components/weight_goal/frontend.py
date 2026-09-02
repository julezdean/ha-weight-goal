"""Serving the Lovelace cards that ship with this integration.

The cards live in ``www/weight-goal-card.js`` inside the integration, so
installing the integration is all it takes to get them.

Registration goes through the Lovelace resource collection, the same list HACS
writes to and the same one you see under **Settings -> Dashboards -> Resources**.
``frontend.add_extra_js_url`` looks like the lighter option, but it only injects
a script tag into the frontend index, and a browser holding a cached index or a
service worker shell never sees the new entry. A resource is fetched over the
websocket API at runtime instead.

The URL carries the integration version, so a browser that cached the previous
build fetches the new one after an update rather than running an old card
against a new integration.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant
from homeassistant.loader import async_get_integration

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

CARD_FILENAME = "weight-goal-card.js"
URL_BASE = f"/{DOMAIN}/frontend"
CARD_URL = f"{URL_BASE}/{CARD_FILENAME}"

#: Marks the registration as done for this Home Assistant run.
_REGISTERED = f"{DOMAIN}_frontend_registered"


def _lovelace_resources(hass: HomeAssistant) -> tuple[Any, str | None]:
    """Return the resource collection and the Lovelace mode.

    ``hass.data["lovelace"]`` has been a plain dict and a dataclass in different
    Home Assistant versions, so both are read.
    """
    lovelace = hass.data.get("lovelace")
    if lovelace is None:
        return None, None
    if isinstance(lovelace, dict):
        return lovelace.get("resources"), lovelace.get("mode")
    return getattr(lovelace, "resources", None), getattr(lovelace, "mode", None)


async def _async_register_resource(hass: HomeAssistant, url: str) -> bool:
    """Add or update the card in the Lovelace resource list.

    Returns ``False`` when the resource could not be written, in which case the
    user is told what to add by hand instead of the card silently not existing.
    """
    resources, mode = _lovelace_resources(hass)
    if resources is None:
        _LOGGER.warning(
            "Lovelace is not set up, so the cards could not be registered. "
            "Add %s as a JavaScript module resource by hand",
            url,
        )
        return False

    if mode == "yaml" or not hasattr(resources, "async_create_item"):
        # In YAML mode the resource list is your file, not ours to edit.
        _LOGGER.warning(
            "Lovelace runs in YAML mode, so the cards were not registered "
            "automatically. Add this to your Lovelace resources:\n"
            "  - url: %s\n    type: module",
            url,
        )
        return False

    # The storage collection is loaded lazily; at startup it usually is not.
    if getattr(resources, "loaded", True) is False:
        await resources.async_load()
        resources.loaded = True

    base = url.split("?")[0]
    for item in resources.async_items():
        if item.get("url", "").split("?")[0] != base:
            continue
        if item["url"] == url:
            _LOGGER.debug("Card resource %s already registered", url)
            return True
        # Reuse the existing entry rather than adding a second one, so a
        # resource left over from a manual install or an older version does not
        # make the browser load the cards twice.
        await resources.async_update_item(item["id"], {"url": url})
        _LOGGER.info("Updated the card resource to %s", url)
        return True

    await resources.async_create_item({"res_type": "module", "url": url})
    _LOGGER.info("Registered the card resource %s", url)
    return True


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Serve the card bundle and register it, once per run.

    Failures here are logged rather than raised: no card is worth a warning, but
    it is not a reason to leave the user without the sensors as well.
    """
    if hass.data.get(_REGISTERED):
        return

    source = Path(__file__).parent / "www" / CARD_FILENAME
    if not await hass.async_add_executor_job(source.is_file):
        _LOGGER.warning(
            "%s is missing, so the Lovelace cards are not available. "
            "Reinstall the integration, or build the cards with "
            "`npm ci && npm run build` in the card directory",
            source,
        )
        return

    hass.data[_REGISTERED] = True
    try:
        await hass.http.async_register_static_paths(
            [
                StaticPathConfig(
                    URL_BASE,
                    str(source.parent),
                    # The version query string handles cache busting, and a
                    # stale card is worse than an extra request.
                    cache_headers=False,
                )
            ]
        )
    except Exception:
        # Leave the flag clear so a later setup can try again rather than
        # silently never serving the cards for the rest of the run.
        hass.data[_REGISTERED] = False
        _LOGGER.exception("Could not serve the Lovelace cards from %s", source.parent)
        return

    integration = await async_get_integration(hass, DOMAIN)
    await _async_register_resource(hass, f"{CARD_URL}?v={integration.version}")
