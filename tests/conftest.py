"""Shared test fixtures."""

from __future__ import annotations

from datetime import date, timedelta

import pytest
from homeassistant.const import CONF_NAME
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.weight_goal.const import (
    CONF_END_DATE,
    CONF_GOAL_MODE,
    CONF_MAX_WEIGHT,
    CONF_MIN_WEIGHT,
    CONF_OVERDUE_DAYS,
    CONF_RATE_PER_WEEK,
    CONF_SOURCE_ENTITY,
    CONF_START_DATE,
    CONF_START_WEIGHT,
    CONF_TARGET_WEIGHT,
    CONF_TOLERANCE,
    CONF_TREND_WINDOW_DAYS,
    DOMAIN,
    MODE_TARGET,
)

pytest_plugins = "pytest_homeassistant_custom_component"

#: All tests use this as "today" via freezegun where timing matters.
TODAY = date(2026, 3, 1)


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(recorder_db_url, enable_custom_integrations):
    """Enable loading of custom_components in every test.

    ``recorder_db_url`` is requested first on purpose: it refuses to run once
    the ``hass`` fixture has started, and ``enable_custom_integrations`` pulls
    ``hass`` in. Without this order every test that also wants a recorder fails
    before it begins.
    """
    return


def goal_options(**overrides):
    """Return a complete, valid set of options for a losing goal."""
    options = {
        CONF_GOAL_MODE: MODE_TARGET,
        CONF_MIN_WEIGHT: 20.0,
        CONF_MAX_WEIGHT: 300.0,
        CONF_TOLERANCE: 0.5,
        CONF_TREND_WINDOW_DAYS: 7,
        CONF_OVERDUE_DAYS: 3,
        CONF_START_WEIGHT: 80.0,
        CONF_TARGET_WEIGHT: 75.0,
        CONF_RATE_PER_WEEK: -0.5,
        CONF_START_DATE: TODAY.isoformat(),
        CONF_END_DATE: (TODAY + timedelta(days=69)).isoformat(),
    }
    options.update(overrides)
    return options


def make_entry(hass: HomeAssistant, **overrides) -> MockConfigEntry:
    """Create and register a config entry."""
    entry = MockConfigEntry(
        domain=DOMAIN,
        title=overrides.pop("title", "Julien"),
        data={CONF_NAME: "Julien"},
        options=goal_options(**overrides),
        entry_id=overrides.pop("entry_id", "testentry"),
    )
    entry.add_to_hass(hass)
    return entry


@pytest.fixture
def mock_entry(hass: HomeAssistant) -> MockConfigEntry:
    """A config entry with a losing goal and no source sensor."""
    return make_entry(hass)


@pytest.fixture
def source_entry(hass: HomeAssistant) -> MockConfigEntry:
    """A config entry that reads from a source sensor."""
    return make_entry(hass, **{CONF_SOURCE_ENTITY: "sensor.scale"})
