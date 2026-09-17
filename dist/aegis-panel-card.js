/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=globalThis,e$2=t$1.ShadowRoot&&(void 0===t$1.ShadyCSS||t$1.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$3=new WeakMap;let n$2 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$2&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$3.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$3.set(s,t));}return t}toString(){return this.cssText}};const r$2=t=>new n$2("string"==typeof t?t:t+"",void 0,s$2),i$3=(t,...e)=>{const o=1===t.length?t[0]:e.reduce((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1],t[0]);return new n$2(o,t,s$2)},S$1=(s,o)=>{if(e$2)s.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of o){const o=document.createElement("style"),n=t$1.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$2?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$2(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:i$2,defineProperty:e$1,getOwnPropertyDescriptor:h$1,getOwnPropertyNames:r$1,getOwnPropertySymbols:o$2,getPrototypeOf:n$1}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$1=c$1?c$1.emptyScript:"",p$1=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$2(t,s),b$1={attribute:true,type:String,converter:u$1,reflect:false,useDefault:false,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1 = class y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b$1){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$1(this.prototype,t,h);}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$1(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??b$1}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$1(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$1(t),...o$2(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$2(s));}else void 0!==s&&i.push(c$2(s));return i}static _$Eu(t,s){const i=s.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach(t=>t.hostConnected?.());}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.());}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&true===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e;const r=h.fromAttribute(s,t.type);this[e]=r??this._$Ej?.get(e)??r,this._$Em=null;}}requestUpdate(t,s,i,e=false,h){if(void 0!==t){const r=this.constructor;if(false===e&&(h=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,s,i);} false===this.isUpdatePending&&(this._$ES=this._$EP());}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),true!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),true===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t));}async _$EP(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:t}=i,e=this[s];true!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e);}}let t=false;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(s)):this._$EM();}catch(s){throw t=false,this._$EM(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EM(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM();}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$1?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=globalThis,i$1=t=>t,s$1=t.trustedTypes,e=s$1?s$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,h="$lit$",o$1=`lit$${Math.random().toFixed(9).slice(2)}$`,n="?"+o$1,r=`<${n}>`,l=document,c=()=>l.createComment(""),a=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u=Array.isArray,d=t=>u(t)||"function"==typeof t?.[Symbol.iterator],f="[ \t\n\f\r]",v=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_=/-->/g,m=/>/g,p=RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g=/'/g,$=/"/g,y=/^(?:script|style|textarea|title)$/i,x=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),b=x(1),E=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),C=new WeakMap,P=l.createTreeWalker(l,129);function V(t,i){if(!u(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==e?e.createHTML(i):i}const N=(t,i)=>{const s=t.length-1,e=[];let n,l=2===i?"<svg>":3===i?"<math>":"",c=v;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,f=0;for(;f<s.length&&(c.lastIndex=f,u=c.exec(s),null!==u);)f=c.lastIndex,c===v?"!--"===u[1]?c=_:void 0!==u[1]?c=m:void 0!==u[2]?(y.test(u[2])&&(n=RegExp("</"+u[2],"g")),c=p):void 0!==u[3]&&(c=p):c===p?">"===u[0]?(c=n??v,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?p:'"'===u[3]?$:g):c===$||c===g?c=p:c===_||c===m?c=v:(c=p,n=void 0);const x=c===p&&t[i+1].startsWith("/>")?" ":"";l+=c===v?s+r:d>=0?(e.push(a),s.slice(0,d)+h+s.slice(d)+o$1+x):s+o$1+(-2===d?i:x);}return [V(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),e]};class S{constructor({strings:t,_$litType$:i},e){let r;this.parts=[];let l=0,a=0;const u=t.length-1,d=this.parts,[f,v]=N(t,i);if(this.el=S.createElement(f,e),P.currentNode=this.el.content,2===i||3===i){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=P.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(h)){const i=v[a++],s=r.getAttribute(t).split(o$1),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:l,name:e[2],strings:s,ctor:"."===e[1]?I:"?"===e[1]?L:"@"===e[1]?z:H}),r.removeAttribute(t);}else t.startsWith(o$1)&&(d.push({type:6,index:l}),r.removeAttribute(t));if(y.test(r.tagName)){const t=r.textContent.split(o$1),i=t.length-1;if(i>0){r.textContent=s$1?s$1.emptyScript:"";for(let s=0;s<i;s++)r.append(t[s],c()),P.nextNode(),d.push({type:2,index:++l});r.append(t[i],c());}}}else if(8===r.nodeType)if(r.data===n)d.push({type:2,index:l});else {let t=-1;for(;-1!==(t=r.data.indexOf(o$1,t+1));)d.push({type:7,index:l}),t+=o$1.length-1;}l++;}}static createElement(t,i){const s=l.createElement("template");return s.innerHTML=t,s}}function M(t,i,s=t,e){if(i===E)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=a(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=M(t,h._$AS(t,i.values),h,e)),i}class R{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??l).importNode(i,true);P.currentNode=e;let h=P.nextNode(),o=0,n=0,r=s[0];for(;void 0!==r;){if(o===r.index){let i;2===r.type?i=new k(h,h.nextSibling,this,t):1===r.type?i=new r.ctor(h,r.name,r.strings,this,t):6===r.type&&(i=new Z(h,this,t)),this._$AV.push(i),r=s[++n];}o!==r?.index&&(h=P.nextNode(),o++);}return P.currentNode=l,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class k{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=M(this,t,i),a(t)?t===A||null==t||""===t?(this._$AH!==A&&this._$AR(),this._$AH=A):t!==this._$AH&&t!==E&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):d(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==A&&a(this._$AH)?this._$AA.nextSibling.data=t:this.T(l.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=S.createElement(V(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new R(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=C.get(t.strings);return void 0===i&&C.set(t.strings,i=new S(t)),i}k(t){u(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new k(this.O(c()),this.O(c()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(false,true,s);t!==this._$AB;){const s=i$1(t).nextSibling;i$1(t).remove(),t=s;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class H{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=A,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=M(this,t,i,0),o=!a(t)||t!==this._$AH&&t!==E,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=M(this,e[s+n],i,n),r===E&&(r=this._$AH[n]),o||=!a(r)||r!==this._$AH[n],r===A?t=A:t!==A&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class I extends H{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===A?void 0:t;}}class L extends H{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==A);}}class z extends H{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=M(this,t,i,0)??A)===E)return;const s=this._$AH,e=t===A&&s!==A||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==A&&(s===A||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class Z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){M(this,t);}}const B=t.litHtmlPolyfillSupport;B?.(S,k),(t.litHtmlVersions??=[]).push("3.3.3");const D=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new k(i.insertBefore(c(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=globalThis;class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=D(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return E}}i._$litElement$=true,i["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i});const o=s.litElementPolyfillSupport;o?.({LitElement:i});(s.litElementVersions??=[]).push("4.2.2");

