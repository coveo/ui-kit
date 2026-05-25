import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n}from"./iframe-cSkD6HDI.js";import{n as r,t as i}from"./common-meta-parameters-BmIbTEf7.js";import{r as a,t as o}from"./search-interface-wrapper-DyJSRxFL.js";import{n as s,t as c}from"./mock-C5ckzz_b.js";var l,u,d,f,p,m,h,g,_,v,y=e((()=>{t(),s(),i(),o(),l=new c,{decorator:u,play:d}=a(),{events:f,args:p,argTypes:m,template:h}=n(`atomic-no-results`,{excludeCategories:[`methods`]}),g={component:`atomic-no-results`,title:`Search/No Results`,id:`atomic-no-results`,render:e=>h(e),decorators:[u],parameters:{...r,actions:{handles:f},msw:{handlers:[...l.handlers]}},args:p,argTypes:m,beforeEach:async()=>{l.searchEndpoint.clear()},play:d},_={name:`atomic-no-results`,beforeEach:async()=>{l.searchEndpoint.mockOnce(e=>({...e,results:[],totalCount:0,totalCountFiltered:0}))}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  name: 'atomic-no-results',
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mockOnce(response => ({
      ...response,
      results: [],
      totalCount: 0,
      totalCountFiltered: 0
    }));
  }
}`,..._.parameters?.docs?.source}}},v=[`Default`]}));y();export{_ as Default,v as __namedExportsOrder,g as default,y as t};