import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,St as r,Tt as i}from"./iframe-cSkD6HDI.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{n as s,t as c}from"./mock-C5ckzz_b.js";var l,u,d,f,p,m,h,g,_,v=e((()=>{t(),r(),o(),s(),{events:l,args:u,argTypes:d,template:f}=n(`atomic-external`,{excludeCategories:[`methods`]}),p=new c,m=e=>i`
  <style>
    .wrapper {
      display: flex;
    }

    .wrapper > div {
      padding: 3rem;
    }

    .wrapper > div * {
      margin-bottom: 2rem;
    }

    h1 {
      font-size: 1rem;
    }
  </style>
  <div id="code-root">
    <div class="wrapper">
      <div>
        <h1>External components of interface #2</h1>
        ${e()}
      </div>
      <div>
        <h1>Interface #1, not linked to URL</h1>
        <atomic-search-interface
          data-interface-id="interface-1"
          pipeline="UI_KIT_E2E"
          search-hub="UI_KIT_E2E"
          reflect-state-in-url="false"
        >
          <atomic-query-summary></atomic-query-summary>
          <atomic-numeric-facet
            field="ec_price"
            label="Cost"
            with-input="integer"
          >
            <atomic-format-currency currency="USD"></atomic-format-currency>
          </atomic-numeric-facet>
          <atomic-search-box></atomic-search-box>
          <atomic-result-list></atomic-result-list>
        </atomic-search-interface>
      </div>
      <div>
        <h1>Interface #2, linked to URL</h1>
        <atomic-search-interface data-interface-id="interface-2">
          <atomic-query-summary></atomic-query-summary>
          <atomic-result-list></atomic-result-list>
        </atomic-search-interface>
      </div>
    </div>
  </div>
`,h={component:`atomic-external`,title:`Search/External`,id:`atomic-external`,render:e=>f(e),decorators:[m],parameters:{...a,actions:{handles:l},msw:{handlers:[...p.handlers]}},argTypes:{...d},args:{...u,selector:`[data-interface-id="interface-2"]`,"default-slot":`
      <atomic-search-box></atomic-search-box>
      <atomic-query-summary></atomic-query-summary>
      <atomic-facet field="author" label="Author"></atomic-facet>
    `},play:async e=>{await customElements.whenDefined(`atomic-search-interface`);let t=e.canvasElement.querySelectorAll(`[data-interface-id='interface-1']`),n=e.canvasElement.querySelectorAll(`[data-interface-id='interface-2']`),r=[];t.forEach(e=>{r.push(e.initialize({accessToken:`xxc23ce82a-3733-496e-b37e-9736168c4fd9`,organizationId:`electronicscoveodemocomo0n2fu8v`,analytics:{analyticsMode:`legacy`}}))}),n.forEach(e=>{r.push(e.initialize({accessToken:`xx564559b1-0045-48e1-953c-3addd1ee4457`,organizationId:`searchuisamples`,analytics:{analyticsMode:`legacy`}}))}),await Promise.all(r),t.forEach(e=>{e.executeFirstSearch()}),n.forEach(e=>{e.executeFirstSearch()})}},g={},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{}`,...g.parameters?.docs?.source}}},_=[`Default`]}));v();export{g as Default,_ as __namedExportsOrder,h as default,v as t};