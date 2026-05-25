import{n as e}from"./chunk-jRWAZmH_.js";import{St as t,Tt as n}from"./iframe-cSkD6HDI.js";import{n as r,t as i}from"./common-meta-parameters-BmIbTEf7.js";import{r as a,t as o}from"./search-interface-wrapper-DyJSRxFL.js";import{n as s,t as c}from"./mock-C5ckzz_b.js";var l,u,d,f,p,m,h,g=e((()=>{t(),s(),i(),o(),l=new c,{decorator:u,play:d}=a(),f=e=>n`<div style="min-width: 470px;">${e()}</div>`,p={component:`atomic-automatic-facet`,title:`Search/Automatic Facet`,id:`atomic-automatic-facet`,render:()=>n`<atomic-automatic-facet-generator></atomic-automatic-facet-generator>`,decorators:[f,u],parameters:{...r,msw:{handlers:[...l.handlers]}},beforeEach:async()=>{l.searchEndpoint.clear()},play:d},m={beforeEach:async()=>{l.searchEndpoint.mockOnce(e=>({...e,generateAutomaticFacets:{facets:[{field:`objecttype`,label:`Type`,values:[{value:`Document`,numberOfResults:45,state:`idle`},{value:`PDF`,numberOfResults:32,state:`idle`},{value:`Video`,numberOfResults:18,state:`idle`},{value:`Image`,numberOfResults:12,state:`idle`}]}]}}))}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mockOnce(response => ({
      ...response,
      generateAutomaticFacets: {
        facets: [{
          field: 'objecttype',
          label: 'Type',
          values: [{
            value: 'Document',
            numberOfResults: 45,
            state: 'idle'
          }, {
            value: 'PDF',
            numberOfResults: 32,
            state: 'idle'
          }, {
            value: 'Video',
            numberOfResults: 18,
            state: 'idle'
          }, {
            value: 'Image',
            numberOfResults: 12,
            state: 'idle'
          }]
        }]
      }
    }));
  }
}`,...m.parameters?.docs?.source}}},h=[`Default`]}));g();export{m as Default,h as __namedExportsOrder,p as default,g as t};