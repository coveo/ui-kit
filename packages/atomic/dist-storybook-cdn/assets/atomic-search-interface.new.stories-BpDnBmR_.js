import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,St as r,Tt as i}from"./iframe-cSkD6HDI.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{getSampleSearchEngineConfiguration as s}from"/headless/v3.50.1/headless.esm.js";async function c(e){await customElements.whenDefined(`atomic-search-interface`),await e.querySelector(`atomic-search-interface`).initialize(s())}var l,u,d,f,p,m,h,g,_=e((()=>{t(),r(),o(),{events:l,args:u,argTypes:d,template:f}=n(`atomic-search-interface`,{excludeCategories:[`methods`]}),p={component:`atomic-search-interface`,title:`Search/Interface`,id:`atomic-search-interface`,render:e=>f(e),decorators:[e=>i`<div id="code-root">${e()}</div>`],parameters:{...a,chromatic:{disableSnapshot:!0},actions:{handles:l}},play:async e=>{await c(e.canvasElement),await e.canvasElement.querySelector(`atomic-search-interface`).executeFirstSearch()},argTypes:{...d,engine:{...d,control:{disable:!0},table:{defaultValue:{summary:void 0}}},urlManager:{...d.urlManager,control:{disable:!0},table:{defaultValue:{summary:void 0}}},i18n:{...d.i18n,control:{disable:!0},table:{defaultValue:{summary:void 0}}}},args:{...u,engine:void 0,i18n:void 0,urlManager:void 0,language:`en`,"default-slot":`<span>Interface content</span>`}},m={},h={name:`With a Result List`,args:{"default-slot":`
      <atomic-search-layout>
        <atomic-layout-section section="search">
          <atomic-search-box></atomic-search-box>
        </atomic-layout-section>
        <atomic-layout-section section="facets">
             <atomic-facet field="author" label="Authors"></atomic-facet>
        </atomic-layout-section>
        <atomic-layout-section section="main">
          <atomic-layout-section section="status">
            <atomic-breadbox></atomic-breadbox>
            <atomic-query-summary></atomic-query-summary>
            <atomic-sort-dropdown>
              <atomic-sort-expression label="relevance" expression="relevancy"></atomic-sort-expression>
              <atomic-sort-expression label="most-recent" expression="date descending"></atomic-sort-expression>
            </atomic-sort-dropdown>
          </atomic-layout-section>
          <atomic-layout-section section="results">
            <atomic-result-list
              display="grid"
              density="compact"
              image-size="small"
            ></atomic-result-list>
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-search-layout>
    `}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: 'With a Result List',
  args: {
    'default-slot': \`
      <atomic-search-layout>
        <atomic-layout-section section="search">
          <atomic-search-box></atomic-search-box>
        </atomic-layout-section>
        <atomic-layout-section section="facets">
             <atomic-facet field="author" label="Authors"></atomic-facet>
        </atomic-layout-section>
        <atomic-layout-section section="main">
          <atomic-layout-section section="status">
            <atomic-breadbox></atomic-breadbox>
            <atomic-query-summary></atomic-query-summary>
            <atomic-sort-dropdown>
              <atomic-sort-expression label="relevance" expression="relevancy"></atomic-sort-expression>
              <atomic-sort-expression label="most-recent" expression="date descending"></atomic-sort-expression>
            </atomic-sort-dropdown>
          </atomic-layout-section>
          <atomic-layout-section section="results">
            <atomic-result-list
              display="grid"
              density="compact"
              image-size="small"
            ></atomic-result-list>
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-search-layout>
    \`
  }
}`,...h.parameters?.docs?.source}}},g=[`Default`,`WithAResultList`]}));_();export{m as Default,h as WithAResultList,g as __namedExportsOrder,p as default,_ as t};