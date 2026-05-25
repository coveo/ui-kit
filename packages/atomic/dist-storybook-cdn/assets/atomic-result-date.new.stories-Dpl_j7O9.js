import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n}from"./iframe-cSkD6HDI.js";import{n as r,t as i}from"./common-meta-parameters-BmIbTEf7.js";import{r as a,t as o}from"./search-interface-wrapper-DyJSRxFL.js";import{n as s,t as c}from"./mock-C5ckzz_b.js";import{n as l,t as u}from"./result-list-wrapper-DszKxGnf.js";import{n as d,t as f}from"./result-template-wrapper-BY8u_Pg8.js";var p,m,h,g,_,v,y,b,x,S,C,w,T,E,D=e((()=>{t(),s(),i(),u(),f(),o(),p=new c,p.searchEndpoint.mock(e=>({...e,results:e.results.slice(0,1).map(e=>({...e,raw:{...e.raw,date:16094592e5}})),totalCount:1,totalCountFiltered:1})),{decorator:m,play:h}=a({includeCodeRoot:!1}),{decorator:g}=l(`list`,!1),{decorator:_}=d(),{events:v,args:y,argTypes:b,template:x}=n(`atomic-result-date`,{excludeCategories:[`methods`]}),S={component:`atomic-result-date`,title:`Search/Result Date`,id:`atomic-result-date`,render:e=>x(e),decorators:[_,g,m],parameters:{...r,msw:{handlers:[...p.handlers]},actions:{handles:v}},args:y,argTypes:b,play:h},C={},w={name:`With Custom Format`,args:{format:`MMMM D, YYYY [at] h:mm A`}},T={name:`With Relative Time`,args:{"relative-time":!0},beforeEach:async()=>{let e=Date.now()-1440*60*1e3;p.searchEndpoint.mockOnce(t=>({...t,results:t.results.slice(0,1).map(t=>({...t,raw:{...t.raw,date:e}})),totalCount:1,totalCountFiltered:1}))}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'With Custom Format',
  args: {
    format: 'MMMM D, YYYY [at] h:mm A'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: 'With Relative Time',
  args: {
    'relative-time': true
  },
  beforeEach: async () => {
    const yesterday = Date.now() - 24 * 60 * 60 * 1000; // 1 day ago
    searchApiHarness.searchEndpoint.mockOnce(response => ({
      ...response,
      results: response.results.slice(0, 1).map(r => ({
        ...r,
        raw: {
          ...r.raw,
          date: yesterday
        }
      })),
      totalCount: 1,
      totalCountFiltered: 1
    }));
  }
}`,...T.parameters?.docs?.source}}},E=[`Default`,`CustomFormat`,`RelativeTime`]}));D();export{w as CustomFormat,C as Default,T as RelativeTime,E as __namedExportsOrder,S as default,D as t};