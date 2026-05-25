import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n}from"./iframe-cSkD6HDI.js";import{n as r,t as i}from"./common-meta-parameters-BmIbTEf7.js";import{n as a,t as o}from"./mock-CijMLWxR.js";import{n as s,t as c}from"./insight-interface-wrapper-BwybnAhf.js";import{n as l,r as u,t as d}from"./facets-decorator-DYB9S-w4.js";var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D=e((()=>{t(),a(),i(),l(),c(),f=new o,p=[{start:`past-1-hour`,end:`now`,state:`idle`,numberOfResults:12,endInclusive:!1},{start:`past-1-day`,end:`now`,state:`idle`,numberOfResults:45,endInclusive:!1},{start:`past-1-week`,end:`now`,state:`idle`,numberOfResults:87,endInclusive:!1},{start:`past-1-month`,end:`now`,state:`idle`,numberOfResults:234,endInclusive:!1},{start:`past-3-months`,end:`now`,state:`idle`,numberOfResults:456,endInclusive:!1},{start:`past-1-year`,end:`now`,state:`idle`,numberOfResults:1234,endInclusive:!1}],m=(e,{moreValuesAvailable:t=!1,facetId:n=`date`,field:r=`date`}={})=>({facetId:n,field:r,moreValuesAvailable:t,values:e,label:`Date`}),f.searchEndpoint.mock(e=>({...e,facets:[m(p),m(p,{facetId:`date_input_range`})]})),h=()=>{f.searchEndpoint.mockOnce(e=>({...e,facets:[m(p),m(p,{facetId:`date_input_range`})]}))},{events:g,args:_,argTypes:v,template:y}=n(`atomic-insight-timeframe-facet`,{excludeCategories:[`methods`]}),{decorator:b,play:x}=s(),S={component:`atomic-insight-timeframe-facet`,title:`Insight/Facet (Timeframe)`,id:`atomic-insight-timeframe-facet`,render:e=>y(e),decorators:[b],parameters:{...r,actions:{handles:g},msw:{handlers:[...f.handlers]}},argTypes:{...v,"depends-on":{control:{type:`object`}}},beforeEach:()=>{f.searchEndpoint.clear()},play:x,args:{..._,"depends-on":`{}`}},C={decorators:[d],args:{field:`date`,"default-slot":`
      <atomic-timeframe unit="hour"></atomic-timeframe>
      <atomic-timeframe unit="day"></atomic-timeframe>
      <atomic-timeframe unit="week"></atomic-timeframe>
      <atomic-timeframe unit="month"></atomic-timeframe>
      <atomic-timeframe unit="quarter"></atomic-timeframe>
      <atomic-timeframe unit="year"></atomic-timeframe>
    `},beforeEach:()=>{h()}},w={name:`With Selected Value`,tags:[`test`],decorators:[d],args:{field:`date`,label:`Date`,"default-slot":`
      <atomic-timeframe unit="hour"></atomic-timeframe>
      <atomic-timeframe unit="day"></atomic-timeframe>
      <atomic-timeframe unit="week"></atomic-timeframe>
      <atomic-timeframe unit="month"></atomic-timeframe>
      <atomic-timeframe unit="quarter"></atomic-timeframe>
      <atomic-timeframe unit="year"></atomic-timeframe>
    `},beforeEach:()=>{let e=p.map(e=>e.start===`past-1-month`?{...e,state:`selected`}:e);f.searchEndpoint.mockOnce(t=>({...t,facets:[m(e),m(p,{facetId:`date_input_range`})]}))}},T={name:`With Date Picker`,tags:[`test`],decorators:[d,u(`before`)],args:{field:`date`,label:`Date`,"with-date-picker":!0,"default-slot":`
      <atomic-timeframe unit="hour"></atomic-timeframe>
      <atomic-timeframe unit="day"></atomic-timeframe>
      <atomic-timeframe unit="week"></atomic-timeframe>
      <atomic-timeframe unit="month"></atomic-timeframe>
      <atomic-timeframe unit="quarter"></atomic-timeframe>
      <atomic-timeframe unit="year"></atomic-timeframe>
    `},beforeEach:()=>{h()}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  decorators: [facetDecorator],
  args: {
    field: 'date',
    'default-slot': \`
      <atomic-timeframe unit="hour"></atomic-timeframe>
      <atomic-timeframe unit="day"></atomic-timeframe>
      <atomic-timeframe unit="week"></atomic-timeframe>
      <atomic-timeframe unit="month"></atomic-timeframe>
      <atomic-timeframe unit="quarter"></atomic-timeframe>
      <atomic-timeframe unit="year"></atomic-timeframe>
    \`
  },
  beforeEach: () => {
    mockDefaultFacetResponse();
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'With Selected Value',
  tags: ['test'],
  decorators: [facetDecorator],
  args: {
    field: 'date',
    label: 'Date',
    'default-slot': \`
      <atomic-timeframe unit="hour"></atomic-timeframe>
      <atomic-timeframe unit="day"></atomic-timeframe>
      <atomic-timeframe unit="week"></atomic-timeframe>
      <atomic-timeframe unit="month"></atomic-timeframe>
      <atomic-timeframe unit="quarter"></atomic-timeframe>
      <atomic-timeframe unit="year"></atomic-timeframe>
    \`
  },
  beforeEach: () => {
    const selectedValues = baseDateFacetValues.map(v => v.start === 'past-1-month' ? {
      ...v,
      state: 'selected'
    } : v);
    mockInsightApi.searchEndpoint.mockOnce(response => ({
      ...response,
      facets: [createDateFacetResponse(selectedValues), createDateFacetResponse(baseDateFacetValues, {
        facetId: 'date_input_range'
      })]
    }));
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: 'With Date Picker',
  tags: ['test'],
  decorators: [facetDecorator, withBreadboxDecorator('before')],
  args: {
    field: 'date',
    label: 'Date',
    'with-date-picker': true,
    'default-slot': \`
      <atomic-timeframe unit="hour"></atomic-timeframe>
      <atomic-timeframe unit="day"></atomic-timeframe>
      <atomic-timeframe unit="week"></atomic-timeframe>
      <atomic-timeframe unit="month"></atomic-timeframe>
      <atomic-timeframe unit="quarter"></atomic-timeframe>
      <atomic-timeframe unit="year"></atomic-timeframe>
    \`
  },
  beforeEach: () => {
    mockDefaultFacetResponse();
  }
}`,...T.parameters?.docs?.source}}},E=[`Default`,`WithSelectedValue`,`WithDatePicker`]}));D();export{C as Default,T as WithDatePicker,w as WithSelectedValue,E as __namedExportsOrder,S as default,D as t};