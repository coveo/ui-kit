import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n}from"./iframe-cSkD6HDI.js";import{n as r,t as i}from"./common-meta-parameters-BmIbTEf7.js";import{n as a,t as o}from"./mock-eNEo2dE0.js";import{n as s,t as c}from"./commerce-recommendation-interface-wrapper-BSZZoFxK.js";var l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w=e((()=>{t(),a(),c(),i(),l=new o,{decorator:u,play:d}=s({}),{events:f,args:p,argTypes:m,template:h}=n(`atomic-commerce-recommendation-list`,{excludeCategories:[`methods`]}),g=`<atomic-product-template>
    <template>
    <atomic-product-section-name>
      <atomic-product-link class="font-bold"></atomic-product-link>
    </atomic-product-section-name>
    <atomic-product-section-visual>
      <atomic-product-image field="ec_thumbnails"></atomic-product-image>
    </atomic-product-section-visual>
    <atomic-product-section-metadata>
      <atomic-product-field-condition if-defined="ec_brand">
        <atomic-product-text field="ec_brand" class="text-neutral-dark block"></atomic-product-text>
      </atomic-product-field-condition>
      <atomic-product-field-condition if-defined="ec_rating">
        <atomic-product-rating field="ec_rating"></atomic-product-rating>
        <atomic-product-multi-value-text field="cat_available_sizes"></atomic-product-multi-value-text>
      </atomic-product-field-condition>
    </atomic-product-section-metadata>
    <atomic-product-section-emphasized>
      <atomic-product-price currency="USD"></atomic-product-price>
    </atomic-product-section-emphasized>
    <atomic-product-section-children>
      <atomic-product-children></atomic-product-children>
    </atomic-product-section-children>
  </template>
</atomic-product-template>`,_={component:`atomic-commerce-recommendation-list`,title:`Commerce/Recommendation List`,id:`atomic-commerce-recommendation-list`,render:e=>h(e),play:d,decorators:[u],parameters:{...r,actions:{handles:f},handlers:[...l.handlers]},beforeEach:async()=>{l.recommendationEndpoint.clear()},argTypes:m,args:{...p,"heading-level":`0`,headingLevel:`0`,slotId:`af4fb7ba-6641-4b67-9cf9-be67e9f30174`,"slot-id":`af4fb7ba-6641-4b67-9cf9-be67e9f30174`,"default-slot":g}},v={},y=`<atomic-product-template>
  <template>
    <atomic-product-section-visual>
      <span>Visual Section</span>
    </atomic-product-section-visual>
    <atomic-product-section-badge>
      <span>Badge Section</span>
    </atomic-product-section-badge>
    <atomic-product-section-actions>
      <span>Actions Section</span>
    </atomic-product-section-actions>
    <atomic-product-section-title>
      <span>Title Section</span>
    </atomic-product-section-title>
    <atomic-product-section-title-metadata>
      <span>Title Metadata Section</span>
    </atomic-product-section-title-metadata>
    <atomic-product-section-emphasized>
      <span>Emphasized Section</span>
    </atomic-product-section-emphasized>
    <atomic-product-section-excerpt>
      <span>Excerpt Section</span>
    </atomic-product-section-excerpt>
    <atomic-product-section-bottom-metadata>
      <span>Bottom Metadata Section</span>
    </atomic-product-section-bottom-metadata>
  </template>
</atomic-product-template>`,b={name:`With a full template`,args:{"default-slot":y}},x={name:`As a carousel`,args:{"products-per-page":3}},S={name:`No recommendations`,beforeEach:async()=>{l.recommendationEndpoint.mockOnce(e=>({...e,products:[],pagination:{page:0,perPage:10,totalEntries:0,totalPages:0},triggers:[]}))}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{}`,...v.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'With a full template',
  args: {
    'default-slot': withFullTemplateSlotContent
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'As a carousel',
  args: {
    'products-per-page': 3
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'No recommendations',
  beforeEach: async () => {
    mockCommerceApi.recommendationEndpoint.mockOnce(response => ({
      ...response,
      products: [],
      pagination: {
        page: 0,
        perPage: 10,
        totalEntries: 0,
        totalPages: 0
      },
      triggers: []
    }));
  }
}`,...S.parameters?.docs?.source}}},C=[`Default`,`WithFullTemplate`,`AsCarousel`,`NoRecommendations`]}));w();export{x as AsCarousel,v as Default,S as NoRecommendations,b as WithFullTemplate,C as __namedExportsOrder,_ as default,w as t};