import{n as e}from"./chunk-jRWAZmH_.js";import{St as t,Tt as n}from"./iframe-cSkD6HDI.js";import{n as r,t as i}from"./lit-helpers-d8c58N_k.js";import{n as a,t as o}from"./is-test-mode-CTyrSANe.js";import{getSampleCommerceEngineConfiguration as s}from"/headless/v3.50.1/commerce/headless.esm.js";var c,l,u,d=e((()=>{t(),i(),o(),c=({engineConfig:e,skipFirstRequest:t,type:i=`search`,includeCodeRoot:o=!0,disableStateReflectionInUrl:c=!1,analytics:l=a()}={})=>({decorator:e=>n`
    <atomic-commerce-interface
      ${r(o?{id:`code-root`}:{})}
      type="${i}"
      ?disable-state-reflection-in-url=${c}
      .analytics=${l}
    >
      ${e()}
    </atomic-commerce-interface>
  `,play:async({canvasElement:n})=>{await customElements.whenDefined(`atomic-commerce-interface`);let r=n.querySelector(`atomic-commerce-interface`);await r.initialize({...s(),...e}),!t&&await r.executeFirstRequest()}}),l=async({canvasElement:e})=>{await e.querySelector(`atomic-commerce-interface`).executeFirstRequest()},u=async(e,t)=>{let n=[`atomic-commerce-facet`,`atomic-commerce-timeframe-facet`,`atomic-commerce-numeric-facet`,`atomic-commerce-category-facet`].filter(t=>t!==e);await new Promise(e=>{let r=()=>{let i=t.canvasElement.querySelector(`atomic-commerce-facets`);if(i&&n.reduce((e,t)=>e+i.querySelectorAll(t).length,0)>0){e();return}setTimeout(r,100)};r()});let r=t.canvasElement.querySelector(`atomic-commerce-facets`);r&&(n.forEach(e=>{r.querySelectorAll(e).forEach(e=>{e.style.display=`none`})}),r.querySelectorAll(e).forEach((e,t)=>{t>0&&(e.style.display=`none`)}))}}));export{c as i,u as n,d as r,l as t};