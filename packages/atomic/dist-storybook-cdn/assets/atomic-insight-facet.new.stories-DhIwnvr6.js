import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n}from"./iframe-cSkD6HDI.js";import{n as r,t as i}from"./common-meta-parameters-BmIbTEf7.js";import{n as a,t as o}from"./mock-CijMLWxR.js";import{n as s,t as c}from"./insight-interface-wrapper-BwybnAhf.js";import{n as l,t as u}from"./facets-decorator-DYB9S-w4.js";var d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O=e((()=>{t(),a(),i(),l(),c(),{decorator:d,play:f}=s(),{events:p,args:m,argTypes:h,template:g}=n(`atomic-insight-facet`,{excludeCategories:[`methods`]}),_=new o,v=()=>{_.searchEndpoint.mockOnce(e=>e)},y=[`alphanumeric`,`alphanumericDescending`,`alphanumericNatural`,`alphanumericNaturalDescending`,`automatic`,`occurrences`,`score`],b={component:`atomic-insight-facet`,title:`Insight/Facet`,id:`atomic-insight-facet`,render:e=>g(e),decorators:[d],parameters:{...r,actions:{handles:p},msw:{handlers:[..._.handlers]}},argTypes:{...h,"sort-criteria":{control:`select`,options:y,type:`string`}},beforeEach:()=>{_.searchEndpoint.clear()},play:f,args:{...m,"number-of-values":8}},x={args:{field:`objecttype`},decorators:[u],beforeEach:()=>{v()}},S={tags:[`test`],args:{field:`objecttype`,"display-values-as":`link`},decorators:[u],beforeEach:()=>{v()}},C={tags:[`test`],args:{field:`objecttype`,"display-values-as":`box`},decorators:[u],beforeEach:()=>{v()}},w={tags:[`test`],args:{field:`objecttype`,"enable-exclusion":!0},decorators:[u],beforeEach:()=>{v()}},T={tags:[`test`],args:{field:`objecttype`},decorators:[u],beforeEach:()=>{_.searchEndpoint.mockOnce(e=>{let t=e.facets?.map(e=>e.field===`objecttype`?{...e,values:e.values.map((e,t)=>t===0?{...e,state:`selected`}:e)}:e);return{...e,facets:t}})}},E={tags:[`test`],args:{field:`objecttype`,"is-collapsed":!0},decorators:[u],beforeEach:()=>{v()}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    field: 'objecttype'
  },
  decorators: [facetDecorator],
  beforeEach: () => {
    mockDefaultFacetResponse();
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  tags: ['test'],
  args: {
    field: 'objecttype',
    'display-values-as': 'link'
  },
  decorators: [facetDecorator],
  beforeEach: () => {
    mockDefaultFacetResponse();
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  tags: ['test'],
  args: {
    field: 'objecttype',
    'display-values-as': 'box'
  },
  decorators: [facetDecorator],
  beforeEach: () => {
    mockDefaultFacetResponse();
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  tags: ['test'],
  args: {
    field: 'objecttype',
    'enable-exclusion': true
  },
  decorators: [facetDecorator],
  beforeEach: () => {
    mockDefaultFacetResponse();
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  tags: ['test'],
  args: {
    field: 'objecttype'
  },
  decorators: [facetDecorator],
  beforeEach: () => {
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any -- MSW mock response structure is dynamic and known at runtime
    mockInsightApi.searchEndpoint.mockOnce((response: any) => {
      const selectedFacets = response.facets?.map((facet: object & {
        field: string;
        values: object[];
      }) => {
        if (facet.field === 'objecttype') {
          return {
            ...facet,
            values: facet.values.map((value, index: number) => index === 0 ? {
              ...value,
              state: 'selected'
            } : value)
          };
        }
        return facet;
      });
      return {
        ...response,
        facets: selectedFacets
      };
    });
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  tags: ['test'],
  args: {
    field: 'objecttype',
    'is-collapsed': true
  },
  decorators: [facetDecorator],
  beforeEach: () => {
    mockDefaultFacetResponse();
  }
}`,...E.parameters?.docs?.source}}},D=[`Default`,`AsLink`,`AsBox`,`WithExclusion`,`WithSelectedValue`,`Collapsed`]}));O();export{C as AsBox,S as AsLink,E as Collapsed,x as Default,w as WithExclusion,T as WithSelectedValue,D as __namedExportsOrder,b as default,O as t};