import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,St as r,Tt as i}from"./iframe-cSkD6HDI.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{n as s,r as c,t as l}from"./mock-CijMLWxR.js";import{n as u,t as d}from"./insight-interface-wrapper-BwybnAhf.js";import{i as f,n as p,r as m,t as h}from"./insight-result-template-wrapper-vZ5uGLfk.js";var g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M=e((()=>{t(),r(),s(),o(),d(),m(),h(),g=new l,{decorator:_,play:v}=u({},!1,!1),{decorator:y}=f(`list`,!1),{decorator:b}=p(!1),{events:x,args:S,argTypes:C,styleTemplate:w}=n(`atomic-insight-result-children`,{excludeCategories:[`methods`]}),T=i`
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
`,E={component:`atomic-insight-result-children`,title:`Insight/Result Children`,id:`atomic-insight-result-children`,render:e=>i`
    ${w(e)}
    <atomic-result-section-title>
      <atomic-result-link></atomic-result-link>
    </atomic-result-section-title>
    <atomic-result-section-children id="code-root">
      <atomic-insight-result-children
        image-size=${e[`image-size`]||`icon`}
        inherit-templates=${e[`inherit-templates`]||!1}
      >
        ${T}
      </atomic-insight-result-children>
    </atomic-result-section-children>
  `,decorators:[b,y,_],parameters:{...a,actions:{handles:x},msw:{handlers:[...g.handlers]}},args:{...S,"image-size":`icon`},argTypes:C,beforeEach:async()=>(g.searchEndpoint.clear(),g.searchEndpoint.mock(()=>c),()=>{g.searchEndpoint.reset()}),play:v},D={},O={name:`With before-children slot`,render:e=>i`
    ${w(e)}
    <atomic-result-section-title>
      <atomic-result-link></atomic-result-link>
    </atomic-result-section-title>
    <atomic-result-section-children id="code-root">
      <atomic-insight-result-children
        image-size=${e[`image-size`]||`icon`}
        inherit-templates=${e[`inherit-templates`]||!1}
      >
        <div slot="before-children" class="text-sm text-neutral-dark">
          Related documents:
        </div>
        ${T}
      </atomic-insight-result-children>
    </atomic-result-section-children>
  `},k={name:`With after-children slot`,render:e=>i`
    ${w(e)}
    <atomic-result-section-title>
      <atomic-result-link></atomic-result-link>
    </atomic-result-section-title>
    <atomic-result-section-children id="code-root">
      <atomic-insight-result-children
        image-size=${e[`image-size`]||`icon`}
        inherit-templates=${e[`inherit-templates`]||!1}
      >
        ${T}
        <div slot="after-children" class="text-sm text-neutral-dark mt-2">
          End of related documents
        </div>
      </atomic-insight-result-children>
    </atomic-result-section-children>
  `},A={name:`With both slots`,render:e=>i`
    ${w(e)}
    <atomic-result-section-title>
      <atomic-result-link></atomic-result-link>
    </atomic-result-section-title>
    <atomic-result-section-children id="code-root">
      <atomic-insight-result-children
        image-size=${e[`image-size`]||`icon`}
        inherit-templates=${e[`inherit-templates`]||!1}
      >
        <div slot="before-children" class="text-sm text-neutral-dark">
          Related documents:
        </div>
        ${T}
        <div slot="after-children" class="text-sm text-neutral-dark mt-2">
          End of related documents
        </div>
      </atomic-insight-result-children>
    </atomic-result-section-children>
  `},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  name: 'With before-children slot',
  render: args => html\`
    \${styleTemplate(args)}
    <atomic-result-section-title>
      <atomic-result-link></atomic-result-link>
    </atomic-result-section-title>
    <atomic-result-section-children id="code-root">
      <atomic-insight-result-children
        image-size=\${args['image-size'] || 'icon'}
        inherit-templates=\${args['inherit-templates'] || false}
      >
        <div slot="before-children" class="text-sm text-neutral-dark">
          Related documents:
        </div>
        \${childrenTemplate}
      </atomic-insight-result-children>
    </atomic-result-section-children>
  \`
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  name: 'With after-children slot',
  render: args => html\`
    \${styleTemplate(args)}
    <atomic-result-section-title>
      <atomic-result-link></atomic-result-link>
    </atomic-result-section-title>
    <atomic-result-section-children id="code-root">
      <atomic-insight-result-children
        image-size=\${args['image-size'] || 'icon'}
        inherit-templates=\${args['inherit-templates'] || false}
      >
        \${childrenTemplate}
        <div slot="after-children" class="text-sm text-neutral-dark mt-2">
          End of related documents
        </div>
      </atomic-insight-result-children>
    </atomic-result-section-children>
  \`
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  name: 'With both slots',
  render: args => html\`
    \${styleTemplate(args)}
    <atomic-result-section-title>
      <atomic-result-link></atomic-result-link>
    </atomic-result-section-title>
    <atomic-result-section-children id="code-root">
      <atomic-insight-result-children
        image-size=\${args['image-size'] || 'icon'}
        inherit-templates=\${args['inherit-templates'] || false}
      >
        <div slot="before-children" class="text-sm text-neutral-dark">
          Related documents:
        </div>
        \${childrenTemplate}
        <div slot="after-children" class="text-sm text-neutral-dark mt-2">
          End of related documents
        </div>
      </atomic-insight-result-children>
    </atomic-result-section-children>
  \`
}`,...A.parameters?.docs?.source}}},j=[`Default`,`WithBeforeChildrenSlot`,`WithAfterChildrenSlot`,`WithBothSlots`]}));M();export{D as Default,k as WithAfterChildrenSlot,O as WithBeforeChildrenSlot,A as WithBothSlots,j as __namedExportsOrder,E as default,M as t};