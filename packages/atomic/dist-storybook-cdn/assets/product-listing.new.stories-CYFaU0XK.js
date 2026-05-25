import{n as e}from"./chunk-jRWAZmH_.js";import{St as t,Tt as n}from"./iframe-cSkD6HDI.js";import{n as r,t as i}from"./is-test-mode-CTyrSANe.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{c as s,n as c,s as l,t as u}from"./mock-eNEo2dE0.js";import{getSampleCommerceEngineConfiguration as d}from"/headless/v3.50.1/commerce/headless.esm.js";async function f(e){await customElements.whenDefined(`atomic-commerce-interface`),await e.querySelector(`atomic-commerce-interface`).initialize(g)}var p,m,h,g,_,v,y;e((()=>{t(),l(),c(),o(),i(),p=new u,{context:m,...h}=d(),g={context:{...m,view:{url:`${m.view.url}/browse/promotions/ui-kit-testing`}},...h},_={component:`product-listing-page`,title:`Commerce/Example Pages`,id:`product-listing-page`,parameters:{...a,layout:`fullscreen`,msw:{handlers:[...p.handlers]},chromatic:{disableSnapshot:!1}},beforeEach:async()=>{p.productListingEndpoint.mock(()=>s)},render:()=>n`
    <atomic-commerce-interface
      type="product-listing"
      language-assets-path="./lang"
      icon-assets-path="./assets"
      .analytics=${r()}
    >
      <atomic-commerce-layout>
        <atomic-layout-section section="facets"
          ><atomic-commerce-facets></atomic-commerce-facets
        ></atomic-layout-section>
        <atomic-layout-section section="main">
          <atomic-layout-section section="status">
            <atomic-commerce-breadbox></atomic-commerce-breadbox>
            <atomic-commerce-query-summary></atomic-commerce-query-summary>
            <atomic-commerce-sort-dropdown></atomic-commerce-sort-dropdown>
            <atomic-commerce-refine-toggle></atomic-commerce-refine-toggle>
          </atomic-layout-section>
          <atomic-layout-section section="products">
            <atomic-commerce-product-list
              display="grid"
              density="compact"
              image-size="small"
            >
              <atomic-product-template>
                <template>
                  <atomic-product-section-name id="product-name-section">
                    <style></style>
                    <atomic-product-link
                      class="font-bold"
                    ></atomic-product-link>
                  </atomic-product-section-name>
                  <atomic-product-section-visual>
                    <atomic-product-field-condition if-defined="ec_thumbnails">
                      <atomic-product-image
                        field="ec_thumbnails"
                      ></atomic-product-image>
                    </atomic-product-field-condition>
                  </atomic-product-section-visual>
                  <atomic-product-section-metadata>
                    <atomic-product-field-condition if-defined="ec_brand">
                      <atomic-product-text
                        field="ec_brand"
                        class="text-neutral-dark block"
                      ></atomic-product-text>
                    </atomic-product-field-condition>
                    <atomic-product-field-condition
                      if-defined="cat_available_sizes"
                    >
                      <atomic-product-multi-value-text
                        field="cat_available_sizes"
                      ></atomic-product-multi-value-text>
                    </atomic-product-field-condition>
                    <atomic-product-field-condition if-defined="ec_rating">
                      <atomic-product-rating
                        field="ec_rating"
                      ></atomic-product-rating>
                    </atomic-product-field-condition>
                    <atomic-product-field-condition if-defined="concepts">
                      <atomic-product-multi-value-text
                        field="concepts"
                      ></atomic-product-multi-value-text>
                    </atomic-product-field-condition>
                  </atomic-product-section-metadata>
                  <atomic-product-section-emphasized>
                    <atomic-product-price currency="USD"></atomic-product-price>
                  </atomic-product-section-emphasized>
                  <atomic-product-section-description>
                    <atomic-product-excerpt></atomic-product-excerpt>
                  </atomic-product-section-description>
                  <atomic-product-section-children>
                    <atomic-product-children></atomic-product-children>
                  </atomic-product-section-children>
                </template>
              </atomic-product-template>
            </atomic-commerce-product-list>
            <atomic-commerce-query-error></atomic-commerce-query-error>
            <atomic-commerce-no-products></atomic-commerce-no-products>
          </atomic-layout-section>
          <atomic-layout-section section="pagination">
            <atomic-commerce-load-more-products></atomic-commerce-load-more-products>
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-commerce-layout>
    </atomic-commerce-interface>
  `,play:async e=>{await f(e.canvasElement),await e.canvasElement.querySelector(`atomic-commerce-interface`).executeFirstRequest()}},v={name:`Product Listing Page`},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'Product Listing Page'
}`,...v.parameters?.docs?.source}}},y=[`Default`]}))();export{v as Default,y as __namedExportsOrder,_ as default};