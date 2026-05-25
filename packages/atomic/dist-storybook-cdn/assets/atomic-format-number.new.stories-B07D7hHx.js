import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,St as r,Tt as i}from"./iframe-cSkD6HDI.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{r as s,t as c}from"./search-interface-wrapper-DyJSRxFL.js";import{n as l,t as u}from"./mock-C5ckzz_b.js";import{n as d,t as f}from"./result-list-wrapper-DszKxGnf.js";import{n as p,t as m}from"./result-template-wrapper-BY8u_Pg8.js";var h,g,_,v,y,b,x,S,C,w,T,E,D,O=e((()=>{t(),r(),l(),o(),f(),m(),c(),{events:h,args:g,argTypes:_,template:v}=n(`atomic-format-number`,{excludeCategories:[`methods`]}),y=new u,{decorator:b,play:x}=s({includeCodeRoot:!1}),{decorator:S}=d(`list`,!1),{decorator:C}=p(!1),w={component:`atomic-format-number`,title:`Search/Format Number`,id:`atomic-format-number`,render:e=>v(e),decorators:[b],parameters:{...a,actions:{handles:h},msw:{handlers:[...y.handlers]}},args:g,argTypes:_,play:x},T={name:`Within Numeric Facet`,render:e=>i`
    <atomic-numeric-facet field="size" label="Size">
      ${v(e)}
    </atomic-numeric-facet>
  `,beforeEach:()=>{y.searchEndpoint.mockOnce(e=>({...e,results:e.results.filter(e=>e.raw.size&&e.raw.size>0).slice(0,1),facets:[{facetId:`size`,field:`size`,indexScore:0,moreValuesAvailable:!1,values:[{start:0,end:1e6,endInclusive:!1,numberOfResults:45,state:`idle`},{start:1e6,end:1e7,endInclusive:!1,numberOfResults:32,state:`idle`},{start:1e7,end:1e8,endInclusive:!0,numberOfResults:18,state:`idle`}],domain:{start:0,end:1e8}}]}))}},E={name:`Within Numeric Result`,render:e=>i`
    <atomic-result-number field="size">
      ${v(e)}
    </atomic-result-number>
  `,decorators:[C,S],beforeEach:()=>{y.searchEndpoint.mockOnce(e=>({...e,results:e.results.slice(0,1).map(e=>({...e,raw:{...e.raw,size:5242880}}))}))}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: 'Within Numeric Facet',
  render: args => html\`
    <atomic-numeric-facet field="size" label="Size">
      \${template(args)}
    </atomic-numeric-facet>
  \`,
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce(response => ({
      ...response,
      results: (response as SearchResponse).results
      // oxlint-disable-next-line @typescript-eslint/no-explicit-any -- raw fields are dynamically added
      .filter((result: any) => result.raw.size && result.raw.size > 0).slice(0, 1),
      facets: [{
        facetId: 'size',
        field: 'size',
        indexScore: 0,
        moreValuesAvailable: false,
        values: [{
          start: 0,
          end: 1000000,
          endInclusive: false,
          numberOfResults: 45,
          state: 'idle'
        }, {
          start: 1000000,
          end: 10000000,
          endInclusive: false,
          numberOfResults: 32,
          state: 'idle'
        }, {
          start: 10000000,
          end: 100000000,
          endInclusive: true,
          numberOfResults: 18,
          state: 'idle'
        }],
        domain: {
          start: 0,
          end: 100000000
        }
      }]
    }));
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  name: 'Within Numeric Result',
  render: args => html\`
    <atomic-result-number field="size">
      \${template(args)}
    </atomic-result-number>
  \`,
  decorators: [resultTemplateDecorator, resultListDecorator],
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce(response => ({
      ...response,
      results: (response as SearchResponse).results.slice(0, 1)
      // oxlint-disable-next-line @typescript-eslint/no-explicit-any -- raw fields are dynamically added
      .map((result: any) => ({
        ...result,
        raw: {
          ...result.raw,
          size: 5242880 // 5MB
        }
      }))
    }));
  }
}`,...E.parameters?.docs?.source}}},D=[`Facet`,`Result`]}));O();export{T as Facet,E as Result,D as __namedExportsOrder,w as default,O as t};