function validateConfig(input, deviceCard = false) {
    if (!input || typeof input !== "object")
        throw new Error("Card configuration is required");
    const config = {
        appearance: "default",
        show_temperature: true,
        battery_warning: 20,
        allow_bypass: false,
        ...(!deviceCard ? { group_by: "area" } : {}),
        ...input,
    };
    if (!["default", "bubble"].includes(String(config.appearance)))
        throw new Error("appearance must be default or bubble");
    for (const key of ["show_temperature", "allow_bypass"])
        if (typeof config[key] !== "boolean")
            throw new Error(`${key} must be boolean`);
    if (typeof config.battery_warning !== "number" ||
        !Number.isFinite(config.battery_warning) ||
        config.battery_warning < 0 ||
        config.battery_warning > 100)
        throw new Error("battery_warning must be 0–100");
    if (input.title !== undefined && typeof input.title !== "string")
        throw new Error("title must be text");
    if (deviceCard && (typeof input.device !== "string" || !input.device.trim()))
        throw new Error("device must be an exact device ID or name");
    if (!deviceCard &&
        !["area", "device", "none"].includes(String(config.group_by)))
        throw new Error("group_by must be area, device or none");
    if (input.alarm_entity !== undefined &&
        (typeof input.alarm_entity !== "string" ||
            !input.alarm_entity.startsWith("alarm_control_panel.")))
        throw new Error("alarm_entity must be an alarm_control_panel entity");
    return config;
}

const ROLES = [
    "alarm",
    "tamper",
    "problem",
    "connectivity",
    "battery",
    "bypass",
    "update",
    "temperature",
    "signal",
    "other",
];
function emptyEntities() {
    return Object.fromEntries(ROLES.map((role) => [role, []]));
}
const labelRoles = {
    aegis_alarm: { role: "alarm", domains: ["binary_sensor"] },
    aegis_tamper: { role: "tamper", domains: ["binary_sensor"] },
    aegis_connectivity: { role: "connectivity", domains: ["binary_sensor"] },
    aegis_battery: { role: "battery", domains: ["sensor", "binary_sensor"] },
    aegis_temperature: { role: "temperature", domains: ["sensor"] },
};
const labelNameRoles = {
    "Aegis: Alarm": "aegis_alarm",
    "Aegis: Tamper": "aegis_tamper",
    "Aegis: Connectivity": "aegis_connectivity",
    "Aegis: Batteries": "aegis_battery",
    "Aegis: Temperature": "aegis_temperature",
};
function roleFor(entry, state, recognizedLabels) {
    const domain = entry.entity_id.split(".", 1)[0];
    for (const label of entry.labels ?? []) {
        const match = labelRoles[recognizedLabels.get(label) ?? label];
        if (match?.domains.includes(domain))
            return match.role;
    }
    const deviceClass = typeof state?.attributes.device_class === "string" ? state.attributes.device_class : undefined;
    if (domain === "binary_sensor") {
        if (deviceClass === "smoke" || deviceClass === "heat")
            return "alarm";
        if (deviceClass === "tamper")
            return "tamper";
        if (deviceClass === "problem")
            return "problem";
        if (deviceClass === "connectivity")
            return "connectivity";
        if (deviceClass === "battery")
            return "battery";
    }
    if (domain === "sensor") {
        if (deviceClass === "battery")
            return "battery";
        if (deviceClass === "temperature")
            return "temperature";
        if (deviceClass === "signal_strength")
            return "signal";
    }
    if (domain === "update" && deviceClass === "firmware")
        return "update";
    const suffixes = [entry.entity_id.toLowerCase(), entry.unique_id.toLowerCase()];
    const endsWith = (suffix) => suffixes.some((value) => value.endsWith(suffix));
    if (domain === "switch" && endsWith("_bypass"))
        return "bypass";
    if (domain === "update" && endsWith("_firmware"))
        return "update";
    if (domain === "binary_sensor" && (endsWith("_smoke_detected") || endsWith("_high_temperature")))
        return "alarm";
    if (domain === "binary_sensor" && endsWith("_connectivity"))
        return "connectivity";
    if (domain === "binary_sensor" && endsWith("_problem"))
        return "problem";
    if (domain === "binary_sensor" && endsWith("_tamper"))
        return "tamper";
    if ((domain === "sensor" || domain === "binary_sensor") && (endsWith("_battery_level") || endsWith("_low_battery")))
        return "battery";
    if (domain === "sensor" && endsWith("_temperature"))
        return "temperature";
    if (domain === "sensor" && endsWith("_signal_strength"))
        return "signal";
    return "other";
}
function discoverDevices(snapshot, states) {
    const byDevice = new Map();
    for (const entity of snapshot.entities) {
        if (entity.platform !== "aegis_ajax" || !entity.device_id)
            continue;
        const entries = byDevice.get(entity.device_id) ?? [];
        entries.push(entity);
        byDevice.set(entity.device_id, entries);
    }
    const areas = new Map(snapshot.areas.map((area) => [area.area_id, area]));
    const recognizedLabels = new Map(snapshot.labels
        .filter((label) => labelNameRoles[label.name])
        .map((label) => [label.label_id, labelNameRoles[label.name]]));
    const devices = [];
    for (const registry of snapshot.devices) {
        const registeredEntities = byDevice.get(registry.id);
        if (!registeredEntities || registry.disabled_by)
            continue;
        const entities = emptyEntities();
        let disabledCount = 0;
        for (const registryEntity of registeredEntities) {
            if (registryEntity.disabled_by) {
                disabledCount += 1;
                continue;
            }
            const entity = { entityId: registryEntity.entity_id, registry: registryEntity };
            entities[roleFor(registryEntity, states[registryEntity.entity_id], recognizedLabels)].push(entity);
        }
        const areaRegistry = registry.area_id ? areas.get(registry.area_id) : undefined;
        devices.push({
            id: registry.id,
            name: registry.name_by_user || registry.name,
            area: areaRegistry ? { id: areaRegistry.area_id, name: areaRegistry.name } : undefined,
            registry,
            entities,
            unknownEntries: entities.other,
            disabledCount,
        });
    }
    return devices;
}
function finding(entity, state) {
    return { ...entity, state };
}
function isUnknown(state) {
    return !state || state.state === "unknown";
}
function deviceHealth(device, states, batteryWarning) {
    const health = {
        alarm: [], tamper: [], problem: [], offline: [], lowBattery: [], bypassed: [], update: [], unknown: [], online: "unknown",
    };
    const allEntities = Object.values(device.entities).flat();
    for (const entity of allEntities) {
        const state = states[entity.entityId];
        if (state?.state === "unavailable")
            health.offline.push(finding(entity, state));
        else if (isUnknown(state))
            health.unknown.push(finding(entity, state));
    }
    for (const role of ["alarm", "tamper", "problem", "update"]) {
        for (const entity of device.entities[role]) {
            const state = states[entity.entityId];
            if (state?.state === "on")
                health[role].push(finding(entity, state));
        }
    }
    const numericBatteries = [];
    for (const entity of device.entities.battery) {
        const state = states[entity.entityId];
        const binary = entity.entityId.startsWith("binary_sensor.");
        const numericState = !binary && state && state.state.trim() !== "" ? Number(state.state) : undefined;
        const value = numericState !== undefined && Number.isFinite(numericState) ? numericState : undefined;
        const reading = {
            ...finding(entity, state),
            binary,
            value,
            unit: typeof state?.attributes.unit_of_measurement === "string" ? state.attributes.unit_of_measurement : undefined,
        };
        if (!binary && state && state.state !== "unknown" && state.state !== "unavailable" && value === undefined) {
            health.unknown.push(finding(entity, state));
        }
        if (reading.value !== undefined)
            numericBatteries.push(reading);
        if ((binary && state?.state === "on") || (reading.value !== undefined && reading.value < batteryWarning)) {
            health.lowBattery.push(reading);
        }
    }
    health.minBattery = numericBatteries.reduce((lowest, reading) => lowest === undefined || reading.value < lowest.value ? reading : lowest, undefined);
    for (const entity of device.entities.bypass) {
        const state = states[entity.entityId];
        if (state?.state !== "on")
            continue;
        const attribute = state.attributes.deactivation_kinds;
        const deactivationKinds = Array.isArray(attribute) ? attribute.filter((kind) => typeof kind === "string") : [];
        const bypass = {
            ...finding(entity, state),
            deactivationKinds,
            wholeDevice: deactivationKinds.some((kind) => kind.endsWith("_whole")),
        };
        health.bypassed.push(bypass);
    }
    const connectivity = device.entities.connectivity.map((entity) => states[entity.entityId]);
    const hasOff = connectivity.some((state) => state?.state === "off" || state?.state === "unavailable");
    const hasOn = connectivity.some((state) => state?.state === "on");
    if (health.offline.length > 0 || hasOff)
        health.online = "offline";
    else if (hasOn)
        health.online = "online";
    return health;
}

