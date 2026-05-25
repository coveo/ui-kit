import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,St as r,Tt as i}from"./iframe-cSkD6HDI.js";import{n as a,t as o}from"./lit-helpers-d8c58N_k.js";import{i as s,r as c}from"./commerce-interface-wrapper-BFOjNQs_.js";import{n as l,t as u}from"./common-meta-parameters-BmIbTEf7.js";import{n as d,t as f}from"./mock-eNEo2dE0.js";import{n as p,t as m}from"./commerce-recommendation-interface-wrapper-BSZZoFxK.js";import{n as h,t as g}from"./search-box-suggestions-parameters-Cvhsyu4s.js";import{n as _,t as v}from"./commerce-product-list-wrapper-CNTwHksc.js";var y,b=e((()=>{o(),r(),y=(e=!0)=>({decorator:t=>i`
    <atomic-commerce-recommendation-list
      ${a(e?{id:`code-root`}:{})}
      slot-id="af4fb7ba-6641-4b67-9cf9-be67e9f30174"
      products-per-page="3"
    >
      ${t()}
    </atomic-commerce-recommendation-list>
  `})})),x,S=e((()=>{o(),r(),x=(e=!0)=>({decorator:t=>i`
    <div style="min-width: 600px;">
      <atomic-commerce-search-box
        data-testid="search-box"
        suggestion-timeout="30000"
      >
        <atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>
        <atomic-commerce-search-box-instant-products
          ${a(e?{id:`code-root`}:{})}
          image-size="small"
        >
          ${t()}
        </atomic-commerce-search-box-instant-products>
      </atomic-commerce-search-box>
      <atomic-commerce-query-error></atomic-commerce-query-error>
    </div>
  `})})),C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V=e((()=>{t(),d(),c(),v(),m(),b(),S(),u(),g(),C=new f,w=`<template>
  <atomic-product-section-name>
    <atomic-product-link class="font-bold"></atomic-product-link>
  </atomic-product-section-name>
  <atomic-product-section-visual>
    <atomic-product-field-condition if-defined="ec_thumbnails">
      <atomic-product-image field="ec_thumbnails"></atomic-product-image>
    </atomic-product-field-condition>
  </atomic-product-section-visual>
  <atomic-product-section-metadata>
    <atomic-product-field-condition if-defined="ec_brand">
      <atomic-product-text
        field="ec_brand"
        class="block text-neutral-dark"
      ></atomic-product-text>
    </atomic-product-field-condition>
    <atomic-product-field-condition if-defined="ec_rating">
      <atomic-product-rating field="ec_rating"></atomic-product-rating>
    </atomic-product-field-condition>
  </atomic-product-section-metadata>
  <atomic-product-section-description>
    <atomic-product-text
      field="excerpt"
      class="block text-neutral-dark"
    ></atomic-product-text>
  </atomic-product-section-description>
  <atomic-product-section-emphasized>
    <atomic-product-price currency="USD"></atomic-product-price>
  </atomic-product-section-emphasized>
  <atomic-product-section-children>
    <atomic-product-children></atomic-product-children>
  </atomic-product-section-children>
</template>`,{events:T,args:E,argTypes:D,template:O}=n(`atomic-product-template`,{excludeCategories:[`methods`]}),k={component:`atomic-product-template`,title:`Commerce/Product Template`,id:`atomic-product-template`,render:e=>O(e),parameters:{...l,actions:{handles:T},msw:{handlers:[...C.handlers]}},beforeEach:()=>{C.clearAll()},args:{...E,"default-slot":w},argTypes:{...D,"must-match":{...D[`must-match`],control:!1},"must-not-match":{...D[`must-not-match`],control:!1},conditions:{...D.conditions,control:!1}}},{decorator:A,play:j}=s({skipFirstRequest:!1,engineConfig:{preprocessRequest:e=>{let t=JSON.parse(e.body);return t.perPage=4,e.body=JSON.stringify(t),e}},includeCodeRoot:!1}),{decorator:M}=_(`list`),N={name:`In a product list`,decorators:[M,A],play:j},{decorator:P,play:F}=p(),{decorator:I}=y(),L={name:`In a recommendation list`,decorators:[I,P],play:F},{decorator:R}=x(),z={name:`In a search box instant products`,decorators:[R,A],parameters:{...h},play:async e=>{await j(e);let{canvas:t,step:n}=e;await n(`Click Searchbox`,async()=>{(await t.findAllByShadowTitle(`Search field with suggestions.`,{exact:!1}))?.find(e=>e.getAttribute(`part`)===`textarea`)?.focus()})}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  name: 'In a product list',
  decorators: [commerceProductListDecorator, commerceInterfaceDecorator],
  play: initializeCommerceInterface
}`,...N.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  name: 'In a recommendation list',
  decorators: [commerceRecommendationListDecorator, commerceRecommendationInterfaceDecorator],
  play: initializeCommerceRecommendationInterface
}`,...L.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  name: 'In a search box instant products',
  decorators: [commerceSearchBoxInstantsProductsDecorator, commerceInterfaceDecorator],
  parameters: {
    ...searchBoxParameters
  },
  play: async context => {
    await initializeCommerceInterface(context);
    const {
      canvas,
      step
    } = context;
    await step('Click Searchbox', async () => {
      (await canvas.findAllByShadowTitle('Search field with suggestions.', {
        exact: false
      }))?.find(el => el.getAttribute('part') === 'textarea')?.focus();
    });
  }
}`,...z.parameters?.docs?.source}}},B=[`InAProductList`,`InARecommendationList`,`InASearchBoxInstantProducts`]}));V();export{N as InAProductList,L as InARecommendationList,z as InASearchBoxInstantProducts,B as __namedExportsOrder,k as default,V as t};