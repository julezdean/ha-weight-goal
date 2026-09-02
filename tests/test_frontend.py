"""The card bundle and the attributes the cards read."""

from __future__ import annotations

import json
from pathlib import Path
from unittest.mock import patch

from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component
from pytest_homeassistant_custom_component.common import MockConfigEntry

import custom_components.weight_goal.frontend as frontend
from custom_components.weight_goal.const import DOMAIN

BUNDLE = (
    Path(frontend.__file__).parent / "www" / frontend.CARD_FILENAME
)


def test_bundle_ships_with_the_integration() -> None:
    """The built card is part of the distributed integration."""
    assert BUNDLE.is_file(), (
        "Build the cards with `npm ci && npm run build` in card/ before"
        " releasing; the bundle is committed so users do not need node."
    )
    assert "weight-goal-card" in BUNDLE.read_text(encoding="utf-8")


def test_bundle_version_matches_the_manifest() -> None:
    """A stale bundle in a release would be invisible without this."""
    manifest = json.loads(
        (Path(frontend.__file__).parent / "manifest.json").read_text(
            encoding="utf-8"
        )
    )
    header = BUNDLE.read_text(encoding="utf-8").splitlines()[0]
    assert manifest["version"] in header, (
        f"Bundle header {header!r} does not carry manifest version"
        f" {manifest['version']}; rebuild the cards."
    )


async def test_status_attributes_expose_card_settings(
    hass: HomeAssistant, mock_entry: MockConfigEntry
) -> None:
    """The status sensor carries everything a card needs to render correctly."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    attributes = hass.states.get("sensor.julien_status").attributes
    assert attributes["direction"] == "lose"
    assert attributes["tolerance"] == 0.5
    assert attributes["goal_mode"] == "target"
    assert attributes["min_weight"] == 20.0
    assert attributes["max_weight"] == 300.0
    assert attributes["trend_window_days"] == 7


async def test_frontend_registration_is_idempotent(hass: HomeAssistant) -> None:
    """Two config entries must not register the same static path twice."""
    # Without http there is no static path to register at all, and the test
    # would run through the error path instead of the one it is about.
    assert await async_setup_component(hass, "http", {})

    with patch.object(
        hass.http,
        "async_register_static_paths",
        wraps=hass.http.async_register_static_paths,
    ) as register:
        await frontend.async_register_frontend(hass)
        assert hass.data.get(f"{DOMAIN}_frontend_registered") is True
        await frontend.async_register_frontend(hass)

    # Counted rather than left to raise: current Home Assistant versions accept
    # a duplicate static path silently, so only the call count still shows that
    # the second setup was a no-op.
    assert register.call_count == 1


class _FakeResources:
    """Enough of ResourceStorageCollection for the registration logic."""

    def __init__(self, items: list[dict] | None = None, loaded: bool = True) -> None:
        self.items = items or []
        self.loaded = loaded
        self.load_calls = 0

    async def async_load(self) -> None:
        self.load_calls += 1

    def async_items(self) -> list[dict]:
        return self.items

    async def async_create_item(self, data: dict) -> dict:
        item = {"id": f"id{len(self.items)}", **data}
        self.items.append(item)
        return item

    async def async_update_item(self, item_id: str, changes: dict) -> dict:
        for item in self.items:
            if item["id"] == item_id:
                item.update(changes)
                return item
        raise KeyError(item_id)


async def test_resource_is_created(hass: HomeAssistant) -> None:
    """A fresh instance gets one module resource pointing at the bundle."""
    resources = _FakeResources(loaded=False)
    hass.data["lovelace"] = {"resources": resources, "mode": "storage"}

    assert await frontend._async_register_resource(hass, f"{frontend.CARD_URL}?v=1.0")

    assert resources.load_calls == 1
    assert resources.items == [
        {"id": "id0", "res_type": "module", "url": f"{frontend.CARD_URL}?v=1.0"}
    ]


async def test_existing_resource_is_updated_not_duplicated(
    hass: HomeAssistant,
) -> None:
    """An entry from an older version or a manual install is reused.

    Two entries for the same file would make the browser load the bundle twice,
    and the second registration of the custom elements fails.
    """
    resources = _FakeResources(
        [{"id": "old", "res_type": "module", "url": f"{frontend.CARD_URL}?v=0.1.0"}]
    )
    hass.data["lovelace"] = {"resources": resources, "mode": "storage"}

    assert await frontend._async_register_resource(hass, f"{frontend.CARD_URL}?v=0.2.0")

    assert len(resources.items) == 1
    assert resources.items[0]["url"] == f"{frontend.CARD_URL}?v=0.2.0"


async def test_unrelated_resources_are_left_alone(hass: HomeAssistant) -> None:
    """Someone else's card must not be overwritten."""
    other = {"id": "other", "res_type": "module", "url": "/local/other-card.js"}
    resources = _FakeResources([other])
    hass.data["lovelace"] = {"resources": resources, "mode": "storage"}

    await frontend._async_register_resource(hass, f"{frontend.CARD_URL}?v=0.2.0")

    assert other in resources.items
    assert len(resources.items) == 2


async def test_yaml_mode_does_not_write(hass: HomeAssistant) -> None:
    """In YAML mode the resource list belongs to the user's file."""
    resources = _FakeResources()
    hass.data["lovelace"] = {"resources": resources, "mode": "yaml"}

    assert not await frontend._async_register_resource(hass, frontend.CARD_URL)
    assert resources.items == []


async def test_missing_lovelace_does_not_raise(hass: HomeAssistant) -> None:
    """No Lovelace means a warning, not a failed setup."""
    hass.data.pop("lovelace", None)
    assert not await frontend._async_register_resource(hass, frontend.CARD_URL)