const UPDATE_EVENTS = [
    "entity_registry_updated",
    "device_registry_updated",
    "area_registry_updated",
    "label_registry_updated",
];
const sharedByConnection = new WeakMap();
function errorMessage(error) {
    if (error instanceof Error)
        return error.message;
    if (typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string") {
        return error.message;
    }
    return String(error);
}
function isUnsupportedCommand(error) {
    return (typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "unknown_command");
}
class SharedRegistryWatcher {
    constructor(connection) {
        this.connection = connection;
        this.callbacks = new Set();
        this.subscriptions = new Map(UPDATE_EVENTS.map((eventType) => [eventType, { pending: false }]));
        this.generation = 0;
        this.stopped = false;
        this.handleDisconnected = () => {
            this.connected = false;
            this.generation += 1;
            this.snapshot = undefined;
            this.fetchError = undefined;
            this.publish({ disconnected: true });
        };
        this.handleReady = () => {
            if (this.stopped)
                return;
            this.connected = true;
            // Missed registry events are not replayed after HA restores the socket.
            this.snapshot = undefined;
            this.fetchError = undefined;
            this.publish({});
            void this.refresh();
        };
        this.connected = connection.connected;
        connection.addEventListener("disconnected", this.handleDisconnected);
        connection.addEventListener("ready", this.handleReady);
        if (this.connected)
            void this.refresh();
        else
            this.handleDisconnected();
    }
    ensureSubscriptions() {
        for (const eventType of UPDATE_EVENTS) {
            const subscription = this.subscriptions.get(eventType);
            if (subscription.pending || subscription.unsubscribe)
                continue;
            subscription.pending = true;
            void this.connection
                .subscribeEvents(() => {
                void this.refresh();
            }, eventType)
                .then((unsubscribe) => {
                subscription.pending = false;
                if (this.stopped) {
                    unsubscribe();
                    return;
                }
                subscription.unsubscribe = unsubscribe;
                subscription.error = undefined;
                this.publishCurrent();
            })
                .catch((error) => {
                subscription.pending = false;
                if (this.stopped)
                    return;
                subscription.error = errorMessage(error);
                this.publishCurrent();
            });
        }
    }
    add(callback) {
        this.callbacks.add(callback);
        if (this.value)
            callback(this.value);
        let active = true;
        return () => {
            if (!active)
                return;
            active = false;
            this.callbacks.delete(callback);
            if (this.callbacks.size === 0)
                this.destroy();
        };
    }
    async refresh() {
        if (this.stopped)
            return;
        if (!this.connected || !this.connection.connected) {
            this.handleDisconnected();
            return;
        }
        // HA restores successful and pending subscriptions itself. Only retry failures.
        this.ensureSubscriptions();
        const generation = ++this.generation;
        const send = (type) => this.connection.sendMessagePromise({ type });
        const entities = send("config/entity_registry/list");
        const devices = send("config/device_registry/list");
        const areas = send("config/area_registry/list");
        const labels = send("config/label_registry/list").catch((error) => {
            if (isUnsupportedCommand(error))
                return [];
            throw error;
        });
        try {
            const [resolvedEntities, resolvedDevices, resolvedAreas, resolvedLabels] = await Promise.all([entities, devices, areas, labels]);
            if (generation !== this.generation || this.stopped)
                return;
            this.snapshot = {
                entities: resolvedEntities,
                devices: resolvedDevices,
                areas: resolvedAreas,
                labels: resolvedLabels,
            };
            this.fetchError = undefined;
            this.publishCurrent();
        }
        catch (error) {
            if (generation !== this.generation || this.stopped)
                return;
            this.fetchError = errorMessage(error);
            this.publishCurrent();
        }
    }
    publishCurrent() {
        if (!this.connected || !this.connection.connected) {
            this.publish({ disconnected: true });
            return;
        }
        const subscriptionError = [...this.subscriptions.values()].find((state) => state.error)?.error;
        const error = subscriptionError ?? this.fetchError;
        if (error)
            this.publish({ error });
        else if (this.snapshot)
            this.publish({ snapshot: this.snapshot });
    }
    publish(value) {
        if (this.stopped)
            return;
        this.value = value;
        for (const callback of this.callbacks)
            callback(value);
    }
    destroy() {
        if (this.stopped)
            return;
        this.stopped = true;
        this.generation += 1;
        this.connection.removeEventListener("disconnected", this.handleDisconnected);
        this.connection.removeEventListener("ready", this.handleReady);
        for (const subscription of this.subscriptions.values()) {
            subscription.unsubscribe?.();
            subscription.unsubscribe = undefined;
        }
        sharedByConnection.delete(this.connection);
    }
}
function watchRegistries(hass, callback) {
    let watcher = sharedByConnection.get(hass.connection);
    if (!watcher) {
        watcher = new SharedRegistryWatcher(hass.connection);
        sharedByConnection.set(hass.connection, watcher);
    }
    return watcher.add(callback);
}
/** Explicit retry also recovers subscriptions that failed during startup. */
function refreshRegistries(hass) {
    void sharedByConnection.get(hass.connection)?.refresh();
}

