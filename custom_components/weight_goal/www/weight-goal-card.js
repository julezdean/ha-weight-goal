/*! weight-goal-card 0.11.0-beta.3 | MIT | https://github.com/julezdean/ha-weight-goal */
const t="weight_goal",e="weight-goal-card",i={no_goal:"var(--disabled-text-color, #9e9e9e)",upcoming:"var(--secondary-text-color, #727272)",on_track:"var(--primary-color, #03a9f4)",ahead:"var(--success-color, #43a047)",behind:"var(--warning-color, #ffa726)",reached:"var(--success-color, #43a047)",ended:"var(--secondary-text-color, #727272)"},s={no_goal:"mdi:target-variant",upcoming:"mdi:calendar-clock",on_track:"mdi:check-circle-outline",ahead:"mdi:rocket-launch-outline",behind:"mdi:alert-circle-outline",reached:"mdi:flag-checkered",ended:"mdi:calendar-check-outline"},o=new Set(["unavailable","unknown"]),r={"picker.card_name":"Weight goal","picker.card_description":"Weight against the planned trajectory, with the chart, the progress bars and the actions of one Road to Weight Goal entry.","card.fallback_name":"Weight goal","card.no_entities":"No Road to Weight Goal entities found for {anchor}. Point `entity` at one entity of the goal, for example sensor.<name>_status.","card.no_target":"This goal has no sensor entity, so actions and readings cannot be loaded.","card.load_failed":"Could not load the readings.","chart.loading":"Loading…","chart.empty":"No readings and no goal yet","chart.readings":"Readings","chart.vs_plan":"{value} {unit} vs plan","chart.summary_readings":"{count} readings","chart.summary_no_weight":"no current weight","chart.summary_current":"currently {value} {unit}","chart.summary_above":"{value} {unit} above plan","chart.summary_below":"{value} {unit} below plan","chart.summary_plan":"plan from {start} to {target} {unit}","header.until":"Until {date}","header.status":"Status: {status}","hero.above_plan":"above plan","hero.below_plan":"below plan","hero.on_plan":"on plan","badges.no_reading":"No reading yet","badge.source.manual":"Entered by hand","badge.source.sensor":"From the scale","badge.source.service":"From an automation","badge.source.import":"Imported","badge.source.statistics":"Daily average","actions.save":"Save reading","actions.enter_number":"Enter a number first.","actions.failed":"That did not work. Check the Home Assistant log for details.","actions.weight_input":"Weight in {unit}","actions.date_input":"Day of the reading","actions.future_date":"A reading can only be from today or an earlier day.","goal.title":"Goal","goal.derived":"calculated","goal.derived_hint":"One of these two is calculated from the other. Change how the goal is defined under Change goal on the integration page to set it directly.","goal.none":"No goal is active. Pick one in the goal list, or add one there with New goal.","goals.title":"Goals","goals.empty":"No goals yet.","goals.manage":"Change or delete goals on the integration page","goals.active":"active","goals.activate":"Activate","goals.reached":"Reached at {value} {unit}","goals.missed":"Ended at {value} {unit}","goals.planned":"Not started","goals.running":"Running","goals.no_reading":"No reading in its period","goals.new":"New goal","goals.form.name":"Name","goals.form.mode":"Define the goal by","goals.form.mode_target":"Target weight","goals.form.mode_rate":"Change per week","goals.form.start_date":"Start date","goals.form.start_weight":"Start weight in {unit}","goals.form.end_date":"End date","goals.form.target_weight":"Target weight in {unit}","goals.form.rate":"Change per week in {unit}","goals.form.activate":"Make it the active goal","goals.form.save":"Add goal","goals.form.cancel":"Cancel","goals.form.incomplete":"Fill in the end date and the goal value as numbers.","progress.weight":"Weight","progress.time":"Time","progress.aria":"{label} progress","editor.loading":"Loading the editor… if this stays here, edit the card in YAML.","editor.entity":"Goal entity","editor.entity_help":"Any entity of the goal. The card finds the rest itself.","editor.name":"Name","editor.icon":"Icon","editor.badges":"Badges","editor.badges_help":"The small chips under the weight, in the order you pick them.","editor.sections":"Sections","editor.chart":"Chart","editor.source":"Readings from","editor.source_help":"Integration readings are exactly what the status is based on. Recorder history reaches further back but still contains readings you deleted.","editor.source_measurements":"Integration readings","editor.source_history":"Recorder history","editor.range":"Time range","editor.range_help":"A number is read as days.","editor.range_goal":"Whole goal period","editor.range_30":"Last 30 days","editor.range_90":"Last 90 days","editor.range_365":"Last year","editor.range_all":"Everything","editor.line":"Line shape","editor.line_smooth":"Smooth","editor.line_linear":"Straight","editor.line_step":"Stepped","editor.average":"Moving average","editor.average_help":"Extra line over the raw readings. 0 turns it off.","editor.height":"Chart height","editor.y_axis":"Vertical axis","editor.mode":"Automatic ends","editor.mode_help":"Rounded gives readable labels. Fit the data uses the smallest and largest value exactly, which leaves more room for the movement.","editor.mode_nice":"Rounded","editor.mode_tight":"Fit the data","editor.include_goal":"Fit the plan line too","editor.include_goal_help":"Off keeps the axis on the readings and clips the plan line if it runs outside.","editor.min":"Lowest value","editor.max":"Highest value","editor.axis_bound_help":"Leave empty to follow the data.","editor.ticks":"Grid lines","editor.layers":"Layers","editor.band":"Tolerance band","editor.plan":"Plan line","editor.projection":"Projection","editor.goals":"Other goals","editor.points":"Reading dots","editor.today":"Today marker","editor.grid":"Grid lines","editor.axis":"Axis labels","editor.show_header":"Header","editor.header":"Header style","editor.header_full":"Full","editor.header_compact":"Compact","editor.show_hero":"Current weight","editor.show_badges":"Badges","editor.show_chart":"Chart","editor.show_progress":"Progress bars","editor.show_record":"Save reading","editor.show_record_date":"Day of the reading","editor.show_goal_editor":"Goal settings","editor.show_goals":"Goal list","editor.interactions":"Interactions","editor.tap_action":"Tap action","editor.tap_action_help":"Once any action is set it covers the whole card, and the weight, the status and the badges no longer open their own dialogs.","editor.hold_action":"Hold action","editor.double_tap_action":"Double tap action"},a={en:r,de:{"picker.card_name":"Gewichtsziel","picker.card_description":"Das Gewicht im Verhältnis zur geplanten Kurve, mit Diagramm, Fortschrittsbalken und den Aktionen eines Ziels aus „Road to Weight Goal“.","card.fallback_name":"Gewichtsziel","card.no_entities":"Keine Entitäten von „Road to Weight Goal“ für {anchor} gefunden. Setze `entity` auf eine Entität des Ziels, zum Beispiel sensor.<name>_status.","card.no_target":"Dieses Ziel hat keine Sensor-Entität, deshalb lassen sich weder Aktionen ausführen noch Messwerte laden.","card.load_failed":"Die Messwerte konnten nicht geladen werden.","chart.loading":"Wird geladen …","chart.empty":"Noch keine Messwerte und kein Ziel","chart.readings":"Messwerte","chart.vs_plan":"{value} {unit} zum Plan","chart.summary_readings":"{count} Messwerte","chart.summary_no_weight":"kein aktuelles Gewicht","chart.summary_current":"aktuell {value} {unit}","chart.summary_above":"{value} {unit} über Plan","chart.summary_below":"{value} {unit} unter Plan","chart.summary_plan":"Plan von {start} auf {target} {unit}","header.until":"Bis {date}","header.status":"Status: {status}","hero.above_plan":"über Plan","hero.below_plan":"unter Plan","hero.on_plan":"auf Plan","badges.no_reading":"Noch keine Messung","badge.source.manual":"Von Hand erfasst","badge.source.sensor":"Von der Waage","badge.source.service":"Aus einer Automatisierung","badge.source.import":"Importiert","badge.source.statistics":"Tagesmittel","actions.save":"Messung speichern","actions.enter_number":"Bitte zuerst eine Zahl eingeben.","actions.failed":"Das hat nicht geklappt. Die Einzelheiten stehen im Home-Assistant-Log.","actions.weight_input":"Gewicht in {unit}","actions.date_input":"Tag der Messung","actions.future_date":"Eine Messung kann nur von heute oder einem früheren Tag sein.","goal.title":"Ziel","goal.derived":"berechnet","goal.derived_hint":"Einer der beiden Werte wird aus dem anderen berechnet. Unter Ziel ändern auf der Seite der Integration legst du fest, welcher direkt eingestellt wird.","goal.none":"Kein Ziel ist aktiv. Wähle eins in der Zielliste oder lege dort mit Neues Ziel eins an.","goals.title":"Ziele","goals.empty":"Noch keine Ziele.","goals.manage":"Ziele auf der Seite der Integration ändern oder löschen","goals.active":"aktiv","goals.activate":"Aktivieren","goals.reached":"Erreicht mit {value} {unit}","goals.missed":"Beendet mit {value} {unit}","goals.planned":"Noch nicht begonnen","goals.running":"Läuft","goals.no_reading":"Keine Messung im Zeitraum","goals.new":"Neues Ziel","goals.form.name":"Name","goals.form.mode":"Ziel festlegen über","goals.form.mode_target":"Zielgewicht","goals.form.mode_rate":"Änderung pro Woche","goals.form.start_date":"Startdatum","goals.form.start_weight":"Startgewicht in {unit}","goals.form.end_date":"Enddatum","goals.form.target_weight":"Zielgewicht in {unit}","goals.form.rate":"Änderung pro Woche in {unit}","goals.form.activate":"Zum aktiven Ziel machen","goals.form.save":"Ziel anlegen","goals.form.cancel":"Abbrechen","goals.form.incomplete":"Trag das Enddatum und den Zielwert als Zahl ein.","progress.weight":"Gewicht","progress.time":"Zeit","progress.aria":"Fortschritt {label}","editor.loading":"Der Editor wird geladen … bleibt das stehen, bearbeite die Karte in YAML.","editor.entity":"Entität des Ziels","editor.entity_help":"Eine beliebige Entität des Ziels. Den Rest findet die Karte selbst.","editor.name":"Name","editor.icon":"Symbol","editor.badges":"Badges","editor.badges_help":"Die kleinen Chips unter dem Gewicht, in der Reihenfolge der Auswahl.","editor.sections":"Bereiche","editor.chart":"Diagramm","editor.source":"Messwerte aus","editor.source_help":"Die Messwerte der Integration sind genau die, auf denen der Status beruht. Die Recorder-Historie reicht weiter zurück, enthält aber auch gelöschte Messungen.","editor.source_measurements":"Messwerte der Integration","editor.source_history":"Recorder-Historie","editor.range":"Zeitraum","editor.range_help":"Eine Zahl wird als Tage gelesen.","editor.range_goal":"Gesamter Zielzeitraum","editor.range_30":"Letzte 30 Tage","editor.range_90":"Letzte 90 Tage","editor.range_365":"Letztes Jahr","editor.range_all":"Alles","editor.line":"Linienform","editor.line_smooth":"Geglättet","editor.line_linear":"Gerade","editor.line_step":"Stufen","editor.average":"Gleitender Mittelwert","editor.average_help":"Zusätzliche Linie über den Rohwerten. 0 schaltet sie aus.","editor.height":"Höhe des Diagramms","editor.y_axis":"Y-Achse","editor.mode":"Automatische Enden","editor.mode_help":"„Gerundet“ ergibt lesbare Beschriftungen. „An die Daten anpassen“ nimmt kleinsten und größten Wert exakt und lässt damit mehr Platz für die Bewegung.","editor.mode_nice":"Gerundet","editor.mode_tight":"An die Daten anpassen","editor.include_goal":"Planlinie mit einbeziehen","editor.include_goal_help":"Aus hält die Achse bei den Messwerten und schneidet die Planlinie ab, wenn sie darüber hinausläuft.","editor.min":"Kleinster Wert","editor.max":"Größter Wert","editor.axis_bound_help":"Leer lassen, um den Daten zu folgen.","editor.ticks":"Gitterlinien","editor.layers":"Ebenen","editor.band":"Toleranzband","editor.plan":"Planlinie","editor.projection":"Prognose","editor.goals":"Andere Ziele","editor.points":"Messpunkte","editor.today":"Heute-Markierung","editor.grid":"Gitterlinien","editor.axis":"Achsenbeschriftung","editor.show_header":"Kopfzeile","editor.header":"Header-Stil","editor.header_full":"Vollständig","editor.header_compact":"Kompakt","editor.show_hero":"Aktuelles Gewicht","editor.show_badges":"Badges","editor.show_chart":"Diagramm","editor.show_progress":"Fortschrittsbalken","editor.show_record":"Messung speichern","editor.show_record_date":"Tag der Messung","editor.show_goal_editor":"Zieleinstellungen","editor.show_goals":"Zielliste","editor.interactions":"Interaktionen","editor.tap_action":"Aktion beim Tippen","editor.tap_action_help":"Sobald eine Aktion gesetzt ist, gilt sie für die ganze Karte, und Gewicht, Status und Badges öffnen keine eigenen Dialoge mehr.","editor.hold_action":"Aktion beim Halten","editor.double_tap_action":"Aktion beim Doppeltippen"}};function n(t,e,i={}){return l(function(t){return t?.locale?.language||t?.language||"en"}(t),e,i)}function l(t,e,i={}){let s=(a[t]??a[t.split("-")[0].toLowerCase()]??a.en)[e]??r[e]??e;for(const[t,e]of Object.entries(i))s=s.split(`{${t}}`).join(String(e));return s}function d(t){return(e,i)=>n(t,e,i)}function c(t,e,i){if(!t||!e)return"";const s=t.states[e]?.attributes?.friendly_name;return s?i&&s.startsWith(`${i} `)?s.slice(i.length+1):s:e}function h(t,e){if(!t||!e)return"";if("function"==typeof t.formatEntityState)try{return t.formatEntityState(e)}catch{}const i=e.attributes?.unit_of_measurement;return i?`${e.state} ${i}`:e.state}function u(t,e,i,s){var o,r=arguments.length,a=r<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,s);else for(var n=t.length-1;n>=0;n--)(o=t[n])&&(a=(r<3?o(a):r>3?o(e,i,a):o(e,i))||a);return r>3&&a&&Object.defineProperty(e,i,a),a}"function"==typeof SuppressedError&&SuppressedError;const p=globalThis,g=p.ShadowRoot&&(void 0===p.ShadyCSS||p.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,m=Symbol(),_=new WeakMap;let f=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==m)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(g&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=_.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&_.set(e,t))}return t}toString(){return this.cssText}};const y=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new f(i,t,m)},b=g?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new f("string"==typeof t?t:t+"",void 0,m))(e)})(t):t,{is:v,defineProperty:$,getOwnPropertyDescriptor:w,getOwnPropertyNames:x,getOwnPropertySymbols:k,getPrototypeOf:A}=Object,E=globalThis,S=E.trustedTypes,M=S?S.emptyScript:"",D=E.reactiveElementPolyfillSupport,C=(t,e)=>t,T={toAttribute(t,e){switch(e){case Boolean:t=t?M:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},P=(t,e)=>!v(t,e),z={attribute:!0,type:String,converter:T,reflect:!1,useDefault:!1,hasChanged:P};Symbol.metadata??=Symbol("metadata"),E.litPropertyMetadata??=new WeakMap;let N=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=z){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&$(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:o}=w(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const r=s?.call(this);o?.call(this,e),this.requestUpdate(t,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??z}static _$Ei(){if(this.hasOwnProperty(C("elementProperties")))return;const t=A(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(C("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(C("properties"))){const t=this.properties,e=[...x(t),...k(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(b(t))}else void 0!==t&&e.push(b(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,e)=>{if(g)t.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of e){const e=document.createElement("style"),s=p.litNonce;void 0!==s&&e.setAttribute("nonce",s),e.textContent=i.cssText,t.appendChild(e)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const o=(void 0!==i.converter?.toAttribute?i.converter:T).toAttribute(e,i.type);this._$Em=t,null==o?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),o="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:T;this._$Em=s;const r=o.fromAttribute(e,t.type);this[s]=r??this._$Ej?.get(s)??r,this._$Em=null}}requestUpdate(t,e,i,s=!1,o){if(void 0!==t){const r=this.constructor;if(!1===s&&(o=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??P)(o,e)||i.useDefault&&i.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:o},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),!0!==o||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};N.elementStyles=[],N.shadowRootOptions={mode:"open"},N[C("elementProperties")]=new Map,N[C("finalized")]=new Map,D?.({ReactiveElement:N}),(E.reactiveElementVersions??=[]).push("2.1.2");const O=globalThis,W=t=>t,R=O.trustedTypes,j=R?R.createPolicy("lit-html",{createHTML:t=>t}):void 0,U="$lit$",H=`lit$${Math.random().toFixed(9).slice(2)}$`,I="?"+H,G=`<${I}>`,L=document,F=()=>L.createComment(""),B=t=>null===t||"object"!=typeof t&&"function"!=typeof t,Z=Array.isArray,q="[ \t\n\f\r]",K=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,V=/-->/g,Y=/>/g,X=RegExp(`>|${q}(?:([^\\s"'>=/]+)(${q}*=${q}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),J=/'/g,Q=/"/g,tt=/^(?:script|style|textarea|title)$/i,et=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),it=et(1),st=et(2),ot=Symbol.for("lit-noChange"),rt=Symbol.for("lit-nothing"),at=new WeakMap,nt=L.createTreeWalker(L,129);function lt(t,e){if(!Z(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==j?j.createHTML(e):e}const dt=(t,e)=>{const i=t.length-1,s=[];let o,r=2===e?"<svg>":3===e?"<math>":"",a=K;for(let e=0;e<i;e++){const i=t[e];let n,l,d=-1,c=0;for(;c<i.length&&(a.lastIndex=c,l=a.exec(i),null!==l);)c=a.lastIndex,a===K?"!--"===l[1]?a=V:void 0!==l[1]?a=Y:void 0!==l[2]?(tt.test(l[2])&&(o=RegExp("</"+l[2],"g")),a=X):void 0!==l[3]&&(a=X):a===X?">"===l[0]?(a=o??K,d=-1):void 0===l[1]?d=-2:(d=a.lastIndex-l[2].length,n=l[1],a=void 0===l[3]?X:'"'===l[3]?Q:J):a===Q||a===J?a=X:a===V||a===Y?a=K:(a=X,o=void 0);const h=a===X&&t[e+1].startsWith("/>")?" ":"";r+=a===K?i+G:d>=0?(s.push(n),i.slice(0,d)+U+i.slice(d)+H+h):i+H+(-2===d?e:h)}return[lt(t,r+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class ct{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let o=0,r=0;const a=t.length-1,n=this.parts,[l,d]=dt(t,e);if(this.el=ct.createElement(l,i),nt.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=nt.nextNode())&&n.length<a;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(U)){const e=d[r++],i=s.getAttribute(t).split(H),a=/([.?@])?(.*)/.exec(e);n.push({type:1,index:o,name:a[2],strings:i,ctor:"."===a[1]?mt:"?"===a[1]?_t:"@"===a[1]?ft:gt}),s.removeAttribute(t)}else t.startsWith(H)&&(n.push({type:6,index:o}),s.removeAttribute(t));if(tt.test(s.tagName)){const t=s.textContent.split(H),e=t.length-1;if(e>0){s.textContent=R?R.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],F()),nt.nextNode(),n.push({type:2,index:++o});s.append(t[e],F())}}}else if(8===s.nodeType)if(s.data===I)n.push({type:2,index:o});else{let t=-1;for(;-1!==(t=s.data.indexOf(H,t+1));)n.push({type:7,index:o}),t+=H.length-1}o++}}static createElement(t,e){const i=L.createElement("template");return i.innerHTML=t,i}}function ht(t,e,i=t,s){if(e===ot)return e;let o=void 0!==s?i._$Co?.[s]:i._$Cl;const r=B(e)?void 0:e._$litDirective$;return o?.constructor!==r&&(o?._$AO?.(!1),void 0===r?o=void 0:(o=new r(t),o._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=o:i._$Cl=o),void 0!==o&&(e=ht(t,o._$AS(t,e.values),o,s)),e}class ut{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??L).importNode(e,!0);nt.currentNode=s;let o=nt.nextNode(),r=0,a=0,n=i[0];for(;void 0!==n;){if(r===n.index){let e;2===n.type?e=new pt(o,o.nextSibling,this,t):1===n.type?e=new n.ctor(o,n.name,n.strings,this,t):6===n.type&&(e=new yt(o,this,t)),this._$AV.push(e),n=i[++a]}r!==n?.index&&(o=nt.nextNode(),r++)}return nt.currentNode=L,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class pt{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=rt,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=ht(this,t,e),B(t)?t===rt||null==t||""===t?(this._$AH!==rt&&this._$AR(),this._$AH=rt):t!==this._$AH&&t!==ot&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>Z(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==rt&&B(this._$AH)?this._$AA.nextSibling.data=t:this.T(L.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=ct.createElement(lt(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new ut(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=at.get(t.strings);return void 0===e&&at.set(t.strings,e=new ct(t)),e}k(t){Z(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const o of t)s===e.length?e.push(i=new pt(this.O(F()),this.O(F()),this,this.options)):i=e[s],i._$AI(o),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=W(t).nextSibling;W(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class gt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,o){this.type=1,this._$AH=rt,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=o,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=rt}_$AI(t,e=this,i,s){const o=this.strings;let r=!1;if(void 0===o)t=ht(this,t,e,0),r=!B(t)||t!==this._$AH&&t!==ot,r&&(this._$AH=t);else{const s=t;let a,n;for(t=o[0],a=0;a<o.length-1;a++)n=ht(this,s[i+a],e,a),n===ot&&(n=this._$AH[a]),r||=!B(n)||n!==this._$AH[a],n===rt?t=rt:t!==rt&&(t+=(n??"")+o[a+1]),this._$AH[a]=n}r&&!s&&this.j(t)}j(t){t===rt?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class mt extends gt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===rt?void 0:t}}class _t extends gt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==rt)}}class ft extends gt{constructor(t,e,i,s,o){super(t,e,i,s,o),this.type=5}_$AI(t,e=this){if((t=ht(this,t,e,0)??rt)===ot)return;const i=this._$AH,s=t===rt&&i!==rt||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,o=t!==rt&&(i===rt||s);s&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class yt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){ht(this,t)}}const bt=O.litHtmlPolyfillSupport;bt?.(ct,pt),(O.litHtmlVersions??=[]).push("3.3.3");const vt=globalThis;let $t=class extends N{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let o=s._$litPart$;if(void 0===o){const t=i?.renderBefore??null;s._$litPart$=o=new pt(e.insertBefore(F(),t),t,void 0,i??{})}return o._$AI(t),o})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return ot}};$t._$litElement$=!0,$t.finalized=!0,vt.litElementHydrateSupport?.({LitElement:$t});const wt=vt.litElementPolyfillSupport;wt?.({LitElement:$t}),(vt.litElementVersions??=[]).push("4.2.2");const xt=t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},kt={attribute:!0,type:String,converter:T,reflect:!1,hasChanged:P},At=(t=kt,e,i)=>{const{kind:s,metadata:o}=i;let r=globalThis.litPropertyMetadata.get(o);if(void 0===r&&globalThis.litPropertyMetadata.set(o,r=new Map),"setter"===s&&((t=Object.create(t)).wrapped=!0),r.set(i.name,t),"accessor"===s){const{name:s}=i;return{set(i){const o=e.get.call(this);e.set.call(this,i),this.requestUpdate(s,o,t,!0,i)},init(e){return void 0!==e&&this.C(s,void 0,t,e),e}}}if("setter"===s){const{name:s}=i;return function(i){const o=this[s];e.call(this,i),this.requestUpdate(s,o,t,!0,i)}}throw Error("Unsupported decorator location: "+s)};function Et(t){return(e,i)=>"object"==typeof i?At(t,e,i):((t,e,i)=>{const s=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),s?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function St(t){return Et({...t,state:!0,attribute:!1})}const Mt=y`
  :host {
    display: block;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .muted {
    color: var(--secondary-text-color, #727272);
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 14px;
    background: var(--secondary-background-color, #f2f2f2);
    font-size: 12px;
    line-height: 1.4;
    white-space: nowrap;
  }
  .chip ha-icon {
    --mdc-icon-size: 15px;
  }
  button.control {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 44px;
    padding: 0 14px;
    border: none;
    border-radius: 10px;
    background: var(--secondary-background-color, #f2f2f2);
    color: var(--primary-text-color, #212121);
    font: inherit;
    font-size: 14px;
    cursor: pointer;
  }
  button.control.primary {
    background: var(--primary-color, #03a9f4);
    color: var(--text-primary-color, #fff);
  }
  button.control:disabled {
    opacity: 0.5;
    cursor: default;
  }
  button.control:focus-visible,
  input:focus-visible,
  summary:focus-visible {
    outline: 2px solid var(--primary-color, #03a9f4);
    outline-offset: 2px;
  }
  input {
    min-height: 44px;
    box-sizing: border-box;
    padding: 0 10px;
    border: 1px solid var(--divider-color, #e0e0e0);
    border-radius: 10px;
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color, #212121);
    font: inherit;
    font-size: 14px;
  }
  input:disabled {
    opacity: 0.6;
  }
  @media (prefers-reduced-motion: reduce) {
    * {
      transition: none !important;
      animation: none !important;
    }
  }
`,Dt={number:["start_weight","target_weight","rate_per_week","manual_weight"],date:["start_date","end_date","manual_date"],button:["record_weight"],select:["active_goal"],sensor:["weight","target_weight_today","deviation","trend","weight_progress","time_progress","remaining","projected_date","status","last_measurement"]},Ct=new Map;for(const[t,e]of Object.entries(Dt))for(const i of e)Ct.set(i,t);const Tt=[...Ct.keys()].sort((t,e)=>e.length-t.length),Pt=["status","weight","last_measurement"];function zt(t){const e=t.indexOf(".");if(e<0)return;const i=t.slice(0,e),s=t.slice(e+1);for(const t of Tt)if(Ct.get(t)===i&&(s===t||s.endsWith(`_${t}`)))return t}function Nt(t,e,i){e&&!t[e]&&Ct.get(e)===i.slice(0,i.indexOf("."))&&(t[e]=i)}function Ot(t,e,i){const s=e?t.devices?.[e]:void 0;if(s){const t=s.name_by_user||s.name;if(t)return t}const o=i.status??i.weight,r=o?t.states?.[o]?.attributes?.friendly_name:void 0;if(!r)return n(t,"card.fallback_name");const a=r.lastIndexOf(" ");return a>0?r.slice(0,a):r}function Wt(e,i){const s=i.entity;let o=i.device_id;!o&&s&&(o=e.entities?.[s]?.device_id??void 0);let r,a=o?function(e,i){const s={};for(const o of Object.values(e.entities??{})){if(o.device_id!==i||o.platform!==t)continue;const e=o.translation_key??void 0;e&&Ct.has(e)?Nt(s,e,o.entity_id):Nt(s,zt(o.entity_id),o.entity_id)}return s}(e,o):{};!Object.keys(a).length&&s&&(a=function(t,e){const i={},s=zt(e);if(!s)return i;const o=e.slice(e.indexOf(".")+1),r=o.slice(0,o.length-s.length);for(const e of Tt){const s=`${Ct.get(e)}.${r}${e}`;t.states?.[s]&&(i[e]=s)}return i}(e,s)),s&&Nt(a,zt(s),s);for(const[t,e]of Object.entries(i.entities??{}))e&&(a[t]=e);for(const t of Pt){const e=a[t];if(e){r=e;break}}return{entities:a,deviceId:o,name:i.name??Ot(e,o,a),target:r}}const Rt=new Map;function jt(e,i){const s="history"===i.source?i.weightEntity:i.target;if(!s)return Promise.resolve([]);const o=`${i.source}|${s}|${i.days??"all"}`,r=Rt.get(o);if(r&&r.stamp===i.stamp)return r.promise;const a="history"===i.source?async function(t,e,i){const s=new Date,o=new Date(s.getTime()-864e5*i),r=await t.connection.sendMessagePromise({type:"history/history_during_period",start_time:o.toISOString(),end_time:s.toISOString(),entity_ids:[e],minimal_response:!0,no_attributes:!0,significant_changes_only:!1}),a=r?.[e]??[],n=[];for(const t of a){const e=Number(t.s),i="number"==typeof t.lu?1e3*t.lu:NaN;Number.isFinite(e)&&Number.isFinite(i)&&n.push({t:i,v:e})}return n.sort((t,e)=>t.t-e.t)}(e,s,i.days??365):async function(e,i,s){const o=await e.callService(t,"get_measurements",s?{days:s}:{},{entity_id:i},!1,!0),r=o?.response??{},a=[];for(const t of Object.values(r.entries??{}))for(const e of t.measurements??[]){const t=Date.parse(e.timestamp),i=Number(e.weight);Number.isFinite(t)&&Number.isFinite(i)&&a.push({t,v:i,source:e.source})}return a.sort((t,e)=>t.t-e.t)}(e,s,i.days),n={key:o,stamp:i.stamp,promise:a};return Rt.set(o,n),a.catch(()=>{Rt.get(o)===n&&Rt.delete(o)}),window.setTimeout(()=>{Rt.get(o)===n&&Rt.delete(o)},3e5),a}const Ut=864e5;const Ht=864e5;function It(t,e){const i=new Intl.DateTimeFormat("en-US",{timeZone:e,hourCycle:"h23",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"}),s={};for(const e of i.formatToParts(new Date(t)))"literal"!==e.type&&(s[e.type]=Number(e.value));return Date.UTC(s.year,s.month-1,s.day,s.hour,s.minute,s.second)-1e3*Math.floor(t/1e3)}function Gt(t,e){const i=/^(\d{4})-(\d{2})-(\d{2})/.exec(t);if(!i)return null;const s=Date.UTC(Number(i[1]),Number(i[2])-1,Number(i[3]));let o=s-It(s,e);return o=s-It(o,e),o}function Lt(t){const e=new Intl.DateTimeFormat("en-US",{timeZone:t,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date),i=t=>e.find(e=>e.type===t)?.value??"";return`${i("year")}-${i("month")}-${i("day")}`}function Ft(t,e,i,s,o){if(!(null!==t&&null!==e&&i&&s&&Number.isFinite(t)&&Number.isFinite(e)))return null;const r=Gt(i,o),a=Gt(function(t,e){const i=/^(\d{4})-(\d{2})-(\d{2})/.exec(t);return i?new Date(Date.UTC(Number(i[1]),Number(i[2])-1,Number(i[3]))+e*Ht).toISOString().slice(0,10):t}(s,1),o);return null===r||null===a||a-r<Ht?null:{startWeight:t,targetWeight:e,begin:r,finish:a}}function Bt(t,e){const i=t.finish-t.begin;if(i<=0)return t.targetWeight;const s=Math.min(1,Math.max(0,(e-t.begin)/i));return t.startWeight+(t.targetWeight-t.startWeight)*s}function Zt(t){const e=t.targetWeight-t.startWeight;return e<-.01?"lose":e>.01?"gain":"maintain"}function qt(t,e){if(t&&e)return t.states?.[e]}function Kt(t){return!!t&&!o.has(t.state)}function Vt(t,e){const i=qt(t,e);if(!Kt(i))return null;const s=Number(i.state);return Number.isFinite(s)?s:null}function Yt(t,e){const i=qt(t,e);return Kt(i)?i.state:null}function Xt(t,e){const i=Yt(t,e);if(!i)return null;const s=Date.parse(i);return Number.isFinite(s)?s:null}function Jt(t,e,i){const s=qt(t,e);return s?.attributes?.[i]}function Qt(t,e,i="kg"){return Jt(t,e,"unit_of_measurement")??i}function te(t){return t?.locale?.language||t?.language||"en"}function ee(t){const e=t.trim();return/^[+-]?(\d+([.,]\d*)?|[.,]\d+)$/.test(e)?Number(e.replace(",",".")):null}function ie(t,e){return new Intl.NumberFormat(te(t),{maximumFractionDigits:3,useGrouping:!1}).format(e)}function se(t,e,i=1){return null!==e&&Number.isFinite(e)?new Intl.NumberFormat(te(t),{minimumFractionDigits:i,maximumFractionDigits:i}).format(e):"–"}function oe(t,e,i=!1){return null===e?"–":new Intl.DateTimeFormat(te(t),{day:"numeric",month:"short",...i?{year:"numeric"}:{},timeZone:t?.config?.time_zone}).format(new Date(e))}const re=[["second",60],["minute",60],["hour",24],["day",7],["week",4.348],["month",12],["year",1/0]];function ae(t){return!!t&&"unavailable"!==t.state}function ne(t,e){const i=e.entities,s=qt(t,i.status),o=Yt(t,i.status)??"no_goal",r=Vt(t,i.start_weight),a=Vt(t,i.target_weight),n=Yt(t,i.start_date),l=Yt(t,i.end_date),d=t.config?.time_zone??"UTC",c=Ft(r,a,n,l,d),h=function(t,e){const i=Jt(t,e,"goals");if(!Array.isArray(i))return[];const s=[];for(const t of i){if(!t||"object"!=typeof t)continue;const e=t,i=e.result,o=le(i?.weight),r="string"==typeof i?.timestamp?Date.parse(i.timestamp):NaN;s.push({id:String(e.id??""),name:String(e.name??""),active:!0===e.active,goalMode:"rate"===e.goal_mode?"rate":"target",startWeight:le(e.start_weight),targetWeight:le(e.target_weight),ratePerWeek:le(e.rate_per_week),startDate:de(e.start_date),endDate:de(e.end_date),result:null!==o&&Number.isFinite(r)?{weight:o,timestamp:r,reached:!0===i?.reached}:null})}return s}(t,i.active_goal),u=[];for(const t of h){if(t.active)continue;const e=Ft(t.startWeight,t.targetWeight,t.startDate,t.endDate,d);e&&u.push({summary:t,goal:e})}const p=Jt(t,i.status,"direction"),g=qt(t,i.manual_weight),m=Xt(t,i.last_measurement);return{context:e,status:o,direction:p??(c?Zt(c):null),tolerance:Jt(t,i.status,"tolerance")??.5,goalMode:Jt(t,i.status,"goal_mode")??null,trendWindowDays:Jt(t,i.status,"trend_window_days")??null,unit:Qt(t,i.weight??i.start_weight),currentWeight:Vt(t,i.weight),lastMeasurement:m,measurementSource:Jt(t,i.weight,"source")??null,startWeight:r,targetWeight:a,ratePerWeek:Vt(t,i.rate_per_week),startDate:n,endDate:l,plannedToday:Vt(t,i.target_weight_today),deviation:Vt(t,i.deviation),trend:Vt(t,i.trend),remaining:Vt(t,i.remaining),weightProgress:Vt(t,i.weight_progress),timeProgress:Vt(t,i.time_progress),projectedDate:Xt(t,i.projected_date),manualWeight:Vt(t,i.manual_weight),manualDate:Yt(t,i.manual_date),manualPending:!0===Jt(t,i.manual_weight,"pending"),manualAvailable:ae(g),recordAvailable:ae(qt(t,i.record_weight)),goal:c,goals:h,otherGoals:u,stamp:[s?.state,m,r,a,n,l].join("|")}}function le(t){const e="number"==typeof t?t:Number(t);return null!=t&&Number.isFinite(e)?e:null}function de(t){return"string"==typeof t&&t?t:null}class ce extends $t{constructor(){super(...arguments),this._measurements=[],this._loading=!1,this._fetchError=null,this._tracked=[],this._signature="",this._requestedStamp=null}set hass(t){if(this._hass=t,!t||!this._config)return;var e;this._context=Wt(t,this._config),this._tracked=(e=this._context,Object.values(e.entities).filter(Boolean));const i=this._tracked.map(e=>{const i=t.states[e];return i?`${e}=${i.state}@${i.last_updated}`:`${e}=∅`}).join(",");i!==this._signature&&(this._signature=i,this._model=ne(t,this._context),this._maybeLoad())}get hass(){return this._hass}setConfig(t){if(!t.entity&&!t.device_id&&!t.entities)throw new Error("Set `entity` to one entity of a Road to Weight Goal device, for example sensor.<name>_status.");this._config=t,this._signature="",this._requestedStamp=null,this._hass&&(this.hass=this._hass)}async _maybeLoad(){const t=this._hass,e=this._model;if(!t||!e||!this.needsMeasurements())return;const i=this.chartOptions(),s=function(t,e,i,s){const o=t??"goal";if("number"==typeof o)return Math.ceil(o)+1;if("all"===o)return 3650;if(!i)return 365;const r=Math.max(7,Math.ceil(e??0)),a=Math.ceil((s-i.begin)/Ut)+r;return a>0?Math.min(3650,Math.max(30,a)):365}(i.range,i.average,e.goal,Date.now()),o=`${e.stamp}|${i.source??"measurements"}|${s??"all"}`;if(o!==this._requestedStamp){this._requestedStamp=o,this._loading=!0;try{const r=await jt(t,{source:"history"===i.source?"history":"measurements",days:s,target:e.context.target,weightEntity:e.context.entities.weight,stamp:e.stamp});this._requestedStamp===o&&(this._measurements=r,this._fetchError=null)}catch(e){this._requestedStamp===o&&(this._fetchError=e&&"object"==typeof e&&"message"in e?String(e.message):n(t,"card.load_failed"),this._requestedStamp=null)}finally{(this._requestedStamp===o||this._fetchError)&&(this._loading=!1)}}}shouldUpdate(t){return t.has("_config")||t.has("_model")||t.has("_measurements")||t.has("_loading")||t.has("_fetchError")}renderProblem(t){return it`
      <ha-card>
        <div class="problem" role="alert">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
          <span>${t}</span>
        </div>
      </ha-card>
    `}missingGoalMessage(){const t=this._config,e=this._hass;if(!t||!e)return null;const i=this._context;return i&&Object.keys(i.entities).length?i.target?null:n(e,"card.no_target"):n(e,"card.no_entities",{anchor:t.entity??t.device_id??"?"})}}u([St()],ce.prototype,"_config",void 0),u([St()],ce.prototype,"_model",void 0),u([St()],ce.prototype,"_measurements",void 0),u([St()],ce.prototype,"_loading",void 0),u([St()],ce.prototype,"_fetchError",void 0),u([Et({attribute:!1})],ce.prototype,"hass",null);function he(t){return Boolean(t?.tap_action||t?.hold_action||t?.double_tap_action)}function ue(t){return void 0!==t&&"none"!==t.action}const pe=new Set(["A","BUTTON","INPUT","SELECT","TEXTAREA","LABEL","SUMMARY","DETAILS","FORM","WG-CHART"]);class ge{constructor(t){this._options=t,this._held=!1,this.down=t=>{this._options.enabled()&&t.isPrimary&&0===t.button&&(!function(t,e){for(const i of t.composedPath()){if(i===e)return!1;if(i instanceof HTMLElement){if(pe.has(i.tagName)||i.isContentEditable)return!0;const t=i.getAttribute("role");if("button"===t||"link"===t||"textbox"===t)return!0}}return!1}(t,t.currentTarget)?(this._start={id:t.pointerId,x:t.clientX,y:t.clientY},this._held=!1,clearTimeout(this._holdTimer),this._options.hold()&&(this._holdTimer=setTimeout(()=>{this._held=!0},500))):this.cancel())},this.move=t=>{const e=this._start;e&&t.pointerId===e.id&&Math.hypot(t.clientX-e.x,t.clientY-e.y)>10&&this.cancel()},this.up=t=>{const e=this._start;if(!e||t.pointerId!==e.id)return;const i=this._held;this.cancel(),i?this._options.fire("hold"):this._tap()},this.cancel=()=>{clearTimeout(this._holdTimer),this._holdTimer=void 0,this._start=void 0,this._held=!1},this.contextMenu=t=>{this._start&&this._options.hold()&&t.preventDefault()},this.key=t=>{this._options.enabled()&&t.composedPath()[0]===t.currentTarget&&("Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._options.fire("tap")))}}reset(){this.cancel(),clearTimeout(this._tapTimer),this._tapTimer=void 0}_tap(){if(this._options.doubleTap())return void 0!==this._tapTimer?(clearTimeout(this._tapTimer),this._tapTimer=void 0,void this._options.fire("double_tap")):void(this._tapTimer=setTimeout(()=>{this._tapTimer=void 0,this._options.fire("tap")},250));this._options.fire("tap")}}let me=class extends $t{constructor(){super(...arguments),this.showRecord=!0,this.showRecordDate=!0,this._draft=null,this._dayDraft=null,this._error=null,this._busy=!1,this._onInput=t=>{this._draft=t.target.value,this._error=null},this._onDayInput=t=>{this._dayDraft=t.target.value,this._error=null},this._onKeydown=t=>{"Enter"===t.key&&this.model&&(t.preventDefault(),this._save(this.model))}}render(){const t=this.model;if(!t||!this.hass)return rt;const e=d(this.hass),i=t.context.entities,s=this.showRecord&&t.manualAvailable&&!!i.manual_weight;if(!s)return rt;const o=this._draft??(null===t.manualWeight?"":ie(this.hass,t.manualWeight)),r=Lt(this.hass.config?.time_zone),a=this._day(t,r);return it`
      ${this._error?it`<div class="error" role="alert">
            <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
            <span>${this._error}</span>
          </div>`:rt}

      <div class="actions">
        ${s?it`
              ${this.showRecordDate?it`<input
                    class="day ${this.hass.themes?.darkMode?"dark":""}"
                    type="date"
                    max=${r}
                    .value=${a}
                    aria-label=${e("actions.date_input")}
                    ?disabled=${this._busy}
                    @input=${this._onDayInput}
                    @keydown=${this._onKeydown}
                  />`:rt}
              <input
                class="weight"
                type="text"
                inputmode="decimal"
                autocomplete="off"
                .value=${o}
                aria-label=${e("actions.weight_input",{unit:t.unit})}
                placeholder=${t.unit}
                ?disabled=${this._busy}
                @input=${this._onInput}
                @keydown=${this._onKeydown}
              />
              <button
                class="control primary"
                ?disabled=${this._busy||!this._hasDraft(t)}
                @click=${()=>this._save(t)}
              >
                <ha-icon icon="mdi:check"></ha-icon>
                <span>${e("actions.save")}</span>
              </button>
            `:rt}
      </div>
    `}_day(t,e){return this.showRecordDate?this._dayDraft??t.manualDate??e:e}_hasDraft(t){return null!==this._draft?null!==ee(this._draft):t.manualPending}async _save(t){const e=t.context.target;if(!this.hass||!e)return;const i=ee(this._draft??String(t.manualWeight??""));if(null===i)return void(this._error=n(this.hass,"actions.enter_number"));const s=Lt(this.hass.config?.time_zone),o=this._day(t,s)||s;if(o>s)this._error=n(this.hass,"actions.future_date");else{this._busy=!0,this._error=null;try{await this.hass.callService("weight_goal","record_weight",o===s?{weight:i}:{weight:i,timestamp:`${o}T12:00:00`},{entity_id:e}),this._draft=null,this._dayDraft=s}catch(t){this._error=_e(this.hass,t)}finally{this._busy=!1}}}};function _e(t,e){if(e&&"object"==typeof e&&"message"in e){const t=String(e.message);if(t)return t}return n(t,"actions.failed")}me.styles=[Mt,y`
      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      input.weight {
        flex: 1 1 90px;
        min-width: 80px;
      }
      input.day {
        flex: 1 1 130px;
        min-width: 120px;
        /* The calendar glyph is drawn by the browser and ignores the CSS
           color; color-scheme is what flips it, and it has to come from the
           Home Assistant theme rather than from the system: a dark theme on a
           light machine would otherwise put a black icon on a dark field. */
        color-scheme: light;
      }
      input.day.dark {
        color-scheme: dark;
      }
      button.control {
        flex: 1 1 auto;
      }
      button.control ha-icon {
        --mdc-icon-size: 18px;
      }
      .error {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 8px;
        padding: 8px 10px;
        border-radius: 8px;
        background: var(--error-color, #db4437);
        color: var(--text-primary-color, #fff);
        font-size: 13px;
      }
      @container (max-width: 320px) {
        button.control span {
          display: none;
        }
        button.control {
          flex: 0 0 44px;
        }
      }
    `],u([Et({attribute:!1})],me.prototype,"hass",void 0),u([Et({attribute:!1})],me.prototype,"model",void 0),u([Et({type:Boolean})],me.prototype,"showRecord",void 0),u([Et({type:Boolean})],me.prototype,"showRecordDate",void 0),u([St()],me.prototype,"_draft",void 0),u([St()],me.prototype,"_dayDraft",void 0),u([St()],me.prototype,"_error",void 0),u([St()],me.prototype,"_busy",void 0),me=u([xt("wg-actions")],me);const fe={last_measurement:{key:"last_measurement",icon:"mdi:clock-outline",relative:!0},projected_date:{key:"projected_date",icon:"mdi:calendar-clock",relative:!0},trend:{key:"trend",icon:"mdi:chart-line-variant",signed:!0},deviation:{key:"deviation",icon:"mdi:plus-minus-variant",signed:!0},remaining:{key:"remaining",icon:"mdi:flag-checkered"},target_weight_today:{key:"target_weight_today",icon:"mdi:target"},weight_progress:{key:"weight_progress",icon:"mdi:scale-balance"},time_progress:{key:"time_progress",icon:"mdi:calendar-range"},start_weight:{key:"start_weight",icon:"mdi:ray-start"},target_weight:{key:"target_weight",icon:"mdi:ray-end"},rate_per_week:{key:"rate_per_week",icon:"mdi:speedometer"},start_date:{key:"start_date",icon:"mdi:calendar-start"},end_date:{key:"end_date",icon:"mdi:calendar-end"}},ye=[...Object.keys(fe),"source"],be=["last_measurement","trend","remaining","projected_date"],ve={manual:"mdi:pencil-outline",sensor:"mdi:scale-bathroom",service:"mdi:cog-outline",import:"mdi:database-import-outline",statistics:"mdi:chart-bell-curve-cumulative"};function $e(t,e){const i=e.measurementSource;if(!i)return null;const s=ve[i]?n(t,`badge.source.${i}`):i;return{key:"source",icon:ve[i]??"mdi:help-circle-outline",text:s,label:s,entityId:e.context.entities.weight}}function we(t,e,i){const s=fe[i],o=e.context.entities[s.key],r=qt(t,o);if(!o||!Kt(r))return null;let a;if(s.relative){const e=Date.parse(r.state);if(!Number.isFinite(e))return null;a=function(t,e){if(null===e)return"–";const i=new Intl.RelativeTimeFormat(te(t),{numeric:"auto"});let s=(e-Date.now())/1e3;for(const[t,e]of re){if(Math.abs(s)<e||e===1/0)return i.format(Math.round(s),t);s/=e}return i.format(Math.round(s),"year")}(t,e)}else if(s.signed){const e=Number(r.state);if(!Number.isFinite(e))return null;const i=r.attributes.unit_of_measurement??"";a=`${function(t,e,i=1){return null!==e&&Number.isFinite(e)?new Intl.NumberFormat(te(t),{minimumFractionDigits:i,maximumFractionDigits:i,signDisplay:"exceptZero"}).format(e):"–"}(t,e,1)}${i?` ${i}`:""}`}else a=h(t,r);return{key:i,icon:s.icon,text:a,label:c(t,o,e.context.name),entityId:o}}function xe(t,e,i){const s=qt(t,i.entity);return Kt(s)?{key:i.entity,icon:i.icon??s.attributes.icon??"mdi:information-outline",text:h(t,s),label:i.name??c(t,i.entity,e.context.name),entityId:i.entity}:null}let ke=class extends $t{constructor(){super(...arguments),this.passive=!1}render(){const t=this.model;if(!t||!this.hass)return rt;const e=d(this.hass),i=function(t,e,i){const s=i??be,o=[];for(const i of s){if("object"==typeof i&&i?.entity){const s=xe(t,e,i);s&&o.push(s);continue}if("source"===i){const i=$e(t,e);i&&o.push(i);continue}if("string"==typeof i&&i in fe){const s=we(t,e,i);s&&o.push(s)}}return o}(this.hass,t,this.badges);return 0===i.length?null===t.currentWeight?it`<div class="chips">
            <span class="chip">
              <ha-icon icon="mdi:scale-bathroom"></ha-icon>
              ${e("badges.no_reading")}
            </span>
          </div>`:rt:it`<div class="chips">
      ${i.map(t=>this._renderBadge(t))}
    </div>`}_renderBadge(t){const e=t.label?`${t.label}: ${t.text}`:t.text;return this.passive?it`<span class="chip" title=${t.label} aria-label=${e}>
        <ha-icon icon=${t.icon}></ha-icon>
        <span>${t.text}</span>
      </span>`:it`<button
      class="chip"
      title=${t.label}
      aria-label=${e}
      ?disabled=${!t.entityId}
      @click=${()=>this._more(t.entityId)}
    >
      <ha-icon icon=${t.icon}></ha-icon>
      <span>${t.text}</span>
    </button>`}_more(t){t&&this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t},bubbles:!0,composed:!0}))}};ke.styles=[Mt,y`
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      button.chip {
        border: none;
        font: inherit;
        font-size: 12px;
        color: inherit;
        cursor: pointer;
      }
      button.chip:disabled {
        cursor: default;
      }
    `],u([Et({attribute:!1})],ke.prototype,"hass",void 0),u([Et({attribute:!1})],ke.prototype,"model",void 0),u([Et({attribute:!1})],ke.prototype,"badges",void 0),u([Et({type:Boolean})],ke.prototype,"passive",void 0),ke=u([xt("wg-badges")],ke);const Ae=1;class Ee{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}const Se=(t=>(...e)=>({_$litDirective$:t,values:e}))(class extends Ee{constructor(t){if(super(t),t.type!==Ae||"class"!==t.name||t.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return" "+Object.keys(t).filter(e=>t[e]).join(" ")+" "}update(t,[e]){if(void 0===this.st){this.st=new Set,void 0!==t.strings&&(this.nt=new Set(t.strings.join(" ").split(/\s/).filter(t=>""!==t)));for(const t in e)e[t]&&!this.nt?.has(t)&&this.st.add(t);return this.render(e)}const i=t.element.classList;for(const t of this.st)t in e||(i.remove(t),this.st.delete(t));for(const t in e){const s=!!e[t];s===this.st.has(t)||this.nt?.has(t)||(s?(i.add(t),this.st.add(t)):(i.remove(t),this.st.delete(t)))}return ot}});function Me(t){return Math.round(100*t)/100}function De(t){return t.map((t,e)=>`${0===e?"M":"L"}${Me(t.x)},${Me(t.y)}`).join(" ")}function Ce(t,e){return 0===t.length?"":1===t.length?`M${Me(t[0].x)},${Me(t[0].y)}`:"step"===e?function(t){const e=[`M${Me(t[0].x)},${Me(t[0].y)}`];for(let i=1;i<t.length;i++)e.push(`H${Me(t[i].x)}`,`V${Me(t[i].y)}`);return e.join(" ")}(t):"smooth"===e?function(t){if(t.length<3)return De(t);const e=[`M${Me(t[0].x)},${Me(t[0].y)}`];for(let i=0;i<t.length-1;i++){const s=t[0===i?0:i-1],o=t[i],r=t[i+1],a=t[i+2>=t.length?t.length-1:i+2],n=Math.min(o.y,r.y),l=Math.max(o.y,r.y),d=t=>Math.min(l,Math.max(n,t)),c=o.x+(r.x-s.x)/6,h=d(o.y+(r.y-s.y)/6),u=r.x-(a.x-o.x)/6,p=d(r.y-(a.y-o.y)/6);e.push(`C${Me(c)},${Me(h)} ${Me(u)},${Me(p)} ${Me(r.x)},${Me(r.y)}`)}return e.join(" ")}(t):De(t)}function Te(t){if(!Number.isFinite(t)||t<=0)return 1;const e=10**Math.floor(Math.log10(t)),i=t/e;return(i>5?10:i>2?5:i>1?2:1)*e}function Pe(t){return Number(t.toFixed(6))}function ze(t,e={}){const i=t.filter(t=>Number.isFinite(t));let s=i.length?Math.min(...i):0,o=i.length?Math.max(...i):1;if(o-s<1e-9){const t=Math.max(.02*Math.abs(o),.5);s-=t,o+=t}const r=Math.max(1,e.ticks??4);if("tight"!==e.mode){const t=Te((o-s)/r);s=Math.floor(s/t)*t,o=Math.ceil(o/t)*t}"number"==typeof e.min&&Number.isFinite(e.min)&&(s=e.min),"number"==typeof e.max&&Number.isFinite(e.max)&&(o=e.max),o<=s&&(o=s+Math.max(Te(.02*Math.abs(s)),1)),s=Pe(s),o=Pe(o);const a=Te((o-s)/r),n=a>=1?0:a>=.1?1:2,l=[s],d=.4*a;for(let t=Math.ceil((s+d)/a)*a;t<o-d;t+=a){const e=Pe(t);e>s&&e<o&&l.push(e)}o>s&&l.push(o);const c=l.map(t=>function(t,e){for(let i=e;i<2;i++)if(Math.abs(Number(t.toFixed(i))-t)<1e-6)return i;return 2}(t,n));return{min:s,max:o,step:a,ticks:l,decimals:c}}const Ne={weight:{color:"auto",width:2,dash:"",opacity:1,point_size:3},average:{color:"var(--primary-color, #03a9f4)",width:2.5,dash:"",opacity:1,point_size:0},plan:{color:"var(--secondary-text-color, #727272)",width:2,dash:"6 4",opacity:1,point_size:0},band:{color:"var(--primary-color, #03a9f4)",width:0,dash:"",opacity:.1,point_size:0},projection:{color:"var(--disabled-text-color, #9e9e9e)",width:2,dash:"2 6",opacity:1,point_size:0},goals:{color:"var(--secondary-text-color, #727272)",width:1.5,dash:"",opacity:.45,point_size:0}};function Oe(t,e){return null!==t&&e>=t.begin&&e<=t.finish}let We=class extends $t{constructor(){super(...arguments),this.measurements=[],this.options={},this.loading=!1,this._width=0,this._hover=null,this._id=Math.random().toString(36).slice(2,9),this._clearHover=()=>{this._hover=null}}connectedCallback(){super.connectedCallback(),this._observer=new ResizeObserver(t=>{const e=Math.round(t[0]?.contentRect.width??0);e&&e!==this._width&&(this._width=e)}),this._observer.observe(this)}disconnectedCallback(){this._observer?.disconnect(),this._observer=void 0,super.disconnectedCallback()}get _height(){return this.options.height??190}_style(t){const e=(this.options.styles??{})[t];return{...Ne[t],...e??{}}}_colour(t){const e=this._style(t).color;return"auto"!==e?e:i[this.model?.status??"no_goal"]??i.on_track}_shown(t,e){const i=this.options.show?.[t];return void 0===i?e:i}_window(t){return function(t,e,i,s){const o=t??"goal";if("goal"===o&&e){const t=i[i.length-1]?.t??s;return{from:e.begin,to:Math.max(e.finish,t,s)}}if("number"==typeof o&&o>0)return{from:s-o*Ut,to:s};const r=i[0]?.t??s-2592e6,a=Math.max(i[i.length-1]?.t??s,s);return{from:r,to:a>r?a:r+Ut}}(this.options.range,this.model?.goal,t,Date.now())}_renderEmpty(t){return it`<div class="empty" style=${`height:${this._height}px`}>
      <ha-icon icon="mdi:chart-line"></ha-icon>
      <span>${t}</span>
    </div>`}render(){const t=this.model;if(!t||!this.hass)return rt;const e=this._width;if(!e)return it`<div class="empty" style=${`height:${this._height}px`}></div>`;const i=this.measurements.filter(t=>Number.isFinite(t.t)&&Number.isFinite(t.v)).slice().sort((t,e)=>t.t-e.t);if(!i.length&&!t.goal)return this._renderEmpty(n(this.hass,this.loading?"chart.loading":"chart.empty"));const{from:s,to:o}=this._window(i),r=i.filter(t=>t.t>=s&&t.t<=o),a=this.options.average??0,l=a>0?function(t,e){if(e<=0||0===t.length)return[];const i=864e5*e,s=[];let o=0,r=0;for(let e=0;e<t.length;e++){for(r+=t[e].v;t[e].t-t[o].t>i;)r-=t[o].v,o+=1;s.push({t:t[e].t,v:r/(e-o+1)})}return s}(i,a).filter(t=>t.t>=s&&t.t<=o):[],d=this._height,c=this._shown("axis",!0),h=c?22:8,u=this._verticalScale(t,r,l,s,o),p=c?this._axisWidth(u):6,g=Math.max(10,e-p-8),m=Math.max(10,d-10-h),_=t=>p+(t-s)/Math.max(1,o-s)*g,f=t=>10+m-(t-u.min)/Math.max(1e-9,u.max-u.min)*m,y=this.options.line??"smooth",b=t=>t.map(t=>({x:_(t.t),y:f(t.v)})),v=`wg-plot-${this._id}`;return it`
      <div class="wrap" @pointerleave=${this._clearHover}>
        <svg
          viewBox="0 0 ${e} ${d}"
          width=${e}
          height=${d}
          role="img"
          aria-label=${this._summary(t,r)}
          @pointermove=${t=>this._onPointer(t,r,s,o,p,g)}
          @pointerdown=${t=>this._onPointer(t,r,s,o,p,g)}
        >
          <defs>
            <clipPath id=${v}>
              <rect
                x=${p}
                y=${8}
                width=${g}
                height=${m+4}
              ></rect>
            </clipPath>
          </defs>
          ${this._renderGrid(u,p,8,e,f,c)}
          <g clip-path=${`url(#${v})`}>
            ${this._renderOtherGoals(t,s,o,_,f)}
            ${this._renderBand(t,s,o,_,f)}
            ${this._renderPlan(t,s,o,_,f)}
            ${this._renderProjection(t,r,_,f)}
            ${this._renderSeries(b(r),b(l),y)}
            ${this._renderPoints(r,_,f,t)}
            ${this._renderGoalLabels(t,s,o,_,f)}
          </g>
          ${this._renderToday(s,o,_,10,m)}
          ${c?this._renderTimeAxis(s,o,_,d):rt}
          ${this._renderCursor(r,_,f,10,m)}
        </svg>
        ${this._renderTooltip(r,t)}
        <table class="sr-only">
          <caption>${n(this.hass,"chart.readings")}</caption>
          <tbody>
            ${r.slice(-12).map(e=>it`<tr>
                <td>${oe(this.hass,e.t,!0)}</td>
                <td>${se(this.hass,e.v,1)} ${t.unit}</td>
              </tr>`)}
          </tbody>
        </table>
      </div>
    `}_axisWidth(t){const e=Math.max(...t.ticks.map((e,i)=>se(this.hass,e,t.decimals[i]).length),2);return 14+7*e}_verticalScale(t,e,i,s,o){const r=this.options.y_axis??{},a=[];for(const t of e)a.push(t.v);for(const t of i)a.push(t.v);if(t.goal&&!1!==r.include_goal){const e=this._shown("band",!0)?t.tolerance:0;for(const i of this._planPoints(t.goal,s,o))a.push(i.v+e,i.v-e)}return a.length||a.push(t.currentWeight??75),ze(a,{min:r.min,max:r.max,mode:"tight"===r.mode?"tight":"nice",ticks:r.ticks??4})}_renderGrid(t,e,i,s,o,r){if(!this._shown("grid",!0))return rt;const a=t.ticks.map((a,n)=>{const l=o(a);return st`
        <line class="grid" x1=${e} x2=${s-i}
              y1=${l} y2=${l}></line>
        ${r?st`<text class="axis" x=${e-6} y=${l+3}
                        text-anchor="end">${se(this.hass,a,t.decimals[n])}</text>`:rt}
      `});return st`<g>${a}</g>`}_renderBand(t,e,i,s,o){if(!t.goal||!this._shown("band",!0)||t.tolerance<=0)return rt;const r=this._style("band"),a=this._planPoints(t.goal,e,i),n=a.map(e=>({x:s(e.t),y:o(e.v+t.tolerance)})),l=a.map(e=>({x:s(e.t),y:o(e.v-t.tolerance)})),d=function(t,e){if(t.length<2||e.length<2)return"";const i=De(t),s=e.slice().reverse().map(t=>`L${Me(t.x)},${Me(t.y)}`).join(" ");return`${i} ${s} Z`}(n,l);return d?st`<path d=${d} fill=${this._colour("band")}
                     fill-opacity=${r.opacity} stroke="none"></path>`:rt}_planPoints(t,e,i){const s=Math.max(e,t.begin),o=Math.min(i,t.finish);return o<=s?[]:[s,o].map(e=>({t:e,v:Bt(t,e)}))}_renderOtherGoals(t,e,i,s,o){if(!this._shown("goals",!0)||!t.otherGoals.length)return rt;const r=this._style("goals"),a=this._colour("goals"),n=t.otherGoals.map(({summary:t,goal:n})=>{const l=this._planPoints(n,e,i);if(l.length<2)return rt;const d=l[l.length-1],c=d.t===n.finish,h=l.map(t=>({x:s(t.t),y:o(t.v)}));return st`
        <path d=${Ce(h,"linear")} fill="none" stroke=${a}
              stroke-width=${r.width} stroke-dasharray=${r.dash||rt}
              stroke-opacity=${r.opacity} stroke-linecap="round"
              data-goal=${t.name}></path>
        ${c?st`<circle cx=${s(d.t)} cy=${o(d.v)} r="2.5" fill=${a}
                          fill-opacity=${r.opacity}></circle>`:rt}
      `});return st`<g>${n}</g>`}_renderGoalLabels(t,e,i,s,o){if(!this._shown("goals",!0)||!t.otherGoals.length)return rt;const r=t.otherGoals.map(({summary:t,goal:r})=>{const a=this._planPoints(r,e,i);if(a.length<2)return rt;const n=a[a.length-1];return st`<text class="goal-label" x=${s(n.t)-4} y=${o(n.v)-6}
                       text-anchor="end">${t.name}</text>`});return st`<g>${r}</g>`}_renderPlan(t,e,i,s,o){if(!t.goal||!this._shown("plan",!0))return rt;const r=this._style("plan"),a=this._planPoints(t.goal,e,i).map(t=>({x:s(t.t),y:o(t.v)}));return a.length<2?rt:st`
      <path d=${Ce(a,"linear")} fill="none"
            stroke=${this._colour("plan")} stroke-width=${r.width}
            stroke-dasharray=${r.dash||rt}
            stroke-opacity=${r.opacity}
            stroke-linecap="round"></path>
      <circle cx=${s(t.goal.finish)} cy=${o(t.goal.targetWeight)}
              r="3.5" fill=${this._colour("plan")}></circle>
    `}_renderProjection(t,e,i,s){if(!this._shown("projection",!0)||!t.goal||null===t.projectedDate||!e.length)return rt;const o=this._style("projection"),r=e[e.length-1],a=Ce([{x:i(r.t),y:s(r.v)},{x:i(t.projectedDate),y:s(t.goal.targetWeight)}],"linear");return st`<path d=${a} fill="none" stroke=${this._colour("projection")}
                     stroke-width=${o.width}
                     stroke-dasharray=${o.dash||rt}
                     stroke-linecap="round"></path>`}_renderSeries(t,e,i){const s=this._style("weight"),o=this._style("average"),r=this._shown("average",!0)&&e.length>1;return st`
      <path d=${Ce(t,i)} fill="none"
            stroke=${this._colour("weight")}
            stroke-width=${s.width}
            stroke-dasharray=${s.dash||rt}
            stroke-opacity=${r?.45*s.opacity:s.opacity}
            stroke-linecap="round" stroke-linejoin="round"></path>
      ${r?st`<path d=${Ce(e,i)} fill="none"
                      stroke=${this._colour("average")}
                      stroke-width=${o.width}
                      stroke-dasharray=${o.dash||rt}
                      stroke-opacity=${o.opacity}
                      stroke-linecap="round" stroke-linejoin="round"></path>`:rt}
    `}_renderPoints(t,e,i,s){const o=this._style("weight");if(!this._shown("points",!0)||o.point_size<=0)return rt;const r=Math.ceil(t.length/120),a=this._colour("weight"),n=t.filter((e,i)=>i%r===0||i===t.length-1).map(t=>{const r=Oe(s.goal,t.t)&&Math.abs(t.v-Bt(s.goal,t.t))>s.tolerance;return st`<circle cx=${e(t.t)} cy=${i(t.v)} r=${o.point_size}
                           fill=${r?"var(--card-background-color, #fff)":a}
                           stroke=${a} stroke-width="1.5"></circle>`});return st`<g>${n}</g>`}_renderToday(t,e,i,s,o){const r=Date.now();return!this._shown("today",!0)||r<t||r>e?rt:st`<line class="today" x1=${i(r)} x2=${i(r)}
                     y1=${s} y2=${s+o}></line>`}_renderTimeAxis(t,e,i,s){const o=this._width<260?2:this._width<420?3:5,r=[];for(let a=0;a<=o;a++){const n=t+(e-t)*a/o,l=0===a?"start":a===o?"end":"middle";r.push(st`<text class="axis" x=${i(n)} y=${s-6}
                  text-anchor=${l}>${oe(this.hass,n)}</text>`)}return st`<g>${r}</g>`}_renderCursor(t,e,i,s,o){if(null===this._hover||!t[this._hover])return rt;const r=t[this._hover];return st`
      <line class="cursor" x1=${e(r.t)} x2=${e(r.t)}
            y1=${s} y2=${s+o}></line>
      <circle cx=${e(r.t)} cy=${i(r.v)} r="5" fill="none"
              stroke=${this._colour("weight")} stroke-width="2"></circle>
    `}_renderTooltip(t,e){if(null===this._hover||!t[this._hover])return rt;const i=t[this._hover],s=Oe(e.goal,i.t)?Bt(e.goal,i.t):null,o=null===s?null:i.v-s;return it`<div
      class=${Se({tooltip:!0,right:this._hover>t.length/2})}
      role="status"
    >
      <strong>${se(this.hass,i.v,1)} ${e.unit}</strong>
      <span>${oe(this.hass,i.t,!0)}</span>
      ${null===o?rt:it`<span
            >${n(this.hass,"chart.vs_plan",{value:`${o>0?"+":""}${se(this.hass,o,1)}`,unit:e.unit})}</span
          >`}
    </div>`}_onPointer(t,e,i,s,o,r){if(!e.length)return;const a=t.currentTarget.getBoundingClientRect(),n=(t.clientX-a.left-o)/Math.max(1,r),l=function(t,e){if(0===t.length)return-1;let i=0,s=1/0;for(let o=0;o<t.length;o++){const r=Math.abs(t[o].t-e);r<s&&(s=r,i=o)}return i}(e,i+Math.min(1,Math.max(0,n))*(s-i));l!==this._hover&&(this._hover=l)}_summary(t,e){const i=d(this.hass),s=t.unit,o=[i("chart.summary_readings",{count:e.length}),null===t.currentWeight?i("chart.summary_no_weight"):i("chart.summary_current",{value:se(this.hass,t.currentWeight,1),unit:s})];return null!==t.deviation&&o.push(i(t.deviation>=0?"chart.summary_above":"chart.summary_below",{value:se(this.hass,Math.abs(t.deviation),1),unit:s})),t.goal&&o.push(i("chart.summary_plan",{start:se(this.hass,t.goal.startWeight,1),target:se(this.hass,t.goal.targetWeight,1),unit:s})),o.join(", ")}};We.styles=y`
    :host {
      display: block;
      position: relative;
    }
    .wrap {
      position: relative;
      width: 100%;
    }
    svg {
      display: block;
      width: 100%;
      touch-action: pan-y;
      overflow: visible;
    }
    .grid {
      stroke: var(--divider-color, #e0e0e0);
      stroke-width: 1;
      opacity: 0.6;
    }
    .axis {
      fill: var(--secondary-text-color, #727272);
      font-size: 11px;
      font-family: inherit;
    }
    .goal-label {
      fill: var(--secondary-text-color, #727272);
      font-size: 10px;
      font-family: inherit;
      paint-order: stroke;
      stroke: var(--card-background-color, #fff);
      stroke-width: 3px;
      stroke-linejoin: round;
    }
    .today {
      stroke: var(--secondary-text-color, #727272);
      stroke-width: 1;
      stroke-dasharray: 3 3;
      opacity: 0.7;
    }
    .cursor {
      stroke: var(--secondary-text-color, #727272);
      stroke-width: 1;
      opacity: 0.5;
    }
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      color: var(--secondary-text-color, #727272);
      font-size: 13px;
    }
    .tooltip {
      position: absolute;
      top: 4px;
      left: 4px;
      display: flex;
      flex-direction: column;
      padding: 6px 8px;
      border-radius: 8px;
      background: var(--card-background-color, #fff);
      box-shadow: var(--ha-card-box-shadow, 0 2px 6px rgba(0, 0, 0, 0.2));
      border: 1px solid var(--divider-color, #e0e0e0);
      font-size: 12px;
      line-height: 1.35;
      pointer-events: none;
      white-space: nowrap;
      z-index: 1;
    }
    .tooltip.right {
      left: auto;
      right: 4px;
    }
    .tooltip span {
      color: var(--secondary-text-color, #727272);
    }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }
  `,u([Et({attribute:!1})],We.prototype,"hass",void 0),u([Et({attribute:!1})],We.prototype,"model",void 0),u([Et({attribute:!1})],We.prototype,"measurements",void 0),u([Et({attribute:!1})],We.prototype,"options",void 0),u([Et({type:Boolean})],We.prototype,"loading",void 0),u([St()],We.prototype,"_width",void 0),u([St()],We.prototype,"_hover",void 0),We=u([xt("wg-chart")],We);let Re=class extends $t{constructor(){super(...arguments),this.open=!1,this._error=null}render(){const t=this.model;if(!t||!this.hass)return rt;const e=t.context.entities,i=t.goalMode,s=t.goals.find(t=>t.active);return e.active_goal&&!s?it`
        <details ?open=${this.open}>
          <summary>
            <ha-icon icon="mdi:target"></ha-icon>
            <span>${n(this.hass,"goal.title")}</span>
          </summary>
          <p class="hint muted">${n(this.hass,"goal.none")}</p>
        </details>
      `:it`
      <details ?open=${this.open}>
        <summary>
          <ha-icon icon="mdi:target"></ha-icon>
          <span>${n(this.hass,"goal.title")}</span>
          ${s?it`<span class="muted">${s.name}</span>`:rt}
        </summary>
        <div class="grid">
          ${this._numberRow(e.start_weight,t.unit,!1)}
          ${this._numberRow(e.target_weight,t.unit,"rate"===i)}
          ${this._numberRow(e.rate_per_week,`${t.unit}/w`,"target"===i)}
          ${this._dateRow(e.start_date)}
          ${this._dateRow(e.end_date)}
        </div>
        ${null===i?rt:it`<p id="derived" class="hint muted">
              ${n(this.hass,"goal.derived_hint")}
            </p>`}
        ${this._error?it`<div class="error" role="alert">${this._error}</div>`:rt}
      </details>
    `}_numberRow(t,e,i){if(!t||!this.hass)return rt;const s=this.hass.states[t];if(!s)return rt;const o=(Jt(this.hass,t,"min")??0)<0,r=Number(s.state),a=""!==s.state.trim()&&Number.isFinite(r)?ie(this.hass,r):"";return it`<label class="field">
      <span class="muted">
        ${c(this.hass,t,this.model?.context.name)}
        ${i?it`<span class="tag">${n(this.hass,"goal.derived")}</span>`:rt}
      </span>
      <span class="input">
        <input
          class="number"
          type="text"
          inputmode=${o?"text":"decimal"}
          autocomplete="off"
          .value=${a}
          ?disabled=${i||"unavailable"===s.state}
          aria-describedby=${i?"derived":rt}
          @change=${e=>this._setNumber(t,e.target.value)}
        />
        <span class="unit muted">${e}</span>
      </span>
    </label>`}_dateRow(t){if(!t||!this.hass?.states[t])return rt;const e=this.hass.states[t];return it`<label class="field">
      <span class="muted"
        >${c(this.hass,t,this.model?.context.name)}</span
      >
      <span class="input">
        <input
          type="date"
          .value=${"unknown"===e.state||"unavailable"===e.state?"":e.state}
          ?disabled=${"unavailable"===e.state}
          @change=${e=>this._setDate(t,e.target.value)}
        />
      </span>
    </label>`}async _setNumber(t,e){const i=ee(e);if(this.hass&&null!==i)try{await this.hass.callService("number","set_value",{value:i},{entity_id:t}),this._error=null}catch(t){this._error=_e(this.hass,t)}}async _setDate(t,e){if(this.hass&&e)try{await this.hass.callService("date","set_value",{date:e},{entity_id:t}),this._error=null}catch(t){this._error=_e(this.hass,t)}}};Re.styles=[Mt,y`
      details {
        border-top: 1px solid var(--divider-color, #e0e0e0);
        padding-top: 6px;
      }
      summary {
        display: flex;
        align-items: center;
        gap: 6px;
        min-height: 40px;
        font-size: 14px;
        cursor: pointer;
        list-style: none;
      }
      summary::-webkit-details-marker {
        display: none;
      }
      summary ha-icon {
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color, #727272);
      }
      summary::after {
        content: "";
        margin-left: auto;
        width: 8px;
        height: 8px;
        border-right: 2px solid var(--secondary-text-color, #727272);
        border-bottom: 2px solid var(--secondary-text-color, #727272);
        transform: rotate(45deg) translateY(-2px);
      }
      details[open] summary::after {
        transform: rotate(-135deg) translateY(-2px);
      }
      .grid {
        display: grid;
        gap: 8px;
        padding: 4px 0 8px;
      }
      .field {
        display: grid;
        grid-template-columns: 1fr minmax(120px, 46%);
        align-items: center;
        gap: 10px;
        font-size: 13px;
      }
      .input {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .input input {
        width: 100%;
        min-width: 0;
      }
      .unit {
        font-size: 12px;
        flex: 0 0 auto;
      }
      .tag {
        margin-left: 6px;
        padding: 1px 6px;
        border-radius: 8px;
        background: var(--secondary-background-color, #f2f2f2);
        font-size: 11px;
        white-space: nowrap;
      }
      .hint {
        margin: 0 0 8px;
        font-size: 12px;
        line-height: 1.4;
      }
      .error {
        padding: 8px 10px;
        border-radius: 8px;
        background: var(--error-color, #db4437);
        color: var(--text-primary-color, #fff);
        font-size: 13px;
      }
    `],u([Et({attribute:!1})],Re.prototype,"hass",void 0),u([Et({attribute:!1})],Re.prototype,"model",void 0),u([Et({type:Boolean})],Re.prototype,"open",void 0),u([St()],Re.prototype,"_error",void 0),Re=u([xt("wg-goal-editor")],Re);let je=class extends $t{constructor(){super(...arguments),this._draft=null,this._error=null,this._busy=!1,this._open=()=>{const t=this.hass,e=this.model?.currentWeight??null;this._draft={name:"",mode:"target",startDate:Lt(t?.config?.time_zone),startWeight:null===e?"":ie(t,e),endDate:"",value:"",activate:!0},this._error=null},this._close=()=>{this._draft=null,this._error=null},this._submit=async e=>{e.preventDefault();const i=this.hass,s=this._draft,o=this.model?.context.target;if(!i||!s||!o)return;const r=d(i),a=ee(s.value),n=s.startWeight.trim()?ee(s.startWeight):null;if(!s.endDate||null===a||s.startWeight.trim()&&null===n)return void(this._error=r("goals.form.incomplete"));const l={name:s.name,goal_mode:s.mode,end_date:s.endDate,activate:s.activate,["rate"===s.mode?"rate_per_week":"target_weight"]:a};s.startDate&&(l.start_date=s.startDate),null!==n&&(l.start_weight=n),this._busy=!0;try{await i.callService(t,"create_goal",l,{entity_id:o}),this._close()}catch(t){this._error=_e(i,t)}finally{this._busy=!1}}}render(){const t=this.hass,e=this.model;if(!t||!e?.context.target)return rt;const i=d(t),s=this._draft;if(!s)return it`<button class="control open" @click=${this._open}>
        <ha-icon icon="mdi:plus"></ha-icon>
        <span>${i("goals.new")}</span>
      </button>`;const o=e.unit,r="rate"===s.mode;return it`
      <form class="form" @submit=${this._submit} novalidate>
        <label class="field wide">
          <span class="muted">${i("goals.form.name")}</span>
          <input
            type="text"
            autocomplete="off"
            .value=${s.name}
            @input=${t=>this._set("name",t.target.value)}
          />
        </label>
        <label class="field wide">
          <span class="muted">${i("goals.form.mode")}</span>
          <select
            .value=${s.mode}
            @change=${t=>this._set("mode",t.target.value)}
          >
            <option value="target" ?selected=${!r}>${i("goals.form.mode_target")}</option>
            <option value="rate" ?selected=${r}>${i("goals.form.mode_rate")}</option>
          </select>
        </label>
        <label class="field">
          <span class="muted">${i("goals.form.start_date")}</span>
          <input
            type="date"
            class=${t.themes?.darkMode?"dark":""}
            .value=${s.startDate}
            @input=${t=>this._set("startDate",t.target.value)}
          />
        </label>
        <label class="field">
          <span class="muted">${i("goals.form.start_weight",{unit:o})}</span>
          <input
            type="text"
            inputmode="decimal"
            autocomplete="off"
            .value=${s.startWeight}
            @input=${t=>this._set("startWeight",t.target.value)}
          />
        </label>
        <label class="field">
          <span class="muted">${i("goals.form.end_date")}</span>
          <input
            type="date"
            class=${t.themes?.darkMode?"dark":""}
            .value=${s.endDate}
            @input=${t=>this._set("endDate",t.target.value)}
          />
        </label>
        <label class="field">
          <span class="muted"
            >${i(r?"goals.form.rate":"goals.form.target_weight",{unit:o})}</span
          >
          <input
            type="text"
            inputmode=${r?"text":"decimal"}
            autocomplete="off"
            .value=${s.value}
            @input=${t=>this._set("value",t.target.value)}
          />
        </label>
        <label class="check wide">
          <input
            type="checkbox"
            .checked=${s.activate}
            @change=${t=>this._set("activate",t.target.checked)}
          />
          <span>${i("goals.form.activate")}</span>
        </label>
        ${this._error?it`<div class="error wide" role="alert">${this._error}</div>`:rt}
        <div class="buttons wide">
          <button type="button" class="control" ?disabled=${this._busy} @click=${this._close}>
            ${i("goals.form.cancel")}
          </button>
          <button type="submit" class="control primary" ?disabled=${this._busy}>
            <ha-icon icon="mdi:check"></ha-icon>
            <span>${i("goals.form.save")}</span>
          </button>
        </div>
      </form>
    `}_set(t,e){this._draft&&(this._draft={...this._draft,[t]:e})}};je.styles=[Mt,y`
      button.control.open {
        width: 100%;
        margin-bottom: 8px;
      }
      button.control ha-icon {
        --mdc-icon-size: 18px;
      }
      .form {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px 10px;
        margin-bottom: 10px;
        padding: 10px;
        border-radius: 10px;
        background: var(--secondary-background-color, #f2f2f2);
      }
      .wide {
        grid-column: 1 / -1;
      }
      .field {
        display: grid;
        gap: 4px;
        min-width: 0;
        font-size: 12px;
      }
      .field input,
      .field select {
        width: 100%;
        min-width: 0;
      }
      select {
        min-height: 44px;
        box-sizing: border-box;
        padding: 0 10px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 10px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #212121);
        font: inherit;
        font-size: 14px;
      }
      input[type="date"] {
        color-scheme: light;
      }
      input[type="date"].dark {
        color-scheme: dark;
      }
      .check {
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 36px;
        font-size: 13px;
      }
      .check input {
        min-height: 0;
        width: 18px;
        height: 18px;
        margin: 0;
      }
      .buttons {
        display: flex;
        gap: 8px;
      }
      .buttons button {
        flex: 1 1 0;
      }
      /* The form sits on the colour of a plain button already. */
      .buttons button:not(.primary) {
        background: var(--card-background-color, #fff);
      }
      .error {
        padding: 8px 10px;
        border-radius: 8px;
        background: var(--error-color, #db4437);
        color: var(--text-primary-color, #fff);
        font-size: 13px;
      }
      /* Two columns of date fields do not fit a narrow card. */
      @container (max-width: 300px) {
        .form {
          grid-template-columns: 1fr;
        }
      }
    `],u([Et({attribute:!1})],je.prototype,"hass",void 0),u([Et({attribute:!1})],je.prototype,"model",void 0),u([St()],je.prototype,"_draft",void 0),u([St()],je.prototype,"_error",void 0),u([St()],je.prototype,"_busy",void 0),je=u([xt("wg-new-goal")],je);const Ue=`/config/integrations/integration/${t}`;let He=class extends $t{constructor(){super(...arguments),this._error=null,this._navigate=t=>{t.ctrlKey||t.metaKey||t.shiftKey||0!==t.button||(t.preventDefault(),history.pushState(null,"",Ue),window.dispatchEvent(new CustomEvent("location-changed",{detail:{replace:!1}})))}}render(){const t=this.model,e=this.hass;if(!t||!e||!t.context.entities.active_goal)return rt;const i=[...t.goals].reverse();return it`
      <details>
        <summary>
          <ha-icon icon="mdi:flag-checkered"></ha-icon>
          <span>${n(e,"goals.title")}</span>
          <span class="count muted">${i.length}</span>
        </summary>
        <wg-new-goal .hass=${e} .model=${t}></wg-new-goal>
        ${i.length?it`<ul>
              ${i.map(t=>this._renderGoal(t))}
            </ul>`:it`<p class="hint muted">${n(e,"goals.empty")}</p>`}
        ${this._error?it`<div class="error" role="alert">${this._error}</div>`:rt}
        <p class="hint muted">
          <a href=${Ue} @click=${this._navigate}
            >${n(e,"goals.manage")}</a
          >
        </p>
      </details>
    `}_renderGoal(t){const e=this.hass,i=this.model?.unit??"kg";return it`<li class=${t.active?"active":""}>
      <div class="line">
        <span class="name">
          ${t.name}
          ${t.active?it`<span class="tag">${n(e,"goals.active")}</span>`:rt}
        </span>
        ${this._renderOutcome(t)}
      </div>
      <div class="line">
        <span class="muted details">
          <span class="nowrap">${this._period(t)}</span>
          <span class="nowrap"
            >${se(e,t.startWeight,1)} →
            ${se(e,t.targetWeight,1)} ${i}</span
          >
        </span>
        ${t.active?rt:it`<button class="control small" @click=${()=>this._activate(t)}>
              ${n(e,"goals.activate")}
            </button>`}
      </div>
    </li>`}_period(t){const e=this.hass,i=e?.config?.time_zone??"UTC",s=t=>oe(e,t?Gt(t,i):null,!0);return`${s(t.startDate)} – ${s(t.endDate)}`}_renderOutcome(t){const e=this.hass,i=t.result;if(i){const t=i.reached?"goals.reached":"goals.missed";return it`<span class="outcome ${i.reached?"reached":""}">
        <ha-icon
          icon=${i.reached?"mdi:check-circle-outline":"mdi:close-circle-outline"}
        ></ha-icon>
        ${n(e,t,{value:se(e,i.weight,1),unit:this.model?.unit??"kg"})}
      </span>`}const s=Lt(e.config?.time_zone);let o="goals.running";return t.startDate&&s<t.startDate?o="goals.planned":t.endDate&&s>t.endDate&&(o="goals.no_reading"),it`<span class="outcome muted">${n(e,o)}</span>`}async _activate(t){const e=this.model?.context.entities.active_goal;if(this.hass&&e)try{await this.hass.callService("select","select_option",{option:t.name},{entity_id:e}),this._error=null}catch(t){this._error=_e(this.hass,t)}}};He.styles=[Mt,y`
      details {
        border-top: 1px solid var(--divider-color, #e0e0e0);
        padding-top: 6px;
      }
      summary {
        display: flex;
        align-items: center;
        gap: 6px;
        min-height: 40px;
        font-size: 14px;
        cursor: pointer;
        list-style: none;
      }
      summary::-webkit-details-marker {
        display: none;
      }
      summary ha-icon {
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color, #727272);
      }
      summary::after {
        content: "";
        margin-left: auto;
        width: 8px;
        height: 8px;
        border-right: 2px solid var(--secondary-text-color, #727272);
        border-bottom: 2px solid var(--secondary-text-color, #727272);
        transform: rotate(45deg) translateY(-2px);
      }
      details[open] summary::after {
        transform: rotate(-135deg) translateY(-2px);
      }
      .count {
        font-size: 12px;
      }
      ul {
        display: grid;
        gap: 8px;
        margin: 0;
        padding: 4px 0 8px;
        list-style: none;
      }
      li {
        display: grid;
        gap: 2px;
        padding: 8px 10px;
        border-radius: 10px;
        background: var(--secondary-background-color, #f2f2f2);
      }
      li.active {
        box-shadow: inset 3px 0 0 var(--primary-color, #03a9f4);
      }
      .line {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        min-width: 0;
      }
      .name {
        font-size: 14px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .details {
        display: flex;
        flex-wrap: wrap;
        column-gap: 10px;
        font-size: 12px;
        min-width: 0;
      }
      /* Wraps between the period and the weights, never inside either. */
      .nowrap {
        white-space: nowrap;
      }
      .outcome {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        flex: 0 0 auto;
        font-size: 12px;
        white-space: nowrap;
      }
      .outcome ha-icon {
        --mdc-icon-size: 16px;
        color: var(--secondary-text-color, #727272);
      }
      .outcome.reached ha-icon {
        color: var(--success-color, #43a047);
      }
      .tag {
        margin-left: 6px;
        padding: 1px 6px;
        border-radius: 8px;
        background: var(--card-background-color, #fff);
        font-size: 11px;
        white-space: nowrap;
      }
      button.control.small {
        flex: 0 0 auto;
        min-height: 36px;
        padding: 0 12px;
        background: var(--card-background-color, #fff);
        font-size: 13px;
      }
      .hint {
        margin: 0 0 8px;
        font-size: 12px;
        line-height: 1.4;
      }
      .hint a {
        color: var(--primary-color, #03a9f4);
      }
      .error {
        margin-bottom: 8px;
        padding: 8px 10px;
        border-radius: 8px;
        background: var(--error-color, #db4437);
        color: var(--text-primary-color, #fff);
        font-size: 13px;
      }
    `],u([Et({attribute:!1})],He.prototype,"hass",void 0),u([Et({attribute:!1})],He.prototype,"model",void 0),u([St()],He.prototype,"_error",void 0),He=u([xt("wg-goals")],He);let Ie=class extends $t{constructor(){super(...arguments),this.name="",this.compact=!1,this.passive=!1,this._openStatus=()=>{const t=this.model?.context.entities.status;t&&this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t},bubbles:!0,composed:!0}))}}render(){const t=this.model;if(!t)return rt;const e=t.status,o=i[e]??i.no_goal;if(this.compact)return it`
        <div class="compact">
          <span class="name" title=${this.name}>${this.name}</span>
          ${null===t.currentWeight?rt:it`<span class="now" style=${`color:${o}`}
                >${se(this.hass,t.currentWeight,1)}
                ${t.unit}</span
              >`}
        </div>
      `;const r=h(this.hass,qt(this.hass,t.context.entities.status))||e,a=it`
      <ha-icon icon=${s[e]??"mdi:information-outline"}></ha-icon>
      <span>${r}</span>
    `;return it`
      <div class="header">
        <div class="badge" style=${`background:${o}`}>
          <ha-icon icon=${this.icon??"mdi:scale-bathroom"}></ha-icon>
        </div>
        <div class="titles">
          <span class="name" title=${this.name}>${this.name}</span>
          ${t.endDate?it`<span class="muted sub"
                >${n(this.hass,"header.until",{date:h(this.hass,qt(this.hass,t.context.entities.end_date))||t.endDate})}</span
              >`:rt}
        </div>
        ${this.passive?it`<span class="status" style=${`color:${o}`}>${a}</span>`:it`<button
              class="status"
              style=${`color:${o}`}
              @click=${this._openStatus}
              aria-label=${n(this.hass,"header.status",{status:r})}
            >
              ${a}
            </button>`}
      </div>
    `}};Ie.styles=[Mt,y`
      .header {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .compact {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 10px;
      }
      .compact .name {
        font-size: 15px;
      }
      .now {
        font-size: 15px;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .badge {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        flex: 0 0 auto;
        border-radius: 12px;
        color: var(--text-primary-color, #fff);
      }
      .badge ha-icon {
        --mdc-icon-size: 22px;
      }
      .titles {
        display: flex;
        flex-direction: column;
        min-width: 0;
        flex: 1 1 auto;
      }
      .name {
        font-size: 16px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .sub {
        font-size: 12px;
      }
      .status {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        flex: 0 0 auto;
        min-height: 36px;
        padding: 0 4px;
        border: none;
        background: none;
        font: inherit;
        font-size: 13px;
        cursor: pointer;
      }
      .status ha-icon {
        --mdc-icon-size: 18px;
      }
      @container (max-width: 300px) {
        .status span {
          display: none;
        }
      }
    `],u([Et({attribute:!1})],Ie.prototype,"hass",void 0),u([Et({attribute:!1})],Ie.prototype,"model",void 0),u([Et()],Ie.prototype,"name",void 0),u([Et()],Ie.prototype,"icon",void 0),u([Et({type:Boolean})],Ie.prototype,"compact",void 0),u([Et({type:Boolean})],Ie.prototype,"passive",void 0),Ie=u([xt("wg-header")],Ie);let Ge=class extends $t{constructor(){super(...arguments),this.passive=!1}render(){const t=this.model;if(!t||!this.hass)return rt;const e=d(this.hass),s=i[t.status]??i.no_goal,o=it`
      <span class="number"
        >${se(this.hass,t.currentWeight,1)}</span
      >
      <span class="unit muted">${t.unit}</span>
    `;return it`
      <div class="hero">
        ${this.passive?it`<span class="value">${o}</span>`:it`<button
              class="value"
              @click=${()=>this._more(t.context.entities.weight)}
            >
              ${o}
            </button>`}
        ${null===t.deviation?rt:it`<div class="deviation" style=${`color:${s}`}>
              <ha-icon
                icon=${t.deviation>0?"mdi:arrow-up":t.deviation<0?"mdi:arrow-down":"mdi:equal"}
              ></ha-icon>
              <span>
                ${0===t.deviation?e("hero.on_plan"):`${se(this.hass,Math.abs(t.deviation),1)} ${t.unit} ${t.deviation>0?e("hero.above_plan"):e("hero.below_plan")}`}
              </span>
            </div>`}
      </div>
    `}_more(t){t&&this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t},bubbles:!0,composed:!0}))}};Ge.styles=[Mt,y`
      .hero {
        display: flex;
        align-items: baseline;
        flex-wrap: wrap;
        gap: 4px 14px;
      }
      .value {
        display: inline-flex;
        align-items: baseline;
        gap: 4px;
        padding: 0;
        border: none;
        background: none;
        color: inherit;
        font: inherit;
        cursor: pointer;
      }
      .number {
        font-size: 34px;
        font-weight: 400;
        line-height: 1.1;
        letter-spacing: -0.5px;
      }
      .unit {
        font-size: 16px;
      }
      .deviation {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-size: 14px;
      }
      .deviation ha-icon {
        --mdc-icon-size: 17px;
      }
    `],u([Et({attribute:!1})],Ge.prototype,"hass",void 0),u([Et({attribute:!1})],Ge.prototype,"model",void 0),u([Et({type:Boolean})],Ge.prototype,"passive",void 0),Ge=u([xt("wg-hero")],Ge);let Le=class extends $t{render(){const t=this.model;if(!t||null===t.weightProgress&&null===t.timeProgress)return rt;const e=i[t.status]??i.on_track;return it`
      ${this._bar(n(this.hass,"progress.weight"),t.weightProgress,e)}
      ${this._bar(n(this.hass,"progress.time"),t.timeProgress,"var(--secondary-text-color, #727272)")}
    `}_bar(t,e,i){if(null===e)return it`<div class="line">
        <span class="label muted">${t}</span>
        <span class="track"></span>
        <span class="value muted">–</span>
      </div>`;const s=Math.min(100,Math.max(0,e));return it`<div class="line">
      <span class="label muted">${t}</span>
      <span
        class="track"
        role="progressbar"
        aria-label=${n(this.hass,"progress.aria",{label:t})}
        aria-valuenow=${Math.round(s)}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <span class="fill" style=${`width:${s}%;background:${i}`}></span>
      </span>
      <span class="value">${se(this.hass,s,0)}%</span>
    </div>`}};Le.styles=[Mt,y`
      .line {
        display: grid;
        grid-template-columns: 52px 1fr 42px;
        align-items: center;
        gap: 10px;
        font-size: 12px;
        padding: 3px 0;
      }
      .track {
        height: 8px;
        border-radius: 4px;
        background: var(--divider-color, #e0e0e0);
        overflow: hidden;
      }
      .fill {
        display: block;
        height: 100%;
        border-radius: 4px;
      }
      .value {
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
    `],u([Et({attribute:!1})],Le.prototype,"hass",void 0),u([Et({attribute:!1})],Le.prototype,"model",void 0),Le=u([xt("wg-progress")],Le);let Fe=class extends ce{constructor(){super(...arguments),this._gestures=new ge({enabled:()=>he(this._config),hold:()=>ue(this._config?.hold_action),doubleTap:()=>ue(this._config?.double_tap_action),fire:t=>this._fireAction(t)})}static getStubConfig(t,i){const s=i.find(t=>t.endsWith("_status"));return{type:`custom:${e}`,entity:s??i[0]}}static async getConfigElement(){return await Promise.resolve().then(function(){return ti}),document.createElement(`${e}-editor`)}chartOptions(){const t=this._config??{},e={source:t.source,range:t.range,average:t.average,line:t.line,height:t.height,y_axis:t.y_axis,show:t.show,styles:t.styles},i=t.chart??{};return{...e,...i,y_axis:{...e.y_axis??{},...i.y_axis??{}},show:{...e.show??{},...i.show??{}},styles:{...e.styles??{},...i.styles??{}}}}needsMeasurements(){return!1!==this._config?.show_chart}disconnectedCallback(){super.disconnectedCallback(),this._gestures.reset()}_fireAction(t){this._config&&this.dispatchEvent(new CustomEvent("hass-action",{detail:{config:this._config,action:t},bubbles:!0,composed:!0}))}getCardSize(){let t=2;return!1!==this._config?.show_chart&&(t+=3),!1!==this._config?.show_progress&&(t+=1),!1!==this._config?.show_record&&(t+=1),!1!==this._config?.show_goals&&(t+=1),t}render(){const t=this.missingGoalMessage();if(t)return this.renderProblem(t);const e=this._model,i=this._config;if(!e||!i||!this.hass)return it`<ha-card></ha-card>`;const s=!1!==i.show_chart,o=!1!==i.show_record,r=he(i),a=function(t){return!!he(t)&&(void 0===t.tap_action||ue(t.tap_action)||ue(t.hold_action)||ue(t.double_tap_action))}(i),n=this._gestures;return it`
      <ha-card
        class=${a?"actionable":""}
        role=${a?"button":rt}
        tabindex=${a?"0":rt}
        aria-label=${a?i.name??e.context.name:rt}
        @pointerdown=${n.down}
        @pointermove=${n.move}
        @pointerup=${n.up}
        @pointercancel=${n.cancel}
        @contextmenu=${n.contextMenu}
        @keydown=${n.key}
      >
        <div class="content">
          ${!1===i.show_header?rt:it`<wg-header
                .hass=${this.hass}
                .model=${e}
                .name=${i.name??e.context.name}
                .icon=${i.icon}
                ?compact=${"compact"===i.header}
                ?passive=${r}
              ></wg-header>`}

          ${!1===i.show_hero?rt:it`<wg-hero
                .hass=${this.hass}
                .model=${e}
                ?passive=${r}
              ></wg-hero>`}

          ${!1===i.show_badges?rt:it`<wg-badges
                .hass=${this.hass}
                .model=${e}
                .badges=${i.badges}
                ?passive=${r}
              ></wg-badges>`}

          ${s?it`
                ${this._fetchError?it`<div class="notice" role="alert">${this._fetchError}</div>`:rt}
                <wg-chart
                  .hass=${this.hass}
                  .model=${e}
                  .measurements=${this._measurements}
                  .options=${this.chartOptions()}
                  .loading=${this._loading}
                ></wg-chart>
              `:rt}

          ${!1===i.show_progress?rt:it`<wg-progress .hass=${this.hass} .model=${e}></wg-progress>`}

          ${o?it`<wg-actions
                .hass=${this.hass}
                .model=${e}
                .showRecord=${!1!==i.show_record}
                .showRecordDate=${!1!==i.show_record_date}
              ></wg-actions>`:rt}

          ${!1===i.show_goal_editor?rt:it`<wg-goal-editor
                .hass=${this.hass}
                .model=${e}
                .open=${"no_goal"===e.status}
              ></wg-goal-editor>`}

          ${!1===i.show_goals?rt:it`<wg-goals .hass=${this.hass} .model=${e}></wg-goals>`}
        </div>
      </ha-card>
    `}};Fe.styles=[Mt,y`
      ha-card {
        container-type: inline-size;
        overflow: hidden;
      }
      ha-card.actionable {
        cursor: pointer;
      }
      ha-card.actionable:focus-visible {
        outline: 2px solid var(--primary-color, #03a9f4);
        outline-offset: 2px;
      }
      .content {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 16px;
      }
      .notice {
        padding: 8px 10px;
        border-radius: 8px;
        background: var(--secondary-background-color, #f2f2f2);
        color: var(--secondary-text-color, #727272);
        font-size: 12px;
      }
      .problem {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 16px;
        color: var(--secondary-text-color, #727272);
        font-size: 14px;
        line-height: 1.45;
      }
      .problem ha-icon {
        flex: 0 0 auto;
        color: var(--warning-color, #ffa726);
      }
    `],Fe=u([xt(e)],Fe),window.customCards=window.customCards??[];const Be=navigator.language||"en",Ze=[{type:e,name:l(Be,"picker.card_name"),description:l(Be,"picker.card_description"),preview:!0,documentationURL:"https://github.com/julezdean/ha-weight-goal"}];for(const t of Ze)window.customCards.some(e=>e.type===t.type)||window.customCards.push(t);let qe;function Ke(e,i){if("source"===i)return n(e,"badge.source.sensor");const s=`component.${t}.entity.sensor.${i}.name`,o=e?.localize?.(s);if("string"==typeof o&&o)return o;for(const s of["number","date"]){const o=e?.localize?.(`component.${t}.entity.${s}.${i}.name`);if("string"==typeof o&&o)return o}return i}function Ve(t,e){return[{name:"",type:"grid",schema:["show_header","show_hero","show_badges","show_chart","show_progress",...e.manual?["show_record"]:[],...e.manual&&e.record?["show_record_date"]:[],"show_goal_editor","show_goals"].map(t=>({name:t,selector:{boolean:{}}}))},{name:"header",selector:{select:{mode:"dropdown",options:[{value:"full",label:t("editor.header_full")},{value:"compact",label:t("editor.header_compact")}]}}}]}function Ye(t){return[{name:"",type:"grid",schema:[{name:"source",selector:{select:{mode:"dropdown",options:[{value:"measurements",label:t("editor.source_measurements")},{value:"history",label:t("editor.source_history")}]}}},{name:"range",selector:{select:{mode:"dropdown",custom_value:!0,options:[{value:"goal",label:t("editor.range_goal")},{value:"30",label:t("editor.range_30")},{value:"90",label:t("editor.range_90")},{value:"365",label:t("editor.range_365")},{value:"all",label:t("editor.range_all")}]}}},{name:"line",selector:{select:{mode:"dropdown",options:[{value:"smooth",label:t("editor.line_smooth")},{value:"linear",label:t("editor.line_linear")},{value:"step",label:t("editor.line_step")}]}}},{name:"average",selector:{number:{min:0,max:60,step:1,mode:"box",unit_of_measurement:"d"}}},{name:"height",selector:{number:{min:100,max:500,step:10,mode:"box",unit_of_measurement:"px"}}}]},{name:"y_axis",type:"expandable",title:t("editor.y_axis"),schema:[{name:"",type:"grid",schema:[{name:"mode",selector:{select:{mode:"dropdown",options:[{value:"nice",label:t("editor.mode_nice")},{value:"tight",label:t("editor.mode_tight")}]}}},{name:"include_goal",selector:{boolean:{}}},{name:"min",selector:{number:{min:0,max:500,step:.5,mode:"box"}}},{name:"max",selector:{number:{min:0,max:500,step:.5,mode:"box"}}},{name:"ticks",selector:{number:{min:2,max:10,step:1,mode:"box"}}}]}]},{name:"show",type:"expandable",title:t("editor.layers"),schema:[{name:"",type:"grid",schema:[{name:"band",selector:{boolean:{}}},{name:"plan",selector:{boolean:{}}},{name:"goals",selector:{boolean:{}}},{name:"average",selector:{boolean:{}}},{name:"projection",selector:{boolean:{}}},{name:"points",selector:{boolean:{}}},{name:"today",selector:{boolean:{}}},{name:"grid",selector:{boolean:{}}},{name:"axis",selector:{boolean:{}}}]}]}]}console.info("%c WEIGHT-GOAL-CARD %c 0.11.0-beta.3 ","color:#fff;background:#03a9f4;font-weight:700","color:#03a9f4;background:#fff;font-weight:700");const Xe={entity:"editor.entity",name:"editor.name",icon:"editor.icon",badges:"editor.badges",source:"editor.source",range:"editor.range",line:"editor.line",average:"editor.average",height:"editor.height",mode:"editor.mode",include_goal:"editor.include_goal",min:"editor.min",max:"editor.max",ticks:"editor.ticks",band:"editor.band",plan:"editor.plan",projection:"editor.projection",goals:"editor.goals",points:"editor.points",today:"editor.today",grid:"editor.grid",axis:"editor.axis",show_header:"editor.show_header",header:"editor.header",show_hero:"editor.show_hero",show_badges:"editor.show_badges",show_chart:"editor.show_chart",show_progress:"editor.show_progress",show_record:"editor.show_record",show_record_date:"editor.show_record_date",show_goal_editor:"editor.show_goal_editor",show_goals:"editor.show_goals",tap_action:"editor.tap_action",hold_action:"editor.hold_action",double_tap_action:"editor.double_tap_action"},Je={entity:"editor.entity_help",badges:"editor.badges_help",source:"editor.source_help",average:"editor.average_help",range:"editor.range_help",mode:"editor.mode_help",include_goal:"editor.include_goal_help",min:"editor.axis_bound_help",max:"editor.axis_bound_help",tap_action:"editor.tap_action_help"};let Qe=class extends $t{constructor(){super(...arguments),this._ready=!1,this._changed=t=>{t.stopPropagation();const e={...t.detail.value};"string"==typeof e.range&&/^\d+$/.test(e.range)&&(e.range=Number(e.range));const i=(this._config?.badges??[]).filter(t=>"object"==typeof t);i.length&&(e.badges=[...e.badges??[],...i]),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}}setConfig(t){this._config=t}connectedCallback(){super.connectedCallback(),(qe||(qe=(async()=>{if(customElements.get("ha-form"))return;const t=await(window.loadCardHelpers?.());if(!t)return;const e=t.createCardElement({type:"entities",entities:[]}).constructor.getConfigElement;e&&await e()})().catch(()=>{})),qe).then(()=>{this._ready=!0})}_schema(){const e=d(this.hass);return[{name:"entity",required:!0,selector:{entity:{integration:t,domain:"sensor"}}},{name:"",type:"grid",schema:[{name:"name",selector:{text:{}}},{name:"icon",selector:{icon:{}}}]},(i=this.hass,{name:"badges",selector:{select:{multiple:!0,mode:"list",options:ye.map(t=>({value:t,label:Ke(i,t)}))}}}),{name:"",type:"expandable",title:e("editor.sections"),schema:Ve(e,{manual:this._manualOffered(),record:!1!==this._config?.show_record})},{name:"",type:"expandable",title:e("editor.chart"),schema:Ye(e)},{name:"",type:"expandable",title:e("editor.interactions"),schema:[{name:"tap_action",selector:{ui_action:{default_action:"more-info"}}},{name:"hold_action",selector:{ui_action:{default_action:"none"}}},{name:"double_tap_action",selector:{ui_action:{default_action:"none"}}}]}];var i}_manualOffered(){if(!this.hass||!this._config)return!1;const t=Wt(this.hass,this._config).entities.manual_weight,e=t?this.hass.states[t]:void 0;return!!e&&"unavailable"!==e.state}render(){return this.hass&&this._config?this._ready||customElements.get("ha-form")?it`
      <ha-form
        .hass=${this.hass}
        .data=${this._defaults()}
        .schema=${this._schema()}
        .computeLabel=${t=>function(t,e){const i=Xe[e.name];return i?n(t,i):e.title??e.name}(this.hass,t)}
        .computeHelper=${t=>function(t,e){const i=Je[e.name];return i?n(t,i):void 0}(this.hass,t)}
        @value-changed=${this._changed}
      ></ha-form>
    `:it`<p class="fallback">
        ${n(this.hass,"editor.loading")}
      </p>`:rt}_defaults(){const t=this._config;return{show_header:!0,header:"full",show_hero:!0,show_badges:!0,show_chart:!0,show_progress:!0,show_record:!0,show_record_date:!0,show_goal_editor:!0,show_goals:!0,source:"measurements",range:"goal",line:"smooth",average:7,...t,badges:(t.badges??be).filter(t=>"string"==typeof t),y_axis:{mode:"nice",include_goal:!0,...t.y_axis??{}},show:{band:!0,plan:!0,goals:!0,average:!0,projection:!0,points:!0,today:!0,grid:!0,axis:!0,...t.show??{}}}}};Qe.styles=y`
    .fallback {
      color: var(--secondary-text-color, #727272);
      font-size: 14px;
    }
  `,u([Et({attribute:!1})],Qe.prototype,"hass",void 0),u([St()],Qe.prototype,"_config",void 0),u([St()],Qe.prototype,"_ready",void 0),Qe=u([xt(`${e}-editor`)],Qe);var ti=Object.freeze({__proto__:null,get WeightGoalCardEditor(){return Qe}});
