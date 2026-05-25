import{n as e}from"./chunk-jRWAZmH_.js";import{St as t,Tt as n}from"./iframe-cSkD6HDI.js";import{n as r,t as i}from"./is-test-mode-CTyrSANe.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{a as s,n as c,o as l,t as u}from"./mock-eNEo2dE0.js";import{buildCommerceEngine as d,getSampleCommerceEngineConfiguration as f}from"/headless/v3.50.1/commerce/headless.esm.js";async function p(e){await customElements.whenDefined(`atomic-commerce-recommendation-interface`),await e.querySelector(`atomic-commerce-recommendation-interface`).initializeWithEngine(d({configuration:f()}))}var m,h,g,_;e((()=>{t(),c(),s(),o(),i(),m=new u,h={component:`recommendations`,title:`Commerce/Example Pages`,id:`recommendations`,parameters:{...a,msw:{handlers:[...m.handlers]},chromatic:{disableSnapshot:!1}},beforeEach:async()=>{m.recommendationEndpoint.mock(()=>l)},render:()=>n`
    <atomic-commerce-recommendation-interface .analytics=${r()}>
      <atomic-commerce-recommendation-list
        display="list"
        density="normal"
        image-size="small"
        products-per-page="3"
        slot-id="af4fb7ba-6641-4b67-9cf9-be67e9f30174"
      >
        <atomic-product-template>
          <template>
            <atomic-product-section-name>
              <atomic-product-link class="font-bold"></atomic-product-link>
            </atomic-product-section-name>
            <atomic-product-section-visual>
              <atomic-product-image
                field="ec_thumbnails"
              ></atomic-product-image>
            </atomic-product-section-visual>
            <atomic-product-section-metadata>
              <atomic-product-field-condition if-defined="ec_brand">
                <atomic-product-text
                  field="ec_brand"
                  class="text-neutral-dark block"
                ></atomic-product-text>
              </atomic-product-field-condition>
              <atomic-product-field-condition if-defined="ec_rating">
                <atomic-product-rating
                  field="ec_rating"
                ></atomic-product-rating>
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
    </atomic-commerce-recommendation-interface>
  `,play:async e=>{await p(e.canvasElement)}},g={name:`Recommendation Carousel`},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: 'Recommendation Carousel'
}`,...g.parameters?.docs?.source}}},_=[`Default`]}))();export{g as Default,_ as __namedExportsOrder,h as default};