const en = {
    details: "Details",
    heat: "Heat",
    smoke: "Smoke",
    loading: "Loading Aegis devices…",
    error: "Unable to load registries",
    disconnected: "Home Assistant disconnected. Waiting to reconnect…",
    retry: "Retry",
    empty: "No Aegis devices found",
    online: "online",
    offline: "offline",
    unknown: "unknown",
    devices: "devices",
    battery: "Battery",
    alarm: "Alarm",
    tamper: "Tamper",
    problem: "Problem",
    bypass: "Bypass",
    update: "Update available",
    lowBattery: "Low battery",
    temperature: "Temperature",
    signal: "Signal",
    other: "Other",
    connectivity: "Connectivity",
    close: "Close",
    cancel: "Cancel",
    confirm: "Confirm",
    bypassAll: "Bypass available devices",
    restoreAll: "Restore available devices",
    restore: "Restore",
    pending: "Sending…",
    disabled: "disabled entities — entity settings",
    noArea: "No area",
    noMatch: "No matching Aegis device. Use an exact device ID or name.",
    ambiguous: "Device name is ambiguous. Use an exact device ID.",
    alarmControl: "Alarm panel",
    clear: "No active alerts",
    elapsed: "elapsed",
    scope: "Available switches",
    changed: "Device scope changed. Review and confirm again.",
    failed: "Some actions failed",
    sent: "Request sent. Waiting for Home Assistant state.",
    deactivation: "Deactivation kinds",
    caution: "Bypass may deactivate tamper only or the whole device, depending on integration settings.",
    selection: "Selected devices",
};
const nb = {
    details: "Detaljer",
    heat: "Varme",
    smoke: "Røyk",
    loading: "Laster Aegis-enheter…",
    error: "Kunne ikke laste registre",
    disconnected: "Home Assistant er frakoblet. Venter på ny tilkobling…",
    retry: "Prøv igjen",
    empty: "Fant ingen Aegis-enheter",
    online: "tilkoblet",
    offline: "frakoblet",
    unknown: "ukjent",
    devices: "enheter",
    battery: "Batteri",
    alarm: "Alarm",
    tamper: "Sabotasje",
    problem: "Problem",
    bypass: "Forbikoble",
    update: "Oppdatering tilgjengelig",
    lowBattery: "Lavt batteri",
    temperature: "Temperatur",
    signal: "Signal",
    other: "Andre",
    connectivity: "Tilkobling",
    close: "Lukk",
    cancel: "Avbryt",
    confirm: "Bekreft",
    bypassAll: "Forbikoble tilgjengelige enheter",
    restoreAll: "Gjenopprett tilgjengelige enheter",
    restore: "Gjenopprett",
    pending: "Sender…",
    disabled: "deaktiverte entiteter — entitetsinnstillinger",
    noArea: "Uten område",
    noMatch: "Ingen Aegis-enhet funnet. Bruk eksakt enhets-ID eller navn.",
    ambiguous: "Enhetsnavnet er ikke entydig. Bruk eksakt enhets-ID.",
    alarmControl: "Alarmpanel",
    clear: "Ingen aktive varsler",
    elapsed: "forløpt",
    scope: "Tilgjengelige brytere",
    changed: "Enhetsutvalget er endret. Kontroller og bekreft på nytt.",
    failed: "Noen handlinger mislyktes",
    sent: "Forespørsel sendt. Venter på tilstand fra Home Assistant.",
    deactivation: "Deaktiveringstyper",
    caution: "Forbikobling kan deaktivere bare sabotasje eller hele enheten, avhengig av integrasjonens innstillinger.",
    selection: "Valgte enheter",
};
function localize(language, key, count) {
    const norwegian = /^(nb|no|nn)(-|$)/.test(language ?? "");
    if (count === 1 && key === "devices")
        return norwegian ? "enhet" : "device";
    if (count === 1 && key === "disabled")
        return norwegian
            ? "deaktivert entitet — entitetsinnstillinger"
            : "disabled entity — entity settings";
    return (norwegian ? nb : en)[key];
}

const styles = i$3 `
  :host {
    display: block;
    color: var(--primary-text-color, #242c38);
    font-family: var(--paper-font-body1_-_font-family, system-ui);
  }
  * {
    box-sizing: border-box;
  }
  ha-card {
    display: block;
    padding: 20px;
    background: var(--ha-card-background, var(--card-background-color, #fff));
    border: var(--ha-card-border-width, 1px) solid
      var(--ha-card-border-color, #ddd);
    border-radius: var(--ha-card-border-radius, 16px);
    box-shadow: var(--ha-card-box-shadow);
  }
  .bubble {
    background: var(
      --bubble-main-background-color,
      var(--ha-card-background, #fff)
    );
    border: var(--bubble-border, none);
    border-radius: var(--bubble-border-radius, 32px);
    box-shadow: var(--bubble-box-shadow, var(--ha-card-box-shadow));
  }
  .bubble .device {
    background: var(
      --bubble-secondary-background-color,
      var(--secondary-background-color, #f3f5f8)
    );
    border-radius: var(--bubble-sub-button-border-radius, 20px);
  }
  .bubble .symbol {
    background: var(--bubble-icon-background-color, #e6eaf0);
    border-radius: var(--bubble-icon-border-radius, 50%);
    color: var(--bubble-accent-color, var(--primary-color, #03a9f4));
  }
  .bubble .actions button {
    background: var(
      --bubble-sub-button-background-color,
      var(--secondary-background-color, #eef1f5)
    );
    border-radius: var(--bubble-sub-button-border-radius, 18px);
  }
  h2 {
    font-size: 1.25rem;
    margin: 0 0 8px;
  }
  h3 {
    font-size: 1rem;
    margin: 18px 0 8px;
  }
  p {
    line-height: 1.5;
  }
  .summary {
    color: var(--secondary-text-color, #526071);
    font-size: 0.9rem;
    line-height: 1.65;
    margin-bottom: 16px;
  }
  .device {
    width: 100%;
    text-align: left;
    display: flex;
    gap: 12px;
    align-items: center;
    margin: 8px 0;
    padding: 14px;
    background: var(--secondary-background-color, #f6f7fa);
    border: 1px solid transparent;
    border-radius: 12px;
    color: inherit;
  }
  .symbol {
    flex: 0 0 40px;
    height: 40px;
    display: grid;
    place-items: center;
    background: #e6eaf0;
    border-radius: 50%;
    font-size: 1.3rem;
  }
  .device strong {
    display: block;
  }
  .device > span:last-child {
    min-width: 0;
  }
  .readings {
    font-size: 0.85rem;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    line-height: 1.6;
    margin-top: 4px;
  }
  .chip {
    border-radius: 999px;
    padding: 2px 8px;
    background: var(--card-background-color, #fff);
    border: 1px solid var(--divider-color, #d8dce2);
    overflow-wrap: anywhere;
  }
  .alarm-chip {
    color: #a51414;
    background: #fff0f0;
    border-color: #d44848;
  }
  .attention-chip {
    color: #7a4300;
    background: #fff3d9;
    border-color: #c68a25;
  }
  .device-group {
    border: 1px solid var(--divider-color, #d8dce2);
    border-radius: 16px;
    padding: 8px;
    margin: 12px 0;
  }
  .device-group .device {
    margin: 0;
  }
  .disabled-notice {
    font-size: 0.8rem;
  }
  .alarm {
    border-left: 5px solid var(--error-color, #c62828) !important;
  }
  .tamper {
    border-left: 5px solid var(--warning-color, #b36a00) !important;
  }
  .takeover {
    background: var(--error-color, #ba1a1a);
    color: white;
    border-radius: 12px;
    padding: 16px;
    margin: 12px 0;
  }
  .takeover button {
    overflow-wrap: anywhere;
    white-space: normal;
    color: inherit;
    text-align: left;
    background: transparent;
    border: 1px solid currentColor;
    width: 100%;
    margin-top: 8px;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }
  button {
    font: inherit;
    cursor: pointer;
    border: 1px solid var(--divider-color, #aab1bc);
    border-radius: 10px;
    padding: 10px 14px;
    color: inherit;
    background: var(--card-background-color, #fff);
    min-height: 44px;
  }
  button:disabled {
    opacity: 0.55;
    cursor: wait;
  }
  button:focus-visible,
  a:focus-visible {
    outline: 3px solid var(--primary-color, #0277bd);
    outline-offset: 3px;
  }
  a {
    color: var(--primary-color, #0277bd);
  }
  dialog {
    color: var(--primary-text-color, #242c38);
    background: var(--card-background-color, #fff);
    border: 1px solid var(--divider-color, #ddd);
    border-radius: 18px;
    padding: 24px;
    width: min(560px, calc(100vw - 24px));
    max-height: 85dvh;
    overflow: auto;
    box-shadow: 0 16px 60px #0006;
  }
  dialog::backdrop {
    background: #0007;
  }
  .entity {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    margin: 6px 0;
    text-align: left;
    overflow-wrap: anywhere;
  }
  .feedback {
    padding: 10px;
    background: var(--secondary-background-color, #eef1f5);
    border-radius: 8px;
    overflow-wrap: anywhere;
  }
  .muted {
    color: var(--secondary-text-color, #526071);
  }
  @media (max-width: 400px) {
    ha-card {
      padding: 14px;
    }
    .device {
      padding: 10px;
    }
    .actions button {
      flex: 1;
    }
    dialog {
      padding: 16px;
    }
  }
`;

