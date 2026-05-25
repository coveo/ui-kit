import{n as e}from"./chunk-jRWAZmH_.js";import{St as t,Tt as n}from"./iframe-cSkD6HDI.js";import{n as r,t as i}from"./lit-helpers-d8c58N_k.js";import{n as a,t as o}from"./is-test-mode-CTyrSANe.js";import{buildCommerceEngine as s,getSampleCommerceEngineConfiguration as c}from"/headless/v3.50.1/commerce/headless.esm.js";var l,u=e((()=>{t(),i(),o(),l=(e,t=!0,i=a())=>({decorator:e=>n`
    <atomic-commerce-recommendation-interface
      ${r(t?{id:`code-root`}:{})}
      .analytics=${i}
    >
      ${e()}
    </atomic-commerce-recommendation-interface>
  `,play:async({canvasElement:t})=>{await customElements.whenDefined(`atomic-commerce-recommendation-interface`);let n=t.querySelector(`atomic-commerce-recommendation-interface`),r=s({configuration:{...c(),...e}});await n.initializeWithEngine(r)}})}));export{l as n,u as t};