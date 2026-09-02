import type { TranslationKey } from "./en";

/**
 * German strings.
 *
 * Typed as a complete record of the English keys, so leaving one out is a
 * compile error rather than an English sentence appearing in a German card.
 */
export const de: Record<TranslationKey, string> = {
  "picker.card_name": "Gewichtsziel",
  "picker.card_description":
    "Das Gewicht im Verhältnis zur geplanten Kurve, mit Diagramm, Fortschrittsbalken und den Aktionen eines Ziels aus „Road to Weight Goal“.",
  "card.fallback_name": "Gewichtsziel",

  "card.no_entities":
    "Keine Entitäten von „Road to Weight Goal“ für {anchor} gefunden. Setze `entity` auf eine Entität des Ziels, zum Beispiel sensor.<name>_status.",
  "card.no_target":
    "Dieses Ziel hat keine Sensor-Entität, deshalb lassen sich weder Aktionen ausführen noch Messwerte laden.",
  "card.load_failed": "Die Messwerte konnten nicht geladen werden.",

  "chart.loading": "Wird geladen …",
  "chart.empty": "Noch keine Messwerte und kein Ziel",
  "chart.readings": "Messwerte",
  "chart.vs_plan": "{value} {unit} zum Plan",
  "chart.summary_readings": "{count} Messwerte",
  "chart.summary_no_weight": "kein aktuelles Gewicht",
  "chart.summary_current": "aktuell {value} {unit}",
  "chart.summary_above": "{value} {unit} über Plan",
  "chart.summary_below": "{value} {unit} unter Plan",
  "chart.summary_plan": "Plan von {start} auf {target} {unit}",

  "header.until": "Bis {date}",
  "header.status": "Status: {status}",

  "hero.above_plan": "über Plan",
  "hero.below_plan": "unter Plan",
  "hero.on_plan": "auf Plan",
  "badges.no_reading": "Noch keine Messung",

  "badge.source.manual": "Von Hand erfasst",
  "badge.source.sensor": "Von der Waage",
  "badge.source.service": "Aus einer Automatisierung",
  "badge.source.import": "Importiert",

  "actions.save": "Messung speichern",
  "actions.restart": "Heute neu starten",
  "actions.restart_title": "Den Zielstart auf heute legen",
  "actions.confirm_restart": "Neustart bestätigen",
  "actions.restart_hint":
    "Beim Bestätigen werden Startgewicht auf die letzte Messung und Startdatum auf heute gesetzt. Das Zieldatum bleibt.",
  "actions.enter_number": "Bitte zuerst eine Zahl eingeben.",
  "actions.failed":
    "Das hat nicht geklappt. Die Einzelheiten stehen im Home-Assistant-Log.",
  "actions.weight_input": "Gewicht in {unit}",

  "goal.title": "Ziel",
  "goal.derived": "berechnet",
  "goal.derived_hint":
    "Einer dieser beiden Werte wird aus dem anderen berechnet. Ändere den Modus in den Optionen der Integration, um ihn direkt zu setzen.",

  "progress.weight": "Gewicht",
  "progress.time": "Zeit",
  "progress.aria": "Fortschritt {label}",

  "editor.loading":
    "Der Editor wird geladen … bleibt das stehen, bearbeite die Karte in YAML.",
  "editor.entity": "Entität des Ziels",
  "editor.entity_help":
    "Eine beliebige Entität des Ziels. Den Rest findet die Karte selbst.",
  "editor.name": "Name",
  "editor.icon": "Symbol",
  "editor.badges": "Badges",
  "editor.badges_help":
    "Die kleinen Chips unter dem Gewicht, in der Reihenfolge der Auswahl.",
  "editor.sections": "Bereiche",
  "editor.chart": "Diagramm",
  "editor.source": "Messwerte aus",
  "editor.source_help":
    "Die Messwerte der Integration sind genau die, auf denen der Status beruht. Die Recorder-Historie reicht weiter zurück, enthält aber auch gelöschte Messungen.",
  "editor.source_measurements": "Messwerte der Integration",
  "editor.source_history": "Recorder-Historie",
  "editor.range": "Zeitraum",
  "editor.range_help": "Eine Zahl wird als Tage gelesen.",
  "editor.range_goal": "Gesamter Zielzeitraum",
  "editor.range_30": "Letzte 30 Tage",
  "editor.range_90": "Letzte 90 Tage",
  "editor.range_365": "Letztes Jahr",
  "editor.range_all": "Alles",
  "editor.line": "Linienform",
  "editor.line_smooth": "Geglättet",
  "editor.line_linear": "Gerade",
  "editor.line_step": "Stufen",
  "editor.average": "Gleitender Mittelwert",
  "editor.average_help":
    "Zusätzliche Linie über den Rohwerten. 0 schaltet sie aus.",
  "editor.height": "Höhe des Diagramms",
  "editor.y_axis": "Y-Achse",
  "editor.mode": "Automatische Enden",
  "editor.mode_help":
    "„Gerundet“ ergibt lesbare Beschriftungen. „An die Daten anpassen“ nimmt kleinsten und größten Wert exakt und lässt damit mehr Platz für die Bewegung.",
  "editor.mode_nice": "Gerundet",
  "editor.mode_tight": "An die Daten anpassen",
  "editor.include_goal": "Planlinie mit einbeziehen",
  "editor.include_goal_help":
    "Aus hält die Achse bei den Messwerten und schneidet die Planlinie ab, wenn sie darüber hinausläuft.",
  "editor.min": "Kleinster Wert",
  "editor.max": "Größter Wert",
  "editor.axis_bound_help": "Leer lassen, um den Daten zu folgen.",
  "editor.ticks": "Gitterlinien",
  "editor.layers": "Ebenen",
  "editor.band": "Toleranzband",
  "editor.plan": "Planlinie",
  "editor.projection": "Prognose",
  "editor.points": "Messpunkte",
  "editor.today": "Heute-Markierung",
  "editor.grid": "Gitterlinien",
  "editor.axis": "Achsenbeschriftung",
  "editor.show_header": "Kopfzeile",
  "editor.header": "Header-Stil",
  "editor.header_full": "Vollständig",
  "editor.header_compact": "Kompakt",
  "editor.show_hero": "Aktuelles Gewicht",
  "editor.show_badges": "Badges",
  "editor.show_chart": "Diagramm",
  "editor.show_progress": "Fortschrittsbalken",
  "editor.show_actions": "Aktionen",
  "editor.show_record": "Messung speichern",
  "editor.show_restart": "Heute neu starten",
  "editor.show_goal_editor": "Zieleinstellungen",
};
