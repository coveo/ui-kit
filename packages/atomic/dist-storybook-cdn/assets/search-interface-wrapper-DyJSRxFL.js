import{n as e}from"./chunk-jRWAZmH_.js";import{St as t,Tt as n}from"./iframe-cSkD6HDI.js";import{n as r,t as i}from"./lit-helpers-d8c58N_k.js";import{n as a,t as o}from"./is-test-mode-CTyrSANe.js";import{getSampleSearchEngineConfiguration as s}from"/headless/v3.50.1/headless.esm.js";var c,l,u=e((()=>{t(),i(),o(),c=({config:e={},skipFirstSearch:t=!1,includeCodeRoot:i=!0,disableStateReflectionInUrl:o=!1,analytics:c=a()}={})=>({decorator:e=>n`
    <atomic-search-interface
      ${r(i?{id:`code-root`}:{})}
      ?disable-state-reflection-in-url=${o}
      .analytics=${c}
    >
      ${e()}
    </atomic-search-interface>
  `,play:async({canvasElement:n,step:r})=>{await customElements.whenDefined(`atomic-search-interface`);let i=n.querySelector(`atomic-search-interface`);await r(`Render the Search Interface`,async()=>{await i.initialize({...s(),...e})}),!t&&await r(`Execute the first search`,async()=>{await i.executeFirstSearch(),await new Promise(e=>requestAnimationFrame(e))})}}),l=async({canvasElement:e,step:t})=>{let n=e.querySelector(`atomic-search-interface`);await t(`Execute the first search`,async()=>{await n.executeFirstSearch()})}}));export{l as n,c as r,u as t};