class AegisCardBase extends i {
    constructor() {
        super(...arguments);
        this.deviceCard = false;
        this.registry = {};
        // Invalidations outlive a reconnect, even when all readings return unchanged.
        this.registryEpoch = 0;
    }
    t(key, count) {
        return localize(this.ha?.language, key, count);
    }
    set hass(value) {
        const replace = this.ha?.connection !== value.connection;
        this.ha = value;
        if (replace) {
            this.stop?.();
            this.stop = undefined;
            this.registry = {};
            if (this.isConnected)
                this.watch();
        }
        this.requestUpdate();
    }
    get hass() {
        return this.ha;
    }
    setConfig(config) {
        this.config = validateConfig(config, this.deviceCard);
        this.requestUpdate();
    }
    getCardSize() {
        return this.deviceCard ? 3 : 5;
    }
    connectedCallback() {
        super.connectedCallback();
        this.watch();
        this.timer = setInterval(() => this.requestUpdate(), 1000);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.stop?.();
        this.stop = undefined;
        this.registry = {};
        this.registryEpoch += 1;
        this.requestUpdate();
        clearInterval(this.timer);
        this.closeDialog();
    }
    watch() {
        if (this.ha && !this.stop)
            this.stop = watchRegistries(this.ha, (value) => {
                this.registry = value;
                if (!value.snapshot)
                    this.registryEpoch += 1;
                this.requestUpdate();
            });
    }
    retry() {
        this.registry = {};
        if (this.ha)
            refreshRegistries(this.ha);
        this.requestUpdate();
    }
    get devices() {
        if (!this.registry.snapshot || !this.ha)
            return [];
        const devices = discoverDevices(this.registry.snapshot, this.ha.states);
        if (!this.deviceCard)
            return devices;
        const selected = String(this.config?.device ?? "");
        const exact = devices.find((d) => d.id === selected);
        return exact ? [exact] : devices.filter((d) => d.name === selected);
    }
    health(device) {
        return deviceHealth(device, this.ha.states, this.config.battery_warning);
    }
    moreInfo(entityId) {
        this.closeDialog();
        this.dispatchEvent(new CustomEvent("hass-more-info", {
            detail: { entityId },
            bubbles: true,
            composed: true,
        }));
    }
    async details(device) {
        this.detailId = device.id;
        this.requestUpdate();
        await this.updateComplete;
        this.shadowRoot.querySelector("#details")?.showModal();
    }
    closeDialog() {
        this.shadowRoot
            ?.querySelectorAll("dialog")
            .forEach((dialog) => dialog.close());
    }
    reading(entityId) {
        const state = this.ha?.states[entityId];
        return !state || state.state === "unknown"
            ? this.t("unknown")
            : state.state === "unavailable"
                ? this.t("offline")
                : `${state.state} ${state.attributes.unit_of_measurement ?? ""}`.trim();
    }
    badges(device, health) {
        const active = [
            "alarm",
            "tamper",
            "problem",
            "lowBattery",
            "bypassed",
            "update",
        ]
            .filter((key) => health[key].length)
            .map((key) => this.t(key === "bypassed" ? "bypass" : key));
        if (health.unknown.length)
            active.push(`${health.unknown.length} ${this.t("unknown")}`);
        if (!active.length && health.online === "online")
            active.push(this.t("clear"));
        const chip = (label, value, kind = "") => b `<span class="chip ${kind}"
        >${label}${value !== undefined ? `: ${value}` : ""}</span
      >`;
        return b `${chip(this.t(health.online))}${active.map((label) => chip(label, undefined, label === this.t("alarm") ? "alarm-chip" : label === this.t("tamper") || label === this.t("bypass") ? "attention-chip" : ""))}
    ${device.entities.battery.length ? chip(this.t("battery"), health.minBattery?.value !== undefined ? `${health.minBattery.value}${health.minBattery.unit ?? "%"}` : device.entities.battery.map((e) => this.reading(e.entityId)).join(", ")) : A}
    ${device.entities.signal.map((e) => chip(this.t("signal"), this.reading(e.entityId)))}
    ${this.config?.show_temperature ? device.entities.temperature.map((e) => chip(this.t("temperature"), this.reading(e.entityId))) : A}`;
    }
    rank(h) {
        return h.alarm.length
            ? 0
            : h.problem.length || h.tamper.length || h.bypassed.length
                ? 1
                : h.online === "offline"
                    ? 2
                    : h.lowBattery.length
                        ? 3
                        : 4;
    }
    renderActions(_device) {
        return A;
    }
    renderFeedback() {
        return A;
    }
    renderConfirmation() {
        return A;
    }
    render() {
        if (!this.config)
            return A;
        const devices = this.devices;
        let sorted = [...devices].sort((a, b) => this.rank(this.health(a)) - this.rank(this.health(b)) ||
            a.name.localeCompare(b.name));
        const alarms = devices.flatMap((device) => this.health(device).alarm.map((alarm) => ({ device, alarm })));
        const detail = devices.find((d) => d.id === this.detailId);
        const panel = this.config;
        if (!this.deviceCard && panel.group_by === "area") {
            const groups = new Map();
            for (const device of sorted) {
                const key = device.area?.id ?? "";
                groups.set(key, [...(groups.get(key) ?? []), device]);
            }
            sorted = [...groups.values()].flat();
        }
        const battery = devices
            .map((d) => this.health(d).minBattery)
            .filter((v) => v?.value !== undefined)
            .sort((a, b) => a.value - b.value);
        const disabledCount = devices.reduce((sum, device) => sum + device.disabledCount, 0);
        let previousArea;
        const registryError = this.registry.disconnected
            ? this.t("disconnected")
            : this.registry.error
                ? `${this.t("error")}: ${this.registry.error}`
                : undefined;
        return b `<ha-card class=${this.config.appearance}
        ><h2>
          ${this.config.title ?? (this.deviceCard ? (devices[0]?.name ?? "Aegis") : "Aegis")}
        </h2>
        ${registryError
            ? b `<p role="alert">${registryError}</p>
                ${this.registry.disconnected ? A : b `<button @click=${this.retry}>${this.t("retry")}</button>`}`
            : !this.registry.snapshot
                ? b `<p role="status">${this.t("loading")}</p>`
                : this.deviceCard && devices.length !== 1
                    ? b `<p role="alert">
                    ${this.t(devices.length ? "ambiguous" : "noMatch")}
                  </p>`
                    : !devices.length
                        ? b `<p>${this.t("empty")}</p>`
                        : b `
                      ${!alarms.length
                            ? b `<div class="summary">
                              ${devices.length}
                              ${this.t("devices", devices.length)} ·
                              ${["online", "offline", "unknown"].map((status) => b `${devices.filter((d) => this.health(d).online === status).length} ${this.t(status)} · `)}${battery.length ? b `${this.t("battery")}: ${battery[0].value}${battery[0].unit ?? ""}` : A}
                            </div>`
                            : A}
                      ${alarms.length
                            ? b `<section
                              class="takeover"
                              aria-label=${this.t("alarm")}
                            >
                              <strong>⚠ ${this.t("alarm")}</strong>${alarms.map(({ device, alarm }) => {
                                const since = Date.parse(alarm.state?.last_changed ?? "");
                                const seconds = Number.isFinite(since)
                                    ? Math.max(0, Math.floor((Date.now() - since) / 1000))
                                    : undefined;
                                return b `<button
                                    data-alarm
                                    @click=${() => this.moreInfo(alarm.entityId)}
                                  >
                                    ${device.name} ·
                                    ${device.area?.name ?? this.t("noArea")}<br />${alarm.state?.attributes.friendly_name ?? alarm.registry.name ?? (alarm.state?.attributes.device_class === "heat" ? this.t("heat") : this.t("smoke"))}
                                    ·
                                    ${seconds === undefined ? this.t("unknown") : `${Math.floor(seconds / 60)}m ${seconds % 60}s`}
                                    ${this.t("elapsed")}
                                  </button>`;
                            })}
                              ${devices.filter((device) => this.health(device).alarm.length).map((device) => b `<button data-device=${device.id} @click=${() => this.details(device)}>${this.t("details")}: ${device.name}</button>`)}
                            </section>`
                            : A}
                      ${(alarms.length ? [] : sorted).map((device) => {
                            const health = this.health(device);
                            const area = device.area?.name ?? this.t("noArea");
                            const heading = !this.deviceCard &&
                                panel.group_by === "area" &&
                                previousArea !== (device.area?.id ?? "");
                            previousArea = device.area?.id ?? "";
                            return b `<section
                          ?data-device-group=${panel.group_by === "device"}
                          class=${panel.group_by === "device" ? "device-group" : ""}
                        >
                          ${heading ? b `<h3>${area}</h3>` : A}<button
                            data-device=${device.id}
                            class="device ${health.alarm.length ? "alarm" : health.tamper.length ? "tamper" : ""}"
                            @click=${() => this.details(device)}
                          >
                            <span class="symbol" aria-hidden="true"
                              >${health.alarm.length ? "⚠" : "◈"}</span
                            ><span
                              ><strong>${device.name}</strong
                              ><span class="muted">${area}</span
                              ><span class="readings"
                                >${this.badges(device, health)}</span
                              ></span
                            >
                          </button>
                        </section>`;
                        })}${alarms.length ? A : this.renderActions(this.deviceCard ? devices[0] : undefined)}
                      ${disabledCount ? b `<p class="disabled-notice"><a href="/config/entities">${disabledCount} ${this.t("disabled", disabledCount)}</a></p>` : A}
                    `}${panel.alarm_entity && this.ha?.states[panel.alarm_entity] ? b `<div class="actions"><button data-alarm-control @click=${() => this.moreInfo(panel.alarm_entity)}>${this.t("alarmControl")}</button></div>` : A}${this.renderFeedback()}</ha-card
      >
      <dialog id="details" aria-labelledby="detail-title">
        <h2 id="detail-title">${detail?.name}</h2>
        ${detail
            ? b `${Object.entries(detail.entities).map(([role, entities]) => role === "temperature" && !this.config?.show_temperature
                ? A
                : entities.length
                    ? b `<h3>${this.t(role)}</h3>
                        ${entities.map((entity) => b `<button class="entity" @click=${() => this.moreInfo(entity.entityId)}><span>${this.ha?.states[entity.entityId]?.attributes.friendly_name ?? entity.registry.name ?? entity.entityId}</span><span>${this.reading(entity.entityId)}</span></button>`)}`
                    : A)}${this.health(detail).bypassed.map((bypass) => b `<p>
                      ${this.t("deactivation")}:
                      ${bypass.deactivationKinds.join(", ") || this.t("unknown")}
                    </p>
                    <p>${this.t("caution")}</p>`)}${detail.disabledCount ? b `<p><a href="/config/entities">${detail.disabledCount} ${this.t("disabled", detail.disabledCount)}</a></p>` : A}${this.renderActions(detail)}${this.renderFeedback()}`
            : A}
        <div class="actions">
          <button
            @click=${() => this.shadowRoot.querySelector("#details").close()}
          >
            ${this.t("close")}
          </button>
        </div>
      </dialog>
      ${this.renderConfirmation()}`;
    }
}
AegisCardBase.styles = styles;

