import{n as e}from"./chunk-jRWAZmH_.js";import{A as t,D as n,E as r,M as i}from"./iframe-cSkD6HDI.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{getSampleSearchEngineConfiguration as s}from"/headless/v3.50.1/headless.esm.js";async function c(e){await customElements.whenDefined(`atomic-search-interface`),await e.querySelector(`atomic-search-interface`).initialize(s())}var l,u,d,f,p,m,h,g,_=e((()=>{n(),t(),o(),{events:l,args:u,argTypes:d,template:f}=r(`atomic-ipx-button`,{excludeCategories:[`methods`]}),p={component:`atomic-ipx-button`,title:`IPX/Button`,id:`atomic-ipx-button`,render:e=>i`
    <style>
      atomic-ipx-button::part(ipx-button) {
        position: relative;
        right: auto;
        bottom: auto;
      }
      atomic-ipx-modal {
        position: relative;
        inset: auto;
      }
    </style>
    <atomic-search-interface>
      <atomic-ipx-modal>
        <div slot="header"><p>Header Content</p></div>
        <div slot="body"><p>Body Content</p></div>
        <div slot="footer"><p>Footer Content</p></div>
      </atomic-ipx-modal>
      ${f(e)}
    </atomic-search-interface>
  `,parameters:{...a,chromatic:{disableSnapshot:!0},actions:{handles:l}},args:{...u},argTypes:d,play:async e=>{await c(e.canvasElement)}},m={name:`Default`},h={name:`With label`,args:{label:`Help`}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: 'Default'
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: 'With label',
  args: {
    label: 'Help'
  }
}`,...h.parameters?.docs?.source}}},g=[`Default`,`WithLabel`]}));_();export{m as Default,h as WithLabel,g as __namedExportsOrder,p as default,_ as t};