# Road to Weight Goal

A Home Assistant integration that tracks your weight against a planned
trajectory: from a start weight to a target weight over a date range, for
losing, maintaining or gaining.

![The card: name, end date and status, the current weight and how far it is from plan, a row of badges, the chart with the plan line and the tolerance band, and the weight and time progress bars.](https://raw.githubusercontent.com/julezdean/ha-weight-goal/main/docs/card.png)

## What this integration does not do

It does not weigh you, it does not notify you, and it does not speak. It keeps
numbers, dates and a status, and it fires events. Everything visible or audible
comes from your own automations and scripts.

It also does not talk to any scale. It reads whatever numeric entity you point
it at, from any scale integration you already use, or it takes weights you type
in yourself. Nothing leaves your instance.

## Features

- One entry per person. Add as many as you need.
- Works with a smart scale entity or with weights entered by hand, or both.
- Losing, maintaining and gaining goals. The status knows which way is good.
- The goal is defined either by a target weight or by a change per week. The
  other value is calculated and read only, so the two can never drift apart.
- Status with a tolerance band and hysteresis: `ahead`, `on_track`, `behind`,
  `reached`, `ended`, `no_goal`.
- Events on the event bus, plus optional actions you can configure in the UI.
- Nothing is polled. The integration reacts to your weight source and to a
  small number of scheduled points in time.
- One Lovelace card ships with the integration, from the whole goal down to the
  chart on its own. No resource to add, no separate HACS entry.
- Timers survive a restart. What fell into a short outage is caught up.

## Installation

### HACS

1. In HACS, open the three dot menu and choose **Custom repositories**.
2. Add `https://github.com/julezdean/ha-weight-goal` with the category
   **Integration**.
3. Install **Road to Weight Goal** and restart Home Assistant.

### Manually

Copy `custom_components/weight_goal` into your `config/custom_components`
directory and restart Home Assistant.

## Setup

**Settings → Devices & Services → Add Integration → Road to Weight Goal.**

| Field | Meaning |
| --- | --- |
| Name | Used for the device and in the entity IDs, for example `sensor.alex_status`. |
| Weight source | Any entity whose state is a weight in kilograms. Leave empty to enter weights by hand. |
| Define the goal by | Target weight, or change per week. Whichever you pick is the value you set; the other is calculated. |

Everything else lives under **Configure** on the entry:

| Option | Default | Meaning |
| --- | --- | --- |
| Lowest / highest plausible weight | 20 / 300 kg | Values outside this range are ignored and logged. |
| On track tolerance | 0.5 kg | How far you may deviate from the plan before the status changes. |
| Trend window | 7 days | **0 switches the trend sensor off.** The projection keeps working. |
| Remind after | 3 days | Days without a measurement before the reminder fires. **0 switches it off**, together with its event and action. |
| Allow manual entry | off with a source | Lets the manual weight entity record measurements. Always on when there is no weight source. |
| Largest accepted change | 0 kg | Reject measurements that jump further than this from the previous one. **0 accepts everything**, which is the default on purpose: most large jumps are real. |
| Extra recalculation | 0 min | Recalculate every N minutes on top of midnight and every measurement. See [How often the sensors update](#how-often-the-sensors-update). |
| Actions | empty | Optional scripts, see [Events and actions](#events-and-actions). |

## Entities

Entity IDs are always built from the English key, whatever language your
instance runs in. Display names are translated.

| Entity | Type | Notes |
| --- | --- | --- |
| `number.<name>_start_weight` | Number | Weight the goal starts from. |
| `number.<name>_target_weight` | Number | Read only when the goal is defined by rate. |
| `number.<name>_rate_per_week` | Number | Read only when the goal is defined by target weight. |
| `number.<name>_manual_weight` | Number | Holds a weight until you confirm it. Nothing is recorded by typing alone. Unavailable while a weight source is configured, unless you switch manual entry back on. |
| `date.<name>_start_date` | Date | First day of the goal. |
| `date.<name>_end_date` | Date | Last day of the goal. It counts towards the goal in full. |
| `button.<name>_record_weight` | Button | Records the weight held above. Unavailable while there is nothing to confirm. |
| `button.<name>_start_today` | Button | Stages a move of the goal start to today. Changes nothing on its own. |
| `button.<name>_confirm_start_today` | Button | Applies it: start weight becomes the latest measurement, start date becomes today, the end date is untouched. Available for thirty seconds after staging. |
| `sensor.<name>_weight` | Sensor | The current weight. This is the entity with the history. |
| `sensor.<name>_target_weight_today` | Sensor | Where the plan says you should be. |
| `sensor.<name>_deviation` | Sensor | Weight minus plan. Read the sign together with `direction`. |
| `sensor.<name>_trend` | Sensor | Change across the trend window. Unavailable when the window is 0. |
| `sensor.<name>_weight_progress` | Sensor | Percent of the planned weight change achieved. Clamped to 0-100, so overshooting reads as 100. Unknown for a maintain goal. |
| `sensor.<name>_time_progress` | Sensor | Percent of the goal period elapsed. |
| `sensor.<name>_remaining` | Sensor | Kilograms still to go, never negative. |
| `sensor.<name>_projected_date` | Sensor | When you reach the target at the current pace. |
| `sensor.<name>_status` | Sensor | Enum, see below. Carries `direction`, `tolerance`, `goal_mode`, `min_weight`, `max_weight` and `trend_window_days` as attributes, so a card needs this one entity and nothing else to render correctly. |
| `sensor.<name>_last_measurement` | Sensor | Timestamp of the latest measurement. |

### Status

| Value | Meaning |
| --- | --- |
| `no_goal` | No usable goal is configured. |
| `on_track` | Inside the tolerance band. |
| `ahead` | Beyond the plan in the direction of the goal. |
| `behind` | Beyond the plan against the direction of the goal. |
| `reached` | The target has been hit. Can be lost again. |
| `ended` | The end date has passed. |

A maintain goal has no `ahead`: any drift beyond the tolerance in either
direction reports `behind`.

Once the status is `ahead` or `behind` it only returns to `on_track` at half
the tolerance. Without that hysteresis a weight sitting on the threshold would
flip the status back and forth on every measurement.

## Services

All services take an entity of the goal as their target; any sensor of the
device works. Devices and areas remain selectable.

| Service | Purpose |
| --- | --- |
| `weight_goal.record_weight` | Record a weight, optionally with a timestamp. |
| `weight_goal.set_goal` | Change several goal values in one atomic write. |
| `weight_goal.reset_goal` | Clear the goal. Recorded weights are kept. |
| `weight_goal.ignore_last_measurement` | Drop the latest measurement from trend, projection and status. |
| `weight_goal.delete_measurement` | Remove one measurement by timestamp. |
| `weight_goal.get_measurements` | Return the recorded measurements as a response. |
| `weight_goal.import_history` | Fill the internal history from weights Home Assistant already recorded. |

### Entering a weight by hand

Entering a weight takes two steps on purpose. Type the value into
`number.<name>_manual_weight`, then press `button.<name>_record_weight`. Until
you press it nothing reaches the history, so a value typed into the wrong field
costs you nothing. The button stays unavailable while there is nothing waiting.

Automations do not need the two steps; `record_weight` writes directly.

### Reading the two progress sensors

`weight_progress` says how much of the planned weight change is done.
`time_progress` says how much of the period is gone. Neither says whether you
are on schedule; read them together:

| | Meaning |
| --- | --- |
| weight above time | Ahead of the plan |
| roughly equal | On the plan |
| weight below time | Behind the plan |

That is the same statement `deviation` makes in kilograms and `status` makes as
a word. Use whichever suits the card you are building.

### Moving the start of the goal

`start_today` also takes two presses. The first one stages the change and makes
`confirm_start_today` available for thirty seconds; the second one applies it.
The
confirm button carries `new_start_weight`, `new_start_date` and the current
values as attributes, so you can check what is about to happen before pressing.

If you leave it alone, the pending change expires. It is deliberately not kept
across a restart.

### Removing a wrong measurement

If it was the last one, `ignore_last_measurement` is enough. Otherwise look the
timestamp up with `get_measurements` and pass it:

```yaml
action: weight_goal.delete_measurement
target:
  entity_id: sensor.alex_status
data:
  timestamp: "2026-09-01T07:42:00+02:00"
  tolerance_minutes: 5
```

The closest measurement within the tolerance is removed, so the timestamp does
not have to be exact to the second. If nothing matches, the action fails rather
than deleting the wrong point.

### Importing past weights

Right after setup the trend and the projection have nothing to work with, so
they stay unavailable for the first days. `import_history` fills the internal
history from what Home Assistant already recorded for your weight source:

```yaml
action: weight_goal.import_history
target:
  entity_id: sensor.alex_status
data:
  days: 365
```

Two sources are read and merged. Recorded states carry every individual
weigh-in but only go back as far as your recorder keeps them, ten days by
default. Long term statistics reach back much further but contribute one
averaged value per day.

Running it twice changes nothing: existing measurements win. Weights you
entered by hand are never overwritten, not even with `replace: true`. Values
outside the plausible range are skipped. The largest accepted change is
deliberately not applied here, because a gap in recorded history legitimately
produces a large step.

Pass `source_entity` to read from a different entity than the configured one,
for example an old sensor you have since replaced.

#### Making the past visible in graphs

By default the import only fills the internal history, which is what the trend,
the projection and the status use. `sensor.<name>_weight` still starts its own
graph on the day you set the integration up.

Add `write_statistics: true` to also backfill the long term statistics of that
sensor:

```yaml
action: weight_goal.import_history
target:
  entity_id: sensor.alex_status
data:
  days: 365
  write_statistics: true
```

Long term statistics are what every history graph reads for anything older than
the recorder's short term retention, so after this your whole past shows up
under the integration's own sensor. Individual weigh-ins are grouped into
hourly buckets with a mean, a minimum and a maximum; at one weigh-in a day that
is the same value, just stored differently.

This writes into the recorder database, which is why it is off by default. If
something goes wrong, remove the series under **Developer tools → Statistics**
and run the import again.

## Cards

A Lovelace card ships with the integration. There is nothing to download and
nothing to add by hand: the integration serves the bundle and registers it as a
Lovelace resource itself, the same way HACS registers a card. After a restart it
appears in the card picker under **Weight goal**, and the resource is visible
under **Settings → Dashboards → Resources**.

If Lovelace runs in YAML mode the integration does not touch your resource list.
It logs the line to add instead:

```yaml
lovelace:
  resources:
    - url: /weight_goal/frontend/weight-goal-card.js
      type: module
```

### The card

```yaml
type: custom:weight-goal-card
entity: sensor.alex_status
```

One entity is all it needs. From it the card finds the device and every other
entity of the same goal, so the numbers, the dates, the buttons and the chart
all work without listing anything.

It shows the current weight and how far it is from the plan, the chart, the two
progress bars next to each other, the actions that are currently available, and
a collapsible section for the goal itself.

### The chart on its own

For a dashboard that shows the numbers elsewhere, switch the other sections off.
`header: compact` replaces the icon, dates and status with a single line of name
and current weight, small enough to sit over a card that is mostly chart:

```yaml
type: custom:weight-goal-card
entity: sensor.alex_status
header: compact
show_hero: false
show_badges: false
show_progress: false
show_record: false
show_restart: false
show_goal_editor: false
range: 90
average: 7
```

Two cards for the same goal on one dashboard share their data, so this costs one
request rather than two.

### What the chart draws

| Layer | Where it comes from |
| --- | --- |
| Plan line | Computed from start weight, target weight and the two dates. It is a straight line, so it is drawn exactly rather than sampled from recorded states. |
| Tolerance band | The plan ± the on track tolerance. While a reading is inside the band the status is `on_track`, so the band is the status made visible. |
| Readings | The measurement history, see **Where the readings come from** below. |
| Moving average | A trailing average over the raw readings. Off with `average: 0`. |
| Projection | Dashed, from the last reading to `sensor.<name>_projected_date`. Absent when that sensor is unknown. |

Readings outside the band are drawn hollow rather than filled, so the
distinction does not depend on colour alone.

### Where the readings come from

| `source` | What you get |
| --- | --- |
| `measurements` (default) | `weight_goal.get_measurements`, so exactly the readings the status, the trend and the projection are based on. Readings you deleted or ignored are gone. Capped at the internal history of 400 readings. |
| `history` | The recorder history of `sensor.<name>_weight`. Reaches back as far as your recorder keeps data and is not capped, but still contains readings you deleted, because the recorder keeps its own copy. Older ranges are aggregated, see [Known limitations](#known-limitations). |

### Options

Both cards take all of these. The card also accepts them nested under `chart:`,
which wins over the flat form.

| Option | Default | Meaning |
| --- | --- | --- |
| `entity` | – | Any entity of the goal. Required unless you set `device_id` or `entities`. |
| `device_id` | – | Alternative anchor, for generated dashboards. |
| `entities` | – | Override individual entities by key, for example `entities: {weight: sensor.something_else}`. Only needed if discovery gets something wrong. |
| `name` | device name | Header text. |
| `icon` | `mdi:scale-bathroom` | Header icon. |
| `source` | `measurements` | See above. |
| `range` | `goal` | `goal` for the whole goal period, a number of days, or `all`. |
| `average` | `7` | Days for the moving average. `0` turns it off. |
| `line` | `smooth` | `smooth`, `linear` or `step`. |
| `height` | `190` / `220` | Chart height in pixels. |
| `y_axis.min` / `y_axis.max` | – | Pin one or both ends of the vertical axis. Leave out for automatic. Readings outside are clipped, not squeezed in. |
| `y_axis.mode` | `nice` | `nice` rounds the automatic ends outwards to readable numbers. `tight` uses the smallest and largest value exactly, which is worth it when the movement is small compared to the goal range. |
| `y_axis.include_goal` | `true` | Whether the plan line and the band may widen the axis. `false` fits the axis to the readings and clips the plan. |
| `y_axis.ticks` | `4` | Roughly how many grid lines to draw. |
| `show.band`, `show.plan`, `show.average`, `show.projection`, `show.points`, `show.today`, `show.grid`, `show.axis` | all `true` | Individual layers. |
| `styles.<series>.color` | see below | Any CSS colour or `var(--…)`. On `weight`, `auto` follows the status. |
| `styles.<series>.width` | varies | Stroke width in pixels. |
| `styles.<series>.dash` | varies | SVG dash pattern, for example `"6 4"`. |
| `styles.<series>.opacity` | `1` | For `band` this is the fill opacity. |
| `styles.weight.point_size` | `3` | Radius of the reading dots. `0` hides them. |

Series names are `weight`, `average`, `plan`, `band` and `projection`.

Only for the card:

| Option | Default | Meaning |
| --- | --- | --- |
| `show_header`, `show_hero`, `show_badges`, `show_chart`, `show_progress`, `show_goal_editor` | `true` | Individual sections. |
| `show_record`, `show_restart` | `true` | The two actions, independent of each other. Both off is no action row at all. |
| `header` | `full` | `full` is the icon, the end date and the status. `compact` is one line of name and current weight. |
| `badges` | `[last_measurement, trend, remaining, projected_date]` | The chips below the weight, in the order given. `[]` hides them all, as does `show_badges: false`. |

### Badges

Built-in badge names, each showing the entity of the same name:
`last_measurement`, `projected_date`, `trend`, `deviation`, `remaining`,
`target_weight_today`, `weight_progress`, `time_progress`, `start_weight`,
`target_weight`, `rate_per_week`, `start_date`, `end_date`. Plus `source`, which
shows where the current reading came from.

A badge whose entity is missing or has no value is left out rather than shown
empty, so a list may name badges that only some goals have.

Any other entity works too:

```yaml
type: custom:weight-goal-card
entity: sensor.alex_status
badges:
  - last_measurement
  - trend
  - entity: sensor.alex_body_fat
    icon: mdi:percent
    name: Body fat
```

The visual editor offers the built-in names. Entity badges are YAML only, and
editing anything else in the visual editor keeps them.

### Language

The cards follow the language in your Home Assistant profile. Entity names,
units and the status value come from the integration's own translations, so
they match what the more-info dialog shows and cannot drift apart from it.
Sentences that belong to the cards themselves are translated in
`card/src/localize/`; English and German are complete. To add a language, copy
`de.ts`, translate the values and register it in `index.ts` — TypeScript will
tell you if you miss a key.

One exception: the card picker entry is registered when the bundle loads,
before Home Assistant tells it anything, so it follows the browser's language.

### Examples

Everything, with a two week average and a longer chart:

```yaml
type: custom:weight-goal-card
entity: sensor.alex_status
average: 14
chart:
  height: 260
  line: linear
```

Just the numbers, no chart:

```yaml
type: custom:weight-goal-card
entity: sensor.alex_status
show_chart: false
show_goal_editor: false
```

A wide chart in your own colours, without the raw readings:

```yaml
type: custom:weight-goal-card
entity: sensor.alex_status
range: 180
average: 7
height: 300
show:
  points: false
styles:
  average:
    color: "#ff7043"
    width: 3
  plan:
    color: var(--secondary-text-color)
    dash: "2 5"
  band:
    color: "#ff7043"
    opacity: 0.08
```

A tight axis, for when the readings move a kilogram inside a ten kilogram goal:

```yaml
type: custom:weight-goal-card
entity: sensor.alex_status
range: 30
y_axis:
  mode: tight
  include_goal: false
```

A fixed axis, so the chart does not rescale under you every time a reading
lands:

```yaml
type: custom:weight-goal-card
entity: sensor.alex_status
y_axis:
  min: 72
  max: 86
  ticks: 7
```

Only the chips you care about, and one from another integration:

```yaml
type: custom:weight-goal-card
entity: sensor.alex_status
badges:
  - trend
  - source
  - entity: sensor.alex_muscle_mass
    icon: mdi:arm-flex
```

Two people side by side:

```yaml
type: grid
columns: 2
cards:
  - type: custom:weight-goal-card
    entity: sensor.alex_status
  - type: custom:weight-goal-card
    entity: sensor.robin_status
```

### Card troubleshooting

**"No Road to Weight Goal entities found."** The entity in `entity` does not
belong to a goal, or the goal's entities are all hidden. Point it at
`sensor.<name>_status`.

**"Custom element doesn't exist: weight-goal-card."** The bundle never reached
the browser. Open `/weight_goal/frontend/weight-goal-card.js` on your instance:

- *JavaScript comes back* — the file is served, so the resource entry is the
  problem. Look under **Settings → Dashboards → Resources**: there should be
  exactly one entry for it, ending in `?v=<version>`. If it is missing, search
  the log for `weight_goal` — the registration logs either the URL it wrote or
  the reason it could not. If there are two entries, delete one; loading the
  bundle twice makes the second registration of the elements fail. Then reload
  the page with the cache cleared.
- *404* — the file is not being served. Check that
  `config/custom_components/weight_goal/www/weight-goal-card.js` exists and that
  Home Assistant was restarted rather than just reloaded. If the bundle is
  missing there is a warning in the log naming the path it looked at.

**The chart is empty but there is a weight.** With `source: measurements` this
means the internal history is empty, which happens on a fresh install. Run
`weight_goal.import_history` to fill it.

**The plan line is missing.** The goal is incomplete. Open the goal section and
set the start weight, the target weight and both dates.

**The target weight cannot be edited in the card.** The goal is defined by
change per week, so the target is derived. Edit the rate instead, or switch the
mode under **Configure → Settings**.

## Events and actions

Every event is fired on the event bus and can additionally run a script you
configure under **Configure → Actions**. Both, not one or the other.

| Event | Data |
| --- | --- |
| `weight_goal_measurement_recorded` | `weight`, `timestamp`, `source` |
| `weight_goal_status_changed` | `from_status`, `to_status` |
| `weight_goal_goal_reached` | `weight`, `target_weight` |
| `weight_goal_goal_ended` | `weight`, `target_weight`, `reached` |
| `weight_goal_measurement_overdue` | `last_measurement`, `days` |

Every event also carries `entry_id` and `name`.

### Example: speak the result when the goal ends

```yaml
automation:
  - alias: Weight goal finished
    triggers:
      - trigger: event
        event_type: weight_goal_goal_ended
    actions:
      - action: tts.speak
        target:
          entity_id: tts.piper
        data:
          media_player_entity_id: media_player.kitchen
          message: >-
            {{ trigger.event.data.name }} finished at
            {{ trigger.event.data.weight }} kilograms.
```

### Example: record a weight from another integration

```yaml
automation:
  - alias: Forward the scale to the goal
    triggers:
      - trigger: state
        entity_id: sensor.my_scale_weight
    conditions:
      - condition: template
        value_template: "{{ trigger.to_state.state not in ['unknown', 'unavailable'] }}"
    actions:
      - action: weight_goal.record_weight
        target:
          entity_id: sensor.alex_status
        data:
          weight: "{{ trigger.to_state.state | float }}"
```

You normally do not need this: point the **Weight source** option at the sensor
instead.

## Known limitations

- **History depth follows your recorder.** Individual weigh-ins live in
  recorded states, which the recorder keeps for ten days by default. Beyond
  that only long term statistics remain, which are aggregated: a ninety day
  chart shows a smoothed curve rather than single measurements. Raise
  `purge_keep_days` if you want individual points further back.
- **Individual past weigh-ins cannot be restored.** The recorder's states table
  cannot be written retroactively. `import_history` with `write_statistics`
  backfills long term statistics, which is what graphs read for older ranges,
  but the short term view still starts on the day you set the integration up.
- **Deleting a measurement does not clear the graph.** `delete_measurement` and
  `ignore_last_measurement` remove a reading from the trend, the projection and
  the status. The recorder keeps its own copy, so the point stays in the short
  term history graph.
- **`projected_date` is a straight line through the last two weeks.** It is not
  a forecast, and it is unavailable when the recent trend runs against the goal.
- **Weights are kilograms.** Display converts to your unit system, but the
  source entity and the services expect kilograms.
- **The rate is always `kg/w`.** Home Assistant has no device class for mass
  per time, so the change per week is not converted along with the other
  weights. On an imperial instance the weights show as pounds while the rate
  stays in kilograms per week.
- **Time dependent behaviour across real days** has been verified with a frozen
  clock in the test suite, not by running for weeks.

## How often the sensors update

The planned weight is a continuous function of time, so a sensor can only ever
be a sampled version of it. By default the integration recalculates at local
midnight and after every measurement. Nothing is polled.

That resolution is right for the numbers themselves. A body weight plan does
not move meaningfully within a day, and an hourly sample would write several
hundred rows a day into your database for nothing.

It is not right for charting. If you plot `sensor.<name>_target_weight_today`
or `sensor.<name>_deviation` in a chart card, the curve is drawn from recorded
states and will look like a staircase with one step per day. Set **Extra
recalculation** to the interval you need in that case, and be aware that the
cost is one recorded state per sensor per interval.

If you build your own card, prefer computing the plan from the start weight,
the target weight and the two dates. It is a straight line, so it can be drawn
exactly at any resolution without sampling anything.

## Troubleshooting

**A weight was ignored.** Look for a warning in the log naming the value. It is
either outside the plausible range or beyond the largest accepted change.

**The status will not leave `behind`.** The hysteresis holds it until the
deviation is back inside half the tolerance.

**The target weight cannot be edited.** The goal is defined by change per week.
Switch the mode under **Configure → Settings**.

**Everything is `unknown`.** No measurement has been recorded yet. Enter one
through `number.<name>_manual_weight` or wait for the source entity.

## For developers

Users do not need anything in this section.

```bash
python -m venv .venv && . .venv/bin/activate
pip install -r requirements-test.txt
pip install "home-assistant-frontend==$(python -c 'import json,pathlib;print(json.loads((pathlib.Path(__import__("homeassistant").__file__).parent/"components/frontend/manifest.json").read_text())["requirements"][0].split("==")[1])')"
pytest tests -q
ruff check --select F,E9 custom_components tests
```

Two implementation notes that cost time to find:

- Entity IDs are pinned in `add_to_platform_start`. `_attr_suggested_object_id`
  looks like the right tool but is never read: `Entity.suggested_object_id` is
  derived from the name alone.
- Home Assistant 2026 has a separate entity ID language in the core config,
  which a user can set to English. That is a user setting with the interface
  language as its default, so it does not replace pinning the IDs here.

### The cards

The card sources live in `card/`. TypeScript, Lit, Rollup; Lit is bundled and
there are no other runtime dependencies.

```bash
cd card
npm ci
npm run typecheck
npm test
npm run build     # or: npm run watch
```

The build writes `custom_components/weight_goal/www/weight-goal-card.js` and a
copy in `card/dist/`. The first one is committed on purpose: installing the
integration has to be enough to get the cards, so nobody needs node to use
them. CI rebuilds and fails if the committed bundle differs from the sources.

When bumping the version, change all three of `custom_components/weight_goal/manifest.json`,
`card/package.json` and `CARD_VERSION` in `card/src/const.ts`, then rebuild. CI
checks that the bundle header carries the manifest version, because a stale
bundle in a release is otherwise invisible.

`card/src/lib/plan.ts` is a port of `planned_weight()` and `goal_weeks()` from
`helpers.py`. If you change the plan maths in one, change it in the other:
`card/test/plan.test.ts` covers the same cases as `tests/test_time.py`, and the
two have to agree or the drawn line will not pass through
`sensor.<name>_target_weight_today`.

## License

MIT. See [LICENSE](LICENSE).
