!function(e){self.webpackChunk=function(t,r){for(var o in r)e[o]=r[o];for(;t.length;)n[t.pop()]=1};var t={},n={0:1},r={};var o={2:function(){return{}}};function i(n){if(t[n])return t[n].exports;var r=t[n]={i:n,l:!1,exports:{}};return e[n].call(r.exports,r,r.exports,i),r.l=!0,r.exports}i.e=function(e){var t=[];return t.push(Promise.resolve().then(function(){n[e]||importScripts(i.p+""+e+".bothello1.worker.js")})),({1:[2]}[e]||[]).forEach(function(e){var n=r[e];if(n)t.push(n);else{var u,a=o[e](),f=fetch(i.p+""+{2:"c17d164f3b89ecf8b98f"}[e]+".module.wasm");if(a instanceof Promise&&"function"==typeof WebAssembly.compileStreaming)u=Promise.all([WebAssembly.compileStreaming(f),a]).then(function(e){return WebAssembly.instantiate(e[0],e[1])});else if("function"==typeof WebAssembly.instantiateStreaming)u=WebAssembly.instantiateStreaming(f,a);else{u=f.then(function(e){return e.arrayBuffer()}).then(function(e){return WebAssembly.instantiate(e,a)})}t.push(r[e]=u.then(function(t){return i.w[e]=(t.instance||t).exports}))}}),Promise.all(t)},i.m=e,i.c=t,i.d=function(e,t,n){i.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},i.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,t){if(1&t&&(e=i(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)i.d(n,r,function(t){return e[t]}.bind(null,r));return n},i.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return i.d(t,"a",t),t},i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},i.p="/reversi/",i.w={},i(i.s=0)}([function(e,t,n){var r=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))(function(o,i){function u(e){try{f(r.next(e))}catch(e){i(e)}}function a(e){try{f(r.throw(e))}catch(e){i(e)}}function f(e){e.done?o(e.value):new n(function(t){t(e.value)}).then(u,a)}f((r=r.apply(e,t||[])).next())})},o=this&&this.__generator||function(e,t){var n,r,o,i,u={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:a(0),throw:a(1),return:a(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function a(i){return function(a){return function(i){if(n)throw new TypeError("Generator is already executing.");for(;u;)try{if(n=1,r&&(o=2&i[0]?r.return:i[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,i[1])).done)return o;switch(r=0,o&&(i=[2&i[0],o.value]),i[0]){case 0:case 1:o=i;break;case 4:return u.label++,{value:i[1],done:!1};case 5:u.label++,r=i[1],i=[0];continue;case 7:i=u.ops.pop(),u.trys.pop();continue;default:if(!(o=(o=u.trys).length>0&&o[o.length-1])&&(6===i[0]||2===i[0])){u=0;continue}if(3===i[0]&&(!o||i[1]>o[0]&&i[1]<o[3])){u.label=i[1];break}if(6===i[0]&&u.label<o[1]){u.label=o[1],o=i;break}if(o&&u.label<o[2]){u.label=o[2],u.ops.push(i);break}o[2]&&u.ops.pop(),u.trys.pop();continue}i=t.call(e,u)}catch(e){i=[6,e],r=0}finally{n=o=0}if(5&i[0])throw i[1];return{value:i[0]?i[1]:void 0,done:!0}}([i,a])}}},i=n.e(1).then(n.bind(null,1)),u=self;u.addEventListener("message",function(e){var t=e.data;if("get move"===t.type){var n=t.turn,a=t.board,f=t.config;(function(e,t){return r(this,void 0,void 0,function(){return o(this,function(n){switch(n.label){case 0:return[4,i];case 1:return[2,(0,n.sent().get_move)(new Uint8Array(e),t)]}})})})(a,"number"==typeof f.depth?f.depth:10).then(function(e){var t={type:"new move",index:e,turn:n};u.postMessage(t)})}})}]);
//# sourceMappingURL=bothello1.worker.js.map