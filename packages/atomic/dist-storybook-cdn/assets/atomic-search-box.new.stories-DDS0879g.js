import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,St as r,Tt as i}from"./iframe-cSkD6HDI.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{r as s,t as c}from"./search-interface-wrapper-DyJSRxFL.js";import{n as l,t as u}from"./mock-C5ckzz_b.js";var d,f,p,m,h,g,_,v,y,b,x,S,C,w=e((()=>{t(),r(),l(),o(),c(),{events:d,args:f,argTypes:p,template:m}=n(`atomic-search-box`,{excludeCategories:[`methods`]}),{decorator:h,play:g}=s({skipFirstSearch:!0,includeCodeRoot:!1}),_=new u,v=e=>i`
  <div style="min-width: 600px;" id="code-root">${e()}</div>
`,y={component:`atomic-search-box`,title:`Search/Search Box`,id:`atomic-search-box`,render:e=>m(e),decorators:[v,h],parameters:{...a,actions:{handles:d},msw:{handlers:[..._.handlers]}},args:{...f,"minimum-query-length":`0`},argTypes:p,play:g},b={},x={name:`With suggestions, recent queries and instant results`,args:{"default-slot":` <atomic-search-box-recent-queries></atomic-search-box-recent-queries>
      <atomic-search-box-query-suggestions></atomic-search-box-query-suggestions>
      <atomic-search-box-instant-results
        image-size="small"
      ></atomic-search-box-instant-results>`}},S={name:`As a standalone search box`,args:{"redirection-url":`./iframe.html?id=atomic-search-interface--with-result-list`}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'With suggestions, recent queries and instant results',
  args: {
    'default-slot': \` <atomic-search-box-recent-queries></atomic-search-box-recent-queries>
      <atomic-search-box-query-suggestions></atomic-search-box-query-suggestions>
      <atomic-search-box-instant-results
        image-size="small"
      ></atomic-search-box-instant-results>\`
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'As a standalone search box',
  args: {
    'redirection-url': './iframe.html?id=atomic-search-interface--with-result-list'
  }
}`,...S.parameters?.docs?.source}}},C=[`Default`,`RichSearchBox`,`StandaloneSearchBox`]}));w();export{b as Default,x as RichSearchBox,S as StandaloneSearchBox,C as __namedExportsOrder,y as default,w as t};