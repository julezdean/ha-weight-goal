/**
 * English strings, and the shape every other language has to match.
 *
 * Only strings the card owns live here. Entity names and status values come
 * from the integration's own translations through `hass`, so they follow the
 * user's language without being duplicated, and they cannot drift apart from
 * what the more-info dialog shows.
 */
export const en = {
  "picker.card_name": "Weight goal",
  "picker.card_description":
    "Weight against the planned trajectory, with the chart, the progress bars and the actions of one Road to Weight Goal entry.",
  "card.fallback_name": "Weight goal",

  "card.no_entities":
    "No Road to Weight Goal entities found for {anchor}. Point `entity` at one entity of the goal, for example sensor.<name>_status.",
  "card.no_target":
    "This goal has no sensor entity, so actions and readings cannot be loaded.",
  "card.load_failed": "Could not load the readings.",

  "chart.loading": "Loading…",
  "chart.empty": "No readings and no goal yet",
  "chart.readings": "Readings",
  "chart.vs_plan": "{value} {unit} vs plan",
  "chart.summary_readings": "{count} readings",
  "chart.summary_no_weight": "no current weight",
  "chart.summary_current": "currently {value} {unit}",
  "chart.summary_above": "{value} {unit} above plan",
  "chart.summary_below": "{value} {unit} below plan",
  "chart.summary_plan": "plan from {start} to {target} {unit}",

  "header.until": "Until {date}",
  "header.status": "Status: {status}",

  "hero.above_plan": "above plan",
  "hero.below_plan": "below plan",
  "hero.on_plan": "on plan",
  "badges.no_reading": "No reading yet",

  "badge.source.manual": "Entered by hand",
  "badge.source.sensor": "From the scale",
  "badge.source.service": "From an automation",
  "badge.source.import": "Imported",

  "actions.save": "Save reading",
  "actions.restart": "Restart today",
  "actions.restart_title": "Move the goal start to today",
  "actions.confirm_restart": "Confirm restart",
  "actions.restart_hint":
    "Confirming sets the start weight to your latest reading and the start date to today. The end date stays.",
  "actions.enter_number": "Enter a number first.",
  "actions.failed":
    "That did not work. Check the Home Assistant log for details.",
  "actions.weight_input": "Weight in {unit}",

  "goal.title": "Goal",
  "goal.derived": "calculated",
  "goal.derived_hint":
    "One of these two is calculated from the other. Change the goal mode in the integration options to set it directly.",

  "progress.weight": "Weight",
  "progress.time": "Time",
  "progress.aria": "{label} progress",

  "editor.loading": "Loading the editor… if this stays here, edit the card in YAML.",
  "editor.entity": "Goal entity",
  "editor.entity_help": "Any entity of the goal. The card finds the rest itself.",
  "editor.name": "Name",
  "editor.icon": "Icon",
  "editor.badges": "Badges",
  "editor.badges_help":
    "The small chips under the weight, in the order you pick them.",
  "editor.sections": "Sections",
  "editor.chart": "Chart",
  "editor.source": "Readings from",
  "editor.source_help":
    "Integration readings are exactly what the status is based on. Recorder history reaches further back but still contains readings you deleted.",
  "editor.source_measurements": "Integration readings",
  "editor.source_history": "Recorder history",
  "editor.range": "Time range",
  "editor.range_help": "A number is read as days.",
  "editor.range_goal": "Whole goal period",
  "editor.range_30": "Last 30 days",
  "editor.range_90": "Last 90 days",
  "editor.range_365": "Last year",
  "editor.range_all": "Everything",
  "editor.line": "Line shape",
  "editor.line_smooth": "Smooth",
  "editor.line_linear": "Straight",
  "editor.line_step": "Stepped",
  "editor.average": "Moving average",
  "editor.average_help": "Extra line over the raw readings. 0 turns it off.",
  "editor.height": "Chart height",
  "editor.y_axis": "Vertical axis",
  "editor.mode": "Automatic ends",
  "editor.mode_help":
    "Rounded gives readable labels. Fit the data uses the smallest and largest value exactly, which leaves more room for the movement.",
  "editor.mode_nice": "Rounded",
  "editor.mode_tight": "Fit the data",
  "editor.include_goal": "Fit the plan line too",
  "editor.include_goal_help":
    "Off keeps the axis on the readings and clips the plan line if it runs outside.",
  "editor.min": "Lowest value",
  "editor.max": "Highest value",
  "editor.axis_bound_help": "Leave empty to follow the data.",
  "editor.ticks": "Grid lines",
  "editor.layers": "Layers",
  "editor.band": "Tolerance band",
  "editor.plan": "Plan line",
  "editor.projection": "Projection",
  "editor.points": "Reading dots",
  "editor.today": "Today marker",
  "editor.grid": "Grid lines",
  "editor.axis": "Axis labels",
  "editor.show_header": "Header",
  "editor.header": "Header style",
  "editor.header_full": "Full",
  "editor.header_compact": "Compact",
  "editor.show_hero": "Current weight",
  "editor.show_badges": "Badges",
  "editor.show_chart": "Chart",
  "editor.show_progress": "Progress bars",
  "editor.show_record": "Save reading",
  "editor.show_restart": "Restart today",
  "editor.show_goal_editor": "Goal settings",
} as const;

export type TranslationKey = keyof typeof en;
