import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,St as r,Tt as i}from"./iframe-cSkD6HDI.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{n as s,t as c}from"./mock-eNEo2dE0.js";import{getSampleCommerceEngineConfiguration as l}from"/headless/v3.50.1/commerce/headless.esm.js";async function u(e){await customElements.whenDefined(`atomic-commerce-interface`),await e.querySelector(`atomic-commerce-interface`).initialize(l())}var d,f,p,m,h,g,_,v,y,b,x=e((()=>{t(),r(),s(),o(),d=new c,{events:f,args:p,argTypes:m,template:h}=n(`atomic-commerce-interface`,{excludeCategories:[`methods`]}),g={component:`atomic-commerce-interface`,title:`Commerce/Interface`,id:`atomic-commerce-interface`,render:e=>h(e),parameters:{...a,msw:{handlers:[...d.handlers]},actions:{handles:f}},decorators:[e=>i`<div id="code-root">${e()}</div>`],beforeEach:()=>{d.clearAll()},play:async e=>{await u(e.canvasElement),await e.canvasElement.querySelector(`atomic-commerce-interface`).executeFirstRequest()},argTypes:{...m,engine:{...m,control:{disable:!0},table:{defaultValue:{summary:void 0}}},urlManager:{...m.urlManager,control:{disable:!0},table:{defaultValue:{summary:void 0}}},i18n:{...m.i18n,control:{disable:!0},table:{defaultValue:{summary:void 0}}}},args:{...p,engine:void 0,i18n:void 0,urlManager:void 0,language:`en`,"default-slot":`<span>Interface content</span>`}},_={},v={args:{type:`product-listing`,"default-slot":`
      <atomic-commerce-layout>
        <atomic-layout-section section="search">
          <atomic-commerce-search-box></atomic-commerce-search-box>
        </atomic-layout-section>
        <atomic-layout-section section="facets">
          <atomic-commerce-facets></atomic-commerce-facets>
        </atomic-layout-section>
        <atomic-layout-section section="main">
          <atomic-layout-section section="status">
            <atomic-commerce-breadbox></atomic-commerce-breadbox>
            <atomic-commerce-query-summary></atomic-commerce-query-summary>
            <atomic-commerce-sort-dropdown></atomic-commerce-sort-dropdown>
          </atomic-layout-section>
          <atomic-layout-section section="products">
            <atomic-commerce-product-list
              display="grid"
              density="compact"
              image-size="small"
            ></atomic-commerce-product-list>
            <atomic-commerce-query-error></atomic-commerce-query-error>
          </atomic-layout-section>
          <atomic-layout-section section="pagination">
            <atomic-commerce-pager></atomic-commerce-pager>
            <atomic-commerce-products-per-page>
            </atomic-commerce-products-per-page>
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-commerce-layout>
    `}},y={args:{type:`search`,"default-slot":`
      <atomic-commerce-layout>
        <atomic-layout-section section="search">
          <atomic-commerce-search-box></atomic-commerce-search-box>
        </atomic-layout-section>
        <atomic-layout-section section="facets">
          <atomic-commerce-facets></atomic-commerce-facets>
        </atomic-layout-section>
        <atomic-layout-section section="main">
          <atomic-layout-section section="status">
            <atomic-commerce-breadbox></atomic-commerce-breadbox>
            <atomic-commerce-query-summary></atomic-commerce-query-summary>
            <atomic-commerce-sort-dropdown></atomic-commerce-sort-dropdown>
          </atomic-layout-section>
          <atomic-layout-section section="products">
            <atomic-commerce-product-list
              display="grid"
              density="compact"
              image-size="small"
            ></atomic-commerce-product-list>
            <atomic-commerce-query-error></atomic-commerce-query-error>
          </atomic-layout-section>
          <atomic-layout-section section="pagination">
            <atomic-commerce-pager></atomic-commerce-pager>
            <atomic-commerce-products-per-page>
            </atomic-commerce-products-per-page>
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-commerce-layout>
    `}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'product-listing',
    'default-slot': \`
      <atomic-commerce-layout>
        <atomic-layout-section section="search">
          <atomic-commerce-search-box></atomic-commerce-search-box>
        </atomic-layout-section>
        <atomic-layout-section section="facets">
          <atomic-commerce-facets></atomic-commerce-facets>
        </atomic-layout-section>
        <atomic-layout-section section="main">
          <atomic-layout-section section="status">
            <atomic-commerce-breadbox></atomic-commerce-breadbox>
            <atomic-commerce-query-summary></atomic-commerce-query-summary>
            <atomic-commerce-sort-dropdown></atomic-commerce-sort-dropdown>
          </atomic-layout-section>
          <atomic-layout-section section="products">
            <atomic-commerce-product-list
              display="grid"
              density="compact"
              image-size="small"
            ></atomic-commerce-product-list>
            <atomic-commerce-query-error></atomic-commerce-query-error>
          </atomic-layout-section>
          <atomic-layout-section section="pagination">
            <atomic-commerce-pager></atomic-commerce-pager>
            <atomic-commerce-products-per-page>
            </atomic-commerce-products-per-page>
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-commerce-layout>
    \`
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'search',
    'default-slot': \`
      <atomic-commerce-layout>
        <atomic-layout-section section="search">
          <atomic-commerce-search-box></atomic-commerce-search-box>
        </atomic-layout-section>
        <atomic-layout-section section="facets">
          <atomic-commerce-facets></atomic-commerce-facets>
        </atomic-layout-section>
        <atomic-layout-section section="main">
          <atomic-layout-section section="status">
            <atomic-commerce-breadbox></atomic-commerce-breadbox>
            <atomic-commerce-query-summary></atomic-commerce-query-summary>
            <atomic-commerce-sort-dropdown></atomic-commerce-sort-dropdown>
          </atomic-layout-section>
          <atomic-layout-section section="products">
            <atomic-commerce-product-list
              display="grid"
              density="compact"
              image-size="small"
            ></atomic-commerce-product-list>
            <atomic-commerce-query-error></atomic-commerce-query-error>
          </atomic-layout-section>
          <atomic-layout-section section="pagination">
            <atomic-commerce-pager></atomic-commerce-pager>
            <atomic-commerce-products-per-page>
            </atomic-commerce-products-per-page>
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-commerce-layout>
    \`
  }
}`,...y.parameters?.docs?.source}}},b=[`Default`,`WithProductList`,`WithSearch`]}));x();export{_ as Default,v as WithProductList,y as WithSearch,b as __namedExportsOrder,g as default,x as t};