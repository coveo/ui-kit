import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n}from"./iframe-cSkD6HDI.js";import{i as r,r as i,t as a}from"./commerce-interface-wrapper-BFOjNQs_.js";import{n as o,t as s}from"./common-meta-parameters-BmIbTEf7.js";var c,l,u,d,f,p,m,h,g,_,v=e((()=>{t(),i(),s(),{decorator:c,play:l}=r({skipFirstRequest:!0}),{events:u,args:d,argTypes:f,template:p}=n(`atomic-commerce-facets`,{excludeCategories:[`methods`]}),m={component:`atomic-commerce-facets`,title:`Commerce/Facets`,id:`atomic-commerce-facets`,render:e=>p(e),decorators:[c],parameters:{...o,chromatic:{disableSnapshot:!0},actions:{handles:u}},args:d,argTypes:f,play:l},h={play:async e=>{await l(e),await a(e)}},g={name:`During loading`,play:async e=>{await l(e)}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  play: async context => {
    await play(context);
    await executeFirstRequestHook(context);
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: 'During loading',
  play: async context => {
    await play(context);
  }
}`,...g.parameters?.docs?.source}}},_=[`Default`,`LoadingState`]}));v();export{h as Default,g as LoadingState,_ as __namedExportsOrder,m as default,v as t};