/** Shared confirmed action boundary. Service responses never mutate HA state. */
class AegisActionCard extends AegisCardBase {
    constructor() {
        super(...arguments);
        this.pending = false;
        this.feedback = "";
    }
    targets(deviceId) {
        if (!this.config?.allow_bypass ||
            !this.registry.snapshot ||
            this.registry.error ||
            !this.isConnected ||
            !this.hass.connection.connected)
            return [];
        const devices = this.devices;
        if (this.deviceCard && devices.length !== 1)
            return [];
        return devices
            .filter((d) => !deviceId || d.id === deviceId)
            .flatMap((device) => device.entities.bypass
            .filter((entity) => entity.entityId.startsWith("switch."))
            .flatMap((entity) => {
            const state = this.hass.states[entity.entityId];
            return state && (state.state === "on" || state.state === "off")
                ? [
                    {
                        entityId: entity.entityId,
                        deviceId: device.id,
                        name: device.name,
                        state: state.state,
                        kinds: state.attributes.deactivation_kinds ?? [],
                    },
                ]
                : [];
        }));
    }
    async ask(restore, device) {
        if (this.pending)
            return;
        const targets = this.targets(device?.id);
        if (!targets.length)
            return;
        this.confirmation = {
            deviceId: device?.id,
            restore,
            targets,
            config: JSON.stringify(this.config),
            connection: this.hass.connection,
            registryEpoch: this.registryEpoch,
        };
        this.feedback = "";
        this.requestUpdate();
        await this.updateComplete;
        this.shadowRoot.querySelector("#confirmation").showModal();
    }
    valid(confirmation, remaining = confirmation.targets) {
        const current = new Map(this.targets(confirmation.deviceId).map((target) => [
            target.entityId,
            target,
        ]));
        return (this.isConnected &&
            confirmation.connection === this.hass.connection &&
            confirmation.registryEpoch === this.registryEpoch &&
            confirmation.config === JSON.stringify(this.config) &&
            this.config?.allow_bypass === true &&
            remaining.every((target) => JSON.stringify(target) ===
                JSON.stringify(current.get(target.entityId))));
    }
    cancel() {
        if (this.pending)
            return;
        this.shadowRoot.querySelector("#confirmation").close();
        this.confirmation = undefined;
        this.requestUpdate();
    }
    async execute() {
        const confirmation = this.confirmation;
        if (!confirmation || this.pending)
            return;
        if (!this.valid(confirmation)) {
            this.feedback = this.t("changed");
            this.cancel();
            this.requestUpdate();
            return;
        }
        this.pending = true;
        this.requestUpdate();
        const failures = [];
        for (const [index, target] of confirmation.targets.entries()) {
            // Completed calls may already have published new HA state. Only the
            // unprocessed confirmed targets must still match their captured readings.
            if (!this.valid(confirmation, confirmation.targets.slice(index))) {
                failures.push(this.t("changed"));
                break;
            }
            try {
                if (!this.hass.callService)
                    throw new Error("Home Assistant service API unavailable");
                await this.hass.callService("switch", confirmation.restore ? "turn_off" : "turn_on", { entity_id: target.entityId });
            }
            catch (error) {
                failures.push(`${target.name}: ${error instanceof Error ? error.message : typeof error === "object" && error && "message" in error ? String(error.message) : String(error)}`);
            }
        }
        this.pending = false;
        this.feedback = failures.length
            ? `${this.t("failed")}: ${failures.join("; ")}`
            : this.t("sent");
        this.cancel();
        this.requestUpdate();
    }
    renderActions(device) {
        if (!this.config?.allow_bypass || !this.targets(device?.id).length)
            return A;
        return b `<div class="actions">
      <button
        data-bypass
        ?disabled=${this.pending}
        @click=${() => this.ask(false, device)}
      >
        ${this.t(device ? "bypass" : "bypassAll")}</button
      ><button
        data-restore
        ?disabled=${this.pending}
        @click=${() => this.ask(true, device)}
      >
        ${this.t(device ? "restore" : "restoreAll")}
      </button>
    </div>`;
    }
    renderFeedback() {
        return this.feedback
            ? b `<p class="feedback" role="status">${this.feedback}</p>`
            : A;
    }
    renderConfirmation() {
        const scope = this.confirmation;
        return b `<dialog
      id="confirmation"
      aria-labelledby="confirm-title"
      @cancel=${(event) => {
            if (this.pending)
                event.preventDefault();
            else
                this.confirmation = undefined;
        }}
    >
      <h2 id="confirm-title">
        ${this.t(scope?.restore ? "restore" : "bypass")}
      </h2>
      ${scope
            ? b `<p>${this.t("scope")}: ${scope.targets.length}</p>
              <p>
                ${this.t("selection")}:
                ${[...new Set(scope.targets.map((target) => target.name))].join(", ")}
              </p>
              <p>${this.t("caution")}</p>
              ${scope.targets.map((target) => b `<p>${target.name} — ${target.entityId}<br />${this.t("deactivation")}: ${Array.isArray(target.kinds) && target.kinds.length ? target.kinds.join(", ") : this.t("unknown")}</p>`)}`
            : A}
      <div class="actions">
        <button data-cancel ?disabled=${this.pending} @click=${this.cancel}>
          ${this.t("cancel")}</button
        ><button data-confirm ?disabled=${this.pending} @click=${this.execute}>
          ${this.t(this.pending ? "pending" : "confirm")}
        </button>
      </div>
    </dialog>`;
    }
}

