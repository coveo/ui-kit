import{n as e}from"./chunk-jRWAZmH_.js";import{A as t,D as n,E as r,M as i}from"./iframe-cSkD6HDI.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{r as s,t as c}from"./search-interface-wrapper-DyJSRxFL.js";var l,u,d,f,p,m,h,g,_,v,y=e((()=>{n(),t(),o(),c(),{decorator:l,play:u}=s(),{events:d,args:f,argTypes:p,template:m}=r(`atomic-refine-toggle`,{excludeCategories:[`methods`]}),h={component:`atomic-refine-toggle`,title:`Search/Refine Toggle`,id:`atomic-refine-toggle`,render:e=>m(e),parameters:{...a,chromatic:{disableSnapshot:!0},actions:{handles:d}},args:f,argTypes:p,play:u},g={decorators:[e=>i`
      ${e()}
      <div style="display:none;">
        <atomic-facet field="author" label="Authors"></atomic-facet>
        <atomic-facet field="language" label="Language"></atomic-facet>
        <atomic-facet
          field="objecttype"
          label="Type"
          display-values-as="link"
        ></atomic-facet>
        <atomic-facet
          field="year"
          label="Year"
          display-values-as="box"
        ></atomic-facet>
      </div>
    `,l]},_={name:`With multiple atomic-external`,decorators:[e=>i`
      <atomic-search-interface id="foo">
        <h1>Search Interface</h1>
        <atomic-layout-section section="horizontal-facets">
          <atomic-facet field="author" label="facet2"></atomic-facet>
        </atomic-layout-section>
        <atomic-layout-section section="facets">
          <atomic-facet field="author" label="facet1"></atomic-facet>
        </atomic-layout-section>
        <atomic-facet field="author" label="facet7"></atomic-facet>
      </atomic-search-interface>
      <atomic-external selector="#foo">
        <h1>External 1</h1>
        <atomic-layout-section section="horizontal-facets">
          <atomic-facet field="author" label="facet4"></atomic-facet>
        </atomic-layout-section>
        <atomic-layout-section section="facets">
          <atomic-facet field="author" label="facet3"></atomic-facet>
        </atomic-layout-section>
        <atomic-facet field="author" label="facet8"></atomic-facet>
      </atomic-external>

      <atomic-external selector="#foo">
        <h1>External 3</h1>
        <atomic-layout-section section="horizontal-facets">
          <atomic-facet field="author" label="facet6"></atomic-facet>
        </atomic-layout-section>
        <atomic-layout-section section="facets">
          <atomic-facet field="author" label="facet5"></atomic-facet>
        </atomic-layout-section>
        <atomic-facet field="author" label="facet9"></atomic-facet>
      </atomic-external>
      <atomic-external selector="#foo">
        <h1>External 4</h1>
        ${e()}
      </atomic-external>
    `]},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  decorators: [story => html\`
      \${story()}
      <div style="display:none;">
        <atomic-facet field="author" label="Authors"></atomic-facet>
        <atomic-facet field="language" label="Language"></atomic-facet>
        <atomic-facet
          field="objecttype"
          label="Type"
          display-values-as="link"
        ></atomic-facet>
        <atomic-facet
          field="year"
          label="Year"
          display-values-as="box"
        ></atomic-facet>
      </div>
    \`, decorator]
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  name: 'With multiple atomic-external',
  decorators: [story => html\`
      <atomic-search-interface id="foo">
        <h1>Search Interface</h1>
        <atomic-layout-section section="horizontal-facets">
          <atomic-facet field="author" label="facet2"></atomic-facet>
        </atomic-layout-section>
        <atomic-layout-section section="facets">
          <atomic-facet field="author" label="facet1"></atomic-facet>
        </atomic-layout-section>
        <atomic-facet field="author" label="facet7"></atomic-facet>
      </atomic-search-interface>
      <atomic-external selector="#foo">
        <h1>External 1</h1>
        <atomic-layout-section section="horizontal-facets">
          <atomic-facet field="author" label="facet4"></atomic-facet>
        </atomic-layout-section>
        <atomic-layout-section section="facets">
          <atomic-facet field="author" label="facet3"></atomic-facet>
        </atomic-layout-section>
        <atomic-facet field="author" label="facet8"></atomic-facet>
      </atomic-external>

      <atomic-external selector="#foo">
        <h1>External 3</h1>
        <atomic-layout-section section="horizontal-facets">
          <atomic-facet field="author" label="facet6"></atomic-facet>
        </atomic-layout-section>
        <atomic-layout-section section="facets">
          <atomic-facet field="author" label="facet5"></atomic-facet>
        </atomic-layout-section>
        <atomic-facet field="author" label="facet9"></atomic-facet>
      </atomic-external>
      <atomic-external selector="#foo">
        <h1>External 4</h1>
        \${story()}
      </atomic-external>
    \`]
}`,..._.parameters?.docs?.source}}},v=[`Default`,`WithAtomicExternals`]}));y();export{g as Default,_ as WithAtomicExternals,v as __namedExportsOrder,h as default,y as t};