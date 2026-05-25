import{n as e}from"./chunk-jRWAZmH_.js";import{A as t,D as n,E as r,M as i}from"./iframe-cSkD6HDI.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{n as s,t as c}from"./mock-CijMLWxR.js";import{n as l,t as u}from"./insight-interface-wrapper-BwybnAhf.js";import{n as d,t as f}from"./mock-s9w74-av.js";var p,m,h,g,_,v,y,b,x,S,C,w,T=e((()=>{n(),t(),d(),s(),o(),u(),p=new f,m=new c,m.searchEndpoint.mock(e=>({...e,extendedResults:{generativeQuestionAnsweringId:`fbc64016-5f04-4a47-aad1-0bccaa2c0616`}})),{args:h,argTypes:g,template:_}=r(`atomic-insight-generated-answer`,{excludeCategories:[`methods`]}),v=e=>i`
  <atomic-insight-layout>
    <atomic-layout-section section="search">
      <atomic-insight-search-box></atomic-insight-search-box>
    </atomic-layout-section>
    <atomic-layout-section section="results">
      ${e()}
    </atomic-layout-section>
  </atomic-insight-layout>
`,{decorator:y,play:b}=l(),x={component:`atomic-insight-generated-answer`,title:`Insight/Generated Answer`,id:`atomic-insight-generated-answer`,render:e=>_(e),decorators:[v,y],parameters:{...a,msw:{handlers:[...m.handlers,...p.handlers]}},args:{...h,"answer-configuration-id":`fc581be0-6e61-4039-ab26-a3f2f52f308f`},argTypes:g,play:async e=>{await b(e);let t=await e.canvas.findAllByShadowPlaceholderText(`Search`),n=`how to resolve netflix connection with tivo`,r=t[0];r.scrollIntoView({block:`center`}),r.focus(),r.value=n,r.dispatchEvent(new InputEvent(`input`,{bubbles:!0,composed:!0,data:n,inputType:`insertText`})),r.dispatchEvent(new KeyboardEvent(`keydown`,{bubbles:!0,composed:!0,key:`Enter`,code:`Enter`}))}},S={},C={name:`Citation anchoring disabled`,args:{"disable-citation-anchoring":!0}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'Citation anchoring disabled',
  args: {
    'disable-citation-anchoring': true
  }
}`,...C.parameters?.docs?.source}}},w=[`Default`,`DisableCitationAnchoring`]}));T();export{S as Default,C as DisableCitationAnchoring,w as __namedExportsOrder,x as default,T as t};