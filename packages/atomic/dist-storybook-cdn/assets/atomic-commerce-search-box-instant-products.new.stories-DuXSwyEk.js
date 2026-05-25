import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,St as r,Tt as i}from"./iframe-cSkD6HDI.js";import{i as a,r as o}from"./commerce-interface-wrapper-BFOjNQs_.js";import{n as s,t as c}from"./mock-eNEo2dE0.js";import{n as l,t as u}from"./commerce-search-box-wrapper-CtiC2ouF.js";import{n as d,t as f}from"./search-box-suggestions-parameters-Cvhsyu4s.js";var p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O=e((()=>{t(),r(),s(),o(),u(),f(),{expect:p,userEvent:m}=__STORYBOOK_MODULE_TEST__,h=new c,{decorator:g,play:_}=a({includeCodeRoot:!1}),{decorator:v}=l(i`
  <atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>
`),{events:y,args:b,argTypes:x,template:S}=n(`atomic-commerce-search-box-instant-products`,{excludeCategories:[`methods`]}),C={component:`atomic-commerce-search-box-instant-products`,title:`Commerce/Search Box Instant Products`,id:`atomic-commerce-search-box-instant-products`,render:e=>S(e),decorators:[v,g],parameters:{...d,actions:{handles:y},msw:{handlers:[...h.handlers]}},args:b,argTypes:x,play:async e=>{let{canvas:t,step:n}=e;await _(e);let r=await t.findAllByShadowPlaceholderText(`Search`);await n(`Click on the search box to show instant products`,async()=>{await m.click(r[0]),await p(await t.findByShadowLabelText(/Zippy Yellow Surfboard, instant product\.( Button\.)? 1 of \d+\. In Right list\./)).toBeVisible()})}},w={},T={name:`With comfortable density`,args:{density:`comfortable`}},E={name:`With no image`,args:{"image-size":`none`}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: 'With comfortable density',
  args: {
    density: 'comfortable'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  name: 'With no image',
  args: {
    'image-size': 'none'
  }
}`,...E.parameters?.docs?.source}}},D=[`Default`,`WithComfortableDensity`,`WithNoImage`]}));O();export{w as Default,T as WithComfortableDensity,E as WithNoImage,D as __namedExportsOrder,C as default,O as t};