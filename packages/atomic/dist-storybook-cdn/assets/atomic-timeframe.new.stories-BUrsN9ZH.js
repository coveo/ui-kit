import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,St as r,Tt as i}from"./iframe-cSkD6HDI.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{r as s,t as c}from"./search-interface-wrapper-DyJSRxFL.js";import{n as l,t as u}from"./mock-C5ckzz_b.js";var d,f,p,m,h,g,_,v,y,b,x,S,C,w=e((()=>{t(),r(),l(),o(),c(),d=new u,{decorator:f,play:p}=s({includeCodeRoot:!1}),{events:m,args:h,argTypes:g,template:_}=n(`atomic-timeframe`,{excludeCategories:[`methods`]}),v={component:`atomic-timeframe`,title:`Common/Timeframe`,id:`atomic-timeframe`,render:e=>i`
    <atomic-timeframe-facet id="code-root" field="date" label="Date">
      ${_(e)}
    </atomic-timeframe-facet>
  `,decorators:[f],parameters:{...a,msw:{handlers:[...d.handlers]},actions:{handles:m}},args:{...h,unit:`week`,amount:1,period:`past`},argTypes:{...g,unit:{control:{type:`select`},options:[`minute`,`hour`,`day`,`week`,`month`,`quarter`,`year`]},amount:{control:{type:`number`,min:1}}},beforeEach:async()=>{d.searchEndpoint.clear()},play:p},y={args:{period:`past`,unit:`week`,amount:1},beforeEach:async()=>{let e=Date.now();d.searchEndpoint.mockOnce(t=>`results`in t?{...t,results:t.results.slice(0,10).map((t,n)=>({...t,raw:{...t.raw,date:e-n*24*60*60*1e3}})),facets:[...t.facets,{facetId:`date`,field:`date`,moreValuesAvailable:!1,values:[{start:`past-1-week`,end:`now`,endInclusive:!1,state:`idle`,numberOfResults:7}]}]}:t)}},b={name:`Past Timeframe`,args:{period:`past`,unit:`month`,amount:3},beforeEach:async()=>{let e=Date.now();d.searchEndpoint.mockOnce(t=>`results`in t?{...t,results:t.results.slice(0,10).map((t,n)=>({...t,raw:{...t.raw,date:e-n*2592e6*.3}})),facets:[...t.facets,{facetId:`date`,field:`date`,moreValuesAvailable:!1,values:[{start:`past-3-month`,end:`now`,endInclusive:!1,state:`idle`,numberOfResults:42}]}]}:t)}},x={name:`Next Timeframe`,args:{period:`next`,unit:`year`,amount:1},beforeEach:async()=>{let e=Date.now();d.searchEndpoint.mockOnce(t=>`results`in t?{...t,results:t.results.slice(0,10).map((t,n)=>({...t,raw:{...t.raw,date:e+(n+1)*31536e6}})),facets:[...t.facets,{facetId:`date`,field:`date`,moreValuesAvailable:!1,values:[{start:`now`,end:`next-1-year`,endInclusive:!1,state:`idle`,numberOfResults:5}]}]}:t)}},S={name:`With Custom Label`,args:{period:`past`,unit:`month`,amount:6,label:`Last Semester`},beforeEach:async()=>{let e=Date.now();d.searchEndpoint.mockOnce(t=>`results`in t?{...t,results:t.results.slice(0,10).map((t,n)=>({...t,raw:{...t.raw,date:e-n*2592e6*.6}})),facets:[...t.facets,{facetId:`date`,field:`date`,moreValuesAvailable:!1,values:[{start:`past-6-month`,end:`now`,endInclusive:!1,state:`idle`,numberOfResults:28}]}]}:t)}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    period: 'past',
    unit: 'week',
    amount: 1
  },
  beforeEach: async () => {
    const now = Date.now();
    searchApiHarness.searchEndpoint.mockOnce(response => {
      if (!('results' in response)) return response;
      return {
        ...response,
        // oxlint-disable-next-line @typescript-eslint/no-explicit-any -- Mock response type needs flexibility
        results: response.results.slice(0, 10).map((r: any, i: number) => ({
          ...r,
          raw: {
            ...r.raw,
            date: now - i * 24 * 60 * 60 * 1000 // Past dates: last 10 days
          }
        })),
        facets: [...response.facets, {
          facetId: 'date',
          field: 'date',
          moreValuesAvailable: false,
          values: [{
            start: 'past-1-week',
            end: 'now',
            endInclusive: false,
            state: 'idle',
            numberOfResults: 7
          }]
        }]
      };
    });
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'Past Timeframe',
  args: {
    period: 'past',
    unit: 'month',
    amount: 3
  },
  beforeEach: async () => {
    const now = Date.now();
    const oneMonth = 30 * 24 * 60 * 60 * 1000;
    searchApiHarness.searchEndpoint.mockOnce(response => {
      if (!('results' in response)) return response;
      return {
        ...response,
        // oxlint-disable-next-line @typescript-eslint/no-explicit-any -- Mock response type needs flexibility
        results: response.results.slice(0, 10).map((r: any, i: number) => ({
          ...r,
          raw: {
            ...r.raw,
            date: now - i * oneMonth * 0.3 // Spread over last 3 months
          }
        })),
        facets: [...response.facets, {
          facetId: 'date',
          field: 'date',
          moreValuesAvailable: false,
          values: [{
            start: 'past-3-month',
            end: 'now',
            endInclusive: false,
            state: 'idle',
            numberOfResults: 42
          }]
        }]
      };
    });
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'Next Timeframe',
  args: {
    period: 'next',
    unit: 'year',
    amount: 1
  },
  beforeEach: async () => {
    const now = Date.now();
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    searchApiHarness.searchEndpoint.mockOnce(response => {
      if (!('results' in response)) return response;
      return {
        ...response,
        // oxlint-disable-next-line @typescript-eslint/no-explicit-any -- Mock response type needs flexibility
        results: response.results.slice(0, 10).map((r: any, i: number) => ({
          ...r,
          raw: {
            ...r.raw,
            date: now + (i + 1) * oneYear // Future dates: 1-10 years from now
          }
        })),
        facets: [...response.facets, {
          facetId: 'date',
          field: 'date',
          moreValuesAvailable: false,
          values: [{
            start: 'now',
            end: 'next-1-year',
            endInclusive: false,
            state: 'idle',
            numberOfResults: 5
          }]
        }]
      };
    });
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'With Custom Label',
  args: {
    period: 'past',
    unit: 'month',
    amount: 6,
    label: 'Last Semester'
  },
  beforeEach: async () => {
    const now = Date.now();
    const oneMonth = 30 * 24 * 60 * 60 * 1000;
    searchApiHarness.searchEndpoint.mockOnce(response => {
      if (!('results' in response)) return response;
      return {
        ...response,
        // oxlint-disable-next-line @typescript-eslint/no-explicit-any -- Mock response type needs flexibility
        results: response.results.slice(0, 10).map((r: any, i: number) => ({
          ...r,
          raw: {
            ...r.raw,
            date: now - i * oneMonth * 0.6 // Spread over last 6 months
          }
        })),
        facets: [...response.facets, {
          facetId: 'date',
          field: 'date',
          moreValuesAvailable: false,
          values: [{
            start: 'past-6-month',
            end: 'now',
            endInclusive: false,
            state: 'idle',
            numberOfResults: 28
          }]
        }]
      };
    });
  }
}`,...S.parameters?.docs?.source}}},C=[`Default`,`WithPastPeriod`,`WithNextPeriod`,`WithCustomLabel`]}));w();export{y as Default,S as WithCustomLabel,x as WithNextPeriod,b as WithPastPeriod,C as __namedExportsOrder,v as default,w as t};