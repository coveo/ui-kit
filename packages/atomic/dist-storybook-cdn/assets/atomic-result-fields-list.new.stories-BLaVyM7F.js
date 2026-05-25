import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n}from"./iframe-cSkD6HDI.js";import{n as r,t as i}from"./common-meta-parameters-BmIbTEf7.js";import{r as a,t as o}from"./search-interface-wrapper-DyJSRxFL.js";import{n as s,t as c}from"./mock-C5ckzz_b.js";import{n as l,t as u}from"./result-list-wrapper-DszKxGnf.js";import{n as d,t as f}from"./result-template-wrapper-BY8u_Pg8.js";var p,m,h,g,_,v,y,b,x,S,C,w,T=e((()=>{t(),s(),i(),u(),f(),o(),p=new c,p.searchEndpoint.mock(e=>({...e,results:e.results.map(e=>({...e,raw:{...e.raw,author:`John Doe`,source:`Documentation`,language:[`en`,`fr`],filetype:`pdf`,date:Date.now()}})).slice(0,1),totalCount:1,totalCountFiltered:1})),{decorator:m,play:h}=a({includeCodeRoot:!1}),{decorator:g}=l(`list`,!1),{decorator:_}=d(),{events:v,args:y,argTypes:b,template:x}=n(`atomic-result-fields-list`,{excludeCategories:[`methods`]}),S={component:`atomic-result-fields-list`,title:`Search/Result Fields List`,id:`atomic-result-fields-list`,render:e=>x(e),decorators:[_,g,m],parameters:{...r,msw:{handlers:[...p.handlers]},actions:{handles:v}},args:{...y,"default-slot":`
          <style>
        .field {
          display: inline-flex;
          white-space: nowrap;
          align-items: center;
        }
        .field-label {
          font-weight: bold;
          margin-right: 0.25rem;
        }
      </style>
      <span class="field">
        <span class="field-label"><atomic-text value="author"></atomic-text>:</span>
        <atomic-result-text field="author"></atomic-result-text>
      </span>

      <span class="field">
        <span class="field-label"><atomic-text value="source"></atomic-text>:</span>
        <atomic-result-text field="source"></atomic-result-text>
      </span>

      <span class="field">
        <span class="field-label"><atomic-text value="language"></atomic-text>:</span>
        <atomic-result-multi-value-text field="language"></atomic-result-multi-value-text>
      </span>

      <span class="field">
        <span class="field-label"><atomic-text value="fileType"></atomic-text>:</span>
        <atomic-result-text field="filetype"></atomic-result-text>
      </span>
    `},argTypes:b,play:h},C={},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{}`,...C.parameters?.docs?.source}}},w=[`Default`]}));T();export{C as Default,w as __namedExportsOrder,S as default,T as t};