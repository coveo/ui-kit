import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,St as r,Tt as i}from"./iframe-cSkD6HDI.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{n as s,t as c}from"./mock-CijMLWxR.js";import{n as l,t as u}from"./insight-interface-wrapper-BwybnAhf.js";var d,f,p,m,h,g,_,v,y,b,x,S,C=e((()=>{t(),r(),s(),o(),u(),{decorator:d,play:f}=l(),{events:p,args:m,argTypes:h,template:g}=n(`atomic-insight-result-list`,{excludeCategories:[`methods`]}),_=new c,v=`<template>
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
    <atomic-result-badge
      icon="https://raw.githubusercontent.com/Rush/Font-Awesome-SVG-PNG/master/black/svg/language.svg"
    >
      <atomic-result-multi-value-text
        field="language"
      ></atomic-result-multi-value-text>
    </atomic-result-badge>
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
</template>`,y=e=>i`
  <atomic-insight-layout>
    <atomic-layout-section section="results">
      ${e()}
    </atomic-layout-section>
  </atomic-insight-layout>
`,b={component:`atomic-insight-result-list`,title:`Insight/Result List`,id:`atomic-insight-result-list`,render:e=>g(e),decorators:[y,d],parameters:{...a,msw:{handlers:[..._.handlers]},actions:{handles:p}},args:{...m,"default-slot":`<atomic-insight-result-template>${v}</atomic-insight-result-template>`},argTypes:{...h,density:{control:`select`,options:[`normal`,`comfortable`,`compact`]},"image-size":{control:`select`,options:[`icon`,`small`,`large`,`none`]}},play:f},x={},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{}`,...x.parameters?.docs?.source}}},S=[`Default`]}));C();export{x as Default,S as __namedExportsOrder,b as default,C as t};