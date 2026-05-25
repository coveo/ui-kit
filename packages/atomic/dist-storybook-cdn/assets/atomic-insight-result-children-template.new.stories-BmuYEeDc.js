import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,St as r,Tt as i}from"./iframe-cSkD6HDI.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{a as s,n as c,r as l,t as u}from"./mock-CijMLWxR.js";import{n as d,t as f}from"./insight-interface-wrapper-BwybnAhf.js";import{i as p,n as m,r as h,t as g}from"./insight-result-template-wrapper-vZ5uGLfk.js";var _,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M=e((()=>{t(),r(),c(),o(),f(),h(),g(),_=new u,_.searchEndpoint.mock(()=>l),v=`<template>
  <atomic-result-section-title>
    <atomic-result-link></atomic-result-link>
  </atomic-result-section-title>
  <atomic-result-section-excerpt>
    <atomic-result-text field="excerpt"></atomic-result-text>
  </atomic-result-section-excerpt>
</template>`,{events:y,args:b,argTypes:x,template:S}=n(`atomic-insight-result-children-template`,{excludeCategories:[`methods`]}),{decorator:C,play:w}=d({},!1,!1),{decorator:T}=p(`list`,!1),{decorator:E}=m(!1),D={component:`atomic-insight-result-children-template`,title:`Insight/Result Children Template`,id:`atomic-insight-result-children-template`,render:e=>i`
    <atomic-result-section-title>
      <atomic-result-link></atomic-result-link>
    </atomic-result-section-title>
    <atomic-result-section-children id="code-root">
      <atomic-insight-result-children image-size="icon">
        ${S(e)}
      </atomic-insight-result-children>
    </atomic-result-section-children>
  `,decorators:[E,T,C],parameters:{...a,actions:{handles:y},msw:{handlers:[..._.handlers]}},args:{...b,"default-slot":v},argTypes:{...x,"must-match":{...x[`must-match`],control:!1},"must-not-match":{...x[`must-not-match`],control:!1},conditions:{...x.conditions,control:!1}},play:w},O={},k={name:`With nested children`,render:()=>i`
    <atomic-result-section-title>
      <atomic-result-link></atomic-result-link>
    </atomic-result-section-title>
    <atomic-result-section-children id="code-root">
      <atomic-insight-result-children image-size="icon">
        <atomic-insight-result-children-template>
          <template>
            <atomic-result-section-title>
              <atomic-result-link></atomic-result-link>
            </atomic-result-section-title>
            <atomic-result-section-excerpt>
              <atomic-result-text field="excerpt"></atomic-result-text>
            </atomic-result-section-excerpt>
            <atomic-result-section-children>
              <atomic-insight-result-children
                inherit-templates
              ></atomic-insight-result-children>
            </atomic-result-section-children>
          </template>
        </atomic-insight-result-children-template>
      </atomic-insight-result-children>
    </atomic-result-section-children>
  `,beforeEach:async()=>(_.searchEndpoint.mock(()=>s),()=>{_.searchEndpoint.reset(),_.searchEndpoint.mock(()=>l)})},A={name:`With conditions`,render:()=>i`
    <atomic-result-section-title>
      <atomic-result-link></atomic-result-link>
    </atomic-result-section-title>
    <atomic-result-section-children id="code-root">
      <atomic-insight-result-children image-size="icon">
        <!-- Template for specific source types -->
        <atomic-insight-result-children-template
          must-match-sourcetype="YouTube"
        >
          <template>
            <atomic-result-section-badges>
              <atomic-result-badge label="YouTube"></atomic-result-badge>
            </atomic-result-section-badges>
            <atomic-result-section-title>
              <atomic-result-link></atomic-result-link>
            </atomic-result-section-title>
          </template>
        </atomic-insight-result-children-template>
        <!-- Default template -->
        <atomic-insight-result-children-template>
          <template>
            <atomic-result-section-title>
              <atomic-result-link></atomic-result-link>
            </atomic-result-section-title>
            <atomic-result-section-excerpt>
              <atomic-result-text field="excerpt"></atomic-result-text>
            </atomic-result-section-excerpt>
          </template>
        </atomic-insight-result-children-template>
      </atomic-insight-result-children>
    </atomic-result-section-children>
  `},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  name: 'With nested children',
  render: () => html\`
    <atomic-result-section-title>
      <atomic-result-link></atomic-result-link>
    </atomic-result-section-title>
    <atomic-result-section-children id="code-root">
      <atomic-insight-result-children image-size="icon">
        <atomic-insight-result-children-template>
          <template>
            <atomic-result-section-title>
              <atomic-result-link></atomic-result-link>
            </atomic-result-section-title>
            <atomic-result-section-excerpt>
              <atomic-result-text field="excerpt"></atomic-result-text>
            </atomic-result-section-excerpt>
            <atomic-result-section-children>
              <atomic-insight-result-children
                inherit-templates
              ></atomic-insight-result-children>
            </atomic-result-section-children>
          </template>
        </atomic-insight-result-children-template>
      </atomic-insight-result-children>
    </atomic-result-section-children>
  \`,
  beforeEach: async () => {
    insightApiHarness.searchEndpoint.mock(() => nestedFoldedResponse);
    return () => {
      insightApiHarness.searchEndpoint.reset();
      insightApiHarness.searchEndpoint.mock(() => baseFoldedResponse);
    };
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  name: 'With conditions',
  render: () => html\`
    <atomic-result-section-title>
      <atomic-result-link></atomic-result-link>
    </atomic-result-section-title>
    <atomic-result-section-children id="code-root">
      <atomic-insight-result-children image-size="icon">
        <!-- Template for specific source types -->
        <atomic-insight-result-children-template
          must-match-sourcetype="YouTube"
        >
          <template>
            <atomic-result-section-badges>
              <atomic-result-badge label="YouTube"></atomic-result-badge>
            </atomic-result-section-badges>
            <atomic-result-section-title>
              <atomic-result-link></atomic-result-link>
            </atomic-result-section-title>
          </template>
        </atomic-insight-result-children-template>
        <!-- Default template -->
        <atomic-insight-result-children-template>
          <template>
            <atomic-result-section-title>
              <atomic-result-link></atomic-result-link>
            </atomic-result-section-title>
            <atomic-result-section-excerpt>
              <atomic-result-text field="excerpt"></atomic-result-text>
            </atomic-result-section-excerpt>
          </template>
        </atomic-insight-result-children-template>
      </atomic-insight-result-children>
    </atomic-result-section-children>
  \`
}`,...A.parameters?.docs?.source}}},j=[`Default`,`WithNestedChildren`,`WithConditions`]}));M();export{O as Default,A as WithConditions,k as WithNestedChildren,j as __namedExportsOrder,D as default,M as t};