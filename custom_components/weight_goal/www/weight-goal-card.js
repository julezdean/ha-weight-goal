/*! weight-goal-card 0.11.0-beta.1 | MIT | https://github.com/julezdean/ha-weight-goal */
const e="weight_goal",t="weight-goal-card",i={no_goal:"var(--disabled-text-color, #9e9e9e)",upcoming:"var(--secondary-text-color, #727272)",on_track:"var(--primary-color, #03a9f4)",ahead:"var(--success-color, #43a047)",behind:"var(--warning-color, #ffa726)",reached:"var(--success-color, #43a047)",ended:"var(--secondary-text-color, #727272)"},s={no_goal:"mdi:target-variant",upcoming:"mdi:calendar-clock",on_track:"mdi:check-circle-outline",ahead:"mdi:rocket-launch-outline",behind:"mdi:alert-circle-outline",reached:"mdi:flag-checkered",ended:"mdi:calendar-check-outline"},o=new Set(["unavailable","unknown"]),r={"picker.card_name":"Weight goal","picker.card_description":"Weight against the planned trajectory, with the chart, the progress bars and the actions of one Road to Weight Goal entry.","card.fallback_name":"Weight goal","card.no_entities":"No Road to Weight Goal entities found for {anchor}. Point `entity` at one entity of the goal, for example sensor.<name>_status.","card.no_target":"This goal has no sensor entity, so actions and readings cannot be loaded.","card.load_failed":"Could not load the readings.","chart.loading":"Loading…","chart.empty":"No readings and no goal yet","chart.readings":"Readings","chart.vs_plan":"{value} {unit} vs plan","chart.summary_readings":"{count} readings","chart.summary_no_weight":"no current weight","chart.summary_current":"currently {value} {unit}","chart.summary_above":"{value} {unit} above plan","chart.summary_below":"{value} {unit} below plan","chart.summary_plan":"plan from {start} to {target} {unit}","header.until":"Until {date}","header.status":"Status: {status}","hero.above_plan":"above plan","hero.below_plan":"below plan","hero.on_plan":"on plan","badges.no_reading":"No reading yet","badge.source.manual":"Entered by hand","badge.source.sensor":"From the scale","badge.source.service":"From an automation","badge.source.import":"Imported","badge.source.statistics":"Daily average","actions.save":"Save reading","actions.enter_number":"Enter a number first.","actions.failed":"That did not work. Check the Home Assistant log for details.","actions.weight_input":"Weight in {unit}","actions.date_input":"Day of the reading","actions.future_date":"A reading can only be from today or an earlier day.","goal.title":"Goal","goal.derived":"calculated","goal.derived_hint":"One of these two is calculated from the other. Change how the goal is defined under Change goal on the integration page to set it directly.","goal.none":"No goal is active. Pick one in the goal list, or add one there with New goal.","goals.title":"Goals","goals.empty":"No goals yet.","goals.manage":"Change or delete goals on the integration page","goals.active":"active","goals.activate":"Activate","goals.reached":"Reached at {value} {unit}","goals.missed":"Ended at {value} {unit}","goals.planned":"Not started","goals.running":"Running","goals.no_reading":"No reading in its period","goals.new":"New goal","goals.form.name":"Name","goals.form.mode":"Define the goal by","goals.form.mode_target":"Target weight","goals.form.mode_rate":"Change per week","goals.form.start_date":"Start date","goals.form.start_weight":"Start weight in {unit}","goals.form.end_date":"End date","goals.form.target_weight":"Target weight in {unit}","goals.form.rate":"Change per week in {unit}","goals.form.activate":"Make it the active goal","goals.form.save":"Add goal","goals.form.cancel":"Cancel","goals.form.incomplete":"Fill in the end date and the goal value as numbers.","progress.weight":"Weight","progress.time":"Time","progress.aria":"{label} progress","editor.loading":"Loading the editor… if this stays here, edit the card in YAML.","editor.entity":"Goal entity","editor.entity_help":"Any entity of the goal. The card finds the rest itself.","editor.name":"Name","editor.icon":"Icon","editor.badges":"Badges","editor.badges_help":"The small chips under the weight, in the order you pick them.","editor.sections":"Sections","editor.chart":"Chart","editor.source":"Readings from","editor.source_help":"Integration readings are exactly what the status is based on. Recorder history reaches further back but still contains readings you deleted.","editor.source_measurements":"Integration readings","editor.source_history":"Recorder history","editor.range":"Time range","editor.range_help":"A number is read as days.","editor.range_goal":"Whole goal period","editor.range_30":"Last 30 days","editor.range_90":"Last 90 days","editor.range_365":"Last year","editor.range_all":"Everything","editor.line":"Line shape","editor.line_smooth":"Smooth","editor.line_linear":"Straight","editor.line_step":"Stepped","editor.average":"Moving average","editor.average_help":"Extra line over the raw readings. 0 turns it off.","editor.height":"Chart height","editor.y_axis":"Vertical axis","editor.mode":"Automatic ends","editor.mode_help":"Rounded gives readable labels. Fit the data uses the smallest and largest value exactly, which leaves more room for the movement.","editor.mode_nice":"Rounded","editor.mode_tight":"Fit the data","editor.include_goal":"Fit the plan line too","editor.include_goal_help":"Off keeps the axis on the readings and clips the plan line if it runs outside.","editor.min":"Lowest value","editor.max":"Highest value","editor.axis_bound_help":"Leave empty to follow the data.","editor.ticks":"Grid lines","editor.layers":"Layers","editor.band":"Tolerance band","editor.plan":"Plan line","editor.projection":"Projection","editor.goals":"Other goals","editor.points":"Reading dots","editor.today":"Today marker","editor.grid":"Grid lines","editor.axis":"Axis labels","editor.show_header":"Header","editor.header":"Header style","editor.header_full":"Full","editor.header_compact":"Compact","editor.show_hero":"Current weight","editor.show_badges":"Badges","editor.show_chart":"Chart","editor.show_progress":"Progress bars","editor.show_record":"Save reading","editor.show_record_date":"Day of the reading","editor.show_goal_editor":"Goal settings","editor.show_goals":"Goal list"},a={en:r,de:{"picker.card_name":"Gewichtsziel","picker.card_description":"Das Gewicht im Verhältnis zur geplanten Kurve, mit Diagramm, Fortschrittsbalken und den Aktionen eines Ziels aus „Road to Weight Goal“.","card.fallback_name":"Gewichtsziel","card.no_entities":"Keine Entitäten von „Road to Weight Goal“ für {anchor} gefunden. Setze `entity` auf eine Entität des Ziels, zum Beispiel sensor.<name>_status.","card.no_target":"Dieses Ziel hat keine Sensor-Entität, deshalb lassen sich weder Aktionen ausführen noch Messwerte laden.","card.load_failed":"Die Messwerte konnten nicht geladen werden.","chart.loading":"Wird geladen …","chart.empty":"Noch keine Messwerte und kein Ziel","chart.readings":"Messwerte","chart.vs_plan":"{value} {unit} zum Plan","chart.summary_readings":"{count} Messwerte","chart.summary_no_weight":"kein aktuelles Gewicht","chart.summary_current":"aktuell {value} {unit}","chart.summary_above":"{value} {unit} über Plan","chart.summary_below":"{value} {unit} unter Plan","chart.summary_plan":"Plan von {start} auf {target} {unit}","header.until":"Bis {date}","header.status":"Status: {status}","hero.above_plan":"über Plan","hero.below_plan":"unter Plan","hero.on_plan":"auf Plan","badges.no_reading":"Noch keine Messung","badge.source.manual":"Von Hand erfasst","badge.source.sensor":"Von der Waage","badge.source.service":"Aus einer Automatisierung","badge.source.import":"Importiert","badge.source.statistics":"Tagesmittel","actions.save":"Messung speichern","actions.enter_number":"Bitte zuerst eine Zahl eingeben.","actions.failed":"Das hat nicht geklappt. Die Einzelheiten stehen im Home-Assistant-Log.","actions.weight_input":"Gewicht in {unit}","actions.date_input":"Tag der Messung","actions.future_date":"Eine Messung kann nur von heute oder einem früheren Tag sein.","goal.title":"Ziel","goal.derived":"berechnet","goal.derived_hint":"Einer der beiden Werte wird aus dem anderen berechnet. Unter Ziel ändern auf der Seite der Integration legst du fest, welcher direkt eingestellt wird.","goal.none":"Kein Ziel ist aktiv. Wähle eins in der Zielliste oder lege dort mit Neues Ziel eins an.","goals.title":"Ziele","goals.empty":"Noch keine Ziele.","goals.manage":"Ziele auf der Seite der Integration ändern oder löschen","goals.active":"aktiv","goals.activate":"Aktivieren","goals.reached":"Erreicht mit {value} {unit}","goals.missed":"Beendet mit {value} {unit}","goals.planned":"Noch nicht begonnen","goals.running":"Läuft","goals.no_reading":"Keine Messung im Zeitraum","goals.new":"Neues Ziel","goals.form.name":"Name","goals.form.mode":"Ziel festlegen über","goals.form.mode_target":"Zielgewicht","goals.form.mode_rate":"Änderung pro Woche","goals.form.start_date":"Startdatum","goals.form.start_weight":"Startgewicht in {unit}","goals.form.end_date":"Enddatum","goals.form.target_weight":"Zielgewicht in {unit}","goals.form.rate":"Änderung pro Woche in {unit}","goals.form.activate":"Zum aktiven Ziel machen","goals.form.save":"Ziel anlegen","goals.form.cancel":"Abbrechen","goals.form.incomplete":"Trag das Enddatum und den Zielwert als Zahl ein.","progress.weight":"Gewicht","progress.time":"Zeit","progress.aria":"Fortschritt {label}","editor.loading":"Der Editor wird geladen … bleibt das stehen, bearbeite die Karte in YAML.","editor.entity":"Entität des Ziels","editor.entity_help":"Eine beliebige Entität des Ziels. Den Rest findet die Karte selbst.","editor.name":"Name","editor.icon":"Symbol","editor.badges":"Badges","editor.badges_help":"Die kleinen Chips unter dem Gewicht, in der Reihenfolge der Auswahl.","editor.sections":"Bereiche","editor.chart":"Diagramm","editor.source":"Messwerte aus","editor.source_help":"Die Messwerte der Integration sind genau die, auf denen der Status beruht. Die Recorder-Historie reicht weiter zurück, enthält aber auch gelöschte Messungen.","editor.source_measurements":"Messwerte der Integration","editor.source_history":"Recorder-Historie","editor.range":"Zeitraum","editor.range_help":"Eine Zahl wird als Tage gelesen.","editor.range_goal":"Gesamter Zielzeitraum","editor.range_30":"Letzte 30 Tage","editor.range_90":"Letzte 90 Tage","editor.range_365":"Letztes Jahr","editor.range_all":"Alles","editor.line":"Linienform","editor.line_smooth":"Geglättet","editor.line_linear":"Gerade","editor.line_step":"Stufen","editor.average":"Gleitender Mittelwert","editor.average_help":"Zusätzliche Linie über den Rohwerten. 0 schaltet sie aus.","editor.height":"Höhe des Diagramms","editor.y_axis":"Y-Achse","editor.mode":"Automatische Enden","editor.mode_help":"„Gerundet“ ergibt lesbare Beschriftungen. „An die Daten anpassen“ nimmt kleinsten und größten Wert exakt und lässt damit mehr Platz für die Bewegung.","editor.mode_nice":"Gerundet","editor.mode_tight":"An die Daten anpassen","editor.include_goal":"Planlinie mit einbeziehen","editor.include_goal_help":"Aus hält die Achse bei den Messwerten und schneidet die Planlinie ab, wenn sie darüber hinausläuft.","editor.min":"Kleinster Wert","editor.max":"Größter Wert","editor.axis_bound_help":"Leer lassen, um den Daten zu folgen.","editor.ticks":"Gitterlinien","editor.layers":"Ebenen","editor.band":"Toleranzband","editor.plan":"Planlinie","editor.projection":"Prognose","editor.goals":"Andere Ziele","editor.points":"Messpunkte","editor.today":"Heute-Markierung","editor.grid":"Gitterlinien","editor.axis":"Achsenbeschriftung","editor.show_header":"Kopfzeile","editor.header":"Header-Stil","editor.header_full":"Vollständig","editor.header_compact":"Kompakt","editor.show_hero":"Aktuelles Gewicht","editor.show_badges":"Badges","editor.show_chart":"Diagramm","editor.show_progress":"Fortschrittsbalken","editor.show_record":"Messung speichern","editor.show_record_date":"Tag der Messung","editor.show_goal_editor":"Zieleinstellungen","editor.show_goals":"Zielliste"}};function n(e,t,i={}){return l(function(e){return e?.locale?.language||e?.language||"en"}(e),t,i)}function l(e,t,i={}){let s=(a[e]??a[e.split("-")[0].toLowerCase()]??a.en)[t]??r[t]??t;for(const[e,t]of Object.entries(i))s=s.split(`{${e}}`).join(String(t));return s}function d(e){return(t,i)=>n(e,t,i)}function c(e,t,i){if(!e||!t)return"";const s=e.states[t]?.attributes?.friendly_name;return s?i&&s.startsWith(`${i} `)?s.slice(i.length+1):s:t}function h(e,t){if(!e||!t)return"";if("function"==typeof e.formatEntityState)try{return e.formatEntityState(t)}catch{}const i=t.attributes?.unit_of_measurement;return i?`${t.state} ${i}`:t.state}function u(e,t,i,s){var o,r=arguments.length,a=r<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,s);else for(var n=e.length-1;n>=0;n--)(o=e[n])&&(a=(r<3?o(a):r>3?o(t,i,a):o(t,i))||a);return r>3&&a&&Object.defineProperty(t,i,a),a}"function"==typeof SuppressedError&&SuppressedError;const p=globalThis,g=p.ShadowRoot&&(void 0===p.ShadyCSS||p.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,m=Symbol(),_=new WeakMap;let f=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==m)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(g&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=_.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&_.set(t,e))}return e}toString(){return this.cssText}};const y=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,s)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[s+1],e[0]);return new f(i,e,m)},b=g?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new f("string"==typeof e?e:e+"",void 0,m))(t)})(e):e,{is:v,defineProperty:$,getOwnPropertyDescriptor:w,getOwnPropertyNames:x,getOwnPropertySymbols:k,getPrototypeOf:A}=Object,S=globalThis,E=S.trustedTypes,M=E?E.emptyScript:"",D=S.reactiveElementPolyfillSupport,C=(e,t)=>e,z={toAttribute(e,t){switch(t){case Boolean:e=e?M:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},P=(e,t)=>!v(e,t),N={attribute:!0,type:String,converter:z,reflect:!1,useDefault:!1,hasChanged:P};Symbol.metadata??=Symbol("metadata"),S.litPropertyMetadata??=new WeakMap;let T=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=N){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(e,i,t);void 0!==s&&$(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){const{get:s,set:o}=w(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:s,set(t){const r=s?.call(this);o?.call(this,t),this.requestUpdate(e,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??N}static _$Ei(){if(this.hasOwnProperty(C("elementProperties")))return;const e=A(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(C("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(C("properties"))){const e=this.properties,t=[...x(e),...k(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(b(e))}else void 0!==e&&t.push(b(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,t)=>{if(g)e.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of t){const t=document.createElement("style"),s=p.litNonce;void 0!==s&&t.setAttribute("nonce",s),t.textContent=i.cssText,e.appendChild(t)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(void 0!==s&&!0===i.reflect){const o=(void 0!==i.converter?.toAttribute?i.converter:z).toAttribute(t,i.type);this._$Em=e,null==o?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(e,t){const i=this.constructor,s=i._$Eh.get(e);if(void 0!==s&&this._$Em!==s){const e=i.getPropertyOptions(s),o="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:z;this._$Em=s;const r=o.fromAttribute(t,e.type);this[s]=r??this._$Ej?.get(s)??r,this._$Em=null}}requestUpdate(e,t,i,s=!1,o){if(void 0!==e){const r=this.constructor;if(!1===s&&(o=this[e]),i??=r.getPropertyOptions(e),!((i.hasChanged??P)(o,t)||i.useDefault&&i.reflect&&o===this._$Ej?.get(e)&&!this.hasAttribute(r._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:s,wrapped:o},r){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,r??t??this[e]),!0!==o||void 0!==r)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===s&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,s=this[t];!0!==e||this._$AL.has(t)||void 0===s||this.C(t,void 0,i,s)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};T.elementStyles=[],T.shadowRootOptions={mode:"open"},T[C("elementProperties")]=new Map,T[C("finalized")]=new Map,D?.({ReactiveElement:T}),(S.reactiveElementVersions??=[]).push("2.1.2");const W=globalThis,j=e=>e,O=W.trustedTypes,R=O?O.createPolicy("lit-html",{createHTML:e=>e}):void 0,U="$lit$",H=`lit$${Math.random().toFixed(9).slice(2)}$`,G="?"+H,I=`<${G}>`,F=document,L=()=>F.createComment(""),Z=e=>null===e||"object"!=typeof e&&"function"!=typeof e,B=Array.isArray,q="[ \t\n\f\r]",K=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,V=/-->/g,Y=/>/g,J=RegExp(`>|${q}(?:([^\\s"'>=/]+)(${q}*=${q}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),X=/'/g,Q=/"/g,ee=/^(?:script|style|textarea|title)$/i,te=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),ie=te(1),se=te(2),oe=Symbol.for("lit-noChange"),re=Symbol.for("lit-nothing"),ae=new WeakMap,ne=F.createTreeWalker(F,129);function le(e,t){if(!B(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==R?R.createHTML(t):t}const de=(e,t)=>{const i=e.length-1,s=[];let o,r=2===t?"<svg>":3===t?"<math>":"",a=K;for(let t=0;t<i;t++){const i=e[t];let n,l,d=-1,c=0;for(;c<i.length&&(a.lastIndex=c,l=a.exec(i),null!==l);)c=a.lastIndex,a===K?"!--"===l[1]?a=V:void 0!==l[1]?a=Y:void 0!==l[2]?(ee.test(l[2])&&(o=RegExp("</"+l[2],"g")),a=J):void 0!==l[3]&&(a=J):a===J?">"===l[0]?(a=o??K,d=-1):void 0===l[1]?d=-2:(d=a.lastIndex-l[2].length,n=l[1],a=void 0===l[3]?J:'"'===l[3]?Q:X):a===Q||a===X?a=J:a===V||a===Y?a=K:(a=J,o=void 0);const h=a===J&&e[t+1].startsWith("/>")?" ":"";r+=a===K?i+I:d>=0?(s.push(n),i.slice(0,d)+U+i.slice(d)+H+h):i+H+(-2===d?t:h)}return[le(e,r+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),s]};class ce{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let o=0,r=0;const a=e.length-1,n=this.parts,[l,d]=de(e,t);if(this.el=ce.createElement(l,i),ne.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(s=ne.nextNode())&&n.length<a;){if(1===s.nodeType){if(s.hasAttributes())for(const e of s.getAttributeNames())if(e.endsWith(U)){const t=d[r++],i=s.getAttribute(e).split(H),a=/([.?@])?(.*)/.exec(t);n.push({type:1,index:o,name:a[2],strings:i,ctor:"."===a[1]?me:"?"===a[1]?_e:"@"===a[1]?fe:ge}),s.removeAttribute(e)}else e.startsWith(H)&&(n.push({type:6,index:o}),s.removeAttribute(e));if(ee.test(s.tagName)){const e=s.textContent.split(H),t=e.length-1;if(t>0){s.textContent=O?O.emptyScript:"";for(let i=0;i<t;i++)s.append(e[i],L()),ne.nextNode(),n.push({type:2,index:++o});s.append(e[t],L())}}}else if(8===s.nodeType)if(s.data===G)n.push({type:2,index:o});else{let e=-1;for(;-1!==(e=s.data.indexOf(H,e+1));)n.push({type:7,index:o}),e+=H.length-1}o++}}static createElement(e,t){const i=F.createElement("template");return i.innerHTML=e,i}}function he(e,t,i=e,s){if(t===oe)return t;let o=void 0!==s?i._$Co?.[s]:i._$Cl;const r=Z(t)?void 0:t._$litDirective$;return o?.constructor!==r&&(o?._$AO?.(!1),void 0===r?o=void 0:(o=new r(e),o._$AT(e,i,s)),void 0!==s?(i._$Co??=[])[s]=o:i._$Cl=o),void 0!==o&&(t=he(e,o._$AS(e,t.values),o,s)),t}class ue{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,s=(e?.creationScope??F).importNode(t,!0);ne.currentNode=s;let o=ne.nextNode(),r=0,a=0,n=i[0];for(;void 0!==n;){if(r===n.index){let t;2===n.type?t=new pe(o,o.nextSibling,this,e):1===n.type?t=new n.ctor(o,n.name,n.strings,this,e):6===n.type&&(t=new ye(o,this,e)),this._$AV.push(t),n=i[++a]}r!==n?.index&&(o=ne.nextNode(),r++)}return ne.currentNode=F,s}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class pe{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,s){this.type=2,this._$AH=re,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=he(this,e,t),Z(e)?e===re||null==e||""===e?(this._$AH!==re&&this._$AR(),this._$AH=re):e!==this._$AH&&e!==oe&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>B(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==re&&Z(this._$AH)?this._$AA.nextSibling.data=e:this.T(F.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,s="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=ce.createElement(le(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(t);else{const e=new ue(s,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=ae.get(e.strings);return void 0===t&&ae.set(e.strings,t=new ce(e)),t}k(e){B(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,s=0;for(const o of e)s===t.length?t.push(i=new pe(this.O(L()),this.O(L()),this,this.options)):i=t[s],i._$AI(o),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=j(e).nextSibling;j(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class ge{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,s,o){this.type=1,this._$AH=re,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=o,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=re}_$AI(e,t=this,i,s){const o=this.strings;let r=!1;if(void 0===o)e=he(this,e,t,0),r=!Z(e)||e!==this._$AH&&e!==oe,r&&(this._$AH=e);else{const s=e;let a,n;for(e=o[0],a=0;a<o.length-1;a++)n=he(this,s[i+a],t,a),n===oe&&(n=this._$AH[a]),r||=!Z(n)||n!==this._$AH[a],n===re?e=re:e!==re&&(e+=(n??"")+o[a+1]),this._$AH[a]=n}r&&!s&&this.j(e)}j(e){e===re?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class me extends ge{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===re?void 0:e}}class _e extends ge{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==re)}}class fe extends ge{constructor(e,t,i,s,o){super(e,t,i,s,o),this.type=5}_$AI(e,t=this){if((e=he(this,e,t,0)??re)===oe)return;const i=this._$AH,s=e===re&&i!==re||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,o=e!==re&&(i===re||s);s&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ye{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){he(this,e)}}const be=W.litHtmlPolyfillSupport;be?.(ce,pe),(W.litHtmlVersions??=[]).push("3.3.3");const ve=globalThis;let $e=class extends T{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const s=i?.renderBefore??t;let o=s._$litPart$;if(void 0===o){const e=i?.renderBefore??null;s._$litPart$=o=new pe(t.insertBefore(L(),e),e,void 0,i??{})}return o._$AI(e),o})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return oe}};$e._$litElement$=!0,$e.finalized=!0,ve.litElementHydrateSupport?.({LitElement:$e});const we=ve.litElementPolyfillSupport;we?.({LitElement:$e}),(ve.litElementVersions??=[]).push("4.2.2");const xe=e=>(t,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},ke={attribute:!0,type:String,converter:z,reflect:!1,hasChanged:P},Ae=(e=ke,t,i)=>{const{kind:s,metadata:o}=i;let r=globalThis.litPropertyMetadata.get(o);if(void 0===r&&globalThis.litPropertyMetadata.set(o,r=new Map),"setter"===s&&((e=Object.create(e)).wrapped=!0),r.set(i.name,e),"accessor"===s){const{name:s}=i;return{set(i){const o=t.get.call(this);t.set.call(this,i),this.requestUpdate(s,o,e,!0,i)},init(t){return void 0!==t&&this.C(s,void 0,e,t),t}}}if("setter"===s){const{name:s}=i;return function(i){const o=this[s];t.call(this,i),this.requestUpdate(s,o,e,!0,i)}}throw Error("Unsupported decorator location: "+s)};function Se(e){return(t,i)=>"object"==typeof i?Ae(e,t,i):((e,t,i)=>{const s=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),s?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}function Ee(e){return Se({...e,state:!0,attribute:!1})}const Me=y`
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
`,De={number:["start_weight","target_weight","rate_per_week","manual_weight"],date:["start_date","end_date","manual_date"],button:["record_weight"],select:["active_goal"],sensor:["weight","target_weight_today","deviation","trend","weight_progress","time_progress","remaining","projected_date","status","last_measurement"]},Ce=new Map;for(const[e,t]of Object.entries(De))for(const i of t)Ce.set(i,e);const ze=[...Ce.keys()].sort((e,t)=>t.length-e.length),Pe=["status","weight","last_measurement"];function Ne(e){const t=e.indexOf(".");if(t<0)return;const i=e.slice(0,t),s=e.slice(t+1);for(const e of ze)if(Ce.get(e)===i&&(s===e||s.endsWith(`_${e}`)))return e}function Te(e,t,i){t&&!e[t]&&Ce.get(t)===i.slice(0,i.indexOf("."))&&(e[t]=i)}function We(e,t,i){const s=t?e.devices?.[t]:void 0;if(s){const e=s.name_by_user||s.name;if(e)return e}const o=i.status??i.weight,r=o?e.states?.[o]?.attributes?.friendly_name:void 0;if(!r)return n(e,"card.fallback_name");const a=r.lastIndexOf(" ");return a>0?r.slice(0,a):r}function je(t,i){const s=i.entity;let o=i.device_id;!o&&s&&(o=t.entities?.[s]?.device_id??void 0);let r,a=o?function(t,i){const s={};for(const o of Object.values(t.entities??{})){if(o.device_id!==i||o.platform!==e)continue;const t=o.translation_key??void 0;t&&Ce.has(t)?Te(s,t,o.entity_id):Te(s,Ne(o.entity_id),o.entity_id)}return s}(t,o):{};!Object.keys(a).length&&s&&(a=function(e,t){const i={},s=Ne(t);if(!s)return i;const o=t.slice(t.indexOf(".")+1),r=o.slice(0,o.length-s.length);for(const t of ze){const s=`${Ce.get(t)}.${r}${t}`;e.states?.[s]&&(i[t]=s)}return i}(t,s)),s&&Te(a,Ne(s),s);for(const[e,t]of Object.entries(i.entities??{}))t&&(a[e]=t);for(const e of Pe){const t=a[e];if(t){r=t;break}}return{entities:a,deviceId:o,name:i.name??We(t,o,a),target:r}}const Oe=new Map;function Re(t,i){const s="history"===i.source?i.weightEntity:i.target;if(!s)return Promise.resolve([]);const o=`${i.source}|${s}|${i.days??"all"}`,r=Oe.get(o);if(r&&r.stamp===i.stamp)return r.promise;const a="history"===i.source?async function(e,t,i){const s=new Date,o=new Date(s.getTime()-864e5*i),r=await e.connection.sendMessagePromise({type:"history/history_during_period",start_time:o.toISOString(),end_time:s.toISOString(),entity_ids:[t],minimal_response:!0,no_attributes:!0,significant_changes_only:!1}),a=r?.[t]??[],n=[];for(const e of a){const t=Number(e.s),i="number"==typeof e.lu?1e3*e.lu:NaN;Number.isFinite(t)&&Number.isFinite(i)&&n.push({t:i,v:t})}return n.sort((e,t)=>e.t-t.t)}(t,s,i.days??365):async function(t,i,s){const o=await t.callService(e,"get_measurements",s?{days:s}:{},{entity_id:i},!1,!0),r=o?.response??{},a=[];for(const e of Object.values(r.entries??{}))for(const t of e.measurements??[]){const e=Date.parse(t.timestamp),i=Number(t.weight);Number.isFinite(e)&&Number.isFinite(i)&&a.push({t:e,v:i,source:t.source})}return a.sort((e,t)=>e.t-t.t)}(t,s,i.days),n={key:o,stamp:i.stamp,promise:a};return Oe.set(o,n),a.catch(()=>{Oe.get(o)===n&&Oe.delete(o)}),window.setTimeout(()=>{Oe.get(o)===n&&Oe.delete(o)},3e5),a}const Ue=864e5;const He=864e5;function Ge(e,t){const i=new Intl.DateTimeFormat("en-US",{timeZone:t,hourCycle:"h23",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"}),s={};for(const t of i.formatToParts(new Date(e)))"literal"!==t.type&&(s[t.type]=Number(t.value));return Date.UTC(s.year,s.month-1,s.day,s.hour,s.minute,s.second)-1e3*Math.floor(e/1e3)}function Ie(e,t){const i=/^(\d{4})-(\d{2})-(\d{2})/.exec(e);if(!i)return null;const s=Date.UTC(Number(i[1]),Number(i[2])-1,Number(i[3]));let o=s-Ge(s,t);return o=s-Ge(o,t),o}function Fe(e){const t=new Intl.DateTimeFormat("en-US",{timeZone:e,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date),i=e=>t.find(t=>t.type===e)?.value??"";return`${i("year")}-${i("month")}-${i("day")}`}function Le(e,t,i,s,o){if(!(null!==e&&null!==t&&i&&s&&Number.isFinite(e)&&Number.isFinite(t)))return null;const r=Ie(i,o),a=Ie(function(e,t){const i=/^(\d{4})-(\d{2})-(\d{2})/.exec(e);return i?new Date(Date.UTC(Number(i[1]),Number(i[2])-1,Number(i[3]))+t*He).toISOString().slice(0,10):e}(s,1),o);return null===r||null===a||a-r<He?null:{startWeight:e,targetWeight:t,begin:r,finish:a}}function Ze(e,t){const i=e.finish-e.begin;if(i<=0)return e.targetWeight;const s=Math.min(1,Math.max(0,(t-e.begin)/i));return e.startWeight+(e.targetWeight-e.startWeight)*s}function Be(e){const t=e.targetWeight-e.startWeight;return t<-.01?"lose":t>.01?"gain":"maintain"}function qe(e,t){if(e&&t)return e.states?.[t]}function Ke(e){return!!e&&!o.has(e.state)}function Ve(e,t){const i=qe(e,t);if(!Ke(i))return null;const s=Number(i.state);return Number.isFinite(s)?s:null}function Ye(e,t){const i=qe(e,t);return Ke(i)?i.state:null}function Je(e,t){const i=Ye(e,t);if(!i)return null;const s=Date.parse(i);return Number.isFinite(s)?s:null}function Xe(e,t,i){const s=qe(e,t);return s?.attributes?.[i]}function Qe(e,t,i="kg"){return Xe(e,t,"unit_of_measurement")??i}function et(e){return e?.locale?.language||e?.language||"en"}function tt(e){const t=e.trim();return/^[+-]?(\d+([.,]\d*)?|[.,]\d+)$/.test(t)?Number(t.replace(",",".")):null}function it(e,t){return new Intl.NumberFormat(et(e),{maximumFractionDigits:3,useGrouping:!1}).format(t)}function st(e,t,i=1){return null!==t&&Number.isFinite(t)?new Intl.NumberFormat(et(e),{minimumFractionDigits:i,maximumFractionDigits:i}).format(t):"–"}function ot(e,t,i=!1){return null===t?"–":new Intl.DateTimeFormat(et(e),{day:"numeric",month:"short",...i?{year:"numeric"}:{},timeZone:e?.config?.time_zone}).format(new Date(t))}const rt=[["second",60],["minute",60],["hour",24],["day",7],["week",4.348],["month",12],["year",1/0]];function at(e){return!!e&&"unavailable"!==e.state}function nt(e,t){const i=t.entities,s=qe(e,i.status),o=Ye(e,i.status)??"no_goal",r=Ve(e,i.start_weight),a=Ve(e,i.target_weight),n=Ye(e,i.start_date),l=Ye(e,i.end_date),d=e.config?.time_zone??"UTC",c=Le(r,a,n,l,d),h=function(e,t){const i=Xe(e,t,"goals");if(!Array.isArray(i))return[];const s=[];for(const e of i){if(!e||"object"!=typeof e)continue;const t=e,i=t.result,o=lt(i?.weight),r="string"==typeof i?.timestamp?Date.parse(i.timestamp):NaN;s.push({id:String(t.id??""),name:String(t.name??""),active:!0===t.active,goalMode:"rate"===t.goal_mode?"rate":"target",startWeight:lt(t.start_weight),targetWeight:lt(t.target_weight),ratePerWeek:lt(t.rate_per_week),startDate:dt(t.start_date),endDate:dt(t.end_date),result:null!==o&&Number.isFinite(r)?{weight:o,timestamp:r,reached:!0===i?.reached}:null})}return s}(e,i.active_goal),u=[];for(const e of h){if(e.active)continue;const t=Le(e.startWeight,e.targetWeight,e.startDate,e.endDate,d);t&&u.push({summary:e,goal:t})}const p=Xe(e,i.status,"direction"),g=qe(e,i.manual_weight),m=Je(e,i.last_measurement);return{context:t,status:o,direction:p??(c?Be(c):null),tolerance:Xe(e,i.status,"tolerance")??.5,goalMode:Xe(e,i.status,"goal_mode")??null,trendWindowDays:Xe(e,i.status,"trend_window_days")??null,unit:Qe(e,i.weight??i.start_weight),currentWeight:Ve(e,i.weight),lastMeasurement:m,measurementSource:Xe(e,i.weight,"source")??null,startWeight:r,targetWeight:a,ratePerWeek:Ve(e,i.rate_per_week),startDate:n,endDate:l,plannedToday:Ve(e,i.target_weight_today),deviation:Ve(e,i.deviation),trend:Ve(e,i.trend),remaining:Ve(e,i.remaining),weightProgress:Ve(e,i.weight_progress),timeProgress:Ve(e,i.time_progress),projectedDate:Je(e,i.projected_date),manualWeight:Ve(e,i.manual_weight),manualDate:Ye(e,i.manual_date),manualPending:!0===Xe(e,i.manual_weight,"pending"),manualAvailable:at(g),recordAvailable:at(qe(e,i.record_weight)),goal:c,goals:h,otherGoals:u,stamp:[s?.state,m,r,a,n,l].join("|")}}function lt(e){const t="number"==typeof e?e:Number(e);return null!=e&&Number.isFinite(t)?t:null}function dt(e){return"string"==typeof e&&e?e:null}class ct extends $e{constructor(){super(...arguments),this._measurements=[],this._loading=!1,this._fetchError=null,this._tracked=[],this._signature="",this._requestedStamp=null}set hass(e){if(this._hass=e,!e||!this._config)return;var t;this._context=je(e,this._config),this._tracked=(t=this._context,Object.values(t.entities).filter(Boolean));const i=this._tracked.map(t=>{const i=e.states[t];return i?`${t}=${i.state}@${i.last_updated}`:`${t}=∅`}).join(",");i!==this._signature&&(this._signature=i,this._model=nt(e,this._context),this._maybeLoad())}get hass(){return this._hass}setConfig(e){if(!e.entity&&!e.device_id&&!e.entities)throw new Error("Set `entity` to one entity of a Road to Weight Goal device, for example sensor.<name>_status.");this._config=e,this._signature="",this._requestedStamp=null,this._hass&&(this.hass=this._hass)}async _maybeLoad(){const e=this._hass,t=this._model;if(!e||!t||!this.needsMeasurements())return;const i=this.chartOptions(),s=function(e,t,i,s){const o=e??"goal";if("number"==typeof o)return Math.ceil(o)+1;if("all"===o)return 3650;if(!i)return 365;const r=Math.max(7,Math.ceil(t??0)),a=Math.ceil((s-i.begin)/Ue)+r;return a>0?Math.min(3650,Math.max(30,a)):365}(i.range,i.average,t.goal,Date.now()),o=`${t.stamp}|${i.source??"measurements"}|${s??"all"}`;if(o!==this._requestedStamp){this._requestedStamp=o,this._loading=!0;try{const r=await Re(e,{source:"history"===i.source?"history":"measurements",days:s,target:t.context.target,weightEntity:t.context.entities.weight,stamp:t.stamp});this._requestedStamp===o&&(this._measurements=r,this._fetchError=null)}catch(t){this._requestedStamp===o&&(this._fetchError=t&&"object"==typeof t&&"message"in t?String(t.message):n(e,"card.load_failed"),this._requestedStamp=null)}finally{(this._requestedStamp===o||this._fetchError)&&(this._loading=!1)}}}shouldUpdate(e){return e.has("_config")||e.has("_model")||e.has("_measurements")||e.has("_loading")||e.has("_fetchError")}renderProblem(e){return ie`
      <ha-card>
        <div class="problem" role="alert">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
          <span>${e}</span>
        </div>
      </ha-card>
    `}missingGoalMessage(){const e=this._config,t=this._hass;if(!e||!t)return null;const i=this._context;return i&&Object.keys(i.entities).length?i.target?null:n(t,"card.no_target"):n(t,"card.no_entities",{anchor:e.entity??e.device_id??"?"})}}u([Ee()],ct.prototype,"_config",void 0),u([Ee()],ct.prototype,"_model",void 0),u([Ee()],ct.prototype,"_measurements",void 0),u([Ee()],ct.prototype,"_loading",void 0),u([Ee()],ct.prototype,"_fetchError",void 0),u([Se({attribute:!1})],ct.prototype,"hass",null);let ht=class extends $e{constructor(){super(...arguments),this.showRecord=!0,this.showRecordDate=!0,this._draft=null,this._dayDraft=null,this._error=null,this._busy=!1,this._onInput=e=>{this._draft=e.target.value,this._error=null},this._onDayInput=e=>{this._dayDraft=e.target.value,this._error=null},this._onKeydown=e=>{"Enter"===e.key&&this.model&&(e.preventDefault(),this._save(this.model))}}render(){const e=this.model;if(!e||!this.hass)return re;const t=d(this.hass),i=e.context.entities,s=this.showRecord&&e.manualAvailable&&!!i.manual_weight;if(!s)return re;const o=this._draft??(null===e.manualWeight?"":it(this.hass,e.manualWeight)),r=Fe(this.hass.config?.time_zone),a=this._day(e,r);return ie`
      ${this._error?ie`<div class="error" role="alert">
            <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
            <span>${this._error}</span>
          </div>`:re}

      <div class="actions">
        ${s?ie`
              ${this.showRecordDate?ie`<input
                    class="day ${this.hass.themes?.darkMode?"dark":""}"
                    type="date"
                    max=${r}
                    .value=${a}
                    aria-label=${t("actions.date_input")}
                    ?disabled=${this._busy}
                    @input=${this._onDayInput}
                    @keydown=${this._onKeydown}
                  />`:re}
              <input
                class="weight"
                type="text"
                inputmode="decimal"
                autocomplete="off"
                .value=${o}
                aria-label=${t("actions.weight_input",{unit:e.unit})}
                placeholder=${e.unit}
                ?disabled=${this._busy}
                @input=${this._onInput}
                @keydown=${this._onKeydown}
              />
              <button
                class="control primary"
                ?disabled=${this._busy||!this._hasDraft(e)}
                @click=${()=>this._save(e)}
              >
                <ha-icon icon="mdi:check"></ha-icon>
                <span>${t("actions.save")}</span>
              </button>
            `:re}
      </div>
    `}_day(e,t){return this.showRecordDate?this._dayDraft??e.manualDate??t:t}_hasDraft(e){return null!==this._draft?null!==tt(this._draft):e.manualPending}async _save(e){const t=e.context.target;if(!this.hass||!t)return;const i=tt(this._draft??String(e.manualWeight??""));if(null===i)return void(this._error=n(this.hass,"actions.enter_number"));const s=Fe(this.hass.config?.time_zone),o=this._day(e,s)||s;if(o>s)this._error=n(this.hass,"actions.future_date");else{this._busy=!0,this._error=null;try{await this.hass.callService("weight_goal","record_weight",o===s?{weight:i}:{weight:i,timestamp:`${o}T12:00:00`},{entity_id:t}),this._draft=null,this._dayDraft=s}catch(e){this._error=ut(this.hass,e)}finally{this._busy=!1}}}};function ut(e,t){if(t&&"object"==typeof t&&"message"in t){const e=String(t.message);if(e)return e}return n(e,"actions.failed")}ht.styles=[Me,y`
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
    `],u([Se({attribute:!1})],ht.prototype,"hass",void 0),u([Se({attribute:!1})],ht.prototype,"model",void 0),u([Se({type:Boolean})],ht.prototype,"showRecord",void 0),u([Se({type:Boolean})],ht.prototype,"showRecordDate",void 0),u([Ee()],ht.prototype,"_draft",void 0),u([Ee()],ht.prototype,"_dayDraft",void 0),u([Ee()],ht.prototype,"_error",void 0),u([Ee()],ht.prototype,"_busy",void 0),ht=u([xe("wg-actions")],ht);const pt={last_measurement:{key:"last_measurement",icon:"mdi:clock-outline",relative:!0},projected_date:{key:"projected_date",icon:"mdi:calendar-clock",relative:!0},trend:{key:"trend",icon:"mdi:chart-line-variant",signed:!0},deviation:{key:"deviation",icon:"mdi:plus-minus-variant",signed:!0},remaining:{key:"remaining",icon:"mdi:flag-checkered"},target_weight_today:{key:"target_weight_today",icon:"mdi:target"},weight_progress:{key:"weight_progress",icon:"mdi:scale-balance"},time_progress:{key:"time_progress",icon:"mdi:calendar-range"},start_weight:{key:"start_weight",icon:"mdi:ray-start"},target_weight:{key:"target_weight",icon:"mdi:ray-end"},rate_per_week:{key:"rate_per_week",icon:"mdi:speedometer"},start_date:{key:"start_date",icon:"mdi:calendar-start"},end_date:{key:"end_date",icon:"mdi:calendar-end"}},gt=[...Object.keys(pt),"source"],mt=["last_measurement","trend","remaining","projected_date"],_t={manual:"mdi:pencil-outline",sensor:"mdi:scale-bathroom",service:"mdi:cog-outline",import:"mdi:database-import-outline",statistics:"mdi:chart-bell-curve-cumulative"};function ft(e,t){const i=t.measurementSource;if(!i)return null;const s=_t[i]?n(e,`badge.source.${i}`):i;return{key:"source",icon:_t[i]??"mdi:help-circle-outline",text:s,label:s,entityId:t.context.entities.weight}}function yt(e,t,i){const s=pt[i],o=t.context.entities[s.key],r=qe(e,o);if(!o||!Ke(r))return null;let a;if(s.relative){const t=Date.parse(r.state);if(!Number.isFinite(t))return null;a=function(e,t){if(null===t)return"–";const i=new Intl.RelativeTimeFormat(et(e),{numeric:"auto"});let s=(t-Date.now())/1e3;for(const[e,t]of rt){if(Math.abs(s)<t||t===1/0)return i.format(Math.round(s),e);s/=t}return i.format(Math.round(s),"year")}(e,t)}else if(s.signed){const t=Number(r.state);if(!Number.isFinite(t))return null;const i=r.attributes.unit_of_measurement??"";a=`${function(e,t,i=1){return null!==t&&Number.isFinite(t)?new Intl.NumberFormat(et(e),{minimumFractionDigits:i,maximumFractionDigits:i,signDisplay:"exceptZero"}).format(t):"–"}(e,t,1)}${i?` ${i}`:""}`}else a=h(e,r);return{key:i,icon:s.icon,text:a,label:c(e,o,t.context.name),entityId:o}}function bt(e,t,i){const s=qe(e,i.entity);return Ke(s)?{key:i.entity,icon:i.icon??s.attributes.icon??"mdi:information-outline",text:h(e,s),label:i.name??c(e,i.entity,t.context.name),entityId:i.entity}:null}let vt=class extends $e{render(){const e=this.model;if(!e||!this.hass)return re;const t=d(this.hass),i=function(e,t,i){const s=i??mt,o=[];for(const i of s){if("object"==typeof i&&i?.entity){const s=bt(e,t,i);s&&o.push(s);continue}if("source"===i){const i=ft(e,t);i&&o.push(i);continue}if("string"==typeof i&&i in pt){const s=yt(e,t,i);s&&o.push(s)}}return o}(this.hass,e,this.badges);return 0===i.length?null===e.currentWeight?ie`<div class="chips">
            <span class="chip">
              <ha-icon icon="mdi:scale-bathroom"></ha-icon>
              ${t("badges.no_reading")}
            </span>
          </div>`:re:ie`<div class="chips">
      ${i.map(e=>this._renderBadge(e))}
    </div>`}_renderBadge(e){const t=e.label?`${e.label}: ${e.text}`:e.text;return ie`<button
      class="chip"
      title=${e.label}
      aria-label=${t}
      ?disabled=${!e.entityId}
      @click=${()=>this._more(e.entityId)}
    >
      <ha-icon icon=${e.icon}></ha-icon>
      <span>${e.text}</span>
    </button>`}_more(e){e&&this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:e},bubbles:!0,composed:!0}))}};vt.styles=[Me,y`
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
    `],u([Se({attribute:!1})],vt.prototype,"hass",void 0),u([Se({attribute:!1})],vt.prototype,"model",void 0),u([Se({attribute:!1})],vt.prototype,"badges",void 0),vt=u([xe("wg-badges")],vt);const $t=1;class wt{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}const xt=(e=>(...t)=>({_$litDirective$:e,values:t}))(class extends wt{constructor(e){if(super(e),e.type!==$t||"class"!==e.name||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter(t=>e[t]).join(" ")+" "}update(e,[t]){if(void 0===this.st){this.st=new Set,void 0!==e.strings&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter(e=>""!==e)));for(const e in t)t[e]&&!this.nt?.has(e)&&this.st.add(e);return this.render(t)}const i=e.element.classList;for(const e of this.st)e in t||(i.remove(e),this.st.delete(e));for(const e in t){const s=!!t[e];s===this.st.has(e)||this.nt?.has(e)||(s?(i.add(e),this.st.add(e)):(i.remove(e),this.st.delete(e)))}return oe}});function kt(e){return Math.round(100*e)/100}function At(e){return e.map((e,t)=>`${0===t?"M":"L"}${kt(e.x)},${kt(e.y)}`).join(" ")}function St(e,t){return 0===e.length?"":1===e.length?`M${kt(e[0].x)},${kt(e[0].y)}`:"step"===t?function(e){const t=[`M${kt(e[0].x)},${kt(e[0].y)}`];for(let i=1;i<e.length;i++)t.push(`H${kt(e[i].x)}`,`V${kt(e[i].y)}`);return t.join(" ")}(e):"smooth"===t?function(e){if(e.length<3)return At(e);const t=[`M${kt(e[0].x)},${kt(e[0].y)}`];for(let i=0;i<e.length-1;i++){const s=e[0===i?0:i-1],o=e[i],r=e[i+1],a=e[i+2>=e.length?e.length-1:i+2],n=Math.min(o.y,r.y),l=Math.max(o.y,r.y),d=e=>Math.min(l,Math.max(n,e)),c=o.x+(r.x-s.x)/6,h=d(o.y+(r.y-s.y)/6),u=r.x-(a.x-o.x)/6,p=d(r.y-(a.y-o.y)/6);t.push(`C${kt(c)},${kt(h)} ${kt(u)},${kt(p)} ${kt(r.x)},${kt(r.y)}`)}return t.join(" ")}(e):At(e)}function Et(e){if(!Number.isFinite(e)||e<=0)return 1;const t=10**Math.floor(Math.log10(e)),i=e/t;return(i>5?10:i>2?5:i>1?2:1)*t}function Mt(e){return Number(e.toFixed(6))}function Dt(e,t={}){const i=e.filter(e=>Number.isFinite(e));let s=i.length?Math.min(...i):0,o=i.length?Math.max(...i):1;if(o-s<1e-9){const e=Math.max(.02*Math.abs(o),.5);s-=e,o+=e}const r=Math.max(1,t.ticks??4);if("tight"!==t.mode){const e=Et((o-s)/r);s=Math.floor(s/e)*e,o=Math.ceil(o/e)*e}"number"==typeof t.min&&Number.isFinite(t.min)&&(s=t.min),"number"==typeof t.max&&Number.isFinite(t.max)&&(o=t.max),o<=s&&(o=s+Math.max(Et(.02*Math.abs(s)),1)),s=Mt(s),o=Mt(o);const a=Et((o-s)/r),n=a>=1?0:a>=.1?1:2,l=[s],d=.4*a;for(let e=Math.ceil((s+d)/a)*a;e<o-d;e+=a){const t=Mt(e);t>s&&t<o&&l.push(t)}o>s&&l.push(o);const c=l.map(e=>function(e,t){for(let i=t;i<2;i++)if(Math.abs(Number(e.toFixed(i))-e)<1e-6)return i;return 2}(e,n));return{min:s,max:o,step:a,ticks:l,decimals:c}}const Ct={weight:{color:"auto",width:2,dash:"",opacity:1,point_size:3},average:{color:"var(--primary-color, #03a9f4)",width:2.5,dash:"",opacity:1,point_size:0},plan:{color:"var(--secondary-text-color, #727272)",width:2,dash:"6 4",opacity:1,point_size:0},band:{color:"var(--primary-color, #03a9f4)",width:0,dash:"",opacity:.1,point_size:0},projection:{color:"var(--disabled-text-color, #9e9e9e)",width:2,dash:"2 6",opacity:1,point_size:0},goals:{color:"var(--secondary-text-color, #727272)",width:1.5,dash:"",opacity:.45,point_size:0}};function zt(e,t){return null!==e&&t>=e.begin&&t<=e.finish}let Pt=class extends $e{constructor(){super(...arguments),this.measurements=[],this.options={},this.loading=!1,this._width=0,this._hover=null,this._id=Math.random().toString(36).slice(2,9),this._clearHover=()=>{this._hover=null}}connectedCallback(){super.connectedCallback(),this._observer=new ResizeObserver(e=>{const t=Math.round(e[0]?.contentRect.width??0);t&&t!==this._width&&(this._width=t)}),this._observer.observe(this)}disconnectedCallback(){this._observer?.disconnect(),this._observer=void 0,super.disconnectedCallback()}get _height(){return this.options.height??190}_style(e){const t=(this.options.styles??{})[e];return{...Ct[e],...t??{}}}_colour(e){const t=this._style(e).color;return"auto"!==t?t:i[this.model?.status??"no_goal"]??i.on_track}_shown(e,t){const i=this.options.show?.[e];return void 0===i?t:i}_window(e){return function(e,t,i,s){const o=e??"goal";if("goal"===o&&t){const e=i[i.length-1]?.t??s;return{from:t.begin,to:Math.max(t.finish,e,s)}}if("number"==typeof o&&o>0)return{from:s-o*Ue,to:s};const r=i[0]?.t??s-2592e6,a=Math.max(i[i.length-1]?.t??s,s);return{from:r,to:a>r?a:r+Ue}}(this.options.range,this.model?.goal,e,Date.now())}_renderEmpty(e){return ie`<div class="empty" style=${`height:${this._height}px`}>
      <ha-icon icon="mdi:chart-line"></ha-icon>
      <span>${e}</span>
    </div>`}render(){const e=this.model;if(!e||!this.hass)return re;const t=this._width;if(!t)return ie`<div class="empty" style=${`height:${this._height}px`}></div>`;const i=this.measurements.filter(e=>Number.isFinite(e.t)&&Number.isFinite(e.v)).slice().sort((e,t)=>e.t-t.t);if(!i.length&&!e.goal)return this._renderEmpty(n(this.hass,this.loading?"chart.loading":"chart.empty"));const{from:s,to:o}=this._window(i),r=i.filter(e=>e.t>=s&&e.t<=o),a=this.options.average??0,l=a>0?function(e,t){if(t<=0||0===e.length)return[];const i=864e5*t,s=[];let o=0,r=0;for(let t=0;t<e.length;t++){for(r+=e[t].v;e[t].t-e[o].t>i;)r-=e[o].v,o+=1;s.push({t:e[t].t,v:r/(t-o+1)})}return s}(i,a).filter(e=>e.t>=s&&e.t<=o):[],d=this._height,c=this._shown("axis",!0),h=c?22:8,u=this._verticalScale(e,r,l,s,o),p=c?this._axisWidth(u):6,g=Math.max(10,t-p-8),m=Math.max(10,d-10-h),_=e=>p+(e-s)/Math.max(1,o-s)*g,f=e=>10+m-(e-u.min)/Math.max(1e-9,u.max-u.min)*m,y=this.options.line??"smooth",b=e=>e.map(e=>({x:_(e.t),y:f(e.v)})),v=`wg-plot-${this._id}`;return ie`
      <div class="wrap" @pointerleave=${this._clearHover}>
        <svg
          viewBox="0 0 ${t} ${d}"
          width=${t}
          height=${d}
          role="img"
          aria-label=${this._summary(e,r)}
          @pointermove=${e=>this._onPointer(e,r,s,o,p,g)}
          @pointerdown=${e=>this._onPointer(e,r,s,o,p,g)}
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
          ${this._renderGrid(u,p,8,t,f,c)}
          <g clip-path=${`url(#${v})`}>
            ${this._renderOtherGoals(e,s,o,_,f)}
            ${this._renderBand(e,s,o,_,f)}
            ${this._renderPlan(e,s,o,_,f)}
            ${this._renderProjection(e,r,_,f)}
            ${this._renderSeries(b(r),b(l),y)}
            ${this._renderPoints(r,_,f,e)}
            ${this._renderGoalLabels(e,s,o,_,f)}
          </g>
          ${this._renderToday(s,o,_,10,m)}
          ${c?this._renderTimeAxis(s,o,_,d):re}
          ${this._renderCursor(r,_,f,10,m)}
        </svg>
        ${this._renderTooltip(r,e)}
        <table class="sr-only">
          <caption>${n(this.hass,"chart.readings")}</caption>
          <tbody>
            ${r.slice(-12).map(t=>ie`<tr>
                <td>${ot(this.hass,t.t,!0)}</td>
                <td>${st(this.hass,t.v,1)} ${e.unit}</td>
              </tr>`)}
          </tbody>
        </table>
      </div>
    `}_axisWidth(e){const t=Math.max(...e.ticks.map((t,i)=>st(this.hass,t,e.decimals[i]).length),2);return 14+7*t}_verticalScale(e,t,i,s,o){const r=this.options.y_axis??{},a=[];for(const e of t)a.push(e.v);for(const e of i)a.push(e.v);if(e.goal&&!1!==r.include_goal){const t=this._shown("band",!0)?e.tolerance:0;for(const i of this._planPoints(e.goal,s,o))a.push(i.v+t,i.v-t)}return a.length||a.push(e.currentWeight??75),Dt(a,{min:r.min,max:r.max,mode:"tight"===r.mode?"tight":"nice",ticks:r.ticks??4})}_renderGrid(e,t,i,s,o,r){if(!this._shown("grid",!0))return re;const a=e.ticks.map((a,n)=>{const l=o(a);return se`
        <line class="grid" x1=${t} x2=${s-i}
              y1=${l} y2=${l}></line>
        ${r?se`<text class="axis" x=${t-6} y=${l+3}
                        text-anchor="end">${st(this.hass,a,e.decimals[n])}</text>`:re}
      `});return se`<g>${a}</g>`}_renderBand(e,t,i,s,o){if(!e.goal||!this._shown("band",!0)||e.tolerance<=0)return re;const r=this._style("band"),a=this._planPoints(e.goal,t,i),n=a.map(t=>({x:s(t.t),y:o(t.v+e.tolerance)})),l=a.map(t=>({x:s(t.t),y:o(t.v-e.tolerance)})),d=function(e,t){if(e.length<2||t.length<2)return"";const i=At(e),s=t.slice().reverse().map(e=>`L${kt(e.x)},${kt(e.y)}`).join(" ");return`${i} ${s} Z`}(n,l);return d?se`<path d=${d} fill=${this._colour("band")}
                     fill-opacity=${r.opacity} stroke="none"></path>`:re}_planPoints(e,t,i){const s=Math.max(t,e.begin),o=Math.min(i,e.finish);return o<=s?[]:[s,o].map(t=>({t,v:Ze(e,t)}))}_renderOtherGoals(e,t,i,s,o){if(!this._shown("goals",!0)||!e.otherGoals.length)return re;const r=this._style("goals"),a=this._colour("goals"),n=e.otherGoals.map(({summary:e,goal:n})=>{const l=this._planPoints(n,t,i);if(l.length<2)return re;const d=l[l.length-1],c=d.t===n.finish,h=l.map(e=>({x:s(e.t),y:o(e.v)}));return se`
        <path d=${St(h,"linear")} fill="none" stroke=${a}
              stroke-width=${r.width} stroke-dasharray=${r.dash||re}
              stroke-opacity=${r.opacity} stroke-linecap="round"
              data-goal=${e.name}></path>
        ${c?se`<circle cx=${s(d.t)} cy=${o(d.v)} r="2.5" fill=${a}
                          fill-opacity=${r.opacity}></circle>`:re}
      `});return se`<g>${n}</g>`}_renderGoalLabels(e,t,i,s,o){if(!this._shown("goals",!0)||!e.otherGoals.length)return re;const r=e.otherGoals.map(({summary:e,goal:r})=>{const a=this._planPoints(r,t,i);if(a.length<2)return re;const n=a[a.length-1];return se`<text class="goal-label" x=${s(n.t)-4} y=${o(n.v)-6}
                       text-anchor="end">${e.name}</text>`});return se`<g>${r}</g>`}_renderPlan(e,t,i,s,o){if(!e.goal||!this._shown("plan",!0))return re;const r=this._style("plan"),a=this._planPoints(e.goal,t,i).map(e=>({x:s(e.t),y:o(e.v)}));return a.length<2?re:se`
      <path d=${St(a,"linear")} fill="none"
            stroke=${this._colour("plan")} stroke-width=${r.width}
            stroke-dasharray=${r.dash||re}
            stroke-opacity=${r.opacity}
            stroke-linecap="round"></path>
      <circle cx=${s(e.goal.finish)} cy=${o(e.goal.targetWeight)}
              r="3.5" fill=${this._colour("plan")}></circle>
    `}_renderProjection(e,t,i,s){if(!this._shown("projection",!0)||!e.goal||null===e.projectedDate||!t.length)return re;const o=this._style("projection"),r=t[t.length-1],a=St([{x:i(r.t),y:s(r.v)},{x:i(e.projectedDate),y:s(e.goal.targetWeight)}],"linear");return se`<path d=${a} fill="none" stroke=${this._colour("projection")}
                     stroke-width=${o.width}
                     stroke-dasharray=${o.dash||re}
                     stroke-linecap="round"></path>`}_renderSeries(e,t,i){const s=this._style("weight"),o=this._style("average"),r=this._shown("average",!0)&&t.length>1;return se`
      <path d=${St(e,i)} fill="none"
            stroke=${this._colour("weight")}
            stroke-width=${s.width}
            stroke-dasharray=${s.dash||re}
            stroke-opacity=${r?.45*s.opacity:s.opacity}
            stroke-linecap="round" stroke-linejoin="round"></path>
      ${r?se`<path d=${St(t,i)} fill="none"
                      stroke=${this._colour("average")}
                      stroke-width=${o.width}
                      stroke-dasharray=${o.dash||re}
                      stroke-opacity=${o.opacity}
                      stroke-linecap="round" stroke-linejoin="round"></path>`:re}
    `}_renderPoints(e,t,i,s){const o=this._style("weight");if(!this._shown("points",!0)||o.point_size<=0)return re;const r=Math.ceil(e.length/120),a=this._colour("weight"),n=e.filter((t,i)=>i%r===0||i===e.length-1).map(e=>{const r=zt(s.goal,e.t)&&Math.abs(e.v-Ze(s.goal,e.t))>s.tolerance;return se`<circle cx=${t(e.t)} cy=${i(e.v)} r=${o.point_size}
                           fill=${r?"var(--card-background-color, #fff)":a}
                           stroke=${a} stroke-width="1.5"></circle>`});return se`<g>${n}</g>`}_renderToday(e,t,i,s,o){const r=Date.now();return!this._shown("today",!0)||r<e||r>t?re:se`<line class="today" x1=${i(r)} x2=${i(r)}
                     y1=${s} y2=${s+o}></line>`}_renderTimeAxis(e,t,i,s){const o=this._width<260?2:this._width<420?3:5,r=[];for(let a=0;a<=o;a++){const n=e+(t-e)*a/o,l=0===a?"start":a===o?"end":"middle";r.push(se`<text class="axis" x=${i(n)} y=${s-6}
                  text-anchor=${l}>${ot(this.hass,n)}</text>`)}return se`<g>${r}</g>`}_renderCursor(e,t,i,s,o){if(null===this._hover||!e[this._hover])return re;const r=e[this._hover];return se`
      <line class="cursor" x1=${t(r.t)} x2=${t(r.t)}
            y1=${s} y2=${s+o}></line>
      <circle cx=${t(r.t)} cy=${i(r.v)} r="5" fill="none"
              stroke=${this._colour("weight")} stroke-width="2"></circle>
    `}_renderTooltip(e,t){if(null===this._hover||!e[this._hover])return re;const i=e[this._hover],s=zt(t.goal,i.t)?Ze(t.goal,i.t):null,o=null===s?null:i.v-s;return ie`<div
      class=${xt({tooltip:!0,right:this._hover>e.length/2})}
      role="status"
    >
      <strong>${st(this.hass,i.v,1)} ${t.unit}</strong>
      <span>${ot(this.hass,i.t,!0)}</span>
      ${null===o?re:ie`<span
            >${n(this.hass,"chart.vs_plan",{value:`${o>0?"+":""}${st(this.hass,o,1)}`,unit:t.unit})}</span
          >`}
    </div>`}_onPointer(e,t,i,s,o,r){if(!t.length)return;const a=e.currentTarget.getBoundingClientRect(),n=(e.clientX-a.left-o)/Math.max(1,r),l=function(e,t){if(0===e.length)return-1;let i=0,s=1/0;for(let o=0;o<e.length;o++){const r=Math.abs(e[o].t-t);r<s&&(s=r,i=o)}return i}(t,i+Math.min(1,Math.max(0,n))*(s-i));l!==this._hover&&(this._hover=l)}_summary(e,t){const i=d(this.hass),s=e.unit,o=[i("chart.summary_readings",{count:t.length}),null===e.currentWeight?i("chart.summary_no_weight"):i("chart.summary_current",{value:st(this.hass,e.currentWeight,1),unit:s})];return null!==e.deviation&&o.push(i(e.deviation>=0?"chart.summary_above":"chart.summary_below",{value:st(this.hass,Math.abs(e.deviation),1),unit:s})),e.goal&&o.push(i("chart.summary_plan",{start:st(this.hass,e.goal.startWeight,1),target:st(this.hass,e.goal.targetWeight,1),unit:s})),o.join(", ")}};Pt.styles=y`
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
  `,u([Se({attribute:!1})],Pt.prototype,"hass",void 0),u([Se({attribute:!1})],Pt.prototype,"model",void 0),u([Se({attribute:!1})],Pt.prototype,"measurements",void 0),u([Se({attribute:!1})],Pt.prototype,"options",void 0),u([Se({type:Boolean})],Pt.prototype,"loading",void 0),u([Ee()],Pt.prototype,"_width",void 0),u([Ee()],Pt.prototype,"_hover",void 0),Pt=u([xe("wg-chart")],Pt);let Nt=class extends $e{constructor(){super(...arguments),this.open=!1,this._error=null}render(){const e=this.model;if(!e||!this.hass)return re;const t=e.context.entities,i=e.goalMode,s=e.goals.find(e=>e.active);return t.active_goal&&!s?ie`
        <details ?open=${this.open}>
          <summary>
            <ha-icon icon="mdi:target"></ha-icon>
            <span>${n(this.hass,"goal.title")}</span>
          </summary>
          <p class="hint muted">${n(this.hass,"goal.none")}</p>
        </details>
      `:ie`
      <details ?open=${this.open}>
        <summary>
          <ha-icon icon="mdi:target"></ha-icon>
          <span>${n(this.hass,"goal.title")}</span>
          ${s?ie`<span class="muted">${s.name}</span>`:re}
        </summary>
        <div class="grid">
          ${this._numberRow(t.start_weight,e.unit,!1)}
          ${this._numberRow(t.target_weight,e.unit,"rate"===i)}
          ${this._numberRow(t.rate_per_week,`${e.unit}/w`,"target"===i)}
          ${this._dateRow(t.start_date)}
          ${this._dateRow(t.end_date)}
        </div>
        ${null===i?re:ie`<p id="derived" class="hint muted">
              ${n(this.hass,"goal.derived_hint")}
            </p>`}
        ${this._error?ie`<div class="error" role="alert">${this._error}</div>`:re}
      </details>
    `}_numberRow(e,t,i){if(!e||!this.hass)return re;const s=this.hass.states[e];if(!s)return re;const o=(Xe(this.hass,e,"min")??0)<0,r=Number(s.state),a=""!==s.state.trim()&&Number.isFinite(r)?it(this.hass,r):"";return ie`<label class="field">
      <span class="muted">
        ${c(this.hass,e,this.model?.context.name)}
        ${i?ie`<span class="tag">${n(this.hass,"goal.derived")}</span>`:re}
      </span>
      <span class="input">
        <input
          class="number"
          type="text"
          inputmode=${o?"text":"decimal"}
          autocomplete="off"
          .value=${a}
          ?disabled=${i||"unavailable"===s.state}
          aria-describedby=${i?"derived":re}
          @change=${t=>this._setNumber(e,t.target.value)}
        />
        <span class="unit muted">${t}</span>
      </span>
    </label>`}_dateRow(e){if(!e||!this.hass?.states[e])return re;const t=this.hass.states[e];return ie`<label class="field">
      <span class="muted"
        >${c(this.hass,e,this.model?.context.name)}</span
      >
      <span class="input">
        <input
          type="date"
          .value=${"unknown"===t.state||"unavailable"===t.state?"":t.state}
          ?disabled=${"unavailable"===t.state}
          @change=${t=>this._setDate(e,t.target.value)}
        />
      </span>
    </label>`}async _setNumber(e,t){const i=tt(t);if(this.hass&&null!==i)try{await this.hass.callService("number","set_value",{value:i},{entity_id:e}),this._error=null}catch(e){this._error=ut(this.hass,e)}}async _setDate(e,t){if(this.hass&&t)try{await this.hass.callService("date","set_value",{date:t},{entity_id:e}),this._error=null}catch(e){this._error=ut(this.hass,e)}}};Nt.styles=[Me,y`
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
    `],u([Se({attribute:!1})],Nt.prototype,"hass",void 0),u([Se({attribute:!1})],Nt.prototype,"model",void 0),u([Se({type:Boolean})],Nt.prototype,"open",void 0),u([Ee()],Nt.prototype,"_error",void 0),Nt=u([xe("wg-goal-editor")],Nt);let Tt=class extends $e{constructor(){super(...arguments),this._draft=null,this._error=null,this._busy=!1,this._open=()=>{const e=this.hass,t=this.model?.currentWeight??null;this._draft={name:"",mode:"target",startDate:Fe(e?.config?.time_zone),startWeight:null===t?"":it(e,t),endDate:"",value:"",activate:!0},this._error=null},this._close=()=>{this._draft=null,this._error=null},this._submit=async t=>{t.preventDefault();const i=this.hass,s=this._draft,o=this.model?.context.target;if(!i||!s||!o)return;const r=d(i),a=tt(s.value),n=s.startWeight.trim()?tt(s.startWeight):null;if(!s.endDate||null===a||s.startWeight.trim()&&null===n)return void(this._error=r("goals.form.incomplete"));const l={name:s.name,goal_mode:s.mode,end_date:s.endDate,activate:s.activate,["rate"===s.mode?"rate_per_week":"target_weight"]:a};s.startDate&&(l.start_date=s.startDate),null!==n&&(l.start_weight=n),this._busy=!0;try{await i.callService(e,"create_goal",l,{entity_id:o}),this._close()}catch(e){this._error=ut(i,e)}finally{this._busy=!1}}}render(){const e=this.hass,t=this.model;if(!e||!t?.context.target)return re;const i=d(e),s=this._draft;if(!s)return ie`<button class="control open" @click=${this._open}>
        <ha-icon icon="mdi:plus"></ha-icon>
        <span>${i("goals.new")}</span>
      </button>`;const o=t.unit,r="rate"===s.mode;return ie`
      <form class="form" @submit=${this._submit} novalidate>
        <label class="field wide">
          <span class="muted">${i("goals.form.name")}</span>
          <input
            type="text"
            autocomplete="off"
            .value=${s.name}
            @input=${e=>this._set("name",e.target.value)}
          />
        </label>
        <label class="field wide">
          <span class="muted">${i("goals.form.mode")}</span>
          <select
            .value=${s.mode}
            @change=${e=>this._set("mode",e.target.value)}
          >
            <option value="target" ?selected=${!r}>${i("goals.form.mode_target")}</option>
            <option value="rate" ?selected=${r}>${i("goals.form.mode_rate")}</option>
          </select>
        </label>
        <label class="field">
          <span class="muted">${i("goals.form.start_date")}</span>
          <input
            type="date"
            class=${e.themes?.darkMode?"dark":""}
            .value=${s.startDate}
            @input=${e=>this._set("startDate",e.target.value)}
          />
        </label>
        <label class="field">
          <span class="muted">${i("goals.form.start_weight",{unit:o})}</span>
          <input
            type="text"
            inputmode="decimal"
            autocomplete="off"
            .value=${s.startWeight}
            @input=${e=>this._set("startWeight",e.target.value)}
          />
        </label>
        <label class="field">
          <span class="muted">${i("goals.form.end_date")}</span>
          <input
            type="date"
            class=${e.themes?.darkMode?"dark":""}
            .value=${s.endDate}
            @input=${e=>this._set("endDate",e.target.value)}
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
            @input=${e=>this._set("value",e.target.value)}
          />
        </label>
        <label class="check wide">
          <input
            type="checkbox"
            .checked=${s.activate}
            @change=${e=>this._set("activate",e.target.checked)}
          />
          <span>${i("goals.form.activate")}</span>
        </label>
        ${this._error?ie`<div class="error wide" role="alert">${this._error}</div>`:re}
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
    `}_set(e,t){this._draft&&(this._draft={...this._draft,[e]:t})}};Tt.styles=[Me,y`
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
    `],u([Se({attribute:!1})],Tt.prototype,"hass",void 0),u([Se({attribute:!1})],Tt.prototype,"model",void 0),u([Ee()],Tt.prototype,"_draft",void 0),u([Ee()],Tt.prototype,"_error",void 0),u([Ee()],Tt.prototype,"_busy",void 0),Tt=u([xe("wg-new-goal")],Tt);const Wt=`/config/integrations/integration/${e}`;let jt=class extends $e{constructor(){super(...arguments),this._error=null,this._navigate=e=>{e.ctrlKey||e.metaKey||e.shiftKey||0!==e.button||(e.preventDefault(),history.pushState(null,"",Wt),window.dispatchEvent(new CustomEvent("location-changed",{detail:{replace:!1}})))}}render(){const e=this.model,t=this.hass;if(!e||!t||!e.context.entities.active_goal)return re;const i=[...e.goals].reverse();return ie`
      <details>
        <summary>
          <ha-icon icon="mdi:flag-checkered"></ha-icon>
          <span>${n(t,"goals.title")}</span>
          <span class="count muted">${i.length}</span>
        </summary>
        <wg-new-goal .hass=${t} .model=${e}></wg-new-goal>
        ${i.length?ie`<ul>
              ${i.map(e=>this._renderGoal(e))}
            </ul>`:ie`<p class="hint muted">${n(t,"goals.empty")}</p>`}
        ${this._error?ie`<div class="error" role="alert">${this._error}</div>`:re}
        <p class="hint muted">
          <a href=${Wt} @click=${this._navigate}
            >${n(t,"goals.manage")}</a
          >
        </p>
      </details>
    `}_renderGoal(e){const t=this.hass,i=this.model?.unit??"kg";return ie`<li class=${e.active?"active":""}>
      <div class="line">
        <span class="name">
          ${e.name}
          ${e.active?ie`<span class="tag">${n(t,"goals.active")}</span>`:re}
        </span>
        ${this._renderOutcome(e)}
      </div>
      <div class="line">
        <span class="muted details">
          <span class="nowrap">${this._period(e)}</span>
          <span class="nowrap"
            >${st(t,e.startWeight,1)} →
            ${st(t,e.targetWeight,1)} ${i}</span
          >
        </span>
        ${e.active?re:ie`<button class="control small" @click=${()=>this._activate(e)}>
              ${n(t,"goals.activate")}
            </button>`}
      </div>
    </li>`}_period(e){const t=this.hass,i=t?.config?.time_zone??"UTC",s=e=>ot(t,e?Ie(e,i):null,!0);return`${s(e.startDate)} – ${s(e.endDate)}`}_renderOutcome(e){const t=this.hass,i=e.result;if(i){const e=i.reached?"goals.reached":"goals.missed";return ie`<span class="outcome ${i.reached?"reached":""}">
        <ha-icon
          icon=${i.reached?"mdi:check-circle-outline":"mdi:close-circle-outline"}
        ></ha-icon>
        ${n(t,e,{value:st(t,i.weight,1),unit:this.model?.unit??"kg"})}
      </span>`}const s=Fe(t.config?.time_zone);let o="goals.running";return e.startDate&&s<e.startDate?o="goals.planned":e.endDate&&s>e.endDate&&(o="goals.no_reading"),ie`<span class="outcome muted">${n(t,o)}</span>`}async _activate(e){const t=this.model?.context.entities.active_goal;if(this.hass&&t)try{await this.hass.callService("select","select_option",{option:e.name},{entity_id:t}),this._error=null}catch(e){this._error=ut(this.hass,e)}}};jt.styles=[Me,y`
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
    `],u([Se({attribute:!1})],jt.prototype,"hass",void 0),u([Se({attribute:!1})],jt.prototype,"model",void 0),u([Ee()],jt.prototype,"_error",void 0),jt=u([xe("wg-goals")],jt);let Ot=class extends $e{constructor(){super(...arguments),this.name="",this.compact=!1,this._openStatus=()=>{const e=this.model?.context.entities.status;e&&this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:e},bubbles:!0,composed:!0}))}}render(){const e=this.model;if(!e)return re;const t=e.status,o=i[t]??i.no_goal;if(this.compact)return ie`
        <div class="compact">
          <span class="name" title=${this.name}>${this.name}</span>
          ${null===e.currentWeight?re:ie`<span class="now" style=${`color:${o}`}
                >${st(this.hass,e.currentWeight,1)}
                ${e.unit}</span
              >`}
        </div>
      `;const r=h(this.hass,qe(this.hass,e.context.entities.status))||t;return ie`
      <div class="header">
        <div class="badge" style=${`background:${o}`}>
          <ha-icon icon=${this.icon??"mdi:scale-bathroom"}></ha-icon>
        </div>
        <div class="titles">
          <span class="name" title=${this.name}>${this.name}</span>
          ${e.endDate?ie`<span class="muted sub"
                >${n(this.hass,"header.until",{date:h(this.hass,qe(this.hass,e.context.entities.end_date))||e.endDate})}</span
              >`:re}
        </div>
        <button
          class="status"
          style=${`color:${o}`}
          @click=${this._openStatus}
          aria-label=${n(this.hass,"header.status",{status:r})}
        >
          <ha-icon icon=${s[t]??"mdi:information-outline"}></ha-icon>
          <span>${r}</span>
        </button>
      </div>
    `}};Ot.styles=[Me,y`
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
    `],u([Se({attribute:!1})],Ot.prototype,"hass",void 0),u([Se({attribute:!1})],Ot.prototype,"model",void 0),u([Se()],Ot.prototype,"name",void 0),u([Se()],Ot.prototype,"icon",void 0),u([Se({type:Boolean})],Ot.prototype,"compact",void 0),Ot=u([xe("wg-header")],Ot);let Rt=class extends $e{render(){const e=this.model;if(!e||!this.hass)return re;const t=d(this.hass),s=i[e.status]??i.no_goal;return ie`
      <div class="hero">
        <button
          class="value"
          @click=${()=>this._more(e.context.entities.weight)}
        >
          <span class="number"
            >${st(this.hass,e.currentWeight,1)}</span
          >
          <span class="unit muted">${e.unit}</span>
        </button>
        ${null===e.deviation?re:ie`<div class="deviation" style=${`color:${s}`}>
              <ha-icon
                icon=${e.deviation>0?"mdi:arrow-up":e.deviation<0?"mdi:arrow-down":"mdi:equal"}
              ></ha-icon>
              <span>
                ${0===e.deviation?t("hero.on_plan"):`${st(this.hass,Math.abs(e.deviation),1)} ${e.unit} ${e.deviation>0?t("hero.above_plan"):t("hero.below_plan")}`}
              </span>
            </div>`}
      </div>
    `}_more(e){e&&this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:e},bubbles:!0,composed:!0}))}};Rt.styles=[Me,y`
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
    `],u([Se({attribute:!1})],Rt.prototype,"hass",void 0),u([Se({attribute:!1})],Rt.prototype,"model",void 0),Rt=u([xe("wg-hero")],Rt);let Ut=class extends $e{render(){const e=this.model;if(!e||null===e.weightProgress&&null===e.timeProgress)return re;const t=i[e.status]??i.on_track;return ie`
      ${this._bar(n(this.hass,"progress.weight"),e.weightProgress,t)}
      ${this._bar(n(this.hass,"progress.time"),e.timeProgress,"var(--secondary-text-color, #727272)")}
    `}_bar(e,t,i){if(null===t)return ie`<div class="line">
        <span class="label muted">${e}</span>
        <span class="track"></span>
        <span class="value muted">–</span>
      </div>`;const s=Math.min(100,Math.max(0,t));return ie`<div class="line">
      <span class="label muted">${e}</span>
      <span
        class="track"
        role="progressbar"
        aria-label=${n(this.hass,"progress.aria",{label:e})}
        aria-valuenow=${Math.round(s)}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <span class="fill" style=${`width:${s}%;background:${i}`}></span>
      </span>
      <span class="value">${st(this.hass,s,0)}%</span>
    </div>`}};Ut.styles=[Me,y`
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
    `],u([Se({attribute:!1})],Ut.prototype,"hass",void 0),u([Se({attribute:!1})],Ut.prototype,"model",void 0),Ut=u([xe("wg-progress")],Ut);let Ht=class extends ct{static getStubConfig(e,i){const s=i.find(e=>e.endsWith("_status"));return{type:`custom:${t}`,entity:s??i[0]}}static async getConfigElement(){return await Promise.resolve().then(function(){return Vt}),document.createElement(`${t}-editor`)}chartOptions(){const e=this._config??{},t={source:e.source,range:e.range,average:e.average,line:e.line,height:e.height,y_axis:e.y_axis,show:e.show,styles:e.styles},i=e.chart??{};return{...t,...i,y_axis:{...t.y_axis??{},...i.y_axis??{}},show:{...t.show??{},...i.show??{}},styles:{...t.styles??{},...i.styles??{}}}}needsMeasurements(){return!1!==this._config?.show_chart}getCardSize(){let e=2;return!1!==this._config?.show_chart&&(e+=3),!1!==this._config?.show_progress&&(e+=1),!1!==this._config?.show_record&&(e+=1),!1!==this._config?.show_goals&&(e+=1),e}render(){const e=this.missingGoalMessage();if(e)return this.renderProblem(e);const t=this._model,i=this._config;if(!t||!i||!this.hass)return ie`<ha-card></ha-card>`;const s=!1!==i.show_chart,o=!1!==i.show_record;return ie`
      <ha-card>
        <div class="content">
          ${!1===i.show_header?re:ie`<wg-header
                .hass=${this.hass}
                .model=${t}
                .name=${i.name??t.context.name}
                .icon=${i.icon}
                ?compact=${"compact"===i.header}
              ></wg-header>`}

          ${!1===i.show_hero?re:ie`<wg-hero .hass=${this.hass} .model=${t}></wg-hero>`}

          ${!1===i.show_badges?re:ie`<wg-badges
                .hass=${this.hass}
                .model=${t}
                .badges=${i.badges}
              ></wg-badges>`}

          ${s?ie`
                ${this._fetchError?ie`<div class="notice" role="alert">${this._fetchError}</div>`:re}
                <wg-chart
                  .hass=${this.hass}
                  .model=${t}
                  .measurements=${this._measurements}
                  .options=${this.chartOptions()}
                  .loading=${this._loading}
                ></wg-chart>
              `:re}

          ${!1===i.show_progress?re:ie`<wg-progress .hass=${this.hass} .model=${t}></wg-progress>`}

          ${o?ie`<wg-actions
                .hass=${this.hass}
                .model=${t}
                .showRecord=${!1!==i.show_record}
                .showRecordDate=${!1!==i.show_record_date}
              ></wg-actions>`:re}

          ${!1===i.show_goal_editor?re:ie`<wg-goal-editor
                .hass=${this.hass}
                .model=${t}
                .open=${"no_goal"===t.status}
              ></wg-goal-editor>`}

          ${!1===i.show_goals?re:ie`<wg-goals .hass=${this.hass} .model=${t}></wg-goals>`}
        </div>
      </ha-card>
    `}};Ht.styles=[Me,y`
      ha-card {
        container-type: inline-size;
        overflow: hidden;
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
    `],Ht=u([xe(t)],Ht),window.customCards=window.customCards??[];const Gt=navigator.language||"en",It=[{type:t,name:l(Gt,"picker.card_name"),description:l(Gt,"picker.card_description"),preview:!0,documentationURL:"https://github.com/julezdean/ha-weight-goal"}];for(const e of It)window.customCards.some(t=>t.type===e.type)||window.customCards.push(e);let Ft;function Lt(t,i){if("source"===i)return n(t,"badge.source.sensor");const s=`component.${e}.entity.sensor.${i}.name`,o=t?.localize?.(s);if("string"==typeof o&&o)return o;for(const s of["number","date"]){const o=t?.localize?.(`component.${e}.entity.${s}.${i}.name`);if("string"==typeof o&&o)return o}return i}function Zt(e){return[{name:"",type:"grid",schema:[{name:"source",selector:{select:{mode:"dropdown",options:[{value:"measurements",label:e("editor.source_measurements")},{value:"history",label:e("editor.source_history")}]}}},{name:"range",selector:{select:{mode:"dropdown",custom_value:!0,options:[{value:"goal",label:e("editor.range_goal")},{value:"30",label:e("editor.range_30")},{value:"90",label:e("editor.range_90")},{value:"365",label:e("editor.range_365")},{value:"all",label:e("editor.range_all")}]}}},{name:"line",selector:{select:{mode:"dropdown",options:[{value:"smooth",label:e("editor.line_smooth")},{value:"linear",label:e("editor.line_linear")},{value:"step",label:e("editor.line_step")}]}}},{name:"average",selector:{number:{min:0,max:60,step:1,mode:"box",unit_of_measurement:"d"}}},{name:"height",selector:{number:{min:100,max:500,step:10,mode:"box",unit_of_measurement:"px"}}}]},{name:"y_axis",type:"expandable",title:e("editor.y_axis"),schema:[{name:"",type:"grid",schema:[{name:"mode",selector:{select:{mode:"dropdown",options:[{value:"nice",label:e("editor.mode_nice")},{value:"tight",label:e("editor.mode_tight")}]}}},{name:"include_goal",selector:{boolean:{}}},{name:"min",selector:{number:{min:0,max:500,step:.5,mode:"box"}}},{name:"max",selector:{number:{min:0,max:500,step:.5,mode:"box"}}},{name:"ticks",selector:{number:{min:2,max:10,step:1,mode:"box"}}}]}]},{name:"show",type:"expandable",title:e("editor.layers"),schema:[{name:"",type:"grid",schema:[{name:"band",selector:{boolean:{}}},{name:"plan",selector:{boolean:{}}},{name:"goals",selector:{boolean:{}}},{name:"average",selector:{boolean:{}}},{name:"projection",selector:{boolean:{}}},{name:"points",selector:{boolean:{}}},{name:"today",selector:{boolean:{}}},{name:"grid",selector:{boolean:{}}},{name:"axis",selector:{boolean:{}}}]}]}]}console.info("%c WEIGHT-GOAL-CARD %c 0.11.0-beta.1 ","color:#fff;background:#03a9f4;font-weight:700","color:#03a9f4;background:#fff;font-weight:700");const Bt={entity:"editor.entity",name:"editor.name",icon:"editor.icon",badges:"editor.badges",source:"editor.source",range:"editor.range",line:"editor.line",average:"editor.average",height:"editor.height",mode:"editor.mode",include_goal:"editor.include_goal",min:"editor.min",max:"editor.max",ticks:"editor.ticks",band:"editor.band",plan:"editor.plan",projection:"editor.projection",goals:"editor.goals",points:"editor.points",today:"editor.today",grid:"editor.grid",axis:"editor.axis",show_header:"editor.show_header",header:"editor.header",show_hero:"editor.show_hero",show_badges:"editor.show_badges",show_chart:"editor.show_chart",show_progress:"editor.show_progress",show_record:"editor.show_record",show_record_date:"editor.show_record_date",show_goal_editor:"editor.show_goal_editor",show_goals:"editor.show_goals"},qt={entity:"editor.entity_help",badges:"editor.badges_help",source:"editor.source_help",average:"editor.average_help",range:"editor.range_help",mode:"editor.mode_help",include_goal:"editor.include_goal_help",min:"editor.axis_bound_help",max:"editor.axis_bound_help"};let Kt=class extends $e{constructor(){super(...arguments),this._ready=!1,this._changed=e=>{e.stopPropagation();const t={...e.detail.value};"string"==typeof t.range&&/^\d+$/.test(t.range)&&(t.range=Number(t.range));const i=(this._config?.badges??[]).filter(e=>"object"==typeof e);i.length&&(t.badges=[...t.badges??[],...i]),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}}setConfig(e){this._config=e}connectedCallback(){super.connectedCallback(),(Ft||(Ft=(async()=>{if(customElements.get("ha-form"))return;const e=await(window.loadCardHelpers?.());if(!e)return;const t=e.createCardElement({type:"entities",entities:[]}).constructor.getConfigElement;t&&await t()})().catch(()=>{})),Ft).then(()=>{this._ready=!0})}_schema(){const t=d(this.hass);return[{name:"entity",required:!0,selector:{entity:{integration:e,domain:"sensor"}}},{name:"",type:"grid",schema:[{name:"name",selector:{text:{}}},{name:"icon",selector:{icon:{}}}]},(i=this.hass,{name:"badges",selector:{select:{multiple:!0,mode:"list",options:gt.map(e=>({value:e,label:Lt(i,e)}))}}}),{name:"",type:"expandable",title:t("editor.sections"),schema:[{name:"",type:"grid",schema:[{name:"show_header",selector:{boolean:{}}},{name:"show_hero",selector:{boolean:{}}},{name:"show_badges",selector:{boolean:{}}},{name:"show_chart",selector:{boolean:{}}},{name:"show_progress",selector:{boolean:{}}},{name:"show_record",selector:{boolean:{}}},{name:"show_record_date",selector:{boolean:{}}},{name:"show_goal_editor",selector:{boolean:{}}},{name:"show_goals",selector:{boolean:{}}}]},{name:"header",selector:{select:{mode:"dropdown",options:[{value:"full",label:t("editor.header_full")},{value:"compact",label:t("editor.header_compact")}]}}}]},{name:"",type:"expandable",title:t("editor.chart"),schema:Zt(t)}];var i}render(){return this.hass&&this._config?this._ready||customElements.get("ha-form")?ie`
      <ha-form
        .hass=${this.hass}
        .data=${this._defaults()}
        .schema=${this._schema()}
        .computeLabel=${e=>function(e,t){const i=Bt[t.name];return i?n(e,i):t.title??t.name}(this.hass,e)}
        .computeHelper=${e=>function(e,t){const i=qt[t.name];return i?n(e,i):void 0}(this.hass,e)}
        @value-changed=${this._changed}
      ></ha-form>
    `:ie`<p class="fallback">
        ${n(this.hass,"editor.loading")}
      </p>`:re}_defaults(){const e=this._config;return{show_header:!0,header:"full",show_hero:!0,show_badges:!0,show_chart:!0,show_progress:!0,show_record:!0,show_record_date:!0,show_goal_editor:!0,show_goals:!0,source:"measurements",range:"goal",line:"smooth",average:7,...e,badges:(e.badges??mt).filter(e=>"string"==typeof e),y_axis:{mode:"nice",include_goal:!0,...e.y_axis??{}},show:{band:!0,plan:!0,goals:!0,average:!0,projection:!0,points:!0,today:!0,grid:!0,axis:!0,...e.show??{}}}}};Kt.styles=y`
    .fallback {
      color: var(--secondary-text-color, #727272);
      font-size: 14px;
    }
  `,u([Se({attribute:!1})],Kt.prototype,"hass",void 0),u([Ee()],Kt.prototype,"_config",void 0),u([Ee()],Kt.prototype,"_ready",void 0),Kt=u([xe(`${t}-editor`)],Kt);var Vt=Object.freeze({__proto__:null,get WeightGoalCardEditor(){return Kt}});
