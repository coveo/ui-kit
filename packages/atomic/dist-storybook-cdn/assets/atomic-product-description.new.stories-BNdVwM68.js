import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,St as r,Tt as i}from"./iframe-cSkD6HDI.js";import{i as a,r as o}from"./commerce-interface-wrapper-BFOjNQs_.js";import{n as s,t as c}from"./common-meta-parameters-BmIbTEf7.js";import{n as l,t as u}from"./commerce-product-list-wrapper-CNTwHksc.js";import{n as d,t as f}from"./commerce-product-template-wrapper-BOcgCT4i.js";var p,m,h,g,_,v,y,b,x,S,C,w,T,E,D=e((()=>{t(),r(),o(),u(),f(),c(),{decorator:p,play:m}=a({engineConfig:{preprocessRequest:e=>{let t=JSON.parse(e.body);return t.perPage=1,e.body=JSON.stringify(t),e}},includeCodeRoot:!1}),{decorator:h}=l(`list`,!1),{decorator:g}=d(!1),{events:_,args:v,argTypes:y,template:b}=n(`atomic-product-description`,{excludeCategories:[`methods`]}),x=e=>i`
    <div style="width: 200px; height: 60px;" id="code-root">${e()}</div>
  `,S={component:`atomic-product-description`,title:`Commerce/Product Description`,id:`atomic-product-description`,render:e=>b(e),parameters:{...s,chromatic:{disableSnapshot:!0},actions:{handles:_}},args:{...v,"truncate-after":`2`},argTypes:y,decorators:[x,g,h,p],play:m},C={},w={name:`Collapsible`,args:{"is-collapsible":!1}},T={name:`Using ec_description`,args:{field:`ec_description`}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'Collapsible',
  args: {
    'is-collapsible': false
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: 'Using ec_description',
  args: {
    field: 'ec_description'
  }
}`,...T.parameters?.docs?.source}}},E=[`Default`,`Collapsible`,`UsingECDescription`]}));D();export{w as Collapsible,C as Default,T as UsingECDescription,E as __namedExportsOrder,S as default,D as t};