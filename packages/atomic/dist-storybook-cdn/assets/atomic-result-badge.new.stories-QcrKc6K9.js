import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n}from"./iframe-cSkD6HDI.js";import{n as r,t as i}from"./common-meta-parameters-BmIbTEf7.js";import{r as a,t as o}from"./search-interface-wrapper-DyJSRxFL.js";import{n as s,t as c}from"./mock-C5ckzz_b.js";import{n as l,t as u}from"./result-list-wrapper-DszKxGnf.js";import{n as d,t as f}from"./result-template-wrapper-BY8u_Pg8.js";var p,m,h,g,_,v,y,b,x,S,C,w,T,E,D=e((()=>{t(),s(),i(),u(),f(),o(),p=new c,p.searchEndpoint.mock(e=>({...e,results:e.results.slice(0,1),totalCount:1,totalCountFiltered:1})),{events:m,args:h,argTypes:g,template:_}=n(`atomic-result-badge`,{excludeCategories:[`methods`]}),{decorator:v,play:y}=a({includeCodeRoot:!1}),{decorator:b}=l(`list`,!1),{decorator:x}=d(),S={component:`atomic-result-badge`,title:`Search/Result Badge`,id:`atomic-result-badge`,render:e=>_(e),decorators:[x,b,v],parameters:{...r,msw:{handlers:[...p.handlers]},actions:{handles:m}},args:h,argTypes:g,play:y},C={name:`Using a field`,args:{field:`title`}},w={name:`Using a label`,args:{label:`Trending`}},T={name:`Using an icon`,args:{label:`Trending`,icon:`https://raw.githubusercontent.com/coveo/ui-kit/main/packages/atomic/src/images/arrow-top-rounded.svg`}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'Using a field',
  args: {
    field: 'title'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'Using a label',
  args: {
    label: 'Trending'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: 'Using an icon',
  args: {
    label: 'Trending',
    icon: 'https://raw.githubusercontent.com/coveo/ui-kit/main/packages/atomic/src/images/arrow-top-rounded.svg'
  }
}`,...T.parameters?.docs?.source}}},E=[`Default`,`WithLabel`,`WithIcon`]}));D();export{C as Default,T as WithIcon,w as WithLabel,E as __namedExportsOrder,S as default,D as t};