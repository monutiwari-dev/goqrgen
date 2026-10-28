const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/HomePage-B6YBrxkB.js","assets/vendor-niTUO1mq.js","assets/shield-D0uQDT11.js","assets/download-BuN3gPfV.js","assets/chevron-up-O7Lq5zmA.js","assets/GeneratorPage-B6Johxl2.js","assets/HistoryPage-Ci6F9k-H.js","assets/index-Dmq5-q48.js","assets/FileSaver.min-BU5bOM2Y.js","assets/index-6sdqbm2o.js","assets/trash-2-CGU1E5mA.js","assets/ScannerPage-CBahoSEv.js","assets/BulkPage-MlZcsO3s.js","assets/AboutPage-D8y7h5Ob.js","assets/PrivacyPolicyPage-CKLDQP1Z.js","assets/TermsPage-Dqvqo5sj.js","assets/ContactPage-BnA5vVYg.js","assets/NotFoundPage-Br9Y1ckW.js"])))=>i.map(i=>d[i]);
import{r as ne,a as ie,b as p,u as le,R as b,L as T,H as ce,B as de,c as ue,d as v,N as pe}from"./vendor-niTUO1mq.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const r of o)if(r.type==="childList")for(const l of r.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&n(l)}).observe(document,{childList:!0,subtree:!0});function a(o){const r={};return o.integrity&&(r.integrity=o.integrity),o.referrerPolicy&&(r.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?r.credentials="include":o.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(o){if(o.ep)return;o.ep=!0;const r=a(o);fetch(o.href,r)}})();var H={exports:{}},L={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var B;function me(){if(B)return L;B=1;var e=ne(),t=Symbol.for("react.element"),a=Symbol.for("react.fragment"),n=Object.prototype.hasOwnProperty,o=e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,r={key:!0,ref:!0,__self:!0,__source:!0};function l(i,c,d){var u,y={},h=null,f=null;d!==void 0&&(h=""+d),c.key!==void 0&&(h=""+c.key),c.ref!==void 0&&(f=c.ref);for(u in c)n.call(c,u)&&!r.hasOwnProperty(u)&&(y[u]=c[u]);if(i&&i.defaultProps)for(u in c=i.defaultProps,c)y[u]===void 0&&(y[u]=c[u]);return{$$typeof:t,type:i,key:h,ref:f,props:y,_owner:o.current}}return L.Fragment=a,L.jsx=l,L.jsxs=l,L}var U;function he(){return U||(U=1,H.exports=me()),H.exports}var s=he(),C={},G;function ye(){if(G)return C;G=1;var e=ie();return C.createRoot=e.createRoot,C.hydrateRoot=e.hydrateRoot,C}var fe=ye();let xe={data:""},ge=e=>typeof window=="object"?((e?e.querySelector("#_goober"):window._goober)||Object.assign((e||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:e||xe,ve=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,be=/\/\*[^]*?\*\/|  +/g,J=/\n+/g,E=(e,t)=>{let a="",n="",o="";for(let r in e){let l=e[r];r[0]=="@"?r[1]=="i"?a=r+" "+l+";":n+=r[1]=="f"?E(l,r):r+"{"+E(l,r[1]=="k"?"":t)+"}":typeof l=="object"?n+=E(l,t?t.replace(/([^,])+/g,i=>r.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,c=>/&/.test(c)?c.replace(/&/g,i):i?i+" "+c:c)):r):l!=null&&(r=/^--/.test(r)?r:r.replace(/[A-Z]/g,"-$&").toLowerCase(),o+=E.p?E.p(r,l):r+":"+l+";")}return a+(t&&o?t+"{"+o+"}":o)+n},w={},X=e=>{if(typeof e=="object"){let t="";for(let a in e)t+=a+X(e[a]);return t}return e},ke=(e,t,a,n,o)=>{let r=X(e),l=w[r]||(w[r]=(c=>{let d=0,u=11;for(;d<c.length;)u=101*u+c.charCodeAt(d++)>>>0;return"go"+u})(r));if(!w[l]){let c=r!==e?e:(d=>{let u,y,h=[{}];for(;u=ve.exec(d.replace(be,""));)u[4]?h.shift():u[3]?(y=u[3].replace(J," ").trim(),h.unshift(h[0][y]=h[0][y]||{})):h[0][u[1]]=u[2].replace(J," ").trim();return h[0]})(e);w[l]=E(o?{["@keyframes "+l]:c}:c,a?"":"."+l)}let i=a&&w.g?w.g:null;return a&&(w.g=w[l]),((c,d,u,y)=>{y?d.data=d.data.replace(y,c):d.data.indexOf(c)===-1&&(d.data=u?c+d.data:d.data+c)})(w[l],t,n,i),l},we=(e,t,a)=>e.reduce((n,o,r)=>{let l=t[r];if(l&&l.call){let i=l(a),c=i&&i.props&&i.props.className||/^go/.test(i)&&i;l=c?"."+c:i&&typeof i=="object"?i.props?"":E(i,""):i===!1?"":i}return n+o+(l??"")},"");function $(e){let t=this||{},a=e.call?e(t.p):e;return ke(a.unshift?a.raw?we(a,[].slice.call(arguments,1),t.p):a.reduce((n,o)=>Object.assign(n,o&&o.call?o(t.p):o),{}):a,ge(t.target),t.g,t.o,t.k)}let K,q,F;$.bind({g:1});let j=$.bind({k:1});function je(e,t,a,n){E.p=t,K=e,q=a,F=n}function N(e,t){let a=this||{};return function(){let n=arguments;function o(r,l){let i=Object.assign({},r),c=i.className||o.className;a.p=Object.assign({theme:q&&q()},i),a.o=/ *go\d+/.test(c),i.className=$.apply(a,n)+(c?" "+c:"");let d=e;return e[0]&&(d=i.as||e,delete i.as),F&&d[0]&&F(i),K(d,i)}return o}}var _e=e=>typeof e=="function",z=(e,t)=>_e(e)?e(t):e,Ee=(()=>{let e=0;return()=>(++e).toString()})(),ee=(()=>{let e;return()=>{if(e===void 0&&typeof window<"u"){let t=matchMedia("(prefers-reduced-motion: reduce)");e=!t||t.matches}return e}})(),Ne=20,te=(e,t)=>{switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,Ne)};case 1:return{...e,toasts:e.toasts.map(r=>r.id===t.toast.id?{...r,...t.toast}:r)};case 2:let{toast:a}=t;return te(e,{type:e.toasts.find(r=>r.id===a.id)?1:0,toast:a});case 3:let{toastId:n}=t;return{...e,toasts:e.toasts.map(r=>r.id===n||n===void 0?{...r,dismissed:!0,visible:!1}:r)};case 4:return t.toastId===void 0?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(r=>r.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let o=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(r=>({...r,pauseDuration:r.pauseDuration+o}))}}},A=[],P={toasts:[],pausedAt:void 0},S=e=>{P=te(P,e),A.forEach(t=>{t(P)})},Pe={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},Se=(e={})=>{let[t,a]=p.useState(P),n=p.useRef(P);p.useEffect(()=>(n.current!==P&&a(P),A.push(a),()=>{let r=A.indexOf(a);r>-1&&A.splice(r,1)}),[]);let o=t.toasts.map(r=>{var l,i,c;return{...e,...e[r.type],...r,removeDelay:r.removeDelay||((l=e[r.type])==null?void 0:l.removeDelay)||(e==null?void 0:e.removeDelay),duration:r.duration||((i=e[r.type])==null?void 0:i.duration)||(e==null?void 0:e.duration)||Pe[r.type],style:{...e.style,...(c=e[r.type])==null?void 0:c.style,...r.style}}});return{...t,toasts:o}},Le=(e,t="blank",a)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...a,id:(a==null?void 0:a.id)||Ee()}),O=e=>(t,a)=>{let n=Le(t,e,a);return S({type:2,toast:n}),n.id},x=(e,t)=>O("blank")(e,t);x.error=O("error");x.success=O("success");x.loading=O("loading");x.custom=O("custom");x.dismiss=e=>{S({type:3,toastId:e})};x.remove=e=>S({type:4,toastId:e});x.promise=(e,t,a)=>{let n=x.loading(t.loading,{...a,...a==null?void 0:a.loading});return typeof e=="function"&&(e=e()),e.then(o=>{let r=t.success?z(t.success,o):void 0;return r?x.success(r,{id:n,...a,...a==null?void 0:a.success}):x.dismiss(n),o}).catch(o=>{let r=t.error?z(t.error,o):void 0;r?x.error(r,{id:n,...a,...a==null?void 0:a.error}):x.dismiss(n)}),e};var Re=(e,t)=>{S({type:1,toast:{id:e,height:t}})},Oe=()=>{S({type:5,time:Date.now()})},R=new Map,Te=1e3,Ce=(e,t=Te)=>{if(R.has(e))return;let a=setTimeout(()=>{R.delete(e),S({type:4,toastId:e})},t);R.set(e,a)},Me=e=>{let{toasts:t,pausedAt:a}=Se(e);p.useEffect(()=>{if(a)return;let r=Date.now(),l=t.map(i=>{if(i.duration===1/0)return;let c=(i.duration||0)+i.pauseDuration-(r-i.createdAt);if(c<0){i.visible&&x.dismiss(i.id);return}return setTimeout(()=>x.dismiss(i.id),c)});return()=>{l.forEach(i=>i&&clearTimeout(i))}},[t,a]);let n=p.useCallback(()=>{a&&S({type:6,time:Date.now()})},[a]),o=p.useCallback((r,l)=>{let{reverseOrder:i=!1,gutter:c=8,defaultPosition:d}=l||{},u=t.filter(f=>(f.position||d)===(r.position||d)&&f.height),y=u.findIndex(f=>f.id===r.id),h=u.filter((f,_)=>_<y&&f.visible).length;return u.filter(f=>f.visible).slice(...i?[h+1]:[0,h]).reduce((f,_)=>f+(_.height||0)+c,0)},[t]);return p.useEffect(()=>{t.forEach(r=>{if(r.dismissed)Ce(r.id,r.removeDelay);else{let l=R.get(r.id);l&&(clearTimeout(l),R.delete(r.id))}})},[t]),{toasts:t,handlers:{updateHeight:Re,startPause:Oe,endPause:n,calculateOffset:o}}},Ae=j`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,ze=j`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,$e=j`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,He=N("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${Ae} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${ze} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${$e} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,De=j`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,Ie=N("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${De} 1s linear infinite;
`,qe=j`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,Fe=j`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,Ve=N("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${qe} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${Fe} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,Be=N("div")`
  position: absolute;
