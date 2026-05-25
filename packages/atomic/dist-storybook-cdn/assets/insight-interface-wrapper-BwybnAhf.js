import{n as e}from"./chunk-jRWAZmH_.js";import{St as t,Tt as n}from"./iframe-cSkD6HDI.js";import{n as r,t as i}from"./lit-helpers-d8c58N_k.js";import{n as a,t as o}from"./is-test-mode-CTyrSANe.js";import{getSampleInsightEngineConfiguration as s}from"/headless/v3.50.1/insight/headless.esm.js";var c,l=e((()=>{t(),i(),o(),c=(e,t=!1,i=!0,o=a())=>({decorator:e=>n`
    <style data-styles>
      atomic-insight-interface:not([widget='false']),
      atomic-insight-layout:not([widget='false']) {
        width: 500px;
        min-height: 1000px;
        margin-left: auto;
        margin-right: auto;
        box-shadow: 0px 3px 24px 0px #0000001a;
      }
    </style>
    <atomic-insight-interface
      ${r(i?{id:`code-root`}:{})}
      .analytics=${o}
    >
      ${e()}
    </atomic-insight-interface>
  `,play:async({canvasElement:n,step:r})=>{await customElements.whenDefined(`atomic-insight-interface`);let i=n.querySelector(`atomic-insight-interface`);await r(`Render the Insight Interface`,async()=>{await i.initialize({...s(),...e})}),!t&&await r(`Execute the first search`,async()=>{await i.executeFirstSearch()})}})}));export{c as n,l as t};