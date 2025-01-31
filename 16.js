/*!
 * 
 * cod-dicomweb-server v1.2.3
 * git+https://github.com/gradienthealth/cod-dicomweb-server.git
 *
 *   Copyright (c) Adithyan Dinesh and project contributors.
 *
 *   This source code is licensed under the MIT license found in the
 *   LICENSE file in the root directory of this source tree.
 *
 */
!function(t,e){if("object"==typeof exports&&"object"==typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var r=e();for(var n in r)("object"==typeof exports?exports:t)[n]=r[n]}}(self,(()=>(()=>{"use strict";
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const t=Symbol("Comlink.proxy"),e=Symbol("Comlink.endpoint"),r=Symbol("Comlink.releaseProxy"),n=Symbol("Comlink.finalizer"),o=Symbol("Comlink.thrown"),i=t=>"object"==typeof t&&null!==t||"function"==typeof t,a={canHandle:e=>i(e)&&e[t],serialize(t){const{port1:e,port2:r}=new MessageChannel;return u(t,e),[r,[r]]},deserialize:t=>(t.start(),function(t,e){const r=new Map;return t.addEventListener("message",(function(t){const{data:e}=t;if(!e||!e.id)return;const n=r.get(e.id);if(n)try{n(e)}finally{r.delete(e.id)}})),y(t,r,[],e)}(t))},c=new Map([["proxy",a],["throw",{canHandle:t=>i(t)&&o in t,serialize({value:t}){let e;return e=t instanceof Error?{isError:!0,value:{message:t.message,name:t.name,stack:t.stack}}:{isError:!1,value:t},[e,[]]},deserialize(t){if(t.isError)throw Object.assign(new Error(t.value.message),t.value);throw t.value}}]]);function u(e,r=globalThis,i=["*"]){r.addEventListener("message",(function a(c){if(!c||!c.data)return;if(!function(t,e){for(const r of t){if(e===r||"*"===r)return!0;if(r instanceof RegExp&&r.test(e))return!0}return!1}(i,c.origin))return void console.warn(`Invalid origin '${c.origin}' for comlink proxy`);const{id:l,type:f,path:h}=Object.assign({path:[]},c.data),p=(c.data.argumentList||[]).map(m);let y;try{const r=h.slice(0,-1).reduce(((t,e)=>t[e]),e),n=h.reduce(((t,e)=>t[e]),e);switch(f){case"GET":y=n;break;case"SET":r[h.slice(-1)[0]]=m(c.data.value),y=!0;break;case"APPLY":y=n.apply(r,p);break;case"CONSTRUCT":y=function(e){return Object.assign(e,{[t]:!0})}(new n(...p));break;case"ENDPOINT":{const{port1:t,port2:r}=new MessageChannel;u(e,r),y=function(t,e){return d.set(t,e),t}(t,[t])}break;case"RELEASE":y=void 0;break;default:return}}catch(t){y={value:t,[o]:0}}Promise.resolve(y).catch((t=>({value:t,[o]:0}))).then((t=>{const[o,i]=g(t);r.postMessage(Object.assign(Object.assign({},o),{id:l}),i),"RELEASE"===f&&(r.removeEventListener("message",a),s(r),n in e&&"function"==typeof e[n]&&e[n]())})).catch((t=>{const[e,n]=g({value:new TypeError("Unserializable return value"),[o]:0});r.postMessage(Object.assign(Object.assign({},e),{id:l}),n)}))})),r.start&&r.start()}function s(t){(function(t){return"MessagePort"===t.constructor.name})(t)&&t.close()}function l(t){if(t)throw new Error("Proxy has been released and is not useable")}function f(t){return w(t,new Map,{type:"RELEASE"}).then((()=>{s(t)}))}const h=new WeakMap,p="FinalizationRegistry"in globalThis&&new FinalizationRegistry((t=>{const e=(h.get(t)||0)-1;h.set(t,e),0===e&&f(t)}));function y(t,n,o=[],i=function(){}){let a=!1;const c=new Proxy(i,{get(e,i){if(l(a),i===r)return()=>{!function(t){p&&p.unregister(t)}(c),f(t),n.clear(),a=!0};if("then"===i){if(0===o.length)return{then:()=>c};const e=w(t,n,{type:"GET",path:o.map((t=>t.toString()))}).then(m);return e.then.bind(e)}return y(t,n,[...o,i])},set(e,r,i){l(a);const[c,u]=g(i);return w(t,n,{type:"SET",path:[...o,r].map((t=>t.toString())),value:c},u).then(m)},apply(r,i,c){l(a);const u=o[o.length-1];if(u===e)return w(t,n,{type:"ENDPOINT"}).then(m);if("bind"===u)return y(t,n,o.slice(0,-1));const[s,f]=v(c);return w(t,n,{type:"APPLY",path:o.map((t=>t.toString())),argumentList:s},f).then(m)},construct(e,r){l(a);const[i,c]=v(r);return w(t,n,{type:"CONSTRUCT",path:o.map((t=>t.toString())),argumentList:i},c).then(m)}});return function(t,e){const r=(h.get(e)||0)+1;h.set(e,r),p&&p.register(t,e,t)}(c,t),c}function v(t){const e=t.map(g);return[e.map((t=>t[0])),(r=e.map((t=>t[1])),Array.prototype.concat.apply([],r))];var r}const d=new WeakMap;function g(t){for(const[e,r]of c)if(r.canHandle(t)){const[n,o]=r.serialize(t);return[{type:"HANDLER",name:e,value:n},o]}return[{type:"RAW",value:t},d.get(t)||[]]}function m(t){switch(t.type){case"HANDLER":return c.get(t.name).deserialize(t.value);case"RAW":return t.value}}function w(t,e,r,n){return new Promise((o=>{const i=new Array(4).fill(0).map((()=>Math.floor(Math.random()*Number.MAX_SAFE_INTEGER).toString(16))).join("-");e.set(i,o),t.start&&t.start(),t.postMessage(Object.assign({id:i},r),n)}))}function b(t){return b="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},b(t)}function E(){/*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */E=function(){return e};var t,e={},r=Object.prototype,n=r.hasOwnProperty,o=Object.defineProperty||function(t,e,r){t[e]=r.value},i="function"==typeof Symbol?Symbol:{},a=i.iterator||"@@iterator",c=i.asyncIterator||"@@asyncIterator",u=i.toStringTag||"@@toStringTag";function s(t,e,r){return Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}),t[e]}try{s({},"")}catch(t){s=function(t,e,r){return t[e]=r}}function l(t,e,r,n){var i=e&&e.prototype instanceof g?e:g,a=Object.create(i.prototype),c=new A(n||[]);return o(a,"_invoke",{value:P(t,r,c)}),a}function f(t,e,r){try{return{type:"normal",arg:t.call(e,r)}}catch(t){return{type:"throw",arg:t}}}e.wrap=l;var h="suspendedStart",p="suspendedYield",y="executing",v="completed",d={};function g(){}function m(){}function w(){}var L={};s(L,a,(function(){return this}));var x=Object.getPrototypeOf,S=x&&x(x(M([])));S&&S!==r&&n.call(S,a)&&(L=S);var j=w.prototype=g.prototype=Object.create(L);function O(t){["next","throw","return"].forEach((function(e){s(t,e,(function(t){return this._invoke(e,t)}))}))}function k(t,e){function r(o,i,a,c){var u=f(t[o],t,i);if("throw"!==u.type){var s=u.arg,l=s.value;return l&&"object"==b(l)&&n.call(l,"__await")?e.resolve(l.__await).then((function(t){r("next",t,a,c)}),(function(t){r("throw",t,a,c)})):e.resolve(l).then((function(t){s.value=t,a(s)}),(function(t){return r("throw",t,a,c)}))}c(u.arg)}var i;o(this,"_invoke",{value:function(t,n){function o(){return new e((function(e,o){r(t,n,e,o)}))}return i=i?i.then(o,o):o()}})}function P(e,r,n){var o=h;return function(i,a){if(o===y)throw Error("Generator is already running");if(o===v){if("throw"===i)throw a;return{value:t,done:!0}}for(n.method=i,n.arg=a;;){var c=n.delegate;if(c){var u=T(c,n);if(u){if(u===d)continue;return u}}if("next"===n.method)n.sent=n._sent=n.arg;else if("throw"===n.method){if(o===h)throw o=v,n.arg;n.dispatchException(n.arg)}else"return"===n.method&&n.abrupt("return",n.arg);o=y;var s=f(e,r,n);if("normal"===s.type){if(o=n.done?v:p,s.arg===d)continue;return{value:s.arg,done:n.done}}"throw"===s.type&&(o=v,n.method="throw",n.arg=s.arg)}}}function T(e,r){var n=r.method,o=e.iterator[n];if(o===t)return r.delegate=null,"throw"===n&&e.iterator.return&&(r.method="return",r.arg=t,T(e,r),"throw"===r.method)||"return"!==n&&(r.method="throw",r.arg=new TypeError("The iterator does not provide a '"+n+"' method")),d;var i=f(o,e.iterator,r.arg);if("throw"===i.type)return r.method="throw",r.arg=i.arg,r.delegate=null,d;var a=i.arg;return a?a.done?(r[e.resultName]=a.value,r.next=e.nextLoc,"return"!==r.method&&(r.method="next",r.arg=t),r.delegate=null,d):a:(r.method="throw",r.arg=new TypeError("iterator result is not an object"),r.delegate=null,d)}function N(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function _(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function A(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(N,this),this.reset(!0)}function M(e){if(e||""===e){var r=e[a];if(r)return r.call(e);if("function"==typeof e.next)return e;if(!isNaN(e.length)){var o=-1,i=function r(){for(;++o<e.length;)if(n.call(e,o))return r.value=e[o],r.done=!1,r;return r.value=t,r.done=!0,r};return i.next=i}}throw new TypeError(b(e)+" is not iterable")}return m.prototype=w,o(j,"constructor",{value:w,configurable:!0}),o(w,"constructor",{value:m,configurable:!0}),m.displayName=s(w,u,"GeneratorFunction"),e.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===m||"GeneratorFunction"===(e.displayName||e.name))},e.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,w):(t.__proto__=w,s(t,u,"GeneratorFunction")),t.prototype=Object.create(j),t},e.awrap=function(t){return{__await:t}},O(k.prototype),s(k.prototype,c,(function(){return this})),e.AsyncIterator=k,e.async=function(t,r,n,o,i){void 0===i&&(i=Promise);var a=new k(l(t,r,n,o),i);return e.isGeneratorFunction(r)?a:a.next().then((function(t){return t.done?t.value:a.next()}))},O(j),s(j,u,"Generator"),s(j,a,(function(){return this})),s(j,"toString",(function(){return"[object Generator]"})),e.keys=function(t){var e=Object(t),r=[];for(var n in e)r.push(n);return r.reverse(),function t(){for(;r.length;){var n=r.pop();if(n in e)return t.value=n,t.done=!1,t}return t.done=!0,t}},e.values=M,A.prototype={constructor:A,reset:function(e){if(this.prev=0,this.next=0,this.sent=this._sent=t,this.done=!1,this.delegate=null,this.method="next",this.arg=t,this.tryEntries.forEach(_),!e)for(var r in this)"t"===r.charAt(0)&&n.call(this,r)&&!isNaN(+r.slice(1))&&(this[r]=t)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(e){if(this.done)throw e;var r=this;function o(n,o){return c.type="throw",c.arg=e,r.next=n,o&&(r.method="next",r.arg=t),!!o}for(var i=this.tryEntries.length-1;i>=0;--i){var a=this.tryEntries[i],c=a.completion;if("root"===a.tryLoc)return o("end");if(a.tryLoc<=this.prev){var u=n.call(a,"catchLoc"),s=n.call(a,"finallyLoc");if(u&&s){if(this.prev<a.catchLoc)return o(a.catchLoc,!0);if(this.prev<a.finallyLoc)return o(a.finallyLoc)}else if(u){if(this.prev<a.catchLoc)return o(a.catchLoc,!0)}else{if(!s)throw Error("try statement without catch or finally");if(this.prev<a.finallyLoc)return o(a.finallyLoc)}}}},abrupt:function(t,e){for(var r=this.tryEntries.length-1;r>=0;--r){var o=this.tryEntries[r];if(o.tryLoc<=this.prev&&n.call(o,"finallyLoc")&&this.prev<o.finallyLoc){var i=o;break}}i&&("break"===t||"continue"===t)&&i.tryLoc<=e&&e<=i.finallyLoc&&(i=null);var a=i?i.completion:{};return a.type=t,a.arg=e,i?(this.method="next",this.next=i.finallyLoc,d):this.complete(a)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),d},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.finallyLoc===t)return this.complete(r.completion,r.afterLoc),_(r),d}},catch:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.tryLoc===t){var n=r.completion;if("throw"===n.type){var o=n.arg;_(r)}return o}}throw Error("illegal catch attempt")},delegateYield:function(e,r,n){return this.delegate={iterator:M(e),resultName:r,nextLoc:n},"next"===this.method&&(this.arg=t),d}},e}function L(t,e,r,n,o,i,a){try{var c=t[i](a),u=c.value}catch(t){return void r(t)}c.done?e(u):Promise.resolve(u).then(n,o)}return u({partial:function(t){return(e=E().mark((function e(){var r,n;return E().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return r=t.url,n=t.headers,e.abrupt("return",fetch(r,{headers:n}).then((function(t){return t.arrayBuffer()})).catch((function(t){throw new Error("filePartial.ts: Error when fetching file: "+(null==t?void 0:t.message))})));case 2:case"end":return e.stop()}}),e)})),function(){var t=this,r=arguments;return new Promise((function(n,o){var i=e.apply(t,r);function a(t){L(i,n,o,a,c,"next",t)}function c(t){L(i,n,o,a,c,"throw",t)}a(void 0)}))})();var e}}),{}})()));
//# sourceMappingURL=16.js.map