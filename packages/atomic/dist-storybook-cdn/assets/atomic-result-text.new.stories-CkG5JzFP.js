import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n}from"./iframe-cSkD6HDI.js";import{n as r,t as i}from"./common-meta-parameters-BmIbTEf7.js";import{r as a,t as o}from"./search-interface-wrapper-DyJSRxFL.js";import{n as s,t as c}from"./result-list-wrapper-DszKxGnf.js";import{n as l,t as u}from"./result-template-wrapper-BY8u_Pg8.js";var d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D=e((()=>{t(),i(),c(),u(),o(),{events:d,args:f,argTypes:p,template:m}=n(`atomic-result-text`,{excludeCategories:[`methods`]}),{decorator:h,play:g}=a({config:{preprocessRequest:e=>{let t=JSON.parse(e.body);return t.numberOfResults=1,e.body=JSON.stringify(t),e},search:{preprocessSearchResponseMiddleware:e=>(e.body.results.forEach(e=>{e.excerpt=`Bonobo the great ape`,e.title=`Bonobo the great ape`,e.firstSentences=`Bonobo the great ape`,e.printableUri=`https://example.com/bonobo`,e.raw.author=`Bonobo`,e.raw.summary=`Bonobo the great ape`,e.excerptHighlights=[{offset:0,length:6}],e.titleHighlights=[{offset:0,length:6}],e.firstSentencesHighlights=[{offset:0,length:6}],e.printableUriHighlights=[{offset:20,length:6}],e.summaryHighlights=[{offset:0,length:6}]}),e)}}}),{decorator:_}=s(void 0,!1),{decorator:v}=l(),y={component:`atomic-result-text`,title:`Search/Result Text`,id:`atomic-result-text`,render:e=>m(e),decorators:[v,_,h],parameters:{...r,chromatic:{disableSnapshot:!0},actions:{handles:d}},args:f,argTypes:p,play:g},b={name:`atomic-result-text`,args:{field:`excerpt`}},x={name:`with title field`,args:{field:`title`}},S={name:`with firstSentences field`,args:{field:`firstSentences`}},C={name:`with printableuUri field`,args:{field:`printableUri`}},w={name:`with summary field`,args:{field:`summary`}},T={name:`without highlights`,args:{field:`excerpt`,"no-highlight":!0}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'atomic-result-text',
  args: {
    field: 'excerpt'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'with title field',
  args: {
    field: 'title'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'with firstSentences field',
  args: {
    field: 'firstSentences'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'with printableuUri field',
  args: {
    field: 'printableUri'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'with summary field',
  args: {
    field: 'summary'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: 'without highlights',
  args: {
    field: 'excerpt',
    'no-highlight': true
  }
}`,...T.parameters?.docs?.source}}},E=[`Default`,`WithTitle`,`WithFirstSentences`,`WithPrintableUri`,`WithSummary`,`WithoutHighlights`]}));D();export{b as Default,S as WithFirstSentences,C as WithPrintableUri,w as WithSummary,x as WithTitle,T as WithoutHighlights,E as __namedExportsOrder,y as default,D as t};