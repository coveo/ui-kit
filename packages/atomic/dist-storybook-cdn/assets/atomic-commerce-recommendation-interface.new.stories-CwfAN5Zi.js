import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,St as r,Tt as i}from"./iframe-cSkD6HDI.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{buildCommerceEngine as s,getSampleCommerceEngineConfiguration as c}from"/headless/v3.50.1/commerce/headless.esm.js";async function l(e){await customElements.whenDefined(`atomic-commerce-recommendation-interface`),await e.querySelector(`atomic-commerce-recommendation-interface`).initializeWithEngine(s({configuration:c()}))}var u,d,f,p,m,h,g,_,v,y=e((()=>{t(),r(),o(),{events:u,args:d,argTypes:f,template:p}=n(`atomic-commerce-recommendation-interface`,{excludeCategories:[`methods`]}),m={component:`atomic-commerce-recommendation-interface`,title:`Commerce/Interface (Recommendation)`,id:`atomic-commerce-recommendation-interface`,render:e=>p(e),decorators:[e=>i`<div id="code-root">${e()}</div>`],parameters:{...a,chromatic:{disableSnapshot:!0},actions:{handles:u}},args:{...d,engine:void 0,i18n:void 0,urlManager:void 0},argTypes:{...f,engine:{...f,control:{disable:!0},table:{defaultValue:{summary:void 0}}},urlManager:{...f.urlManager,control:{disable:!0},table:{defaultValue:{summary:void 0}}},i18n:{...f.i18n,control:{disable:!0},table:{defaultValue:{summary:void 0}}}},play:async e=>{await l(e.canvasElement)}},h={args:{"default-slot":`<span>Interface content</span>`}},g=`<style>
  atomic-commerce-recommendation-list {
    --atomic-recs-number-of-columns: 3;
  }
  @media only screen and (max-width: 1024px) {
    atomic-commerce-recommendation-list {
      --atomic-recs-number-of-columns: 1;
      --atomic-recs-number-of-rows: 3;
    }
  }
</style>

<atomic-commerce-layout>
  <atomic-layout-section section="main">
    <atomic-commerce-recommendation-list
      id="popular_bought"
      slot-id="af4fb7ba-6641-4b67-9cf9-be67e9f30174"
      products-per-page="3"
    >
      <atomic-product-template>
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
            <atomic-product-field-condition if-defined="ec_brand">
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
      </atomic-product-template>
    </atomic-commerce-recommendation-list>
  </atomic-layout-section>
</atomic-commerce-layout>`,_={name:`With a recommendation list`,args:{"default-slot":g},play:async({canvasElement:e})=>{let t=e.querySelector(`atomic-commerce-recommendation-interface`);t.innerHTML=g,await l(e)}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    'default-slot': \`<span>Interface content</span>\`
  }
}`,...h.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  name: 'With a recommendation list',
  args: {
    'default-slot': recommendationList
  },
  play: async ({
    canvasElement
  }) => {
    const recsInterface = canvasElement.querySelector('atomic-commerce-recommendation-interface');
    recsInterface!.innerHTML = recommendationList;
    await initializeCommerceRecommendationInterface(canvasElement);
  }
}`,..._.parameters?.docs?.source}}},v=[`Default`,`WithRecommendationList`]}));y();export{h as Default,_ as WithRecommendationList,v as __namedExportsOrder,m as default,y as t};