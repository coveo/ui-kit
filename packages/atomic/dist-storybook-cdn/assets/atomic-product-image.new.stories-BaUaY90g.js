import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,St as r,Tt as i}from"./iframe-cSkD6HDI.js";import{i as a,r as o}from"./commerce-interface-wrapper-BFOjNQs_.js";import{n as s,t as c}from"./common-meta-parameters-BmIbTEf7.js";import{n as l,t as u}from"./commerce-product-list-wrapper-CNTwHksc.js";import{n as d,t as f}from"./commerce-product-template-wrapper-BOcgCT4i.js";var p,m,h,g,_,v,y,b,x,S,C,w,T=e((()=>{t(),r(),o(),u(),f(),c(),{decorator:p,play:m}=a({type:`product-listing`,engineConfig:{context:{view:{url:`https://ui-kit.coveo/atomic/storybook/atomic-product-image`},language:`en`,country:`US`,currency:`USD`},preprocessRequest:e=>{let t=JSON.parse(e.body);return t.perPage=2,e.body=JSON.stringify(t),e}},includeCodeRoot:!1}),{decorator:h}=l(`list`,!1),{decorator:g}=d(!1),{events:_,args:v,argTypes:y,template:b}=n(`atomic-product-image`,{excludeCategories:[`methods`]}),x={component:`atomic-product-image`,title:`Commerce/Product Image`,id:`atomic-product-image`,render:e=>b(e),decorators:[e=>i`
      <atomic-product-section-visual id="code-root">
        ${e()}
      </atomic-product-section-visual>
    `,g,h,p],parameters:{...s,chromatic:{disableSnapshot:!0},actions:{handles:_}},args:v,argTypes:y,play:m},S={},C={name:`With a fallback image`,args:{field:`invalid`,fallback:`https://sports.barca.group/logos/barca.svg`}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'With a fallback image',
  args: {
    field: 'invalid',
    fallback: 'https://sports.barca.group/logos/barca.svg'
  }
}`,...C.parameters?.docs?.source}}},w=[`Default`,`withAFallbackImage`]}));T();export{S as Default,w as __namedExportsOrder,x as default,T as t,C as withAFallbackImage};