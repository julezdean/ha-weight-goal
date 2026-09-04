/*! weight-goal-card 0.5.1 | MIT | https://github.com/julezdean/ha-weight-goal */
const t="weight_goal",e="weight-goal-card",i={no_goal:"var(--disabled-text-color, #9e9e9e)",on_track:"var(--primary-color, #03a9f4)",ahead:"var(--success-color, #43a047)",behind:"var(--warning-color, #ffa726)",reached:"var(--success-color, #43a047)",ended:"var(--secondary-text-color, #727272)"},s={no_goal:"mdi:target-variant",on_track:"mdi:check-circle-outline",ahead:"mdi:rocket-launch-outline",behind:"mdi:alert-circle-outline",reached:"mdi:flag-checkered",ended:"mdi:calendar-check-outline"},r=new Set(["unavailable","unknown"]),n={"picker.card_name":"Weight goal","picker.card_description":"Weight against the planned trajectory, with the chart, the progress bars and the actions of one Road to Weight Goal entry.","card.fallback_name":"Weight goal","card.no_entities":"No Road to Weight Goal entities found for {anchor}. Point `entity` at one entity of the goal, for example sensor.<name>_status.","card.no_target":"This goal has no sensor entity, so actions and readings cannot be loaded.","card.load_failed":"Could not load the readings.","chart.loading":"Loading…","chart.empty":"No readings and no goal yet","chart.readings":"Readings","chart.vs_plan":"{value} {unit} vs plan","chart.summary_readings":"{count} readings","chart.summary_no_weight":"no current weight","chart.summary_current":"currently {value} {unit}","chart.summary_above":"{value} {unit} above plan","chart.summary_below":"{value} {unit} below plan","chart.summary_plan":"plan from {start} to {target} {unit}","header.until":"Until {date}","header.status":"Status: {status}","hero.above_plan":"above plan","hero.below_plan":"below plan","hero.on_plan":"on plan","badges.no_reading":"No reading yet","badge.source.manual":"Entered by hand","badge.source.sensor":"From the scale","badge.source.service":"From an automation","badge.source.import":"Imported","actions.save":"Save reading","actions.restart":"Restart today","actions.restart_title":"Move the goal start to today","actions.confirm_restart":"Confirm restart","actions.restart_hint":"Confirming sets the start weight to your latest reading and the start date to today. The end date stays.","actions.enter_number":"Enter a number first.","actions.failed":"That did not work. Check the Home Assistant log for details.","actions.weight_input":"Weight in {unit}","goal.title":"Goal","goal.derived":"calculated","goal.derived_hint":"One of these two is calculated from the other. Change the goal mode in the integration options to set it directly.","progress.weight":"Weight","progress.time":"Time","progress.aria":"{label} progress","editor.loading":"Loading the editor… if this stays here, edit the card in YAML.","editor.entity":"Goal entity","editor.entity_help":"Any entity of the goal. The card finds the rest itself.","editor.name":"Name","editor.icon":"Icon","editor.badges":"Badges","editor.badges_help":"The small chips under the weight, in the order you pick them.","editor.sections":"Sections","editor.chart":"Chart","editor.source":"Readings from","editor.source_help":"Integration readings are exactly what the status is based on. Recorder history reaches further back but still contains readings you deleted.","editor.source_measurements":"Integration readings","editor.source_history":"Recorder history","editor.range":"Time range","editor.range_help":"A number is read as days.","editor.range_goal":"Whole goal period","editor.range_30":"Last 30 days","editor.range_90":"Last 90 days","editor.range_365":"Last year","editor.range_all":"Everything","editor.line":"Line shape","editor.line_smooth":"Smooth","editor.line_linear":"Straight","editor.line_step":"Stepped","editor.average":"Moving average","editor.average_help":"Extra line over the raw readings. 0 turns it off.","editor.height":"Chart height","editor.y_axis":"Vertical axis","editor.mode":"Automatic ends","editor.mode_help":"Rounded gives readable labels. Fit the data uses the smallest and largest value exactly, which leaves more room for the movement.","editor.mode_nice":"Rounded","editor.mode_tight":"Fit the data","editor.include_goal":"Fit the plan line too","editor.include_goal_help":"Off keeps the axis on the readings and clips the plan line if it runs outside.","editor.min":"Lowest value","editor.max":"Highest value","editor.axis_bound_help":"Leave empty to follow the data.","editor.ticks":"Grid lines","editor.layers":"Layers","editor.band":"Tolerance band","editor.plan":"Plan line","editor.projection":"Projection","editor.points":"Reading dots","editor.today":"Today marker","editor.grid":"Grid lines","editor.axis":"Axis labels","editor.show_header":"Header","editor.header":"Header style","editor.header_full":"Full","editor.header_compact":"Compact","editor.show_hero":"Current weight","editor.show_badges":"Badges","editor.show_chart":"Chart","editor.show_progress":"Progress bars","editor.show_record":"Save reading","editor.show_restart":"Restart today","editor.show_goal_editor":"Goal settings"},o={en:n,de:{"picker.card_name":"Gewichtsziel","picker.card_description":"Das Gewicht im Verhältnis zur geplanten Kurve, mit Diagramm, Fortschrittsbalken und den Aktionen eines Ziels aus „Road to Weight Goal“.","card.fallback_name":"Gewichtsziel","card.no_entities":"Keine Entitäten von „Road to Weight Goal“ für {anchor} gefunden. Setze `entity` auf eine Entität des Ziels, zum Beispiel sensor.<name>_status.","card.no_target":"Dieses Ziel hat keine Sensor-Entität, deshalb lassen sich weder Aktionen ausführen noch Messwerte laden.","card.load_failed":"Die Messwerte konnten nicht geladen werden.","chart.loading":"Wird geladen …","chart.empty":"Noch keine Messwerte und kein Ziel","chart.readings":"Messwerte","chart.vs_plan":"{value} {unit} zum Plan","chart.summary_readings":"{count} Messwerte","chart.summary_no_weight":"kein aktuelles Gewicht","chart.summary_current":"aktuell {value} {unit}","chart.summary_above":"{value} {unit} über Plan","chart.summary_below":"{value} {unit} unter Plan","chart.summary_plan":"Plan von {start} auf {target} {unit}","header.until":"Bis {date}","header.status":"Status: {status}","hero.above_plan":"über Plan","hero.below_plan":"unter Plan","hero.on_plan":"auf Plan","badges.no_reading":"Noch keine Messung","badge.source.manual":"Von Hand erfasst","badge.source.sensor":"Von der Waage","badge.source.service":"Aus einer Automatisierung","badge.source.import":"Importiert","actions.save":"Messung speichern","actions.restart":"Heute neu starten","actions.restart_title":"Den Zielstart auf heute legen","actions.confirm_restart":"Neustart bestätigen","actions.restart_hint":"Beim Bestätigen werden Startgewicht auf die letzte Messung und Startdatum auf heute gesetzt. Das Zieldatum bleibt.","actions.enter_number":"Bitte zuerst eine Zahl eingeben.","actions.failed":"Das hat nicht geklappt. Die Einzelheiten stehen im Home-Assistant-Log.","actions.weight_input":"Gewicht in {unit}","goal.title":"Ziel","goal.derived":"berechnet","goal.derived_hint":"Einer dieser beiden Werte wird aus dem anderen berechnet. Ändere den Modus in den Optionen der Integration, um ihn direkt zu setzen.","progress.weight":"Gewicht","progress.time":"Zeit","progress.aria":"Fortschritt {label}","editor.loading":"Der Editor wird geladen … bleibt das stehen, bearbeite die Karte in YAML.","editor.entity":"Entität des Ziels","editor.entity_help":"Eine beliebige Entität des Ziels. Den Rest findet die Karte selbst.","editor.name":"Name","editor.icon":"Symbol","editor.badges":"Badges","editor.badges_help":"Die kleinen Chips unter dem Gewicht, in der Reihenfolge der Auswahl.","editor.sections":"Bereiche","editor.chart":"Diagramm","editor.source":"Messwerte aus","editor.source_help":"Die Messwerte der Integration sind genau die, auf denen der Status beruht. Die Recorder-Historie reicht weiter zurück, enthält aber auch gelöschte Messungen.","editor.source_measurements":"Messwerte der Integration","editor.source_history":"Recorder-Historie","editor.range":"Zeitraum","editor.range_help":"Eine Zahl wird als Tage gelesen.","editor.range_goal":"Gesamter Zielzeitraum","editor.range_30":"Letzte 30 Tage","editor.range_90":"Letzte 90 Tage","editor.range_365":"Letztes Jahr","editor.range_all":"Alles","editor.line":"Linienform","editor.line_smooth":"Geglättet","editor.line_linear":"Gerade","editor.line_step":"Stufen","editor.average":"Gleitender Mittelwert","editor.average_help":"Zusätzliche Linie über den Rohwerten. 0 schaltet sie aus.","editor.height":"Höhe des Diagramms","editor.y_axis":"Y-Achse","editor.mode":"Automatische Enden","editor.mode_help":"„Gerundet“ ergibt lesbare Beschriftungen. „An die Daten anpassen“ nimmt kleinsten und größten Wert exakt und lässt damit mehr Platz für die Bewegung.","editor.mode_nice":"Gerundet","editor.mode_tight":"An die Daten anpassen","editor.include_goal":"Planlinie mit einbeziehen","editor.include_goal_help":"Aus hält die Achse bei den Messwerten und schneidet die Planlinie ab, wenn sie darüber hinausläuft.","editor.min":"Kleinster Wert","editor.max":"Größter Wert","editor.axis_bound_help":"Leer lassen, um den Daten zu folgen.","editor.ticks":"Gitterlinien","editor.layers":"Ebenen","editor.band":"Toleranzband","editor.plan":"Planlinie","editor.projection":"Prognose","editor.points":"Messpunkte","editor.today":"Heute-Markierung","editor.grid":"Gitterlinien","editor.axis":"Achsenbeschriftung","editor.show_header":"Kopfzeile","editor.header":"Header-Stil","editor.header_full":"Vollständig","editor.header_compact":"Kompakt","editor.show_hero":"Aktuelles Gewicht","editor.show_badges":"Badges","editor.show_chart":"Diagramm","editor.show_progress":"Fortschrittsbalken","editor.show_record":"Messung speichern","editor.show_restart":"Heute neu starten","editor.show_goal_editor":"Zieleinstellungen"}};function a(t,e,i={}){return l(function(t){return t?.locale?.language||t?.language||"en"}(t),e,i)}function l(t,e,i={}){let s=(o[t]??o[t.split("-")[0].toLowerCase()]??o.en)[e]??n[e]??e;for(const[t,e]of Object.entries(i))s=s.split(`{${t}}`).join(String(e));return s}function h(t){return(e,i)=>a(t,e,i)}function d(t,e,i){if(!t||!e)return"";const s=t.states[e]?.attributes?.friendly_name;return s?i&&s.startsWith(`${i} `)?s.slice(i.length+1):s:e}function c(t,e){if(!t||!e)return"";if("function"==typeof t.formatEntityState)try{return t.formatEntityState(e)}catch{}const i=e.attributes?.unit_of_measurement;return i?`${e.state} ${i}`:e.state}function u(t,e,i,s){var r,n=arguments.length,o=n<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,s);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(n<3?r(o):n>3?r(e,i,o):r(e,i))||o);return n>3&&o&&Object.defineProperty(e,i,o),o}"function"==typeof SuppressedError&&SuppressedError;const p=globalThis,m=p.ShadowRoot&&(void 0===p.ShadyCSS||p.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,g=Symbol(),_=new WeakMap;let f=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==g)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(m&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=_.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&_.set(e,t))}return t}toString(){return this.cssText}};const y=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new f(i,t,g)},b=m?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new f("string"==typeof t?t:t+"",void 0,g))(e)})(t):t,{is:$,defineProperty:v,getOwnPropertyDescriptor:w,getOwnPropertyNames:x,getOwnPropertySymbols:k,getPrototypeOf:A}=Object,E=globalThis,S=E.trustedTypes,M=S?S.emptyScript:"",C=E.reactiveElementPolyfillSupport,P=(t,e)=>t,z={toAttribute(t,e){switch(e){case Boolean:t=t?M:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},N=(t,e)=>!$(t,e),j={attribute:!0,type:String,converter:z,reflect:!1,useDefault:!1,hasChanged:N};Symbol.metadata??=Symbol("metadata"),E.litPropertyMetadata??=new WeakMap;let D=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=j){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&v(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:r}=w(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const n=s?.call(this);r?.call(this,e),this.requestUpdate(t,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??j}static _$Ei(){if(this.hasOwnProperty(P("elementProperties")))return;const t=A(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(P("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(P("properties"))){const t=this.properties,e=[...x(t),...k(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(b(t))}else void 0!==t&&e.push(b(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,e)=>{if(m)t.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of e){const e=document.createElement("style"),s=p.litNonce;void 0!==s&&e.setAttribute("nonce",s),e.textContent=i.cssText,t.appendChild(e)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const r=(void 0!==i.converter?.toAttribute?i.converter:z).toAttribute(e,i.type);this._$Em=t,null==r?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),r="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:z;this._$Em=s;const n=r.fromAttribute(e,t.type);this[s]=n??this._$Ej?.get(s)??n,this._$Em=null}}requestUpdate(t,e,i,s=!1,r){if(void 0!==t){const n=this.constructor;if(!1===s&&(r=this[t]),i??=n.getPropertyOptions(t),!((i.hasChanged??N)(r,e)||i.useDefault&&i.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:r},n){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),!0!==r||void 0!==n)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};D.elementStyles=[],D.shadowRootOptions={mode:"open"},D[P("elementProperties")]=new Map,D[P("finalized")]=new Map,C?.({ReactiveElement:D}),(E.reactiveElementVersions??=[]).push("2.1.2");const R=globalThis,T=t=>t,O=R.trustedTypes,W=O?O.createPolicy("lit-html",{createHTML:t=>t}):void 0,U="$lit$",H=`lit$${Math.random().toFixed(9).slice(2)}$`,I="?"+H,L=`<${I}>`,F=document,B=()=>F.createComment(""),G=t=>null===t||"object"!=typeof t&&"function"!=typeof t,Z=Array.isArray,q="[ \t\n\f\r]",V=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,K=/-->/g,Y=/>/g,J=RegExp(`>|${q}(?:([^\\s"'>=/]+)(${q}*=${q}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),X=/'/g,Q=/"/g,tt=/^(?:script|style|textarea|title)$/i,et=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),it=et(1),st=et(2),rt=Symbol.for("lit-noChange"),nt=Symbol.for("lit-nothing"),ot=new WeakMap,at=F.createTreeWalker(F,129);function lt(t,e){if(!Z(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==W?W.createHTML(e):e}const ht=(t,e)=>{const i=t.length-1,s=[];let r,n=2===e?"<svg>":3===e?"<math>":"",o=V;for(let e=0;e<i;e++){const i=t[e];let a,l,h=-1,d=0;for(;d<i.length&&(o.lastIndex=d,l=o.exec(i),null!==l);)d=o.lastIndex,o===V?"!--"===l[1]?o=K:void 0!==l[1]?o=Y:void 0!==l[2]?(tt.test(l[2])&&(r=RegExp("</"+l[2],"g")),o=J):void 0!==l[3]&&(o=J):o===J?">"===l[0]?(o=r??V,h=-1):void 0===l[1]?h=-2:(h=o.lastIndex-l[2].length,a=l[1],o=void 0===l[3]?J:'"'===l[3]?Q:X):o===Q||o===X?o=J:o===K||o===Y?o=V:(o=J,r=void 0);const c=o===J&&t[e+1].startsWith("/>")?" ":"";n+=o===V?i+L:h>=0?(s.push(a),i.slice(0,h)+U+i.slice(h)+H+c):i+H+(-2===h?e:c)}return[lt(t,n+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class dt{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let r=0,n=0;const o=t.length-1,a=this.parts,[l,h]=ht(t,e);if(this.el=dt.createElement(l,i),at.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=at.nextNode())&&a.length<o;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(U)){const e=h[n++],i=s.getAttribute(t).split(H),o=/([.?@])?(.*)/.exec(e);a.push({type:1,index:r,name:o[2],strings:i,ctor:"."===o[1]?gt:"?"===o[1]?_t:"@"===o[1]?ft:mt}),s.removeAttribute(t)}else t.startsWith(H)&&(a.push({type:6,index:r}),s.removeAttribute(t));if(tt.test(s.tagName)){const t=s.textContent.split(H),e=t.length-1;if(e>0){s.textContent=O?O.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],B()),at.nextNode(),a.push({type:2,index:++r});s.append(t[e],B())}}}else if(8===s.nodeType)if(s.data===I)a.push({type:2,index:r});else{let t=-1;for(;-1!==(t=s.data.indexOf(H,t+1));)a.push({type:7,index:r}),t+=H.length-1}r++}}static createElement(t,e){const i=F.createElement("template");return i.innerHTML=t,i}}function ct(t,e,i=t,s){if(e===rt)return e;let r=void 0!==s?i._$Co?.[s]:i._$Cl;const n=G(e)?void 0:e._$litDirective$;return r?.constructor!==n&&(r?._$AO?.(!1),void 0===n?r=void 0:(r=new n(t),r._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=r:i._$Cl=r),void 0!==r&&(e=ct(t,r._$AS(t,e.values),r,s)),e}class ut{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??F).importNode(e,!0);at.currentNode=s;let r=at.nextNode(),n=0,o=0,a=i[0];for(;void 0!==a;){if(n===a.index){let e;2===a.type?e=new pt(r,r.nextSibling,this,t):1===a.type?e=new a.ctor(r,a.name,a.strings,this,t):6===a.type&&(e=new yt(r,this,t)),this._$AV.push(e),a=i[++o]}n!==a?.index&&(r=at.nextNode(),n++)}return at.currentNode=F,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class pt{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=nt,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=ct(this,t,e),G(t)?t===nt||null==t||""===t?(this._$AH!==nt&&this._$AR(),this._$AH=nt):t!==this._$AH&&t!==rt&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>Z(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==nt&&G(this._$AH)?this._$AA.nextSibling.data=t:this.T(F.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=dt.createElement(lt(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new ut(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=ot.get(t.strings);return void 0===e&&ot.set(t.strings,e=new dt(t)),e}k(t){Z(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const r of t)s===e.length?e.push(i=new pt(this.O(B()),this.O(B()),this,this.options)):i=e[s],i._$AI(r),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=T(t).nextSibling;T(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class mt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,r){this.type=1,this._$AH=nt,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=nt}_$AI(t,e=this,i,s){const r=this.strings;let n=!1;if(void 0===r)t=ct(this,t,e,0),n=!G(t)||t!==this._$AH&&t!==rt,n&&(this._$AH=t);else{const s=t;let o,a;for(t=r[0],o=0;o<r.length-1;o++)a=ct(this,s[i+o],e,o),a===rt&&(a=this._$AH[o]),n||=!G(a)||a!==this._$AH[o],a===nt?t=nt:t!==nt&&(t+=(a??"")+r[o+1]),this._$AH[o]=a}n&&!s&&this.j(t)}j(t){t===nt?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class gt extends mt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===nt?void 0:t}}class _t extends mt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==nt)}}class ft extends mt{constructor(t,e,i,s,r){super(t,e,i,s,r),this.type=5}_$AI(t,e=this){if((t=ct(this,t,e,0)??nt)===rt)return;const i=this._$AH,s=t===nt&&i!==nt||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,r=t!==nt&&(i===nt||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class yt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){ct(this,t)}}const bt=R.litHtmlPolyfillSupport;bt?.(dt,pt),(R.litHtmlVersions??=[]).push("3.3.3");const $t=globalThis;let vt=class extends D{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let r=s._$litPart$;if(void 0===r){const t=i?.renderBefore??null;s._$litPart$=r=new pt(e.insertBefore(B(),t),t,void 0,i??{})}return r._$AI(t),r})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return rt}};vt._$litElement$=!0,vt.finalized=!0,$t.litElementHydrateSupport?.({LitElement:vt});const wt=$t.litElementPolyfillSupport;wt?.({LitElement:vt}),($t.litElementVersions??=[]).push("4.2.2");const xt=t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},kt={attribute:!0,type:String,converter:z,reflect:!1,hasChanged:N},At=(t=kt,e,i)=>{const{kind:s,metadata:r}=i;let n=globalThis.litPropertyMetadata.get(r);if(void 0===n&&globalThis.litPropertyMetadata.set(r,n=new Map),"setter"===s&&((t=Object.create(t)).wrapped=!0),n.set(i.name,t),"accessor"===s){const{name:s}=i;return{set(i){const r=e.get.call(this);e.set.call(this,i),this.requestUpdate(s,r,t,!0,i)},init(e){return void 0!==e&&this.C(s,void 0,t,e),e}}}if("setter"===s){const{name:s}=i;return function(i){const r=this[s];e.call(this,i),this.requestUpdate(s,r,t,!0,i)}}throw Error("Unsupported decorator location: "+s)};function Et(t){return(e,i)=>"object"==typeof i?At(t,e,i):((t,e,i)=>{const s=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),s?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function St(t){return Et({...t,state:!0,attribute:!1})}const Mt=y`
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
`,Ct={number:["start_weight","target_weight","rate_per_week","manual_weight"],date:["start_date","end_date"],button:["start_today","confirm_start_today","record_weight"],sensor:["weight","target_weight_today","deviation","trend","weight_progress","time_progress","remaining","projected_date","status","last_measurement"]},Pt=new Map;for(const[t,e]of Object.entries(Ct))for(const i of e)Pt.set(i,t);const zt=[...Pt.keys()].sort((t,e)=>e.length-t.length),Nt=["status","weight","last_measurement"];function jt(t){const e=t.indexOf(".");if(e<0)return;const i=t.slice(0,e),s=t.slice(e+1);for(const t of zt)if(Pt.get(t)===i&&(s===t||s.endsWith(`_${t}`)))return t}function Dt(t,e,i){e&&!t[e]&&Pt.get(e)===i.slice(0,i.indexOf("."))&&(t[e]=i)}function Rt(t,e,i){const s=e?t.devices?.[e]:void 0;if(s){const t=s.name_by_user||s.name;if(t)return t}const r=i.status??i.weight,n=r?t.states?.[r]?.attributes?.friendly_name:void 0;if(!n)return a(t,"card.fallback_name");const o=n.lastIndexOf(" ");return o>0?n.slice(0,o):n}function Tt(e,i){const s=i.entity;let r=i.device_id;!r&&s&&(r=e.entities?.[s]?.device_id??void 0);let n,o=r?function(e,i){const s={};for(const r of Object.values(e.entities??{})){if(r.device_id!==i||r.platform!==t)continue;const e=r.translation_key??void 0;e&&Pt.has(e)?Dt(s,e,r.entity_id):Dt(s,jt(r.entity_id),r.entity_id)}return s}(e,r):{};!Object.keys(o).length&&s&&(o=function(t,e){const i={},s=jt(e);if(!s)return i;const r=e.slice(e.indexOf(".")+1),n=r.slice(0,r.length-s.length);for(const e of zt){const s=`${Pt.get(e)}.${n}${e}`;t.states?.[s]&&(i[e]=s)}return i}(e,s)),s&&Dt(o,jt(s),s);for(const[t,e]of Object.entries(i.entities??{}))e&&(o[t]=e);for(const t of Nt){const e=o[t];if(e){n=e;break}}return{entities:o,deviceId:r,name:i.name??Rt(e,r,o),target:n}}const Ot=new Map;function Wt(e,i){const s="history"===i.source?i.weightEntity:i.target;if(!s)return Promise.resolve([]);const r=`${i.source}|${s}|${i.days??"all"}`,n=Ot.get(r);if(n&&n.stamp===i.stamp)return n.promise;const o="history"===i.source?async function(t,e,i){const s=new Date,r=new Date(s.getTime()-864e5*i),n=await t.connection.sendMessagePromise({type:"history/history_during_period",start_time:r.toISOString(),end_time:s.toISOString(),entity_ids:[e],minimal_response:!0,no_attributes:!0,significant_changes_only:!1}),o=n?.[e]??[],a=[];for(const t of o){const e=Number(t.s),i="number"==typeof t.lu?1e3*t.lu:NaN;Number.isFinite(e)&&Number.isFinite(i)&&a.push({t:i,v:e})}return a.sort((t,e)=>t.t-e.t)}(e,s,i.days??365):async function(e,i,s){const r=await e.callService(t,"get_measurements",s?{days:s}:{},{entity_id:i},!1,!0),n=r?.response??{},o=[];for(const t of Object.values(n.entries??{}))for(const e of t.measurements??[]){const t=Date.parse(e.timestamp),i=Number(e.weight);Number.isFinite(t)&&Number.isFinite(i)&&o.push({t,v:i,source:e.source})}return o.sort((t,e)=>t.t-e.t)}(e,s,i.days),a={key:r,stamp:i.stamp,promise:o};return Ot.set(r,a),o.catch(()=>{Ot.get(r)===a&&Ot.delete(r)}),window.setTimeout(()=>{Ot.get(r)===a&&Ot.delete(r)},3e5),o}const Ut=864e5;const Ht=864e5;function It(t,e){const i=new Intl.DateTimeFormat("en-US",{timeZone:e,hourCycle:"h23",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"}),s={};for(const e of i.formatToParts(new Date(t)))"literal"!==e.type&&(s[e.type]=Number(e.value));return Date.UTC(s.year,s.month-1,s.day,s.hour,s.minute,s.second)-1e3*Math.floor(t/1e3)}function Lt(t,e){const i=/^(\d{4})-(\d{2})-(\d{2})/.exec(t);if(!i)return null;const s=Date.UTC(Number(i[1]),Number(i[2])-1,Number(i[3]));let r=s-It(s,e);return r=s-It(r,e),r}function Ft(t,e,i,s,r){if(!(null!==t&&null!==e&&i&&s&&Number.isFinite(t)&&Number.isFinite(e)))return null;const n=Lt(i,r),o=Lt(function(t,e){const i=/^(\d{4})-(\d{2})-(\d{2})/.exec(t);return i?new Date(Date.UTC(Number(i[1]),Number(i[2])-1,Number(i[3]))+e*Ht).toISOString().slice(0,10):t}(s,1),r);return null===n||null===o||o-n<Ht?null:{startWeight:t,targetWeight:e,begin:n,finish:o}}function Bt(t,e){const i=t.finish-t.begin;if(i<=0)return t.targetWeight;const s=Math.min(1,Math.max(0,(e-t.begin)/i));return t.startWeight+(t.targetWeight-t.startWeight)*s}function Gt(t){const e=t.targetWeight-t.startWeight;return e<-.01?"lose":e>.01?"gain":"maintain"}function Zt(t,e){if(t&&e)return t.states?.[e]}function qt(t){return!!t&&!r.has(t.state)}function Vt(t,e){const i=Zt(t,e);if(!qt(i))return null;const s=Number(i.state);return Number.isFinite(s)?s:null}function Kt(t,e){const i=Zt(t,e);return qt(i)?i.state:null}function Yt(t,e){const i=Kt(t,e);if(!i)return null;const s=Date.parse(i);return Number.isFinite(s)?s:null}function Jt(t,e,i){const s=Zt(t,e);return s?.attributes?.[i]}function Xt(t,e,i="kg"){return Jt(t,e,"unit_of_measurement")??i}function Qt(t){return t?.locale?.language||t?.language||"en"}function te(t,e,i=1){return null!==e&&Number.isFinite(e)?new Intl.NumberFormat(Qt(t),{minimumFractionDigits:i,maximumFractionDigits:i}).format(e):"–"}function ee(t,e,i=!1){return null===e?"–":new Intl.DateTimeFormat(Qt(t),{day:"numeric",month:"short",...i?{year:"numeric"}:{},timeZone:t?.config?.time_zone}).format(new Date(e))}const ie=[["second",60],["minute",60],["hour",24],["day",7],["week",4.348],["month",12],["year",1/0]];function se(t){return!!t&&"unavailable"!==t.state}class re extends vt{constructor(){super(...arguments),this._measurements=[],this._loading=!1,this._fetchError=null,this._tracked=[],this._signature="",this._requestedStamp=null}set hass(t){if(this._hass=t,!t||!this._config)return;var e;this._context=Tt(t,this._config),this._tracked=(e=this._context,Object.values(e.entities).filter(Boolean));const i=this._tracked.map(e=>{const i=t.states[e];return i?`${e}=${i.state}@${i.last_updated}`:`${e}=∅`}).join(",");i!==this._signature&&(this._signature=i,this._model=function(t,e){const i=e.entities,s=Zt(t,i.status),r=Kt(t,i.status)??"no_goal",n=Vt(t,i.start_weight),o=Vt(t,i.target_weight),a=Kt(t,i.start_date),l=Kt(t,i.end_date),h=Ft(n,o,a,l,t.config?.time_zone??"UTC"),d=Jt(t,i.status,"direction"),c=Zt(t,i.manual_weight),u=Yt(t,i.last_measurement);return{context:e,status:r,direction:d??(h?Gt(h):null),tolerance:Jt(t,i.status,"tolerance")??.5,goalMode:Jt(t,i.status,"goal_mode")??null,trendWindowDays:Jt(t,i.status,"trend_window_days")??null,unit:Xt(t,i.weight??i.start_weight),currentWeight:Vt(t,i.weight),lastMeasurement:u,measurementSource:Jt(t,i.weight,"source")??null,startWeight:n,targetWeight:o,ratePerWeek:Vt(t,i.rate_per_week),startDate:a,endDate:l,plannedToday:Vt(t,i.target_weight_today),deviation:Vt(t,i.deviation),trend:Vt(t,i.trend),remaining:Vt(t,i.remaining),weightProgress:Vt(t,i.weight_progress),timeProgress:Vt(t,i.time_progress),projectedDate:Yt(t,i.projected_date),manualWeight:Vt(t,i.manual_weight),manualPending:!0===Jt(t,i.manual_weight,"pending"),manualAvailable:se(c),recordAvailable:se(Zt(t,i.record_weight)),startTodayArmed:se(Zt(t,i.confirm_start_today)),goal:h,stamp:[s?.state,u,n,o,a,l].join("|")}}(t,this._context),this._maybeLoad())}get hass(){return this._hass}setConfig(t){if(!t.entity&&!t.device_id&&!t.entities)throw new Error("Set `entity` to one entity of a Road to Weight Goal device, for example sensor.<name>_status.");this._config=t,this._signature="",this._requestedStamp=null,this._hass&&(this.hass=this._hass)}async _maybeLoad(){const t=this._hass,e=this._model;if(!t||!e||!this.needsMeasurements())return;const i=this.chartOptions(),s=function(t,e,i,s){const r=t??"goal";if("number"==typeof r)return Math.ceil(r)+1;if(!i)return 365;const n=Math.max(7,Math.ceil(e??0)),o=Math.ceil((s-i.begin)/Ut)+n;return o>0?Math.min(3650,Math.max(30,o)):365}(i.range,i.average,e.goal,Date.now()),r=`${e.stamp}|${i.source??"measurements"}|${s??"all"}`;if(r!==this._requestedStamp){this._requestedStamp=r,this._loading=!0;try{const n=await Wt(t,{source:"history"===i.source?"history":"measurements",days:s,target:e.context.target,weightEntity:e.context.entities.weight,stamp:e.stamp});this._requestedStamp===r&&(this._measurements=n,this._fetchError=null)}catch(e){this._requestedStamp===r&&(this._fetchError=e&&"object"==typeof e&&"message"in e?String(e.message):a(t,"card.load_failed"),this._requestedStamp=null)}finally{(this._requestedStamp===r||this._fetchError)&&(this._loading=!1)}}}shouldUpdate(t){return t.has("_config")||t.has("_model")||t.has("_measurements")||t.has("_loading")||t.has("_fetchError")}renderProblem(t){return it`
      <ha-card>
        <div class="problem" role="alert">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
          <span>${t}</span>
        </div>
      </ha-card>
    `}missingGoalMessage(){const t=this._config,e=this._hass;if(!t||!e)return null;const i=this._context;return i&&Object.keys(i.entities).length?i.target?null:a(e,"card.no_target"):a(e,"card.no_entities",{anchor:t.entity??t.device_id??"?"})}}u([St()],re.prototype,"_config",void 0),u([St()],re.prototype,"_model",void 0),u([St()],re.prototype,"_measurements",void 0),u([St()],re.prototype,"_loading",void 0),u([St()],re.prototype,"_fetchError",void 0),u([Et({attribute:!1})],re.prototype,"hass",null);let ne=class extends vt{constructor(){super(...arguments),this.showRecord=!0,this.showRestart=!0,this._draft=null,this._error=null,this._busy=!1,this._onInput=t=>{this._draft=t.target.value,this._error=null},this._onKeydown=t=>{"Enter"===t.key&&this.model&&(t.preventDefault(),this._save(this.model))}}render(){const t=this.model;if(!t||!this.hass)return nt;const e=h(this.hass),i=t.context.entities,s=this.showRecord&&t.manualAvailable&&!!i.manual_weight,r=this.showRestart&&!!i.start_today&&null!==t.goal;if(!s&&!r)return nt;const n=Jt(this.hass,i.manual_weight,"min")??20,o=Jt(this.hass,i.manual_weight,"max")??300,a=this._draft??(null===t.manualWeight?"":String(t.manualWeight));return it`
      ${this._error?it`<div class="error" role="alert">
            <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
            <span>${this._error}</span>
          </div>`:nt}

      <div class="actions">
        ${s?it`
              <input
                type="number"
                inputmode="decimal"
                step="0.1"
                min=${n}
                max=${o}
                .value=${a}
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
            `:nt}
        ${r?t.startTodayArmed?it`<button
                  class="control confirm"
                  @click=${()=>this._press(t,"confirm_start_today")}
                >
                  <ha-icon icon="mdi:check-bold"></ha-icon>
                  <span>${e("actions.confirm_restart")}</span>
                </button>`:it`<button
                class="control"
                title=${e("actions.restart_title")}
                @click=${()=>this._press(t,"start_today")}
              >
                <ha-icon icon="mdi:calendar-arrow-right"></ha-icon>
                <span>${e("actions.restart")}</span>
              </button>`:nt}
      </div>
      ${r&&t.startTodayArmed?it`<p class="hint muted">${e("actions.restart_hint")}</p>`:nt}
    `}_hasDraft(t){return null!==this._draft&&""!==this._draft||t.manualPending}async _save(t){const e=t.context.target;if(!this.hass||!e)return;const i=this._draft??String(t.manualWeight??""),s=Number(i.replace(",","."));if(Number.isFinite(s)){this._busy=!0,this._error=null;try{await this.hass.callService("weight_goal","record_weight",{weight:s},{entity_id:e}),this._draft=null}catch(t){this._error=oe(this.hass,t)}finally{this._busy=!1}}else this._error=a(this.hass,"actions.enter_number")}async _press(t,e){const i=t.context.entities[e];if(this.hass&&i){this._busy=!0;try{await this.hass.callService("button","press",{},{entity_id:i}),this._error=null}catch(t){this._error=oe(this.hass,t)}finally{this._busy=!1}}}};function oe(t,e){if(e&&"object"==typeof e&&"message"in e){const t=String(e.message);if(t)return t}return a(t,"actions.failed")}ne.styles=[Mt,y`
      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      input {
        flex: 1 1 90px;
        min-width: 80px;
      }
      button.control {
        flex: 1 1 auto;
      }
      button.control.confirm {
        background: var(--success-color, #43a047);
        color: var(--text-primary-color, #fff);
      }
      button.control ha-icon {
        --mdc-icon-size: 18px;
      }
      .hint {
        margin: 8px 0 0;
        font-size: 12px;
        line-height: 1.4;
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
    `],u([Et({attribute:!1})],ne.prototype,"hass",void 0),u([Et({attribute:!1})],ne.prototype,"model",void 0),u([Et({type:Boolean})],ne.prototype,"showRecord",void 0),u([Et({type:Boolean})],ne.prototype,"showRestart",void 0),u([St()],ne.prototype,"_draft",void 0),u([St()],ne.prototype,"_error",void 0),u([St()],ne.prototype,"_busy",void 0),ne=u([xt("wg-actions")],ne);const ae={last_measurement:{key:"last_measurement",icon:"mdi:clock-outline",relative:!0},projected_date:{key:"projected_date",icon:"mdi:calendar-clock",relative:!0},trend:{key:"trend",icon:"mdi:chart-line-variant",signed:!0},deviation:{key:"deviation",icon:"mdi:plus-minus-variant",signed:!0},remaining:{key:"remaining",icon:"mdi:flag-checkered"},target_weight_today:{key:"target_weight_today",icon:"mdi:target"},weight_progress:{key:"weight_progress",icon:"mdi:scale-balance"},time_progress:{key:"time_progress",icon:"mdi:calendar-range"},start_weight:{key:"start_weight",icon:"mdi:ray-start"},target_weight:{key:"target_weight",icon:"mdi:ray-end"},rate_per_week:{key:"rate_per_week",icon:"mdi:speedometer"},start_date:{key:"start_date",icon:"mdi:calendar-start"},end_date:{key:"end_date",icon:"mdi:calendar-end"}},le=[...Object.keys(ae),"source"],he=["last_measurement","trend","remaining","projected_date"],de={manual:"mdi:pencil-outline",sensor:"mdi:scale-bathroom",service:"mdi:cog-outline",import:"mdi:database-import-outline"};function ce(t,e){const i=e.measurementSource;if(!i)return null;const s=de[i]?a(t,`badge.source.${i}`):i;return{key:"source",icon:de[i]??"mdi:help-circle-outline",text:s,label:s,entityId:e.context.entities.weight}}function ue(t,e,i){const s=ae[i],r=e.context.entities[s.key],n=Zt(t,r);if(!r||!qt(n))return null;let o;if(s.relative){const e=Date.parse(n.state);if(!Number.isFinite(e))return null;o=function(t,e){if(null===e)return"–";const i=new Intl.RelativeTimeFormat(Qt(t),{numeric:"auto"});let s=(e-Date.now())/1e3;for(const[t,e]of ie){if(Math.abs(s)<e||e===1/0)return i.format(Math.round(s),t);s/=e}return i.format(Math.round(s),"year")}(t,e)}else if(s.signed){const e=Number(n.state);if(!Number.isFinite(e))return null;const i=n.attributes.unit_of_measurement??"";o=`${function(t,e,i=1){return null!==e&&Number.isFinite(e)?new Intl.NumberFormat(Qt(t),{minimumFractionDigits:i,maximumFractionDigits:i,signDisplay:"exceptZero"}).format(e):"–"}(t,e,1)}${i?` ${i}`:""}`}else o=c(t,n);return{key:i,icon:s.icon,text:o,label:d(t,r,e.context.name),entityId:r}}function pe(t,e,i){const s=Zt(t,i.entity);return qt(s)?{key:i.entity,icon:i.icon??s.attributes.icon??"mdi:information-outline",text:c(t,s),label:i.name??d(t,i.entity,e.context.name),entityId:i.entity}:null}let me=class extends vt{render(){const t=this.model;if(!t||!this.hass)return nt;const e=h(this.hass),i=function(t,e,i){const s=i??he,r=[];for(const i of s){if("object"==typeof i&&i?.entity){const s=pe(t,e,i);s&&r.push(s);continue}if("source"===i){const i=ce(t,e);i&&r.push(i);continue}if("string"==typeof i&&i in ae){const s=ue(t,e,i);s&&r.push(s)}}return r}(this.hass,t,this.badges);return 0===i.length?null===t.currentWeight?it`<div class="chips">
            <span class="chip">
              <ha-icon icon="mdi:scale-bathroom"></ha-icon>
              ${e("badges.no_reading")}
            </span>
          </div>`:nt:it`<div class="chips">
      ${i.map(t=>this._renderBadge(t))}
    </div>`}_renderBadge(t){const e=t.label?`${t.label}: ${t.text}`:t.text;return it`<button
      class="chip"
      title=${t.label}
      aria-label=${e}
      ?disabled=${!t.entityId}
      @click=${()=>this._more(t.entityId)}
    >
      <ha-icon icon=${t.icon}></ha-icon>
      <span>${t.text}</span>
    </button>`}_more(t){t&&this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t},bubbles:!0,composed:!0}))}};me.styles=[Mt,y`
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
    `],u([Et({attribute:!1})],me.prototype,"hass",void 0),u([Et({attribute:!1})],me.prototype,"model",void 0),u([Et({attribute:!1})],me.prototype,"badges",void 0),me=u([xt("wg-badges")],me);const ge=1;class _e{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}const fe=(t=>(...e)=>({_$litDirective$:t,values:e}))(class extends _e{constructor(t){if(super(t),t.type!==ge||"class"!==t.name||t.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return" "+Object.keys(t).filter(e=>t[e]).join(" ")+" "}update(t,[e]){if(void 0===this.st){this.st=new Set,void 0!==t.strings&&(this.nt=new Set(t.strings.join(" ").split(/\s/).filter(t=>""!==t)));for(const t in e)e[t]&&!this.nt?.has(t)&&this.st.add(t);return this.render(e)}const i=t.element.classList;for(const t of this.st)t in e||(i.remove(t),this.st.delete(t));for(const t in e){const s=!!e[t];s===this.st.has(t)||this.nt?.has(t)||(s?(i.add(t),this.st.add(t)):(i.remove(t),this.st.delete(t)))}return rt}});function ye(t){return Math.round(100*t)/100}function be(t){return t.map((t,e)=>`${0===e?"M":"L"}${ye(t.x)},${ye(t.y)}`).join(" ")}function $e(t,e){return 0===t.length?"":1===t.length?`M${ye(t[0].x)},${ye(t[0].y)}`:"step"===e?function(t){const e=[`M${ye(t[0].x)},${ye(t[0].y)}`];for(let i=1;i<t.length;i++)e.push(`H${ye(t[i].x)}`,`V${ye(t[i].y)}`);return e.join(" ")}(t):"smooth"===e?function(t){if(t.length<3)return be(t);const e=[`M${ye(t[0].x)},${ye(t[0].y)}`];for(let i=0;i<t.length-1;i++){const s=t[0===i?0:i-1],r=t[i],n=t[i+1],o=t[i+2>=t.length?t.length-1:i+2],a=Math.min(r.y,n.y),l=Math.max(r.y,n.y),h=t=>Math.min(l,Math.max(a,t)),d=r.x+(n.x-s.x)/6,c=h(r.y+(n.y-s.y)/6),u=n.x-(o.x-r.x)/6,p=h(n.y-(o.y-r.y)/6);e.push(`C${ye(d)},${ye(c)} ${ye(u)},${ye(p)} ${ye(n.x)},${ye(n.y)}`)}return e.join(" ")}(t):be(t)}function ve(t){if(!Number.isFinite(t)||t<=0)return 1;const e=10**Math.floor(Math.log10(t)),i=t/e;return(i>5?10:i>2?5:i>1?2:1)*e}function we(t){return Number(t.toFixed(6))}const xe={weight:{color:"auto",width:2,dash:"",opacity:1,point_size:3},average:{color:"var(--primary-color, #03a9f4)",width:2.5,dash:"",opacity:1,point_size:0},plan:{color:"var(--secondary-text-color, #727272)",width:2,dash:"6 4",opacity:1,point_size:0},band:{color:"var(--primary-color, #03a9f4)",width:0,dash:"",opacity:.1,point_size:0},projection:{color:"var(--disabled-text-color, #9e9e9e)",width:2,dash:"2 6",opacity:1,point_size:0}};let ke=class extends vt{constructor(){super(...arguments),this.measurements=[],this.options={},this.loading=!1,this._width=0,this._hover=null,this._id=Math.random().toString(36).slice(2,9),this._clearHover=()=>{this._hover=null}}connectedCallback(){super.connectedCallback(),this._observer=new ResizeObserver(t=>{const e=Math.round(t[0]?.contentRect.width??0);e&&e!==this._width&&(this._width=e)}),this._observer.observe(this)}disconnectedCallback(){this._observer?.disconnect(),this._observer=void 0,super.disconnectedCallback()}get _height(){return this.options.height??190}_style(t){const e=(this.options.styles??{})[t];return{...xe[t],...e??{}}}_colour(t){const e=this._style(t).color;return"auto"!==e?e:i[this.model?.status??"no_goal"]??i.on_track}_shown(t,e){const i=this.options.show?.[t];return void 0===i?e:i}_window(t){return function(t,e,i,s){const r=t??"goal";if("goal"===r&&e){const t=i[i.length-1]?.t??s;return{from:e.begin,to:Math.max(e.finish,t,s)}}if("number"==typeof r&&r>0)return{from:s-r*Ut,to:s};const n=i[0]?.t??s-2592e6,o=Math.max(i[i.length-1]?.t??s,s);return{from:n,to:o>n?o:n+Ut}}(this.options.range,this.model?.goal,t,Date.now())}_renderEmpty(t){return it`<div class="empty" style=${`height:${this._height}px`}>
      <ha-icon icon="mdi:chart-line"></ha-icon>
      <span>${t}</span>
    </div>`}render(){const t=this.model;if(!t||!this.hass)return nt;const e=this._width;if(!e)return it`<div class="empty" style=${`height:${this._height}px`}></div>`;const i=this.measurements.filter(t=>Number.isFinite(t.t)&&Number.isFinite(t.v)).slice().sort((t,e)=>t.t-e.t);if(!i.length&&!t.goal)return this._renderEmpty(a(this.hass,this.loading?"chart.loading":"chart.empty"));const{from:s,to:r}=this._window(i),n=i.filter(t=>t.t>=s&&t.t<=r),o=this.options.average??0,l=o>0?function(t,e){if(e<=0||0===t.length)return[];const i=864e5*e,s=[];let r=0,n=0;for(let e=0;e<t.length;e++){for(n+=t[e].v;t[e].t-t[r].t>i;)n-=t[r].v,r+=1;s.push({t:t[e].t,v:n/(e-r+1)})}return s}(i,o).filter(t=>t.t>=s&&t.t<=r):[],h=this._height,d=this._shown("axis",!0),c=d?22:8,u=this._verticalScale(t,n,l,s,r),p=d?this._axisWidth(u):6,m=Math.max(10,e-p-8),g=Math.max(10,h-10-c),_=t=>p+(t-s)/Math.max(1,r-s)*m,f=t=>10+g-(t-u.min)/Math.max(1e-9,u.max-u.min)*g,y=this.options.line??"smooth",b=t=>t.map(t=>({x:_(t.t),y:f(t.v)})),$=`wg-plot-${this._id}`;return it`
      <div class="wrap" @pointerleave=${this._clearHover}>
        <svg
          viewBox="0 0 ${e} ${h}"
          width=${e}
          height=${h}
          role="img"
          aria-label=${this._summary(t,n)}
          @pointermove=${t=>this._onPointer(t,n,s,r,p,m)}
          @pointerdown=${t=>this._onPointer(t,n,s,r,p,m)}
        >
          <defs>
            <clipPath id=${$}>
              <rect
                x=${p}
                y=${8}
                width=${m}
                height=${g+4}
              ></rect>
            </clipPath>
          </defs>
          ${this._renderGrid(u,p,8,e,f,d)}
          <g clip-path=${`url(#${$})`}>
            ${this._renderBand(t,s,r,_,f)}
            ${this._renderPlan(t,s,r,_,f)}
            ${this._renderProjection(t,n,_,f)}
            ${this._renderSeries(b(n),b(l),y)}
            ${this._renderPoints(n,_,f,t)}
          </g>
          ${this._renderToday(s,r,_,10,g)}
          ${d?this._renderTimeAxis(s,r,_,h):nt}
          ${this._renderCursor(n,_,f,10,g)}
        </svg>
        ${this._renderTooltip(n,t)}
        <table class="sr-only">
          <caption>${a(this.hass,"chart.readings")}</caption>
          <tbody>
            ${n.slice(-12).map(e=>it`<tr>
                <td>${ee(this.hass,e.t,!0)}</td>
                <td>${te(this.hass,e.v,1)} ${t.unit}</td>
              </tr>`)}
          </tbody>
        </table>
      </div>
    `}_axisWidth(t){return 14+7*Math.max(...t.ticks.map(e=>te(this.hass,e,t.decimals).length),2)}_verticalScale(t,e,i,s,r){const n=this.options.y_axis??{},o=[];for(const t of e)o.push(t.v);for(const t of i)o.push(t.v);if(t.goal&&!1!==n.include_goal){const e=this._shown("band",!0)?t.tolerance:0;for(const i of this._planPoints(t,s,r))o.push(i.v+e,i.v-e)}return o.length||o.push(t.currentWeight??75),function(t,e={}){const i=t.filter(t=>Number.isFinite(t));let s=i.length?Math.min(...i):0,r=i.length?Math.max(...i):1;if(r-s<1e-9){const t=Math.max(.02*Math.abs(r),.5);s-=t,r+=t}const n=Math.max(1,e.ticks??4);if("tight"!==e.mode){const t=ve((r-s)/n);s=Math.floor(s/t)*t,r=Math.ceil(r/t)*t}"number"==typeof e.min&&Number.isFinite(e.min)&&(s=e.min),"number"==typeof e.max&&Number.isFinite(e.max)&&(r=e.max),r<=s&&(r=s+Math.max(ve(.02*Math.abs(s)),1)),s=we(s),r=we(r);const o=ve((r-s)/n),a=o>=1?0:o>=.1?1:2,l=[s],h=.4*o;for(let t=Math.ceil((s+h)/o)*o;t<r-h;t+=o){const e=we(t);e>s&&e<r&&l.push(e)}return r>s&&l.push(r),{min:s,max:r,step:o,ticks:l,decimals:a}}(o,{min:n.min,max:n.max,mode:"tight"===n.mode?"tight":"nice",ticks:n.ticks??4})}_renderGrid(t,e,i,s,r,n){if(!this._shown("grid",!0))return nt;const o=t.ticks.map(o=>{const a=r(o);return st`
        <line class="grid" x1=${e} x2=${s-i}
              y1=${a} y2=${a}></line>
        ${n?st`<text class="axis" x=${e-6} y=${a+3}
                        text-anchor="end">${te(this.hass,o,t.decimals)}</text>`:nt}
      `});return st`<g>${o}</g>`}_renderBand(t,e,i,s,r){if(!t.goal||!this._shown("band",!0)||t.tolerance<=0)return nt;const n=this._style("band"),o=this._planPoints(t,e,i),a=o.map(e=>({x:s(e.t),y:r(e.v+t.tolerance)})),l=o.map(e=>({x:s(e.t),y:r(e.v-t.tolerance)})),h=function(t,e){if(t.length<2||e.length<2)return"";const i=be(t),s=e.slice().reverse().map(t=>`L${ye(t.x)},${ye(t.y)}`).join(" ");return`${i} ${s} Z`}(a,l);return h?st`<path d=${h} fill=${this._colour("band")}
                     fill-opacity=${n.opacity} stroke="none"></path>`:nt}_planPoints(t,e,i){const s=t.goal,r=[e,s.begin,s.finish,i].filter(t=>t>=e&&t<=i).sort((t,e)=>t-e),n=r.filter((t,e)=>0===e||t!==r[e-1]);return n.map(t=>({t,v:Bt(s,t)}))}_renderPlan(t,e,i,s,r){if(!t.goal||!this._shown("plan",!0))return nt;const n=this._style("plan"),o=this._planPoints(t,e,i).map(t=>({x:s(t.t),y:r(t.v)}));return st`
      <path d=${$e(o,"linear")} fill="none"
            stroke=${this._colour("plan")} stroke-width=${n.width}
            stroke-dasharray=${n.dash||nt}
            stroke-opacity=${n.opacity}
            stroke-linecap="round"></path>
      <circle cx=${s(t.goal.finish)} cy=${r(t.goal.targetWeight)}
              r="3.5" fill=${this._colour("plan")}></circle>
    `}_renderProjection(t,e,i,s){if(!this._shown("projection",!0)||!t.goal||null===t.projectedDate||!e.length)return nt;const r=this._style("projection"),n=e[e.length-1],o=$e([{x:i(n.t),y:s(n.v)},{x:i(t.projectedDate),y:s(t.goal.targetWeight)}],"linear");return st`<path d=${o} fill="none" stroke=${this._colour("projection")}
                     stroke-width=${r.width}
                     stroke-dasharray=${r.dash||nt}
                     stroke-linecap="round"></path>`}_renderSeries(t,e,i){const s=this._style("weight"),r=this._style("average"),n=this._shown("average",!0)&&e.length>1;return st`
      <path d=${$e(t,i)} fill="none"
            stroke=${this._colour("weight")}
            stroke-width=${s.width}
            stroke-dasharray=${s.dash||nt}
            stroke-opacity=${n?.45*s.opacity:s.opacity}
            stroke-linecap="round" stroke-linejoin="round"></path>
      ${n?st`<path d=${$e(e,i)} fill="none"
                      stroke=${this._colour("average")}
                      stroke-width=${r.width}
                      stroke-dasharray=${r.dash||nt}
                      stroke-opacity=${r.opacity}
                      stroke-linecap="round" stroke-linejoin="round"></path>`:nt}
    `}_renderPoints(t,e,i,s){const r=this._style("weight");if(!this._shown("points",!0)||r.point_size<=0)return nt;const n=Math.ceil(t.length/120),o=this._colour("weight"),a=t.filter((e,i)=>i%n===0||i===t.length-1).map(t=>{const n=null!==s.goal&&Math.abs(t.v-Bt(s.goal,t.t))>s.tolerance;return st`<circle cx=${e(t.t)} cy=${i(t.v)} r=${r.point_size}
                           fill=${n?"var(--card-background-color, #fff)":o}
                           stroke=${o} stroke-width="1.5"></circle>`});return st`<g>${a}</g>`}_renderToday(t,e,i,s,r){const n=Date.now();return!this._shown("today",!0)||n<t||n>e?nt:st`<line class="today" x1=${i(n)} x2=${i(n)}
                     y1=${s} y2=${s+r}></line>`}_renderTimeAxis(t,e,i,s){const r=this._width<260?2:this._width<420?3:5,n=[];for(let o=0;o<=r;o++){const a=t+(e-t)*o/r,l=0===o?"start":o===r?"end":"middle";n.push(st`<text class="axis" x=${i(a)} y=${s-6}
                  text-anchor=${l}>${ee(this.hass,a)}</text>`)}return st`<g>${n}</g>`}_renderCursor(t,e,i,s,r){if(null===this._hover||!t[this._hover])return nt;const n=t[this._hover];return st`
      <line class="cursor" x1=${e(n.t)} x2=${e(n.t)}
            y1=${s} y2=${s+r}></line>
      <circle cx=${e(n.t)} cy=${i(n.v)} r="5" fill="none"
              stroke=${this._colour("weight")} stroke-width="2"></circle>
    `}_renderTooltip(t,e){if(null===this._hover||!t[this._hover])return nt;const i=t[this._hover],s=e.goal?Bt(e.goal,i.t):null,r=null===s?null:i.v-s;return it`<div
      class=${fe({tooltip:!0,right:this._hover>t.length/2})}
      role="status"
    >
      <strong>${te(this.hass,i.v,1)} ${e.unit}</strong>
      <span>${ee(this.hass,i.t,!0)}</span>
      ${null===r?nt:it`<span
            >${a(this.hass,"chart.vs_plan",{value:`${r>0?"+":""}${te(this.hass,r,1)}`,unit:e.unit})}</span
          >`}
    </div>`}_onPointer(t,e,i,s,r,n){if(!e.length)return;const o=t.currentTarget.getBoundingClientRect(),a=(t.clientX-o.left-r)/Math.max(1,n),l=function(t,e){if(0===t.length)return-1;let i=0,s=1/0;for(let r=0;r<t.length;r++){const n=Math.abs(t[r].t-e);n<s&&(s=n,i=r)}return i}(e,i+Math.min(1,Math.max(0,a))*(s-i));l!==this._hover&&(this._hover=l)}_summary(t,e){const i=h(this.hass),s=t.unit,r=[i("chart.summary_readings",{count:e.length}),null===t.currentWeight?i("chart.summary_no_weight"):i("chart.summary_current",{value:te(this.hass,t.currentWeight,1),unit:s})];return null!==t.deviation&&r.push(i(t.deviation>=0?"chart.summary_above":"chart.summary_below",{value:te(this.hass,Math.abs(t.deviation),1),unit:s})),t.goal&&r.push(i("chart.summary_plan",{start:te(this.hass,t.goal.startWeight,1),target:te(this.hass,t.goal.targetWeight,1),unit:s})),r.join(", ")}};ke.styles=y`
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
  `,u([Et({attribute:!1})],ke.prototype,"hass",void 0),u([Et({attribute:!1})],ke.prototype,"model",void 0),u([Et({attribute:!1})],ke.prototype,"measurements",void 0),u([Et({attribute:!1})],ke.prototype,"options",void 0),u([Et({type:Boolean})],ke.prototype,"loading",void 0),u([St()],ke.prototype,"_width",void 0),u([St()],ke.prototype,"_hover",void 0),ke=u([xt("wg-chart")],ke);let Ae=class extends vt{constructor(){super(...arguments),this.open=!1,this._error=null}render(){const t=this.model;if(!t||!this.hass)return nt;const e=t.context.entities,i=t.goalMode;return it`
      <details ?open=${this.open}>
        <summary>
          <ha-icon icon="mdi:target"></ha-icon>
          <span>${a(this.hass,"goal.title")}</span>
        </summary>
        <div class="grid">
          ${this._numberRow(e.start_weight,t.unit,!1)}
          ${this._numberRow(e.target_weight,t.unit,"rate"===i)}
          ${this._numberRow(e.rate_per_week,`${t.unit}/w`,"target"===i,.01)}
          ${this._dateRow(e.start_date)}
          ${this._dateRow(e.end_date)}
        </div>
        ${null===i?nt:it`<p id="derived" class="hint muted">
              ${a(this.hass,"goal.derived_hint")}
            </p>`}
        ${this._error?it`<div class="error" role="alert">${this._error}</div>`:nt}
      </details>
    `}_numberRow(t,e,i,s=.1){if(!t||!this.hass)return nt;const r=this.hass.states[t];return r?it`<label class="field">
      <span class="muted">
        ${d(this.hass,t,this.model?.context.name)}
        ${i?it`<span class="tag">${a(this.hass,"goal.derived")}</span>`:nt}
      </span>
      <span class="input">
        <input
          type="number"
          step=${s}
          min=${Jt(this.hass,t,"min")??0}
          max=${Jt(this.hass,t,"max")??1e3}
          .value=${"unknown"===r.state?"":r.state}
          ?disabled=${i||"unavailable"===r.state}
          aria-describedby=${i?"derived":nt}
          @change=${e=>this._setNumber(t,e.target.value)}
        />
        <span class="unit muted">${e}</span>
      </span>
    </label>`:nt}_dateRow(t){if(!t||!this.hass?.states[t])return nt;const e=this.hass.states[t];return it`<label class="field">
      <span class="muted"
        >${d(this.hass,t,this.model?.context.name)}</span
      >
      <span class="input">
        <input
          type="date"
          .value=${"unknown"===e.state||"unavailable"===e.state?"":e.state}
          ?disabled=${"unavailable"===e.state}
          @change=${e=>this._setDate(t,e.target.value)}
        />
      </span>
    </label>`}async _setNumber(t,e){const i=Number(e.replace(",","."));if(this.hass&&Number.isFinite(i))try{await this.hass.callService("number","set_value",{value:i},{entity_id:t}),this._error=null}catch(t){this._error=oe(this.hass,t)}}async _setDate(t,e){if(this.hass&&e)try{await this.hass.callService("date","set_value",{date:e},{entity_id:t}),this._error=null}catch(t){this._error=oe(this.hass,t)}}};Ae.styles=[Mt,y`
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
    `],u([Et({attribute:!1})],Ae.prototype,"hass",void 0),u([Et({attribute:!1})],Ae.prototype,"model",void 0),u([Et({type:Boolean})],Ae.prototype,"open",void 0),u([St()],Ae.prototype,"_error",void 0),Ae=u([xt("wg-goal-editor")],Ae);let Ee=class extends vt{constructor(){super(...arguments),this.name="",this.compact=!1,this._openStatus=()=>{const t=this.model?.context.entities.status;t&&this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t},bubbles:!0,composed:!0}))}}render(){const t=this.model;if(!t)return nt;const e=t.status,r=i[e]??i.no_goal;if(this.compact)return it`
        <div class="compact">
          <span class="name" title=${this.name}>${this.name}</span>
          ${null===t.currentWeight?nt:it`<span class="now" style=${`color:${r}`}
                >${te(this.hass,t.currentWeight,1)}
                ${t.unit}</span
              >`}
        </div>
      `;const n=c(this.hass,Zt(this.hass,t.context.entities.status))||e;return it`
      <div class="header">
        <div class="badge" style=${`background:${r}`}>
          <ha-icon icon=${this.icon??"mdi:scale-bathroom"}></ha-icon>
        </div>
        <div class="titles">
          <span class="name" title=${this.name}>${this.name}</span>
          ${t.endDate?it`<span class="muted sub"
                >${a(this.hass,"header.until",{date:c(this.hass,Zt(this.hass,t.context.entities.end_date))||t.endDate})}</span
              >`:nt}
        </div>
        <button
          class="status"
          style=${`color:${r}`}
          @click=${this._openStatus}
          aria-label=${a(this.hass,"header.status",{status:n})}
        >
          <ha-icon icon=${s[e]??"mdi:information-outline"}></ha-icon>
          <span>${n}</span>
        </button>
      </div>
    `}};Ee.styles=[Mt,y`
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
    `],u([Et({attribute:!1})],Ee.prototype,"hass",void 0),u([Et({attribute:!1})],Ee.prototype,"model",void 0),u([Et()],Ee.prototype,"name",void 0),u([Et()],Ee.prototype,"icon",void 0),u([Et({type:Boolean})],Ee.prototype,"compact",void 0),Ee=u([xt("wg-header")],Ee);let Se=class extends vt{render(){const t=this.model;if(!t||!this.hass)return nt;const e=h(this.hass),s=i[t.status]??i.no_goal;return it`
      <div class="hero">
        <button
          class="value"
          @click=${()=>this._more(t.context.entities.weight)}
        >
          <span class="number"
            >${te(this.hass,t.currentWeight,1)}</span
          >
          <span class="unit muted">${t.unit}</span>
        </button>
        ${null===t.deviation?nt:it`<div class="deviation" style=${`color:${s}`}>
              <ha-icon
                icon=${t.deviation>0?"mdi:arrow-up":t.deviation<0?"mdi:arrow-down":"mdi:equal"}
              ></ha-icon>
              <span>
                ${0===t.deviation?e("hero.on_plan"):`${te(this.hass,Math.abs(t.deviation),1)} ${t.unit} ${t.deviation>0?e("hero.above_plan"):e("hero.below_plan")}`}
              </span>
            </div>`}
      </div>
    `}_more(t){t&&this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t},bubbles:!0,composed:!0}))}};Se.styles=[Mt,y`
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
    `],u([Et({attribute:!1})],Se.prototype,"hass",void 0),u([Et({attribute:!1})],Se.prototype,"model",void 0),Se=u([xt("wg-hero")],Se);let Me=class extends vt{render(){const t=this.model;if(!t||null===t.weightProgress&&null===t.timeProgress)return nt;const e=i[t.status]??i.on_track;return it`
      ${this._bar(a(this.hass,"progress.weight"),t.weightProgress,e)}
      ${this._bar(a(this.hass,"progress.time"),t.timeProgress,"var(--secondary-text-color, #727272)")}
    `}_bar(t,e,i){if(null===e)return it`<div class="line">
        <span class="label muted">${t}</span>
        <span class="track"></span>
        <span class="value muted">–</span>
      </div>`;const s=Math.min(100,Math.max(0,e));return it`<div class="line">
      <span class="label muted">${t}</span>
      <span
        class="track"
        role="progressbar"
        aria-label=${a(this.hass,"progress.aria",{label:t})}
        aria-valuenow=${Math.round(s)}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <span class="fill" style=${`width:${s}%;background:${i}`}></span>
      </span>
      <span class="value">${te(this.hass,s,0)}%</span>
    </div>`}};Me.styles=[Mt,y`
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
    `],u([Et({attribute:!1})],Me.prototype,"hass",void 0),u([Et({attribute:!1})],Me.prototype,"model",void 0),Me=u([xt("wg-progress")],Me);let Ce=class extends re{static getStubConfig(t,i){const s=i.find(t=>t.endsWith("_status"));return{type:`custom:${e}`,entity:s??i[0]}}static async getConfigElement(){return await Promise.resolve().then(function(){return We}),document.createElement(`${e}-editor`)}chartOptions(){const t=this._config??{},e={source:t.source,range:t.range,average:t.average,line:t.line,height:t.height,y_axis:t.y_axis,show:t.show,styles:t.styles},i=t.chart??{};return{...e,...i,y_axis:{...e.y_axis??{},...i.y_axis??{}},show:{...e.show??{},...i.show??{}},styles:{...e.styles??{},...i.styles??{}}}}needsMeasurements(){return!1!==this._config?.show_chart}getCardSize(){let t=2;return!1!==this._config?.show_chart&&(t+=3),!1!==this._config?.show_progress&&(t+=1),!1===this._config?.show_record&&!1===this._config?.show_restart||(t+=1),t}render(){const t=this.missingGoalMessage();if(t)return this.renderProblem(t);const e=this._model,i=this._config;if(!e||!i||!this.hass)return it`<ha-card></ha-card>`;const s=!1!==i.show_chart,r=!1!==i.show_record||!1!==i.show_restart;return it`
      <ha-card>
        <div class="content">
          ${!1===i.show_header?nt:it`<wg-header
                .hass=${this.hass}
                .model=${e}
                .name=${i.name??e.context.name}
                .icon=${i.icon}
                ?compact=${"compact"===i.header}
              ></wg-header>`}

          ${!1===i.show_hero?nt:it`<wg-hero .hass=${this.hass} .model=${e}></wg-hero>`}

          ${!1===i.show_badges?nt:it`<wg-badges
                .hass=${this.hass}
                .model=${e}
                .badges=${i.badges}
              ></wg-badges>`}

          ${s?it`
                ${this._fetchError?it`<div class="notice" role="alert">${this._fetchError}</div>`:nt}
                <wg-chart
                  .hass=${this.hass}
                  .model=${e}
                  .measurements=${this._measurements}
                  .options=${this.chartOptions()}
                  .loading=${this._loading}
                ></wg-chart>
              `:nt}

          ${!1===i.show_progress?nt:it`<wg-progress .hass=${this.hass} .model=${e}></wg-progress>`}

          ${r?it`<wg-actions
                .hass=${this.hass}
                .model=${e}
                .showRecord=${!1!==i.show_record}
                .showRestart=${!1!==i.show_restart}
              ></wg-actions>`:nt}

          ${!1===i.show_goal_editor?nt:it`<wg-goal-editor
                .hass=${this.hass}
                .model=${e}
                .open=${"no_goal"===e.status}
              ></wg-goal-editor>`}
        </div>
      </ha-card>
    `}};Ce.styles=[Mt,y`
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
    `],Ce=u([xt(e)],Ce),window.customCards=window.customCards??[];const Pe=navigator.language||"en",ze=[{type:e,name:l(Pe,"picker.card_name"),description:l(Pe,"picker.card_description"),preview:!0,documentationURL:"https://github.com/julezdean/ha-weight-goal"}];for(const t of ze)window.customCards.some(e=>e.type===t.type)||window.customCards.push(t);let Ne;function je(e,i){if("source"===i)return a(e,"badge.source.sensor");const s=`component.${t}.entity.sensor.${i}.name`,r=e?.localize?.(s);if("string"==typeof r&&r)return r;for(const s of["number","date"]){const r=e?.localize?.(`component.${t}.entity.${s}.${i}.name`);if("string"==typeof r&&r)return r}return i}function De(t){return[{name:"",type:"grid",schema:[{name:"source",selector:{select:{mode:"dropdown",options:[{value:"measurements",label:t("editor.source_measurements")},{value:"history",label:t("editor.source_history")}]}}},{name:"range",selector:{select:{mode:"dropdown",custom_value:!0,options:[{value:"goal",label:t("editor.range_goal")},{value:"30",label:t("editor.range_30")},{value:"90",label:t("editor.range_90")},{value:"365",label:t("editor.range_365")},{value:"all",label:t("editor.range_all")}]}}},{name:"line",selector:{select:{mode:"dropdown",options:[{value:"smooth",label:t("editor.line_smooth")},{value:"linear",label:t("editor.line_linear")},{value:"step",label:t("editor.line_step")}]}}},{name:"average",selector:{number:{min:0,max:60,step:1,mode:"box",unit_of_measurement:"d"}}},{name:"height",selector:{number:{min:100,max:500,step:10,mode:"box",unit_of_measurement:"px"}}}]},{name:"y_axis",type:"expandable",title:t("editor.y_axis"),schema:[{name:"",type:"grid",schema:[{name:"mode",selector:{select:{mode:"dropdown",options:[{value:"nice",label:t("editor.mode_nice")},{value:"tight",label:t("editor.mode_tight")}]}}},{name:"include_goal",selector:{boolean:{}}},{name:"min",selector:{number:{min:0,max:500,step:.5,mode:"box"}}},{name:"max",selector:{number:{min:0,max:500,step:.5,mode:"box"}}},{name:"ticks",selector:{number:{min:2,max:10,step:1,mode:"box"}}}]}]},{name:"show",type:"expandable",title:t("editor.layers"),schema:[{name:"",type:"grid",schema:[{name:"band",selector:{boolean:{}}},{name:"plan",selector:{boolean:{}}},{name:"average",selector:{boolean:{}}},{name:"projection",selector:{boolean:{}}},{name:"points",selector:{boolean:{}}},{name:"today",selector:{boolean:{}}},{name:"grid",selector:{boolean:{}}},{name:"axis",selector:{boolean:{}}}]}]}]}console.info("%c WEIGHT-GOAL-CARD %c 0.5.1 ","color:#fff;background:#03a9f4;font-weight:700","color:#03a9f4;background:#fff;font-weight:700");const Re={entity:"editor.entity",name:"editor.name",icon:"editor.icon",badges:"editor.badges",source:"editor.source",range:"editor.range",line:"editor.line",average:"editor.average",height:"editor.height",mode:"editor.mode",include_goal:"editor.include_goal",min:"editor.min",max:"editor.max",ticks:"editor.ticks",band:"editor.band",plan:"editor.plan",projection:"editor.projection",points:"editor.points",today:"editor.today",grid:"editor.grid",axis:"editor.axis",show_header:"editor.show_header",header:"editor.header",show_hero:"editor.show_hero",show_badges:"editor.show_badges",show_chart:"editor.show_chart",show_progress:"editor.show_progress",show_record:"editor.show_record",show_restart:"editor.show_restart",show_goal_editor:"editor.show_goal_editor"},Te={entity:"editor.entity_help",badges:"editor.badges_help",source:"editor.source_help",average:"editor.average_help",range:"editor.range_help",mode:"editor.mode_help",include_goal:"editor.include_goal_help",min:"editor.axis_bound_help",max:"editor.axis_bound_help"};let Oe=class extends vt{constructor(){super(...arguments),this._ready=!1,this._changed=t=>{t.stopPropagation();const e={...t.detail.value};"string"==typeof e.range&&/^\d+$/.test(e.range)&&(e.range=Number(e.range));const i=(this._config?.badges??[]).filter(t=>"object"==typeof t);i.length&&(e.badges=[...e.badges??[],...i]),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}}setConfig(t){this._config=t}connectedCallback(){super.connectedCallback(),(Ne||(Ne=(async()=>{if(customElements.get("ha-form"))return;const t=await(window.loadCardHelpers?.());if(!t)return;const e=t.createCardElement({type:"entities",entities:[]}).constructor.getConfigElement;e&&await e()})().catch(()=>{})),Ne).then(()=>{this._ready=!0})}_schema(){const e=h(this.hass);return[{name:"entity",required:!0,selector:{entity:{integration:t,domain:"sensor"}}},{name:"",type:"grid",schema:[{name:"name",selector:{text:{}}},{name:"icon",selector:{icon:{}}}]},(i=this.hass,{name:"badges",selector:{select:{multiple:!0,mode:"list",options:le.map(t=>({value:t,label:je(i,t)}))}}}),{name:"",type:"expandable",title:e("editor.sections"),schema:[{name:"",type:"grid",schema:[{name:"show_header",selector:{boolean:{}}},{name:"show_hero",selector:{boolean:{}}},{name:"show_badges",selector:{boolean:{}}},{name:"show_chart",selector:{boolean:{}}},{name:"show_progress",selector:{boolean:{}}},{name:"show_record",selector:{boolean:{}}},{name:"show_restart",selector:{boolean:{}}},{name:"show_goal_editor",selector:{boolean:{}}}]},{name:"header",selector:{select:{mode:"dropdown",options:[{value:"full",label:e("editor.header_full")},{value:"compact",label:e("editor.header_compact")}]}}}]},{name:"",type:"expandable",title:e("editor.chart"),schema:De(e)}];var i}render(){return this.hass&&this._config?this._ready||customElements.get("ha-form")?it`
      <ha-form
        .hass=${this.hass}
        .data=${this._defaults()}
        .schema=${this._schema()}
        .computeLabel=${t=>function(t,e){const i=Re[e.name];return i?a(t,i):e.title??e.name}(this.hass,t)}
        .computeHelper=${t=>function(t,e){const i=Te[e.name];return i?a(t,i):void 0}(this.hass,t)}
        @value-changed=${this._changed}
      ></ha-form>
    `:it`<p class="fallback">
        ${a(this.hass,"editor.loading")}
      </p>`:nt}_defaults(){const t=this._config;return{show_header:!0,header:"full",show_hero:!0,show_badges:!0,show_chart:!0,show_progress:!0,show_record:!0,show_restart:!0,show_goal_editor:!0,source:"measurements",range:"goal",line:"smooth",average:7,...t,badges:(t.badges??he).filter(t=>"string"==typeof t),y_axis:{mode:"nice",include_goal:!0,...t.y_axis??{}},show:{band:!0,plan:!0,average:!0,projection:!0,points:!0,today:!0,grid:!0,axis:!0,...t.show??{}}}}};Oe.styles=y`
    .fallback {
      color: var(--secondary-text-color, #727272);
      font-size: 14px;
    }
  `,u([Et({attribute:!1})],Oe.prototype,"hass",void 0),u([St()],Oe.prototype,"_config",void 0),u([St()],Oe.prototype,"_ready",void 0),Oe=u([xt(`${e}-editor`)],Oe);var We=Object.freeze({__proto__:null,get WeightGoalCardEditor(){return Oe}});
