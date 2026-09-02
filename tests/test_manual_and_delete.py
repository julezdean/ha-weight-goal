"""Manual entry gating and deleting a single measurement."""

from __future__ import annotations

from datetime import datetime, timedelta

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.weight_goal.const import (
    ATTR_TIMESTAMP,
    ATTR_TOLERANCE_MINUTES,
    CONF_ALLOW_MANUAL,
    CONF_SOURCE_ENTITY,
    DOMAIN,
    SERVICE_DELETE_MEASUREMENT,
    SOURCE_MANUAL,
)

from .conftest import make_entry

NOW = datetime(2026, 3, 1, 12, 0, tzinfo=dt_util.UTC)
ANCHOR = {"entity_id": "sensor.julien_status"}


@pytest.fixture
async def frozen(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> FrozenDateTimeFactory:
    """Freeze the clock and pin the time zone."""
    await hass.config.async_set_time_zone("UTC")
    freezer.move_to(NOW)
    return freezer


async def _set_manual(hass: HomeAssistant, value: float) -> None:
    await hass.services.async_call(
        "number",
        "set_value",
        {"entity_id": "number.julien_manual_weight", "value": value},
        blocking=True,
    )


async def _confirm(hass: HomeAssistant) -> None:
    await hass.services.async_call(
        "button", "press", {"entity_id": "button.julien_record_weight"}, blocking=True
    )


async def test_manual_entry_is_on_without_a_source(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """Without a scale, typing a weight is the only way in."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    assert mock_entry.runtime_data.manual_entry_enabled is True
    await _set_manual(hass, 79.5)
    await _confirm(hass)
    await hass.async_block_till_done()
    assert mock_entry.runtime_data.current_weight == 79.5


async def test_manual_entry_is_off_with_a_source(hass: HomeAssistant, frozen) -> None:
    """With a scale, the entity is unavailable and refuses values."""
    entry = make_entry(
        hass, **{CONF_SOURCE_ENTITY: "sensor.scale", CONF_ALLOW_MANUAL: False}
    )
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    assert entry.runtime_data.manual_entry_enabled is False
    assert hass.states.get("number.julien_manual_weight").state == "unavailable"

    # Home Assistant skips unavailable entities in service calls without
    # raising, so what matters is that nothing was recorded.
    await _set_manual(hass, 79.5)
    await hass.async_block_till_done()
    assert entry.runtime_data.current_weight is None

    # Calling the entity directly is still refused, in case anything reaches
    # past the availability check.
    number = hass.data["entity_components"]["number"].get_entity(
        "number.julien_manual_weight"
    )
    with pytest.raises(ServiceValidationError):
        await number.async_set_native_value(79.5)


async def test_manual_entry_can_be_switched_back_on(
    hass: HomeAssistant, frozen
) -> None:
    """The option applies immediately, without reloading the entry."""
    entry = make_entry(
        hass, **{CONF_SOURCE_ENTITY: "sensor.scale", CONF_ALLOW_MANUAL: False}
    )
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    hass.config_entries.async_update_entry(
        entry, options={**entry.options, CONF_ALLOW_MANUAL: True}
    )
    await hass.async_block_till_done()

    assert hass.states.get("number.julien_manual_weight").state != "unavailable"
    await _set_manual(hass, 79.5)
    await _confirm(hass)
    await hass.async_block_till_done()
    assert entry.runtime_data.current_weight == 79.5


async def test_option_cannot_lock_out_a_sourceless_entry(
    hass: HomeAssistant, frozen
) -> None:
    """Turning it off without a source would leave no way to record anything."""
    entry = make_entry(hass, **{CONF_ALLOW_MANUAL: False})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.runtime_data.manual_entry_enabled is True


async def test_delete_measurement_removes_the_match(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, mock_entry: MockConfigEntry
) -> None:
    """A wrong entry from the middle of the history can be removed."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()
    manager = mock_entry.runtime_data

    wrong_moment = NOW - timedelta(days=2)
    await manager.async_record_weight(80.0, timestamp=NOW - timedelta(days=3))
    await manager.async_record_weight(123.0, timestamp=wrong_moment)
    await manager.async_record_weight(79.5, timestamp=NOW - timedelta(days=1))
    await hass.async_block_till_done()
    assert 123.0 in [m.weight for m in manager.measurements]

    response = await hass.services.async_call(
        DOMAIN,
        SERVICE_DELETE_MEASUREMENT,
        {**ANCHOR, ATTR_TIMESTAMP: wrong_moment.isoformat()},
        blocking=True,
        return_response=True,
    )
    await hass.async_block_till_done()

    assert response["removed"][0]["weight"] == 123.0
    assert [m.weight for m in manager.measurements] == [80.0, 79.5]
    assert manager.current_weight == 79.5


async def test_delete_measurement_uses_the_tolerance(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """The timestamp does not have to be exact to the second."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()
    manager = mock_entry.runtime_data

    moment = NOW - timedelta(days=1)
    await manager.async_record_weight(88.0, timestamp=moment)
    await hass.async_block_till_done()

    await hass.services.async_call(
        DOMAIN,
        SERVICE_DELETE_MEASUREMENT,
        {**ANCHOR, ATTR_TIMESTAMP: (moment + timedelta(minutes=3)).isoformat()},
        blocking=True,
    )
    await hass.async_block_till_done()
    assert manager.measurements == []


async def test_delete_measurement_outside_the_tolerance_raises(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """Nothing is deleted silently when the timestamp does not match."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()
    await mock_entry.runtime_data.async_record_weight(
        88.0, timestamp=NOW - timedelta(days=1)
    )
    await hass.async_block_till_done()

    with pytest.raises(ServiceValidationError):
        await hass.services.async_call(
            DOMAIN,
            SERVICE_DELETE_MEASUREMENT,
            {
                **ANCHOR,
                ATTR_TIMESTAMP: (NOW - timedelta(days=5)).isoformat(),
                ATTR_TOLERANCE_MINUTES: 5,
            },
            blocking=True,
        )
    assert len(mock_entry.runtime_data.measurements) == 1


async def test_deleting_the_last_manual_value_clears_the_input(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """The entry field must not keep showing a weight that no longer exists."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    await _set_manual(hass, 77.7)
    await _confirm(hass)
    await hass.async_block_till_done()
    moment = mock_entry.runtime_data.last_measurement.timestamp
    assert hass.states.get("number.julien_manual_weight").state == "77.7"

    await hass.services.async_call(
        DOMAIN,
        SERVICE_DELETE_MEASUREMENT,
        {**ANCHOR, ATTR_TIMESTAMP: moment.isoformat()},
        blocking=True,
    )
    await hass.async_block_till_done()

    assert mock_entry.runtime_data.manual_weight is None
    assert hass.states.get("number.julien_manual_weight").state == "unknown"


async def test_deleted_measurement_stays_deleted_after_a_restart(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """The removal is persisted, not just held in memory."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()
    manager = mock_entry.runtime_data

    moment = NOW - timedelta(days=1)
    await manager.async_record_weight(80.0, timestamp=NOW - timedelta(days=2))
    await manager.async_record_weight(150.0, timestamp=moment)
    await hass.async_block_till_done()

    await hass.services.async_call(
        DOMAIN,
        SERVICE_DELETE_MEASUREMENT,
        {**ANCHOR, ATTR_TIMESTAMP: moment.isoformat()},
        blocking=True,
    )
    await hass.async_block_till_done()

    assert await hass.config_entries.async_unload(mock_entry.entry_id)
    await hass.async_block_till_done()
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    assert [m.weight for m in mock_entry.runtime_data.measurements] == [80.0]


async def test_source_measurements_still_work_with_manual_off(
    hass: HomeAssistant, frozen
) -> None:
    """Switching manual entry off must not stop the scale from being read."""
    entry = make_entry(
        hass, **{CONF_SOURCE_ENTITY: "sensor.scale", CONF_ALLOW_MANUAL: False}
    )
    hass.states.async_set("sensor.scale", "81.3")
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    assert entry.runtime_data.current_weight == 81.3
    assert SOURCE_MANUAL not in {m.source for m in entry.runtime_data.measurements}


async def test_typing_a_weight_does_not_record_it(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """A mistyped value must not become a measurement."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    await _set_manual(hass, 80.0)
    await hass.async_block_till_done()

    assert mock_entry.runtime_data.measurements == []
    assert hass.states.get("number.julien_manual_weight").state == "80.0"
    assert (
        hass.states.get("number.julien_manual_weight").attributes["pending"] is True
    )


async def test_confirm_button_records_the_staged_weight(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """Two steps: type, then confirm."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    await _set_manual(hass, 79.2)
    await hass.async_block_till_done()
    await _confirm(hass)
    await hass.async_block_till_done()

    assert mock_entry.runtime_data.current_weight == 79.2
    assert mock_entry.runtime_data.last_measurement.source == SOURCE_MANUAL


async def test_confirm_button_is_unavailable_without_a_draft(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """Nothing staged, nothing to press."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()
    assert hass.states.get("button.julien_record_weight").state == "unavailable"

    await _set_manual(hass, 79.2)
    await hass.async_block_till_done()
    assert hass.states.get("button.julien_record_weight").state != "unavailable"


async def test_confirming_twice_records_once(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, mock_entry: MockConfigEntry
) -> None:
    """A second press must not duplicate the measurement."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    await _set_manual(hass, 79.2)
    await hass.async_block_till_done()
    await _confirm(hass)
    await hass.async_block_till_done()

    frozen.move_to(NOW + timedelta(minutes=10))
    await _confirm(hass)
    await hass.async_block_till_done()

    assert len(mock_entry.runtime_data.measurements) == 1


async def test_a_draft_survives_a_restart(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """An unconfirmed value is still there, and still unconfirmed."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()
    await _set_manual(hass, 81.4)
    await hass.async_block_till_done()

    assert await hass.config_entries.async_unload(mock_entry.entry_id)
    await hass.async_block_till_done()
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    assert mock_entry.runtime_data.manual_pending is True
    assert mock_entry.runtime_data.measurements == []
    assert hass.states.get("number.julien_manual_weight").state == "81.4"


async def test_an_implausible_draft_stays_staged(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """A rejected value is not silently dropped; it waits for a correction."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    await mock_entry.runtime_data.async_stage_manual_weight(5.0)
    await hass.async_block_till_done()
    assert await mock_entry.runtime_data.async_confirm_manual_weight() is False

    assert mock_entry.runtime_data.measurements == []
    assert mock_entry.runtime_data.manual_pending is True


async def test_confirm_button_follows_the_manual_switch(
    hass: HomeAssistant, frozen
) -> None:
    """With manual entry off, the button is unavailable too."""
    entry = make_entry(
        hass, **{CONF_SOURCE_ENTITY: "sensor.scale", CONF_ALLOW_MANUAL: False}
    )
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert hass.states.get("button.julien_record_weight").state == "unavailable"
