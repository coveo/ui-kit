import{n as e}from"./chunk-jRWAZmH_.js";import{A as t,D as n,E as r,M as i,O as a,k as o}from"./iframe-cSkD6HDI.js";import{n as s,t as c}from"./common-meta-parameters-BmIbTEf7.js";import{r as l,t as u}from"./search-interface-wrapper-DyJSRxFL.js";var d,f,p,m,h,g,_,v,y,b,x,S=e((()=>{n(),a(),t(),c(),u(),d=`<template>
  <style>
    .field {
      display: inline-flex;
      align-items: center;
    }

    .field-label {
      font-weight: bold;
      margin-right: 0.25rem;
    }
  </style>
  <atomic-result-section-visual>
    <img loading="lazy" src="https://picsum.photos/seed/picsum/350" class="thumbnail" />
  </atomic-result-section-visual>
  <atomic-result-section-title>
    <atomic-result-link></atomic-result-link>
  </atomic-result-section-title>
  <atomic-result-section-excerpt>
    <atomic-result-text field="excerpt"></atomic-result-text>
  </atomic-result-section-excerpt>
  <atomic-result-section-bottom-metadata>
    <atomic-result-fields-list>
      <atomic-field-condition class="field" if-defined="inat_kingdom">
        <span class="field-label">Kingdom:</span>
        <atomic-result-text field="inat_kingdom"></atomic-result-text>
      </atomic-field-condition>

      <atomic-field-condition class="field" if-defined="inat_family">
        <span class="field-label">Family:</span>
        <atomic-result-text field="inat_family"></atomic-result-text>
      </atomic-field-condition>

      <atomic-field-condition class="field" if-defined="inat_class">
        <span class="field-label">Class:</span>
        <atomic-result-text field="inat_class"></atomic-result-text>
      </atomic-field-condition>
    </atomic-result-fields-list>
  </atomic-result-section-bottom-metadata>
  <atomic-result-section-children>
    <atomic-result-children inherit-templates></atomic-result-children>
  </atomic-result-section-children>
</template>`,f=`<template>
  <style>
    .field {
      display: inline-flex;
      align-items: center;
    }

    .field-label {
      font-weight: bold;
      margin-right: 0.25rem;
    }

    .thumbnail {
      border-radius: var(--atomic-border-radius);
    }
  </style>
  <atomic-result-section-visual>
    <img loading="lazy" src="https://picsum.photos/seed/picsum/350" class="thumbnail" />
  </atomic-result-section-visual>
  <atomic-result-section-title>
    <atomic-result-link></atomic-result-link>
  </atomic-result-section-title>
  <atomic-result-section-excerpt>
    <atomic-result-text field="excerpt"></atomic-result-text>
  </atomic-result-section-excerpt>
  <atomic-result-section-bottom-metadata>
    <atomic-result-fields-list>
      <atomic-field-condition class="field" if-defined="inat_kingdom">
        <span class="field-label">Kingdom:</span>
        <atomic-result-text field="inat_kingdom"></atomic-result-text>
      </atomic-field-condition>

      <atomic-field-condition class="field" if-defined="inat_family">
        <span class="field-label">Family:</span>
        <atomic-result-text field="inat_family"></atomic-result-text>
      </atomic-field-condition>

      <atomic-field-condition class="field" if-defined="inat_class">
        <span class="field-label">Class:</span>
        <atomic-result-text field="inat_class"></atomic-result-text>
      </atomic-field-condition>
    </atomic-result-fields-list>
  </atomic-result-section-bottom-metadata>
  <atomic-result-section-children slot="children-template">
  </atomic-result-section-children>
</template>`,{events:p,args:m,argTypes:h,template:g}=r(`atomic-result-children-template`,{excludeCategories:[`methods`]}),_={component:`atomic-result-children-template`,title:`Search/Result Children Template`,id:`atomic-result-children-template`,render:e=>g(e),parameters:{...s,chromatic:{disableSnapshot:!0},actions:{handles:p}},args:{...m,"default-slot":d},argTypes:{...h,"must-match":{...h[`must-match`],control:!1},"must-not-match":{...h[`must-not-match`],control:!1},conditions:{...h.conditions,control:!1}}},{decorator:v,play:y}=l({config:{preprocessRequest:e=>{let t=JSON.parse(e.body);return t.numberOfResults=4,t.aq=`@source=iNaturalistTaxons`,e.body=JSON.stringify(t),e}},skipFirstSearch:!1,includeCodeRoot:!1}),b={name:`In a folded result list`,decorators:[e=>i`
      <atomic-folded-result-list image-size="small" display="grid">
        <atomic-result-template>
          ${o(f)}
        </atomic-result-template>
        <atomic-result-children image-size="image">
          ${e()}
        </atomic-result-children>
      </atomic-folded-result-list>
    `,v],play:y,parameters:{docs:{source:{code:`<atomic-folded-result-list image-size="small" display="grid">
  <atomic-result-template>
${f}
  </atomic-result-template>
  <atomic-result-children image-size="image">
    <atomic-result-children-template>
${d}
    </atomic-result-children-template>
  </atomic-result-children>
</atomic-folded-result-list>`}}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'In a folded result list',
  decorators: [story => html\`
      <atomic-folded-result-list image-size="small" display="grid">
        <atomic-result-template>
          \${unsafeHTML(PARENT_TEMPLATE_EXAMPLE)}
        </atomic-result-template>
        <atomic-result-children image-size="image">
          \${story()}
        </atomic-result-children>
      </atomic-folded-result-list>
    \`, decorator],
  play,
  parameters: {
    docs: {
      source: {
        code: \`<atomic-folded-result-list image-size="small" display="grid">
  <atomic-result-template>
\${PARENT_TEMPLATE_EXAMPLE}
  </atomic-result-template>
  <atomic-result-children image-size="image">
    <atomic-result-children-template>
\${CHILD_TEMPLATE_EXAMPLE}
    </atomic-result-children-template>
  </atomic-result-children>
</atomic-folded-result-list>\`
      }
    }
  }
}`,...b.parameters?.docs?.source}}},x=[`Default`]}));S();export{b as Default,x as __namedExportsOrder,_ as default,S as t};