class AegisDeviceCard extends AegisActionCard {
    constructor() {
        super(...arguments);
        this.deviceCard = true;
    }
    static getConfigElement() {
        return document.createElement("aegis-device-card-editor");
    }
    static getStubConfig() {
        return { type: "custom:aegis-device-card", device: "" };
    }
}
customElements.define("aegis-device-card", AegisDeviceCard);

const copy = {
    en: {
        title: "Title",
        appearance: "Appearance",
        default: "Default",
        bubble: "Bubble",
        temperature: "Show temperature",
        battery: "Battery warning (%)",
        bypass: "Allow bypass controls",
        grouping: "Group by",
        area: "Area",
        deviceGroup: "Device",
        none: "No grouping",
        alarm: "Alarm entity",
        noAlarm: "No alarm entity",
        device: "Device",
        selectDevice: "Select an Aegis device",
        deviceHelp: "Choose a device discovered from the Aegis for Ajax integration.",
        fallback: "Registry discovery failed. Enter an exact Aegis device ID or unique name.",
        requiredDevice: "Select or enter an Aegis device.",
        threshold: "Enter a number from 0–100.",
    },
    nb: {
        title: "Tittel",
        appearance: "Utseende",
        default: "Standard",
        bubble: "Bubble",
        temperature: "Vis temperatur",
        battery: "Batterivarsel (%)",
        bypass: "Tillat forbikoblingskontroller",
        grouping: "Grupper etter",
        area: "Område",
        deviceGroup: "Enhet",
        none: "Ingen gruppering",
        alarm: "Alarmentitet",
        noAlarm: "Ingen alarmentitet",
        device: "Enhet",
        selectDevice: "Velg en Aegis-enhet",
        deviceHelp: "Velg en enhet funnet fra Aegis for Ajax-integrasjonen.",
        fallback: "Registeroppslag mislyktes. Skriv inn eksakt Aegis-enhets-ID eller unikt navn.",
        requiredDevice: "Velg eller skriv inn en Aegis-enhet.",
        threshold: "Skriv inn et tall fra 0–100.",
    },
};
class AegisEditor extends i {
    constructor() {
        super(...arguments);
        this.config = {};
        this.registryFailed = false;
        this.invalidBattery = false;
        this.invalidDevice = false;
    }
    set hass(value) {
        const previousConnection = this._hass?.connection;
        this._hass = value;
        this.requestUpdate("hass");
        if (this.deviceCard &&
            value &&
            previousConnection !== value.connection &&
            this.isConnected)
            this.startRegistryWatch();
    }
    get hass() {
        return this._hass;
    }
    setConfig(config) {
        this.config = { ...config };
        this.invalidBattery = false;
        this.invalidDevice = false;
        this.requestUpdate();
    }
    connectedCallback() {
        super.connectedCallback();
        if (this.deviceCard && this._hass)
            this.startRegistryWatch();
    }
    disconnectedCallback() {
        this.stopRegistry?.();
        this.stopRegistry = undefined;
        this.watchedConnection = undefined;
        super.disconnectedCallback();
    }
    get text() {
        return /^(nb|no|nn)(-|$)/.test(this.hass?.language ?? "")
            ? copy.nb
            : copy.en;
    }
    startRegistryWatch() {
        const hass = this._hass;
        if (!hass || this.watchedConnection === hass.connection)
            return;
        this.stopRegistry?.();
        this.watchedConnection = hass.connection;
        this.deviceChoices = undefined;
        this.registryFailed = false;
        this.requestUpdate();
        this.stopRegistry = watchRegistries(hass, (value) => {
            this.registryFailed = Boolean(value.error || value.disconnected);
            this.deviceChoices = value.snapshot
                ? this.choicesFromSnapshot(value.snapshot)
                : [];
            this.requestUpdate();
        });
    }
    choicesFromSnapshot(snapshot) {
        const ids = new Set(snapshot.entities
            .filter((entry) => entry.platform === "aegis_ajax" && entry.device_id)
            .map((entry) => entry.device_id));
        return snapshot.devices
            .filter((device) => ids.has(device.id) && !device.disabled_by)
            .map((device) => ({
            id: device.id,
            name: device.name_by_user || device.name,
        }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }
    updated(changed) {
        super.updated(changed);
        const battery = this.renderRoot.querySelector('[name="battery_warning"]');
        battery?.setAttribute("aria-invalid", String(this.invalidBattery));
        const device = this.renderRoot.querySelector('[name="device"]');
        device?.setAttribute("aria-invalid", String(this.invalidDevice));
    }
    emit(config) {
        this.config = config;
        this.dispatchEvent(new CustomEvent("config-changed", {
            detail: { config },
            bubbles: true,
            composed: true,
        }));
        this.requestUpdate();
    }
    changed(event) {
        const control = event.target;
        const key = control.name;
        if (!key)
            return;
        const next = { ...this.config };
        if (key === "battery_warning") {
            const value = Number(control.value);
            this.invalidBattery =
                control.value.trim() === "" ||
                    !Number.isFinite(value) ||
                    value < 0 ||
                    value > 100;
            this.requestUpdate();
            if (this.invalidBattery)
                return;
            next[key] = value;
        }
        else if (key === "device" && !control.value.trim()) {
            this.invalidDevice = true;
            this.requestUpdate();
            return;
        }
        else if (control instanceof HTMLInputElement &&
            control.type === "checkbox") {
            next[key] = control.checked;
        }
        else if ((key === "title" || key === "alarm_entity") &&
            !control.value.trim()) {
            delete next[key];
        }
        else {
            next[key] = control.value;
        }
        this.invalidBattery = false;
        this.invalidDevice = false;
        this.emit(next);
    }
    commonFields() {
        const t = this.text;
        return b `
      <label
        >${t.title}<input
          name="title"
          .value=${String(this.config.title ?? "")}
          @change=${this.changed}
      /></label>
      <label
        >${t.appearance}
        <select
          name="appearance"
          .value=${String(this.config.appearance ?? "default")}
          @change=${this.changed}
        >
          <option value="default">${t.default}</option>
          <option value="bubble">${t.bubble}</option>
        </select>
      </label>
      <label class="check"
        ><input
          type="checkbox"
          name="show_temperature"
          .checked=${this.config.show_temperature !== false}
          @change=${this.changed}
        />${t.temperature}</label
      >
      <label
        >${t.battery}<input
          type="number"
          min="0"
          max="100"
          step="1"
          name="battery_warning"
          .value=${String(this.config.battery_warning ?? 20)}
          @change=${this.changed}
          aria-describedby="battery-error"
      /></label>
      ${this.invalidBattery ? b `<p id="battery-error" class="error" role="alert">${t.threshold}</p>` : A}
      <label class="check"
        ><input
          type="checkbox"
          name="allow_bypass"
          .checked=${this.config.allow_bypass === true}
          @change=${this.changed}
        />${t.bypass}</label
      >
    `;
    }
}
AegisEditor.styles = i$3 `
    :host {
      display: block;
      color: var(--primary-text-color);
    }
    .form {
      display: grid;
      gap: 16px;
      padding: 8px 0;
    }
    label {
      display: grid;
      gap: 6px;
      font-size: 14px;
    }
    input,
    select {
      box-sizing: border-box;
      width: 100%;
      min-height: 42px;
      padding: 8px 10px;
      color: inherit;
      background: var(--card-background-color, white);
      border: 1px solid var(--divider-color, #bbb);
      border-radius: 6px;
      font: inherit;
    }
    .check {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .check input {
      width: 20px;
      min-height: 20px;
    }
    .help,
    .error {
      margin: -8px 0 0;
      color: var(--secondary-text-color);
      font-size: 13px;
    }
    .error {
      color: var(--error-color, #db4437);
    }
    [aria-invalid="true"] {
      border-color: var(--error-color, #db4437);
    }
  `;
class AegisPanelCardEditor extends AegisEditor {
    constructor() {
        super(...arguments);
        this.deviceCard = false;
    }
    render() {
        const t = this.text;
        const alarms = Object.values(this.hass?.states ?? {})
            .filter((state) => state.entity_id.startsWith("alarm_control_panel."))
            .sort((a, b) => a.entity_id.localeCompare(b.entity_id));
        return b `<div class="form">
      ${this.commonFields()}
      <label
        >${t.grouping}<select
          name="group_by"
          .value=${String(this.config.group_by ?? "area")}
          @change=${this.changed}
        >
          <option value="area">${t.area}</option>
          <option value="device">${t.deviceGroup}</option>
          <option value="none">${t.none}</option>
        </select></label
      >
      <label
        >${t.alarm}<select name="alarm_entity" @change=${this.changed}>
          <option value="" ?selected=${!this.config.alarm_entity}>
            ${t.noAlarm}
          </option>
          ${alarms.map((state) => b `<option value=${state.entity_id} ?selected=${this.config.alarm_entity === state.entity_id}>${String(state.attributes.friendly_name ?? state.entity_id)}</option>`)}
        </select></label
      >
    </div>`;
    }
}
class AegisDeviceCardEditor extends AegisEditor {
    constructor() {
        super(...arguments);
        this.deviceCard = true;
    }
    render() {
        const t = this.text;
        const value = String(this.config.device ?? "");
        const nameCounts = new Map();
        for (const device of this.deviceChoices ?? []) {
            nameCounts.set(device.name, (nameCounts.get(device.name) ?? 0) + 1);
        }
        const configuredName = value &&
            !this.deviceChoices?.some((device) => device.id === value) &&
            this.deviceChoices?.some((device) => device.name === value)
            ? value
            : undefined;
        const deviceField = this.registryFailed
            ? b `<label
            >${t.device}<input
              name="device"
              .value=${value}
              @change=${this.changed}
          /></label>
          <p class="help">${t.fallback}</p>`
            : b `<label
            >${t.device}<select name="device" @change=${this.changed}>
              <option value="" ?selected=${!value}>${t.selectDevice}</option>
              ${configuredName
                ? b `<option value=${configuredName} selected>
                      ${configuredName}${(nameCounts.get(configuredName) ?? 0) > 1 ? ` — ${t.selectDevice}` : ""}
                    </option>`
                : A}
              ${(this.deviceChoices ?? []).map((device) => b `<option value=${device.id} ?selected=${value === device.id}>${device.name}${(nameCounts.get(device.name) ?? 0) > 1 ? ` (${device.id})` : ""}</option>`)}
            </select></label
          >
          <p class="help">${t.deviceHelp}</p>`;
        return b `<div class="form">
      ${deviceField}
      ${this.invalidDevice
            ? b `<p class="error" role="alert">${t.requiredDevice}</p>`
            : A}
      ${this.commonFields()}
    </div>`;
    }
}
if (!customElements.get("aegis-panel-card-editor"))
    customElements.define("aegis-panel-card-editor", AegisPanelCardEditor);
if (!customElements.get("aegis-device-card-editor"))
    customElements.define("aegis-device-card-editor", AegisDeviceCardEditor);

class AegisPanelCard extends AegisActionCard {
    static getConfigElement() {
        return document.createElement("aegis-panel-card-editor");
    }
    static getStubConfig() {
        return { type: "custom:aegis-panel-card" };
    }
}
customElements.define("aegis-panel-card", AegisPanelCard);
const registry = window;
registry.customCards ?? (registry.customCards = []);
registry.customCards.push({
    type: "aegis-panel-card",
    name: "Aegis Panel",
    description: "Aegis for Ajax device overview",
    preview: true,
}, {
    type: "aegis-device-card",
    name: "Aegis Device",
    description: "Aegis for Ajax device details",
    preview: true,
});

export { AegisPanelCard };
//# sourceMappingURL=aegis-panel-card.js.map