`,Ue=N("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,Ge=j`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Je=N("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${Ge} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,Qe=({toast:e})=>{let{icon:t,type:a,iconTheme:n}=e;return t!==void 0?typeof t=="string"?p.createElement(Je,null,t):t:a==="blank"?null:p.createElement(Ue,null,p.createElement(Ie,{...n}),a!=="loading"&&p.createElement(Be,null,a==="error"?p.createElement(He,{...n}):p.createElement(Ve,{...n})))},Ye=e=>`
0% {transform: translate3d(0,${e*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,Ze=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e*-150}%,-1px) scale(.6); opacity:0;}
`,We="0%{opacity:0;} 100%{opacity:1;}",Xe="0%{opacity:1;} 100%{opacity:0;}",Ke=N("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,et=N("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,tt=(e,t)=>{let a=e.includes("top")?1:-1,[n,o]=ee()?[We,Xe]:[Ye(a),Ze(a)];return{animation:t?`${j(n)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${j(o)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},rt=p.memo(({toast:e,position:t,style:a,children:n})=>{let o=e.height?tt(e.position||t||"top-center",e.visible):{opacity:0},r=p.createElement(Qe,{toast:e}),l=p.createElement(et,{...e.ariaProps},z(e.message,e));return p.createElement(Ke,{className:e.className,style:{...o,...a,...e.style}},typeof n=="function"?n({icon:r,message:l}):p.createElement(p.Fragment,null,r,l))});je(p.createElement);var at=({id:e,className:t,style:a,onHeightUpdate:n,children:o})=>{let r=p.useCallback(l=>{if(l){let i=()=>{let c=l.getBoundingClientRect().height;n(e,c)};i(),new MutationObserver(i).observe(l,{subtree:!0,childList:!0,characterData:!0})}},[e,n]);return p.createElement("div",{ref:r,className:t,style:a},o)},st=(e,t)=>{let a=e.includes("top"),n=a?{top:0}:{bottom:0},o=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:ee()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(a?1:-1)}px)`,...n,...o}},ot=$`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,M=16,nt=({reverseOrder:e,position:t="top-center",toastOptions:a,gutter:n,children:o,containerStyle:r,containerClassName:l})=>{let{toasts:i,handlers:c}=Me(a);return p.createElement("div",{id:"_rht_toaster",style:{position:"fixed",zIndex:9999,top:M,left:M,right:M,bottom:M,pointerEvents:"none",...r},className:l,onMouseEnter:c.startPause,onMouseLeave:c.endPause},i.map(d=>{let u=d.position||t,y=c.calculateOffset(d,{reverseOrder:e,gutter:n,defaultPosition:t}),h=st(u,y);return p.createElement(at,{id:d.id,key:d.id,onHeightUpdate:c.updateHeight,className:d.visible?ot:"",style:h},d.type==="custom"?z(d.message,d):o?o(d):p.createElement(rt,{toast:d,position:u}))}))},D=x;const it="modulepreload",lt=function(e){return"/"+e},Q={},k=function(t,a,n){let o=Promise.resolve();if(a&&a.length>0){let l=function(d){return Promise.all(d.map(u=>Promise.resolve(u).then(y=>({status:"fulfilled",value:y}),y=>({status:"rejected",reason:y}))))};document.getElementsByTagName("link");const i=document.querySelector("meta[property=csp-nonce]"),c=(i==null?void 0:i.nonce)||(i==null?void 0:i.getAttribute("nonce"));o=l(a.map(d=>{if(d=lt(d),d in Q)return;Q[d]=!0;const u=d.endsWith(".css"),y=u?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${d}"]${y}`))return;const h=document.createElement("link");if(h.rel=u?"stylesheet":it,u||(h.as="script"),h.crossOrigin="",h.href=d,c&&h.setAttribute("nonce",c),document.head.appendChild(h),u)return new Promise((f,_)=>{h.addEventListener("load",f),h.addEventListener("error",()=>_(new Error(`Unable to preload CSS for ${d}`)))})}))}function r(l){const i=new Event("vite:preloadError",{cancelable:!0});if(i.payload=l,window.dispatchEvent(i),!i.defaultPrevented)throw l}return o.then(l=>{for(const i of l||[])i.status==="rejected"&&r(i.reason);return t().catch(r)})},re=p.createContext(void 0),ct=({children:e})=>{const[t,a]=p.useState(()=>localStorage.getItem("theme")||"light");p.useEffect(()=>{localStorage.setItem("theme",t),document.documentElement.classList.toggle("dark",t==="dark")},[t]);const n=()=>{a(o=>o==="light"?"dark":"light")};return s.jsx(re.Provider,{value:{theme:t,toggleTheme:n},children:e})},dt=()=>{const e=p.useContext(re);if(!e)throw new Error("useTheme must be used within a ThemeProvider");return e},ae=p.createContext(void 0),Ht=()=>{const e=p.useContext(ae);if(!e)throw new Error("useHistory must be used within a HistoryProvider");return e},ut=({children:e})=>{const[t,a]=p.useState(()=>{const l=localStorage.getItem("qrHistory");return l?JSON.parse(l):[]});p.useEffect(()=>{localStorage.setItem("qrHistory",JSON.stringify(t))},[t]);const n=l=>{a(i=>[l,...i.slice(0,29)])},o=()=>{a([])},r=l=>{a(i=>i.filter(c=>c.id!==l))};return s.jsx(ae.Provider,{value:{history:t,addToHistory:n,clearHistory:o,removeFromHistory:r},children:e})};/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var pt={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const mt=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase().trim(),g=(e,t)=>{const a=p.forwardRef(({color:n="currentColor",size:o=24,strokeWidth:r=2,absoluteStrokeWidth:l,className:i="",children:c,...d},u)=>p.createElement("svg",{ref:u,...pt,width:o,height:o,stroke:n,strokeWidth:l?Number(r)*24/Number(o):r,className:["lucide",`lucide-${mt(e)}`,i].join(" "),...d},[...t.map(([y,h])=>p.createElement(y,h)),...Array.isArray(c)?c:[c]]));return a.displayName=`${e}`,a};/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ht=g("ArrowUp",[["path",{d:"m5 12 7-7 7 7",key:"hav0vg"}],["path",{d:"M12 19V5",key:"x0mq9r"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const yt=g("Facebook",[["path",{d:"M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",key:"1jg4f8"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ft=g("History",[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}],["path",{d:"M12 7v5l4 2",key:"1fdv2h"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xt=g("Home",[["path",{d:"m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"y5dka4"}],["polyline",{points:"9 22 9 12 15 12 15 22",key:"e2us08"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const gt=g("Layers",[["path",{d:"m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z",key:"8b97xw"}],["path",{d:"m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65",key:"dd6zsq"}],["path",{d:"m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65",key:"ep9fru"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vt=g("Linkedin",[["path",{d:"M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z",key:"c2jq9f"}],["rect",{width:"4",height:"12",x:"2",y:"9",key:"mk3on5"}],["circle",{cx:"4",cy:"4",r:"2",key:"bt5ra8"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const bt=g("Mail",[["rect",{width:"20",height:"16",x:"2",y:"4",rx:"2",key:"18n3k1"}],["path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",key:"1ocrg3"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const kt=g("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Y=g("Moon",[["path",{d:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",key:"a7tn18"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=g("QrCode",[["rect",{width:"5",height:"5",x:"3",y:"3",rx:"1",key:"1tu5fj"}],["rect",{width:"5",height:"5",x:"16",y:"3",rx:"1",key:"1v8r4q"}],["rect",{width:"5",height:"5",x:"3",y:"16",rx:"1",key:"1x03jg"}],["path",{d:"M21 16h-3a2 2 0 0 0-2 2v3",key:"177gqh"}],["path",{d:"M21 21v.01",key:"ents32"}],["path",{d:"M12 7v3a2 2 0 0 1-2 2H7",key:"8crl2c"}],["path",{d:"M3 12h.01",key:"nlz23k"}],["path",{d:"M12 3h.01",key:"n36tog"}],["path",{d:"M12 16v.01",key:"133mhm"}],["path",{d:"M16 12h1",key:"1slzba"}],["path",{d:"M21 12v.01",key:"1lwtk9"}],["path",{d:"M12 21v-1",key:"1880an"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const wt=g("Scan",[["path",{d:"M3 7V5a2 2 0 0 1 2-2h2",key:"aa7l1z"}],["path",{d:"M17 3h2a2 2 0 0 1 2 2v2",key:"4qcy5o"}],["path",{d:"M21 17v2a2 2 0 0 1-2 2h-2",key:"6vwrx8"}],["path",{d:"M7 21H5a2 2 0 0 1-2-2v-2",key:"ioqczr"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Z=g("Sun",[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jt=g("Twitter",[["path",{d:"M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z",key:"pff0z6"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _t=g("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);function se(e){var t,a,n="";if(typeof e=="string"||typeof e=="number")n+=e;else if(typeof e=="object")if(Array.isArray(e)){var o=e.length;for(t=0;t<o;t++)e[t]&&(a=se(e[t]))&&(n&&(n+=" "),n+=a)}else for(a in e)e[a]&&(n&&(n+=" "),n+=a);return n}function Et(){for(var e,t,a=0,n="",o=arguments.length;a<o;a++)(e=arguments[a])&&(t=se(e))&&(n&&(n+=" "),n+=t);return n}const Nt=({children:e})=>{const[t,a]=p.useState(!1),[n,o]=p.useState(""),r=le(),{theme:l,toggleTheme:i}=dt(),[c,d]=p.useState(!1),u=[{path:"/",label:"Home",icon:xt},{path:"/generator",label:"Generator",icon:I},{path:"/history",label:"History",icon:ft},{path:"/scanner",label:"Scanner",icon:wt},{path:"/bulk",label:"Bulk",icon:gt}],y=[{label:"About",path:"/about"},{label:"Privacy Policy",path:"/privacy"},{label:"Terms of Service",path:"/terms"},{label:"Contact",path:"/contact"}],h=[{icon:yt,href:"https://www.facebook.com/goqrgen/",label:"Facebook"},{icon:jt,href:"https://x.com/goqrgen",label:"Twitter (X)"},{icon:vt,href:"https://www.linkedin.com/in/monukumar/",label:"LinkedIn"}],f=m=>{if(m.preventDefault(),!n){D.error("Please enter your email address");return}if(!/\S+@\S+\.\S+/.test(n)){D.error("Please enter a valid email address");return}D.success("Thank you for subscribing!"),o("")},_=m=>r.pathname===m,V=m=>Et("flex items-center gap-2 py-2 px-4 rounded-lg transition-all duration-300",{"bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium":_(m),"text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800":!_(m)});b.useEffect(()=>{const m=()=>{d(window.scrollY>400)};return window.addEventListener("scroll",m),()=>window.removeEventListener("scroll",m)},[]);const oe=()=>{window.scrollTo({top:0,behavior:"smooth"})};return s.jsxs("div",{className:"min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden",children:[s.jsxs("header",{className:"bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-opacity-90",children:[s.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:s.jsxs("div",{className:"flex justify-between h-16",children:[s.jsx("div",{className:"flex items-center",children:s.jsxs(T,{to:"/",className:"flex items-center group",children:[s.jsx(I,{className:"h-8 w-8 text-primary-600 dark:text-primary-400 transition-transform group-hover:scale-110"}),s.jsx("span",{className:"ml-2 text-xl font-bold text-gray-900 dark:text-white",children:"GOQRGen"})]})}),s.jsxs("nav",{className:"hidden md:flex items-center space-x-4",children:[u.map(m=>s.jsxs(T,{to:m.path,className:V(m.path),children:[s.jsx(m.icon,{className:"h-5 w-5"}),s.jsx("span",{children:m.label})]},m.path)),s.jsx("button",{onClick:i,className:"p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors","aria-label":`Switch to ${l==="light"?"dark":"light"} mode`,children:l==="light"?s.jsx(Y,{className:"h-5 w-5"}):s.jsx(Z,{className:"h-5 w-5"})})]}),s.jsxs("div",{className:"flex items-center md:hidden",children:[s.jsx("button",{onClick:i,className:"p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mr-2","aria-label":`Switch to ${l==="light"?"dark":"light"} mode`,children:l==="light"?s.jsx(Y,{className:"h-5 w-5"}):s.jsx(Z,{className:"h-5 w-5"})}),s.jsx("button",{onClick:()=>a(!t),className:"p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none","aria-label":"Toggle menu",children:t?s.jsx(_t,{className:"h-6 w-6"}):s.jsx(kt,{className:"h-6 w-6"})})]})]})}),t&&s.jsx("div",{className:"md:hidden",children:s.jsx("div",{className:"pt-2 pb-4 space-y-1 px-4",children:u.map(m=>s.jsxs(T,{to:m.path,className:V(m.path),onClick:()=>a(!1),children:[s.jsx(m.icon,{className:"h-5 w-5"}),s.jsx("span",{children:m.label})]},m.path))})})]}),s.jsx("main",{className:"w-full max-w-7xl mx-auto py-6 px-2 sm:px-6 lg:px-8",children:s.jsx("div",{className:"px-0 py-6 sm:px-0",children:e})}),s.jsx("button",{onClick:oe,className:`fixed bottom-8 right-8 bg-purple-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50 ${c?"opacity-100 translate-y-0":"opacity-0 translate-y-16"}`,"aria-label":"Back to top",style:{pointerEvents:c?"auto":"none"},children:s.jsx(ht,{className:"h-6 w-6"})}),s.jsx("footer",{className:"w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700",children:s.jsxs("div",{className:"w-full max-w-7xl mx-auto py-12 px-2 sm:px-6 lg:px-8",children:[s.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-8",children:[s.jsxs("div",{className:"space-y-4",children:[s.jsxs("div",{className:"flex items-center",children:[s.jsx(I,{className:"h-8 w-8 text-primary-600 dark:text-primary-400"}),s.jsx("span",{className:"ml-2 text-xl font-bold text-gray-900 dark:text-white",children:"GOQRGen"})]}),s.jsx("p",{className:"text-gray-600 dark:text-gray-400",children:"Create beautiful, customizable QR codes for your business, events, or personal use. Advanced features and professional designs at your fingertips."}),s.jsx("div",{className:"flex space-x-4",children:h.map(m=>s.jsx("a",{href:m.href,target:"_blank",rel:"noopener noreferrer",className:"text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors","aria-label":m.label,children:s.jsx(m.icon,{className:"h-6 w-6"})},m.label))})]}),s.jsxs("div",{children:[s.jsx("h3",{className:"text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4",children:"Quick Links"}),s.jsx("ul",{className:"space-y-3",children:y.map(m=>s.jsx("li",{children:s.jsx(T,{to:m.path,className:"text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors",children:m.label})},m.label))})]}),s.jsxs("div",{children:[s.jsx("h3",{className:"text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4",children:"Stay Updated"}),s.jsx("p",{className:"text-gray-600 dark:text-gray-400 text-sm mb-4",children:"Subscribe to our newsletter for the latest features and updates."}),s.jsxs("form",{onSubmit:f,className:"flex",children:[s.jsxs("div",{className:"relative flex-1",children:[s.jsx(bt,{className:"absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"}),s.jsx("input",{type:"email",value:n,onChange:m=>o(m.target.value),placeholder:"Enter your email",className:"w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"})]}),s.jsx("button",{type:"submit",className:"px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-r-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900",children:"Subscribe"})]})]})]}),s.jsx("div",{className:"mt-8 pt-8 border-t border-gray-200 dark:border-gray-700",children:s.jsxs("p",{className:"text-center text-gray-500 dark:text-gray-400 text-sm",children:["© ",new Date().getFullYear()," GOQRGen. All rights reserved."]})})]})})]})},Pt=b.lazy(()=>k(()=>import("./HomePage-B6YBrxkB.js"),__vite__mapDeps([0,1,2,3,4]))),W=b.lazy(()=>k(()=>import("./GeneratorPage-B6Johxl2.js"),__vite__mapDeps([5,1,2,3,4]))),St=b.lazy(()=>k(()=>import("./HistoryPage-Ci6F9k-H.js"),__vite__mapDeps([6,1,7,8,9,10,3,4]))),Lt=b.lazy(()=>k(()=>import("./ScannerPage-CBahoSEv.js"),__vite__mapDeps([11,1]))),Rt=b.lazy(()=>k(()=>import("./BulkPage-MlZcsO3s.js"),__vite__mapDeps([12,1,8,10,3]))),Ot=b.lazy(()=>k(()=>import("./AboutPage-D8y7h5Ob.js"),__vite__mapDeps([13,1]))),Tt=b.lazy(()=>k(()=>import("./PrivacyPolicyPage-CKLDQP1Z.js"),__vite__mapDeps([14,1]))),Ct=b.lazy(()=>k(()=>import("./TermsPage-Dqvqo5sj.js"),__vite__mapDeps([15,1]))),Mt=b.lazy(()=>k(()=>import("./ContactPage-BnA5vVYg.js"),__vite__mapDeps([16,1]))),At=b.lazy(()=>k(()=>import("./NotFoundPage-Br9Y1ckW.js"),__vite__mapDeps([17,1])));function zt(){const e={};return s.jsx(ce,{context:e,children:s.jsx(ct,{children:s.jsx(ut,{children:s.jsx(de,{children:s.jsx(Nt,{children:s.jsx(p.Suspense,{fallback:s.jsx("div",{className:"flex justify-center items-center min-h-screen text-xl",children:"Loading..."}),children:s.jsxs(ue,{children:[s.jsx(v,{path:"/",element:s.jsx(Pt,{})}),s.jsx(v,{path:"/generator",element:s.jsx(W,{})}),s.jsx(v,{path:"/generator/:type",element:s.jsx(W,{})}),s.jsx(v,{path:"/history",element:s.jsx(St,{})}),s.jsx(v,{path:"/scanner",element:s.jsx(Lt,{})}),s.jsx(v,{path:"/bulk",element:s.jsx(Rt,{})}),s.jsx(v,{path:"/about",element:s.jsx(Ot,{})}),s.jsx(v,{path:"/privacy",element:s.jsx(Tt,{})}),s.jsx(v,{path:"/terms",element:s.jsx(Ct,{})}),s.jsx(v,{path:"/contact",element:s.jsx(Mt,{})}),s.jsx(v,{path:"/404",element:s.jsx(At,{})}),s.jsx(v,{path:"*",element:s.jsx(pe,{to:"/404",replace:!0})})]})})})})})})})}fe.createRoot(document.getElementById("root")).render(s.jsxs(p.StrictMode,{children:[s.jsx(zt,{}),s.jsx(nt,{position:"top-right"})]}));export{ht as A,yt as F,ft as H,gt as L,bt as M,I as Q,wt as S,jt as T,D as V,_t as X,k as _,vt as a,xt as b,g as c,s as j,Ht as u};
