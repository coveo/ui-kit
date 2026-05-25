import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n}from"./iframe-cSkD6HDI.js";import{i as r,r as i}from"./commerce-interface-wrapper-BFOjNQs_.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{n as s,t as c}from"./commerce-product-list-wrapper-CNTwHksc.js";import{n as l,t as u}from"./commerce-product-template-wrapper-BOcgCT4i.js";var d,f,p,m,h,g,_,v,y,b,x,S,C,w,T=e((()=>{t(),i(),c(),u(),o(),{decorator:d,play:f}=r({type:`product-listing`,engineConfig:{context:{view:{url:`https://sports.barca.group/browse/promotions/ui-kit-testing`},language:`en`,country:`US`,currency:`USD`},preprocessRequest:e=>{let t=JSON.parse(e.body);return t.perPage=1,e.body=JSON.stringify(t),e}},includeCodeRoot:!1}),{decorator:p}=s(`list`,!1),{decorator:m}=l(),{events:h,args:g,argTypes:_,template:v}=n(`atomic-product-rating`,{excludeCategories:[`methods`],containerSelector:`atomic-product-template template`}),y={component:`atomic-product-rating`,title:`Commerce/Product Rating`,id:`atomic-product-rating`,render:e=>v(e),decorators:[m,p,d],parameters:{...a,chromatic:{disableSnapshot:!0},actions:{handles:h}},args:g,argTypes:_,play:f},b={},x={name:`With a rating details field`,args:{"rating-details-field":`ec_rating`}},S={name:`With a custom max value`,args:{"max-value-in-index":10}},C={name:`With a custom icon`,args:{icon:`https://raw.githubusercontent.com/Rush/Font-Awesome-SVG-PNG/master/black/svg/circle.svg`}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'With a rating details field',
  args: {
    'rating-details-field': 'ec_rating'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'With a custom max value',
  args: {
    'max-value-in-index': 10
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'With a custom icon',
  args: {
    icon: 'https://raw.githubusercontent.com/Rush/Font-Awesome-SVG-PNG/master/black/svg/circle.svg'
  }
}`,...C.parameters?.docs?.source}}},w=[`Default`,`WithARatingDetailsField`,`WithAMaxValueInIndex`,`WithADifferentIcon`]}));T();export{b as Default,C as WithADifferentIcon,S as WithAMaxValueInIndex,x as WithARatingDetailsField,w as __namedExportsOrder,y as default,T as t};