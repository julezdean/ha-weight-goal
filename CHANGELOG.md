# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project uses
[semantic versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- `range: goal` covers the goal period and nothing else. It used to pull the
  chart back to the earliest reading it had loaded, up to a week before the
  start, so the option disagreed with the name it carries in the editor.
  Readings from before the goal are still there under `all` and under a plain
  number of days, which is what those are for.

### Fixed

- The moving average no longer starts on a partial window when `average` is
  longer than a week. The card loaded a fixed seven days of readings from
  before the goal; it now loads a whole average window, so the line is right
  where the chart begins rather than a few days in.

## [0.4.0] - 2026-09-02

### Added

- The badges under the current weight are configurable. `badges:` takes any of
  the built-in names in any order, `[]` hides them, and an object with an
  `entity` puts any other entity next to the weight. The visual editor offers
  the built-in ones and leaves entity badges in the configuration untouched.

### Changed

- The cards now follow the language set in the Home Assistant profile instead
  of being English with a few translated pieces mixed in. Entity names, units
  and the status value are read from the integration's own translations rather
  than being duplicated in the card, so they stay in step with the more-info
  dialog. The card's own sentences ship in English and German, with English as
  the fallback for any other language.
- The card picker entries are translated as far as the browser language allows;
  the picker is populated before Home Assistant can be asked.

## [0.3.0] - 2026-09-01

### Added

- The chart's vertical axis is configurable. `y_axis.min` and `y_axis.max` pin
  either end, `y_axis.mode: tight` fits the automatic ends to the smallest and
  largest value instead of rounding outwards, `y_axis.include_goal: false` keeps
  the axis on the readings rather than on the plan line, and `y_axis.ticks` sets
  how many grid lines to draw. All of it is in the visual editor too.

### Fixed

- The axis took its range from the goal's start and target weight even when only
  part of the goal was on screen, so a 30 day view was stretched across the whole
  goal range and flattened the readings into a straight line. It now uses the
  part of the plan that is actually visible.
- Series are clipped to the plot area, so a fixed or tight axis no longer lets
  lines run over the labels and out of the card.
- Axis labels get as many decimals as the step needs, and the axis gutter is
  sized from the widest label it will actually print rather than a guess.
- `y_axis` was dropped on its way from the card configuration to the chart, so
  the setting had no effect on either card. Both cards now pass every chart
  option through, and a test checks that they do.

## [0.2.0] - 2026-09-01

### Added

- Two Lovelace cards, `custom:weight-goal-card` and
  `custom:weight-goal-chart-card`, bundled with the integration. The integration
  serves the bundle and adds it to the Lovelace resources itself, so there is
  nothing to download and nothing to register by hand. An entry left over from
  an older version or a manual install is reused rather than duplicated. In YAML
  mode the resource list is left alone and the line to add is logged.
- The cards find every entity of a goal from a single one, so `entity:` is
  usually the whole configuration. Individual entities can still be overridden.
- Chart with the plan line from the start weight to the target weight, the
  tolerance band around it, the readings, an optional moving average and the
  projection to `projected_date`. Line shape, colours, stroke widths and the
  average window are configurable per series.
- The chart reads either the integration's own readings through
  `get_measurements` or the recorder history of the weight sensor, selectable
  per card.
- Visual editors for both cards.
- `sensor.<name>_status` now also carries `goal_mode`, `min_weight`,
  `max_weight` and `trend_window_days`, so a card can tell which of target
  weight and rate per week is editable instead of finding out by being
  rejected.

### Changed

- The integration now depends on `frontend`, `http` and `lovelace`, which it
  uses to serve and register the cards.

## [0.1.0] - 2026-09-01

First release.

### Added

- Config flow with one entry per person, one device per entry.
- Weight source from any numeric entity, or manual entry through a number
  entity and the `record_weight` action.
- Goal defined either by target weight or by change per week; the other value
  is calculated and read only.
- Sensors for weight, planned weight, deviation, trend, weight progress, time
  progress, remaining, projected date, status and last measurement.
- Status with direction awareness for losing, maintaining and gaining goals,
  and a hysteresis band so the status does not flap.
- Events on the event bus and matching optional actions in the options flow.
- Runtime state in storage; timers are caught up after downtime with a
  documented grace period.
- `import_history` action to fill the internal history from weights the
  recorder already holds, so the trend and the projection work straight away.
  With `write_statistics` it also backfills the long term statistics of the
  weight sensor, so past weights appear in history graphs.
- Manual weight entry is a two step action: the number entity holds a draft and
  a confirm button records it, so a mistyped value never becomes a measurement.
- Moving the goal start to today takes two presses as well, with a preview of
  the change and a two minute expiry.
- `delete_measurement` action to remove a single reading by timestamp.
- Manual weight entry is off by default when a weight source is configured, and
  can be switched back on in the options.
- English and German translations.

[0.4.0]: https://github.com/julezdean/ha-weight-goal/releases/tag/v0.4.0
[0.3.0]: https://github.com/julezdean/ha-weight-goal/releases/tag/v0.3.0
[0.2.0]: https://github.com/julezdean/ha-weight-goal/releases/tag/v0.2.0
[0.1.0]: https://github.com/julezdean/ha-weight-goal/releases/tag/v0.1.0
