import{n as e}from"./chunk-jRWAZmH_.js";import{A as t,D as n,E as r,M as i}from"./iframe-cSkD6HDI.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{r as s,t as c}from"./search-interface-wrapper-DyJSRxFL.js";import{n as l,t as u}from"./mock-C5ckzz_b.js";var d,f,p,m,h,g,_,v,y,b,x,S,C=e((()=>{n(),t(),l(),o(),c(),d=new u,{events:f,args:p,argTypes:m,template:h}=r(`atomic-smart-snippet-feedback-modal`,{excludeCategories:[`methods`]}),g=e=>i`
  <div>
    <button
      id="open-modal-btn"
      style="padding: 8px 16px; cursor: pointer;"
      @click=${e=>{let t=e.target.closest(`div`)?.querySelector(`atomic-smart-snippet-feedback-modal`);t&&(t.isOpen=!0)}}
    >
      Open Feedback Modal
    </button>
    ${e()}
  </div>
`,{decorator:_,play:v}=s(),y={component:`atomic-smart-snippet-feedback-modal`,title:`Search/Smart Snippet Feedback Modal`,id:`atomic-smart-snippet-feedback-modal`,render:e=>h(e),decorators:[g,_],parameters:{...a,actions:{handles:f},msw:{handlers:[...d.handlers]}},args:{...p},argTypes:m,play:v},b={name:`Default`},x={name:`Modal Opened`,args:{"is-open":!0}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'Default'
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'Modal Opened',
  args: {
    'is-open': true
  }
}`,...x.parameters?.docs?.source}}},S=[`Default`,`OpenedModal`]}));C();export{b as Default,x as OpenedModal,S as __namedExportsOrder,y as default,C as t};