/*!
 * 
 * cod-dicomweb-server v1.2.4
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
const t=Symbol("Comlink.proxy"),e=Symbol("Comlink.endpoint"),r=Symbol("Comlink.releaseProxy"),n=Symbol("Comlink.finalizer"),o=Symbol("Comlink.thrown"),i=t=>"object"==typeof t&&null!==t||"function"==typeof t,a={canHandle:e=>i(e)&&e[t],serialize(t){const{port1:e,port2:r}=new MessageChannel;return u(t,e),[r,[r]]},deserialize:t=>(t.start(),function(t,e){const r=new Map;return t.addEventListener("message",(function(t){const{data:e}=t;if(!e||!e.id)return;const n=r.get(e.id);if(n)try{n(e)}finally{r.delete(e.id)}})),h(t,r,[],e)}(t))},c=new Map([["proxy",a],["throw",{canHandle:t=>i(t)&&o in t,serialize({value:t}){let e;return e=t instanceof Error?{isError:!0,value:{message:t.message,name:t.name,stack:t.stack}}:{isError:!1,value:t},[e,[]]},deserialize(t){if(t.isError)throw Object.assign(new Error(t.value.message),t.value);throw t.value}}]]);function u(e,r=globalThis,i=["*"]){r.addEventListener("message",(function a(c){if(!c||!c.data)return;if(!function(t,e){for(const r of t){if(e===r||"*"===r)return!0;if(r instanceof RegExp&&r.test(e))return!0}return!1}(i,c.origin))return void console.warn(`Invalid origin '${c.origin}' for comlink proxy`);const{id:f,type:l,path:p}=Object.assign({path:[]},c.data),y=(c.data.argumentList||[]).map(d);let h;try{const r=p.slice(0,-1).reduce(((t,e)=>t[e]),e),n=p.reduce(((t,e)=>t[e]),e);switch(l){case"GET":h=n;break;case"SET":r[p.slice(-1)[0]]=d(c.data.value),h=!0;break;case"APPLY":h=n.apply(r,y);break;case"CONSTRUCT":h=function(e){return Object.assign(e,{[t]:!0})}(new n(...y));break;case"ENDPOINT":{const{port1:t,port2:r}=new MessageChannel;u(e,r),h=function(t,e){return b.set(t,e),t}(t,[t])}break;case"RELEASE":h=void 0;break;default:return}}catch(t){h={value:t,[o]:0}}Promise.resolve(h).catch((t=>({value:t,[o]:0}))).then((t=>{const[o,i]=m(t);r.postMessage(Object.assign(Object.assign({},o),{id:f}),i),"RELEASE"===l&&(r.removeEventListener("message",a),s(r),n in e&&"function"==typeof e[n]&&e[n]())})).catch((t=>{const[e,n]=m({value:new TypeError("Unserializable return value"),[o]:0});r.postMessage(Object.assign(Object.assign({},e),{id:f}),n)}))})),r.start&&r.start()}function s(t){(function(t){return"MessagePort"===t.constructor.name})(t)&&t.close()}function f(t){if(t)throw new Error("Proxy has been released and is not useable")}function l(t){return g(t,new Map,{type:"RELEASE"}).then((()=>{s(t)}))}const p=new WeakMap,y="FinalizationRegistry"in globalThis&&new FinalizationRegistry((t=>{const e=(p.get(t)||0)-1;p.set(t,e),0===e&&l(t)}));function h(t,n,o=[],i=function(){}){let a=!1;const c=new Proxy(i,{get(e,i){if(f(a),i===r)return()=>{!function(t){y&&y.unregister(t)}(c),l(t),n.clear(),a=!0};if("then"===i){if(0===o.length)return{then:()=>c};const e=g(t,n,{type:"GET",path:o.map((t=>t.toString()))}).then(d);return e.then.bind(e)}return h(t,n,[...o,i])},set(e,r,i){f(a);const[c,u]=m(i);return g(t,n,{type:"SET",path:[...o,r].map((t=>t.toString())),value:c},u).then(d)},apply(r,i,c){f(a);const u=o[o.length-1];if(u===e)return g(t,n,{type:"ENDPOINT"}).then(d);if("bind"===u)return h(t,n,o.slice(0,-1));const[s,l]=v(c);return g(t,n,{type:"APPLY",path:o.map((t=>t.toString())),argumentList:s},l).then(d)},construct(e,r){f(a);const[i,c]=v(r);return g(t,n,{type:"CONSTRUCT",path:o.map((t=>t.toString())),argumentList:i},c).then(d)}});return function(t,e){const r=(p.get(e)||0)+1;p.set(e,r),y&&y.register(t,e,t)}(c,t),c}function v(t){const e=t.map(m);return[e.map((t=>t[0])),(r=e.map((t=>t[1])),Array.prototype.concat.apply([],r))];var r}const b=new WeakMap;function m(t){for(const[e,r]of c)if(r.canHandle(t)){const[n,o]=r.serialize(t);return[{type:"HANDLER",name:e,value:n},o]}return[{type:"RAW",value:t},b.get(t)||[]]}function d(t){switch(t.type){case"HANDLER":return c.get(t.name).deserialize(t.value);case"RAW":return t.value}}function g(t,e,r,n){return new Promise((o=>{const i=new Array(4).fill(0).map((()=>Math.floor(Math.random()*Number.MAX_SAFE_INTEGER).toString(16))).join("-");e.set(i,o),t.start&&t.start(),t.postMessage(Object.assign({id:i},r),n)}))}function w(t){return w="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},w(t)}function E(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,j(n.key),n)}}function O(t,e,r){return e&&E(t.prototype,e),r&&E(t,r),Object.defineProperty(t,"prototype",{writable:!1}),t}function j(t){var e=function(t,e){if("object"!=w(t)||!t)return t;var r=t[Symbol.toPrimitive];if(void 0!==r){var n=r.call(t,e||"default");if("object"!=w(n))return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===e?String:Number)(t)}(t,"string");return"symbol"==w(e)?e:e+""}function S(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function P(t,e,r){return e=_(e),function(t,e){if(e&&("object"==w(e)||"function"==typeof e))return e;if(void 0!==e)throw new TypeError("Derived constructors may only return object or undefined");return function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}(t)}(t,k()?Reflect.construct(e,r||[],_(t).constructor):e.apply(t,r))}function x(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),Object.defineProperty(t,"prototype",{writable:!1}),e&&T(t,e)}function L(t){var e="function"==typeof Map?new Map:void 0;return L=function(t){if(null===t||!function(t){try{return-1!==Function.toString.call(t).indexOf("[native code]")}catch(e){return"function"==typeof t}}(t))return t;if("function"!=typeof t)throw new TypeError("Super expression must either be null or a function");if(void 0!==e){if(e.has(t))return e.get(t);e.set(t,r)}function r(){return function(t,e,r){if(k())return Reflect.construct.apply(null,arguments);var n=[null];n.push.apply(n,e);var o=new(t.bind.apply(t,n));return r&&T(o,r.prototype),o}(t,arguments,_(this).constructor)}return r.prototype=Object.create(t.prototype,{constructor:{value:r,enumerable:!1,writable:!0,configurable:!0}}),T(r,t)},L(t)}function k(){try{var t=!Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){})))}catch(t){}return(k=function(){return!!t})()}function T(t,e){return T=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t},T(t,e)}function _(t){return _=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(t){return t.__proto__||Object.getPrototypeOf(t)},_(t)}var N=function(t){function e(){return S(this,e),P(this,e,arguments)}return x(e,t),O(e)}(L(Error));function R(t){return R="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},R(t)}function A(){/*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */A=function(){return e};var t,e={},r=Object.prototype,n=r.hasOwnProperty,o=Object.defineProperty||function(t,e,r){t[e]=r.value},i="function"==typeof Symbol?Symbol:{},a=i.iterator||"@@iterator",c=i.asyncIterator||"@@asyncIterator",u=i.toStringTag||"@@toStringTag";function s(t,e,r){return Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}),t[e]}try{s({},"")}catch(t){s=function(t,e,r){return t[e]=r}}function f(t,e,r,n){var i=e&&e.prototype instanceof m?e:m,a=Object.create(i.prototype),c=new _(n||[]);return o(a,"_invoke",{value:x(t,r,c)}),a}function l(t,e,r){try{return{type:"normal",arg:t.call(e,r)}}catch(t){return{type:"throw",arg:t}}}e.wrap=f;var p="suspendedStart",y="suspendedYield",h="executing",v="completed",b={};function m(){}function d(){}function g(){}var w={};s(w,a,(function(){return this}));var E=Object.getPrototypeOf,O=E&&E(E(N([])));O&&O!==r&&n.call(O,a)&&(w=O);var j=g.prototype=m.prototype=Object.create(w);function S(t){["next","throw","return"].forEach((function(e){s(t,e,(function(t){return this._invoke(e,t)}))}))}function P(t,e){function r(o,i,a,c){var u=l(t[o],t,i);if("throw"!==u.type){var s=u.arg,f=s.value;return f&&"object"==R(f)&&n.call(f,"__await")?e.resolve(f.__await).then((function(t){r("next",t,a,c)}),(function(t){r("throw",t,a,c)})):e.resolve(f).then((function(t){s.value=t,a(s)}),(function(t){return r("throw",t,a,c)}))}c(u.arg)}var i;o(this,"_invoke",{value:function(t,n){function o(){return new e((function(e,o){r(t,n,e,o)}))}return i=i?i.then(o,o):o()}})}function x(e,r,n){var o=p;return function(i,a){if(o===h)throw Error("Generator is already running");if(o===v){if("throw"===i)throw a;return{value:t,done:!0}}for(n.method=i,n.arg=a;;){var c=n.delegate;if(c){var u=L(c,n);if(u){if(u===b)continue;return u}}if("next"===n.method)n.sent=n._sent=n.arg;else if("throw"===n.method){if(o===p)throw o=v,n.arg;n.dispatchException(n.arg)}else"return"===n.method&&n.abrupt("return",n.arg);o=h;var s=l(e,r,n);if("normal"===s.type){if(o=n.done?v:y,s.arg===b)continue;return{value:s.arg,done:n.done}}"throw"===s.type&&(o=v,n.method="throw",n.arg=s.arg)}}}function L(e,r){var n=r.method,o=e.iterator[n];if(o===t)return r.delegate=null,"throw"===n&&e.iterator.return&&(r.method="return",r.arg=t,L(e,r),"throw"===r.method)||"return"!==n&&(r.method="throw",r.arg=new TypeError("The iterator does not provide a '"+n+"' method")),b;var i=l(o,e.iterator,r.arg);if("throw"===i.type)return r.method="throw",r.arg=i.arg,r.delegate=null,b;var a=i.arg;return a?a.done?(r[e.resultName]=a.value,r.next=e.nextLoc,"return"!==r.method&&(r.method="next",r.arg=t),r.delegate=null,b):a:(r.method="throw",r.arg=new TypeError("iterator result is not an object"),r.delegate=null,b)}function k(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function T(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function _(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(k,this),this.reset(!0)}function N(e){if(e||""===e){var r=e[a];if(r)return r.call(e);if("function"==typeof e.next)return e;if(!isNaN(e.length)){var o=-1,i=function r(){for(;++o<e.length;)if(n.call(e,o))return r.value=e[o],r.done=!1,r;return r.value=t,r.done=!0,r};return i.next=i}}throw new TypeError(R(e)+" is not iterable")}return d.prototype=g,o(j,"constructor",{value:g,configurable:!0}),o(g,"constructor",{value:d,configurable:!0}),d.displayName=s(g,u,"GeneratorFunction"),e.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===d||"GeneratorFunction"===(e.displayName||e.name))},e.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,g):(t.__proto__=g,s(t,u,"GeneratorFunction")),t.prototype=Object.create(j),t},e.awrap=function(t){return{__await:t}},S(P.prototype),s(P.prototype,c,(function(){return this})),e.AsyncIterator=P,e.async=function(t,r,n,o,i){void 0===i&&(i=Promise);var a=new P(f(t,r,n,o),i);return e.isGeneratorFunction(r)?a:a.next().then((function(t){return t.done?t.value:a.next()}))},S(j),s(j,u,"Generator"),s(j,a,(function(){return this})),s(j,"toString",(function(){return"[object Generator]"})),e.keys=function(t){var e=Object(t),r=[];for(var n in e)r.push(n);return r.reverse(),function t(){for(;r.length;){var n=r.pop();if(n in e)return t.value=n,t.done=!1,t}return t.done=!0,t}},e.values=N,_.prototype={constructor:_,reset:function(e){if(this.prev=0,this.next=0,this.sent=this._sent=t,this.done=!1,this.delegate=null,this.method="next",this.arg=t,this.tryEntries.forEach(T),!e)for(var r in this)"t"===r.charAt(0)&&n.call(this,r)&&!isNaN(+r.slice(1))&&(this[r]=t)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(e){if(this.done)throw e;var r=this;function o(n,o){return c.type="throw",c.arg=e,r.next=n,o&&(r.method="next",r.arg=t),!!o}for(var i=this.tryEntries.length-1;i>=0;--i){var a=this.tryEntries[i],c=a.completion;if("root"===a.tryLoc)return o("end");if(a.tryLoc<=this.prev){var u=n.call(a,"catchLoc"),s=n.call(a,"finallyLoc");if(u&&s){if(this.prev<a.catchLoc)return o(a.catchLoc,!0);if(this.prev<a.finallyLoc)return o(a.finallyLoc)}else if(u){if(this.prev<a.catchLoc)return o(a.catchLoc,!0)}else{if(!s)throw Error("try statement without catch or finally");if(this.prev<a.finallyLoc)return o(a.finallyLoc)}}}},abrupt:function(t,e){for(var r=this.tryEntries.length-1;r>=0;--r){var o=this.tryEntries[r];if(o.tryLoc<=this.prev&&n.call(o,"finallyLoc")&&this.prev<o.finallyLoc){var i=o;break}}i&&("break"===t||"continue"===t)&&i.tryLoc<=e&&e<=i.finallyLoc&&(i=null);var a=i?i.completion:{};return a.type=t,a.arg=e,i?(this.method="next",this.next=i.finallyLoc,b):this.complete(a)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),b},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.finallyLoc===t)return this.complete(r.completion,r.afterLoc),T(r),b}},catch:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.tryLoc===t){var n=r.completion;if("throw"===n.type){var o=n.arg;T(r)}return o}}throw Error("illegal catch attempt")},delegateYield:function(e,r,n){return this.delegate={iterator:N(e),resultName:r,nextLoc:n},"next"===this.method&&(this.arg=t),b}},e}function M(t,e,r,n,o,i,a){try{var c=t[i](a),u=c.value}catch(t){return void r(t)}c.done?e(u):Promise.resolve(u).then(n,o)}const C={partial:function(t,e){return(r=A().mark((function r(){var n,o,i;return A().wrap((function(r){for(;;)switch(r.prev=r.next){case 0:return n=t.url,o=t.offsets,i=t.headers,null!=o&&o.startByte&&null!=o&&o.endByte&&(i.Range="bytes=".concat(o.startByte,"-").concat(o.endByte-1)),r.next=4,fetch(n,{headers:i}).then((function(t){return t.arrayBuffer()})).then((function(t){return e({url:n,fileArraybuffer:new Uint8Array(t),offsets:o})})).catch((function(t){throw new N("filePartial.ts: Error when fetching file: "+(null==t?void 0:t.message))}));case 4:case"end":return r.stop()}}),r)})),function(){var t=this,e=arguments;return new Promise((function(n,o){var i=r.apply(t,e);function a(t){M(i,n,o,a,c,"next",t)}function c(t){M(i,n,o,a,c,"throw",t)}a(void 0)}))})();var r}};function G(t){return G="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},G(t)}function z(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,n)}return r}function D(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?z(Object(r),!0).forEach((function(e){F(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):z(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}function F(t,e,r){return(e=function(t){var e=function(t,e){if("object"!=G(t)||!t)return t;var r=t[Symbol.toPrimitive];if(void 0!==r){var n=r.call(t,e||"default");if("object"!=G(n))return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===e?String:Number)(t)}(t,"string");return"symbol"==G(e)?e:e+""}(e))in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}return u(D(D({},C),{},{partial:function(t){return C.partial(t,postMessage)}})),{}})()));
//# sourceMappingURL=614.js.map