import{n as e}from"./chunk-jRWAZmH_.js";import{A as t,D as n,E as r,M as i}from"./iframe-cSkD6HDI.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{r as s,t as c}from"./search-interface-wrapper-DyJSRxFL.js";import{n as l,t as u}from"./mock-C5ckzz_b.js";var d,f,p,m,h,g,_,v,y,b,x=e((()=>{n(),t(),l(),o(),c(),d=new u,{decorator:f,play:p}=s(),{events:m,args:h,argTypes:g,template:_}=r(`atomic-facet-manager`,{excludeCategories:[`methods`]}),v={component:`atomic-facet-manager`,title:`Search/Facet Manager`,id:`atomic-facet-manager`,render:e=>_(e),decorators:[f],parameters:{...a,actions:{handles:m},msw:{handlers:[...d.handlers]}},args:h,argTypes:g,beforeEach:async()=>{d.searchEndpoint.clear()},play:p,globals:{default:{control:!1}}},y={decorators:[e=>i`
      <style>
        atomic-facet-manager {
          width: 500px;
          margin: auto;
          display: block;
        }
      </style>
      ${e()}
    `],args:{"default-slot":`
      <atomic-facet field="author" label="Authors"></atomic-facet>
      <atomic-facet field="language" label="Language"></atomic-facet>
      <atomic-facet
        field="objecttype"
        label="Type"
        display-values-as="link"
      ></atomic-facet>
      <atomic-facet
        field="year"
        label="Year"
        display-values-as="box"
      ></atomic-facet>
    `},beforeEach:async()=>{d.searchEndpoint.mockOnce(e=>({...e,facets:[{facetId:`author`,field:`author`,values:[{value:`Alice Johnson`,numberOfResults:150,state:`idle`},{value:`Bob Smith`,numberOfResults:120,state:`idle`},{value:`Carol Williams`,numberOfResults:98,state:`idle`},{value:`David Brown`,numberOfResults:76,state:`idle`},{value:`Emma Davis`,numberOfResults:54,state:`idle`}],moreValuesAvailable:!0},{facetId:`language`,field:`language`,values:[{value:`English`,numberOfResults:250,state:`idle`},{value:`Spanish`,numberOfResults:180,state:`idle`},{value:`French`,numberOfResults:145,state:`idle`},{value:`German`,numberOfResults:92,state:`idle`}],moreValuesAvailable:!0},{facetId:`objecttype`,field:`objecttype`,values:[{value:`Article`,numberOfResults:320,state:`idle`},{value:`Blog`,numberOfResults:215,state:`idle`},{value:`Video`,numberOfResults:167,state:`idle`},{value:`PDF`,numberOfResults:134,state:`idle`}],moreValuesAvailable:!0},{facetId:`year`,field:`year`,values:[{value:`2024`,numberOfResults:420,state:`idle`},{value:`2023`,numberOfResults:385,state:`idle`},{value:`2022`,numberOfResults:298,state:`idle`},{value:`2021`,numberOfResults:221,state:`idle`}],moreValuesAvailable:!0}]}))}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  decorators: [story => html\`
      <style>
        atomic-facet-manager {
          width: 500px;
          margin: auto;
          display: block;
        }
      </style>
      \${story()}
    \`],
  args: {
    'default-slot': \`
      <atomic-facet field="author" label="Authors"></atomic-facet>
      <atomic-facet field="language" label="Language"></atomic-facet>
      <atomic-facet
        field="objecttype"
        label="Type"
        display-values-as="link"
      ></atomic-facet>
      <atomic-facet
        field="year"
        label="Year"
        display-values-as="box"
      ></atomic-facet>
    \`
  },
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mockOnce(response => ({
      ...response,
      facets: [{
        facetId: 'author',
        field: 'author',
        values: [{
          value: 'Alice Johnson',
          numberOfResults: 150,
          state: 'idle'
        }, {
          value: 'Bob Smith',
          numberOfResults: 120,
          state: 'idle'
        }, {
          value: 'Carol Williams',
          numberOfResults: 98,
          state: 'idle'
        }, {
          value: 'David Brown',
          numberOfResults: 76,
          state: 'idle'
        }, {
          value: 'Emma Davis',
          numberOfResults: 54,
          state: 'idle'
        }],
        moreValuesAvailable: true
      }, {
        facetId: 'language',
        field: 'language',
        values: [{
          value: 'English',
          numberOfResults: 250,
          state: 'idle'
        }, {
          value: 'Spanish',
          numberOfResults: 180,
          state: 'idle'
        }, {
          value: 'French',
          numberOfResults: 145,
          state: 'idle'
        }, {
          value: 'German',
          numberOfResults: 92,
          state: 'idle'
        }],
        moreValuesAvailable: true
      }, {
        facetId: 'objecttype',
        field: 'objecttype',
        values: [{
          value: 'Article',
          numberOfResults: 320,
          state: 'idle'
        }, {
          value: 'Blog',
          numberOfResults: 215,
          state: 'idle'
        }, {
          value: 'Video',
          numberOfResults: 167,
          state: 'idle'
        }, {
          value: 'PDF',
          numberOfResults: 134,
          state: 'idle'
        }],
        moreValuesAvailable: true
      }, {
        facetId: 'year',
        field: 'year',
        values: [{
          value: '2024',
          numberOfResults: 420,
          state: 'idle'
        }, {
          value: '2023',
          numberOfResults: 385,
          state: 'idle'
        }, {
          value: '2022',
          numberOfResults: 298,
          state: 'idle'
        }, {
          value: '2021',
          numberOfResults: 221,
          state: 'idle'
        }],
        moreValuesAvailable: true
      }]
    }));
  }
}`,...y.parameters?.docs?.source}}},b=[`Default`]}));x();export{y as Default,b as __namedExportsOrder,v as default,x as t};