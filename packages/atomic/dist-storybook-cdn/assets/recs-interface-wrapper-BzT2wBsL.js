import{n as e}from"./chunk-jRWAZmH_.js";import{St as t,Tt as n}from"./iframe-cSkD6HDI.js";import{n as r,t as i}from"./lit-helpers-d8c58N_k.js";import{n as a,t as o}from"./is-test-mode-CTyrSANe.js";import{getSampleRecommendationEngineConfiguration as s}from"/headless/v3.50.1/recommendation/headless.esm.js";var c,l=e((()=>{t(),i(),o(),c=({config:e,skipFirstQuery:t=!1,skipInitialization:i=!1,includeCodeRoot:o=!0,analytics:c=a()}={})=>({decorator:e=>n`
    <atomic-recs-interface
      ${r(o?{id:`code-root`}:{})}
      .analytics=${c}
    >
      ${e()}
    </atomic-recs-interface>
  `,play:async({canvasElement:n,step:r})=>{await customElements.whenDefined(`atomic-recs-interface`);let a=n.querySelector(`atomic-recs-interface`);i||await r(`Render the Recs Interface`,async()=>{await a.initialize({...s(),...e})}),!(t||i)&&await r(`Execute the first search`,async()=>{await a.getRecommendations()})}})}));export{c as n,l as t};