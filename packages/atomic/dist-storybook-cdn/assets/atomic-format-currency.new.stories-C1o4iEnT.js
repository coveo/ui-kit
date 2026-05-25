import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,St as r,Tt as i}from"./iframe-cSkD6HDI.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{r as s,t as c}from"./search-interface-wrapper-DyJSRxFL.js";import{n as l,t as u}from"./mock-C5ckzz_b.js";import{n as d,t as f}from"./result-list-wrapper-DszKxGnf.js";import{n as p,t as m}from"./result-template-wrapper-BY8u_Pg8.js";var h,g,_,v,y,b,x,S,C,w,T,E,D,O=e((()=>{t(),r(),l(),o(),f(),m(),c(),{events:h,args:g,argTypes:_,template:v}=n(`atomic-format-currency`,{excludeCategories:[`methods`]}),y=new u,{decorator:b,play:x}=s({includeCodeRoot:!1}),{decorator:S}=d(`list`,!1),{decorator:C}=p(!1),w={component:`atomic-format-currency`,title:`Search/Format Currency`,id:`atomic-format-currency`,render:e=>v(e),decorators:[b],parameters:{...a,actions:{handles:h},msw:{handlers:[...y.handlers]}},args:g,argTypes:_,play:x},T={name:`Within Numeric Facet`,render:e=>i`
    <atomic-numeric-facet field="sncost" label="Cost">
      ${v(e)}
    </atomic-numeric-facet>
  `,args:{currency:`USD`},beforeEach:()=>{y.searchEndpoint.mockOnce(e=>({...e,results:e.results.slice(0,1),facets:[{facetId:`sncost`,field:`sncost`,indexScore:0,moreValuesAvailable:!1,values:[{start:0,end:100,endInclusive:!1,numberOfResults:45,state:`idle`},{start:100,end:500,endInclusive:!1,numberOfResults:32,state:`idle`},{start:500,end:1e3,endInclusive:!0,numberOfResults:18,state:`idle`}],domain:{start:0,end:1e3}}]}))}},E={name:`Within Numeric Result`,render:e=>i`
    <atomic-result-number field="sncost">
      ${v(e)}
    </atomic-result-number>
  `,decorators:[C,S],args:{currency:`USD`},beforeEach:()=>{y.searchEndpoint.mockOnce(e=>({...e,results:e.results.slice(0,1).map(e=>({...e,raw:{...e.raw,sncost:299.99}}))}))}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: 'Within Numeric Facet',
  render: args => html\`
    <atomic-numeric-facet field="sncost" label="Cost">
      \${template(args)}
    </atomic-numeric-facet>
  \`,
  args: {
    currency: 'USD'
  },
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce(response => ({
      ...response,
      results: (response as SearchResponse).results.slice(0, 1),
      facets: [{
        facetId: 'sncost',
        field: 'sncost',
        indexScore: 0,
        moreValuesAvailable: false,
        values: [{
          start: 0,
          end: 100,
          endInclusive: false,
          numberOfResults: 45,
          state: 'idle'
        }, {
          start: 100,
          end: 500,
          endInclusive: false,
          numberOfResults: 32,
          state: 'idle'
        }, {
          start: 500,
          end: 1000,
          endInclusive: true,
          numberOfResults: 18,
          state: 'idle'
        }],
        domain: {
          start: 0,
          end: 1000
        }
      }]
    }));
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  name: 'Within Numeric Result',
  render: args => html\`
    <atomic-result-number field="sncost">
      \${template(args)}
    </atomic-result-number>
  \`,
  decorators: [resultTemplateDecorator, resultListDecorator],
  args: {
    currency: 'USD'
  },
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce(response => ({
      ...response,
      results: (response as SearchResponse).results.slice(0, 1)
      // oxlint-disable-next-line @typescript-eslint/no-explicit-any -- raw fields are dynamically added
      .map((result: any) => ({
        ...result,
        raw: {
          ...result.raw,
          sncost: 299.99
        }
      }))
    }));
  }
}`,...E.parameters?.docs?.source}}},D=[`Facet`,`Result`]}));O();export{T as Facet,E as Result,D as __namedExportsOrder,w as default,O as t};