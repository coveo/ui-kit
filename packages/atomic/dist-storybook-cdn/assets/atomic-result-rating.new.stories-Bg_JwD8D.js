import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n}from"./iframe-cSkD6HDI.js";import{n as r,t as i}from"./common-meta-parameters-BmIbTEf7.js";import{r as a,t as o}from"./search-interface-wrapper-DyJSRxFL.js";import{n as s,t as c}from"./result-list-wrapper-DszKxGnf.js";import{n as l,t as u}from"./result-template-wrapper-BY8u_Pg8.js";var d,f,p,m,h,g,_,v,y,b,x,S,C,w,T=e((()=>{t(),i(),c(),u(),o(),d=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/></svg>`,{events:f,args:p,argTypes:m,template:h}=n(`atomic-result-rating`,{excludeCategories:[`methods`]}),{decorator:g,play:_}=a({config:{preprocessRequest:e=>{let t=JSON.parse(e.body);return t.aq=`@snrating`,t.fieldsToInclude=[...t.fieldsToInclude,`snrating`],t.numberOfResults=1,e.body=JSON.stringify(t),e}}}),{decorator:v}=s(void 0,!1),{decorator:y}=l(),b={component:`atomic-result-rating`,title:`Search/Result Rating`,id:`atomic-result-rating`,render:e=>h(e),decorators:[y,v,g],parameters:{...r,chromatic:{disableSnapshot:!0},actions:{handles:f}},args:p,argTypes:m,play:_},x={args:{field:`snrating`}},S={name:`With a custom max value`,args:{field:`snrating`,"max-value-in-index":10}},C={name:`With a custom icon`,args:{field:`snrating`,icon:d}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    field: 'snrating'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'With a custom max value',
  args: {
    field: 'snrating',
    'max-value-in-index': 10
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'With a custom icon',
  args: {
    field: 'snrating',
    icon: CircleIcon
  }
}`,...C.parameters?.docs?.source}}},w=[`Default`,`WithAMaxValueInIndex`,`WithADifferentIcon`]}));T();export{x as Default,C as WithADifferentIcon,S as WithAMaxValueInIndex,w as __namedExportsOrder,b as default,T as t};