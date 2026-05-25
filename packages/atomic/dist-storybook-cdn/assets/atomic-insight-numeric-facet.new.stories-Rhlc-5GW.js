import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n}from"./iframe-cSkD6HDI.js";import{n as r,t as i}from"./common-meta-parameters-BmIbTEf7.js";import{n as a,t as o}from"./mock-CijMLWxR.js";import{n as s,t as c}from"./insight-interface-wrapper-BwybnAhf.js";import{n as l,r as u,t as d}from"./facets-decorator-DYB9S-w4.js";var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O=e((()=>{t(),a(),i(),l(),c(),f=new o,p=[{start:0,end:88e4,endInclusive:!1,state:`idle`,numberOfResults:59362},{start:88e4,end:176e4,endInclusive:!1,state:`idle`,numberOfResults:1974},{start:176e4,end:264e4,endInclusive:!1,state:`idle`,numberOfResults:638},{start:264e4,end:352e4,endInclusive:!1,state:`idle`,numberOfResults:317},{start:352e4,end:44e5,endInclusive:!1,state:`idle`,numberOfResults:170},{start:44e5,end:616e4,endInclusive:!1,state:`idle`,numberOfResults:91},{start:616e4,end:1144e4,endInclusive:!1,state:`idle`,numberOfResults:115},{start:1144e4,end:704e5,endInclusive:!0,state:`idle`,numberOfResults:67}],f.searchEndpoint.mock(e=>({...e,facets:[{facetId:`ytviewcount`,field:`ytviewcount`,moreValuesAvailable:!1,values:p,indexScore:.23,domain:{start:8,end:70261098}},{facetId:`ytviewcount_input_range`,field:`ytviewcount`,moreValuesAvailable:!1,values:[{start:0,end:1e8,endInclusive:!0,state:`idle`,numberOfResults:500}],indexScore:.23,domain:{start:8,end:70261098}}]})),m=()=>{f.searchEndpoint.mockOnce(e=>({...e,facets:[{facetId:`ytviewcount`,field:`ytviewcount`,moreValuesAvailable:!1,values:p,indexScore:.23,domain:{start:8,end:70261098}},{facetId:`ytviewcount_input_range`,field:`ytviewcount`,moreValuesAvailable:!1,values:[{start:0,end:1e8,endInclusive:!0,state:`idle`,numberOfResults:500}],indexScore:.23,domain:{start:8,end:70261098}}]}))},{events:h,args:g,argTypes:_,template:v}=n(`atomic-insight-numeric-facet`,{excludeCategories:[`methods`]}),{decorator:y,play:b}=s(),x={component:`atomic-insight-numeric-facet`,title:`Insight/Facet (Numeric)`,id:`atomic-insight-numeric-facet`,render:e=>v(e),decorators:[y],parameters:{...r,actions:{handles:h},msw:{handlers:[...f.handlers]}},argTypes:{..._,"depends-on":{control:{type:`object`}}},beforeEach:()=>{f.searchEndpoint.clear()},play:b,args:{...g,"number-of-values":8,"depends-on":`{}`}},S={decorators:[d],args:{field:`ytviewcount`},beforeEach:()=>{m()}},C={name:`With Input (Integer)`,tags:[`test`],decorators:[d,u(`before`)],args:{label:`YouTube View Count`,field:`ytviewcount`,"with-input":`integer`},beforeEach:()=>{m()}},w={name:`Display As Link`,decorators:[d],args:{field:`ytviewcount`,label:`YouTube View Count`,"display-values-as":`link`},beforeEach:()=>{m()}},T={decorators:[d],args:{field:`ytviewcount`,label:`YouTube View Count`,"is-collapsed":!0},beforeEach:()=>{m()}},E={name:`With Selected Value`,tags:[`test`],decorators:[d],args:{field:`ytviewcount`,label:`YouTube View Count`},beforeEach:()=>{let e=p.map((e,t)=>t===0?{...e,state:`selected`}:e);f.searchEndpoint.mockOnce(t=>({...t,facets:[{facetId:`ytviewcount`,field:`ytviewcount`,moreValuesAvailable:!1,values:e,indexScore:.23,domain:{start:8,end:70261098}}]}))}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  decorators: [facetDecorator],
  args: {
    field: 'ytviewcount'
  },
  beforeEach: () => {
    mockDefaultFacetResponse();
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'With Input (Integer)',
  tags: ['test'],
  decorators: [facetDecorator, withBreadboxDecorator('before')],
  args: {
    label: 'YouTube View Count',
    field: 'ytviewcount',
    'with-input': 'integer'
  },
  beforeEach: () => {
    mockDefaultFacetResponse();
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'Display As Link',
  decorators: [facetDecorator],
  args: {
    field: 'ytviewcount',
    label: 'YouTube View Count',
    'display-values-as': 'link'
  },
  beforeEach: () => {
    mockDefaultFacetResponse();
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  decorators: [facetDecorator],
  args: {
    field: 'ytviewcount',
    label: 'YouTube View Count',
    'is-collapsed': true
  },
  beforeEach: () => {
    mockDefaultFacetResponse();
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  name: 'With Selected Value',
  tags: ['test'],
  decorators: [facetDecorator],
  args: {
    field: 'ytviewcount',
    label: 'YouTube View Count'
  },
  beforeEach: () => {
    const selectedValues = numericFacetValues.map((v, i) => i === 0 ? {
      ...v,
      state: 'selected'
    } : v);
    mockInsightApi.searchEndpoint.mockOnce(response => ({
      ...response,
      facets: [{
        facetId: 'ytviewcount',
        field: 'ytviewcount',
        moreValuesAvailable: false,
        values: selectedValues,
        indexScore: 0.23,
        domain: {
          start: 8,
          end: 70261098
        }
      }]
    }));
  }
}`,...E.parameters?.docs?.source}}},D=[`Default`,`WithInputInteger`,`DisplayAsLink`,`Collapsed`,`WithSelectedValue`]}));O();export{T as Collapsed,S as Default,w as DisplayAsLink,C as WithInputInteger,E as WithSelectedValue,D as __namedExportsOrder,x as default,O as t};