import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,St as r,Tt as i}from"./iframe-cSkD6HDI.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{n as s,t as c}from"./mock-C5ckzz_b.js";import{n as l,t as u}from"./recs-interface-wrapper-BzT2wBsL.js";var d,f,p,m,h,g,_,v,y,b,x,S,C,w,T=e((()=>{t(),r(),s(),o(),u(),d=new c,d.searchEndpoint.mock(e=>({...e,results:e.results.slice(0,10),totalCount:10,totalCountFiltered:10})),f=`<template>
  <atomic-result-section-visual>
    <atomic-result-image field="ytthumbnailurl" fallback="https://picsum.photos/seed/picsum/350"></atomic-result-image>
  </atomic-result-section-visual>
  <atomic-result-section-badges>
    <atomic-field-condition must-match-sourcetype="YouTube">
      <atomic-result-badge
        label="YouTube"
        class="youtube-badge"
      ></atomic-result-badge>
    </atomic-field-condition>
  </atomic-result-section-badges>
  <atomic-result-section-title>
    <atomic-result-link></atomic-result-link>
  </atomic-result-section-title>
  <atomic-result-section-excerpt>
    <atomic-result-text field="excerpt"></atomic-result-text>
  </atomic-result-section-excerpt>
  <atomic-result-section-bottom-metadata>
    <atomic-result-fields-list>
      <atomic-field-condition class="field" if-defined="source">
        <span class="field-label">
          <atomic-text value="source"></atomic-text>:
        </span>
        <atomic-result-text field="source"></atomic-result-text>
      </atomic-field-condition>
      <atomic-field-condition class="field" if-defined="author">
        <span class="field-label">
          <atomic-text value="author"></atomic-text>:
        </span>
        <atomic-result-text field="author"></atomic-result-text>
      </atomic-field-condition>
      <atomic-field-condition class="field" if-defined="date">
        <span class="field-label">
          <atomic-text value="date"></atomic-text>:
        </span>
        <atomic-result-date></atomic-result-date>
      </atomic-field-condition>
    </atomic-result-fields-list>
  </atomic-result-section-bottom-metadata>
</template>`,p=`<template>
  <atomic-result-section-title>
    <atomic-result-link></atomic-result-link>
  </atomic-result-section-title>
</template>`,{decorator:m,play:h}=l(),{events:g,args:_,argTypes:v,template:y}=n(`atomic-recs-result-template`,{excludeCategories:[`methods`]}),b={component:`atomic-recs-result-template`,title:`Recommendations/Recs Result Template`,id:`atomic-recs-result-template`,render:e=>y(e),parameters:{...a,actions:{handles:g},msw:{handlers:[...d.handlers]}},beforeEach:()=>{d.searchEndpoint.clear()},args:{..._,"default-slot":f},argTypes:{...v,"must-match":{...v[`must-match`],control:!1},"must-not-match":{...v[`must-not-match`],control:!1},conditions:{...v.conditions,control:!1}}},x={name:`In a recs list`,decorators:[e=>i`
      <atomic-recs-list display="list" density="normal" image-size="icon">
        ${e()}
      </atomic-recs-list>
    `,m],play:h},S={name:`With minimal template`,args:{"default-slot":p},decorators:[e=>i`
      <atomic-recs-list display="list" density="normal" image-size="none">
        ${e()}
      </atomic-recs-list>
    `,m],play:h},C={name:`With link slot`,args:{"default-slot":`<template slot="link">
      <atomic-result-link>
        <a slot="attributes" target="_blank"></a>
      </atomic-result-link>
    </template>
    <template>
      <atomic-result-section-title>
        <atomic-result-text field="title"></atomic-result-text>
      </atomic-result-section-title>
    </template>`},decorators:[e=>i`
      <atomic-recs-list display="list" density="normal" image-size="none">
        ${e()}
      </atomic-recs-list>
    `,m],play:h},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'In a recs list',
  decorators: [story => html\`
      <atomic-recs-list display="list" density="normal" image-size="icon">
        \${story()}
      </atomic-recs-list>
    \`, decorator],
  play
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'With minimal template',
  args: {
    'default-slot': MINIMAL_TEMPLATE
  },
  decorators: [story => html\`
      <atomic-recs-list display="list" density="normal" image-size="none">
        \${story()}
      </atomic-recs-list>
    \`, decorator],
  play
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'With link slot',
  args: {
    'default-slot': \`<template slot="link">
      <atomic-result-link>
        <a slot="attributes" target="_blank"></a>
      </atomic-result-link>
    </template>
    <template>
      <atomic-result-section-title>
        <atomic-result-text field="title"></atomic-result-text>
      </atomic-result-section-title>
    </template>\`
  },
  decorators: [story => html\`
      <atomic-recs-list display="list" density="normal" image-size="none">
        \${story()}
      </atomic-recs-list>
    \`, decorator],
  play
}`,...C.parameters?.docs?.source}}},w=[`Default`,`WithMinimalTemplate`,`WithLinkSlot`]}));T();export{x as Default,C as WithLinkSlot,S as WithMinimalTemplate,w as __namedExportsOrder,b as default,T as t};