import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,St as r,Tt as i}from"./iframe-cSkD6HDI.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{n as s,t as c}from"./mock-C5ckzz_b.js";import{n as l,t as u}from"./mock-CijMLWxR.js";import{n as d,t as f}from"./insight-interface-wrapper-BwybnAhf.js";import{n as p,t as m}from"./insight-layout-wrapper-ByxKkP0j.js";import{a as h,n as g,r as _,t as v}from"./insight-result-template-wrapper-vZ5uGLfk.js";var y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P=e((()=>{t(),r(),l(),s(),o(),f(),m(),_(),v(),y=new u,b=new c,y.searchEndpoint.mock(e=>({...e,results:e.results.slice(0,3).map(e=>({...e,flags:`HasHtmlVersion;HasThumbnail`,hasHtmlVersion:!0})),totalCount:3})),{decorator:x,play:S}=d({},!1,!1),{decorator:C}=p(!1),{decorator:w}=h(`list`,!1),{decorator:T}=g(!1),{events:E,args:D,argTypes:O,template:k}=n(`atomic-insight-result-quickview-action`,{excludeCategories:[`methods`]}),A={component:`atomic-insight-result-quickview-action`,title:`Insight/Result Quickview Action`,id:`atomic-insight-result-quickview-action`,render:e=>i`
    <atomic-result-section-actions id="code-root">
      ${k(e)}
    </atomic-result-section-actions>
  `,decorators:[e=>i`
      <atomic-result-section-visual>
        <atomic-result-image
          field="ytthumbnailurl"
          fallback="https://picsum.photos/seed/picsum/350"
        ></atomic-result-image>
      </atomic-result-section-visual>
      <atomic-result-section-title>
        <atomic-result-link></atomic-result-link>
      </atomic-result-section-title>
      <atomic-result-section-excerpt>
        <atomic-result-text field="excerpt"></atomic-result-text>
      </atomic-result-section-excerpt>
      ${e()}
    `,T,w,C,x],parameters:{...a,actions:{handles:E},msw:{handlers:[...y.handlers,b.htmlEndpoint.generateHandler()]}},args:D,argTypes:O,play:S},j={},M={name:`With custom sandbox attributes`,args:{sandbox:`allow-scripts allow-popups allow-top-navigation allow-same-origin`}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  name: 'With custom sandbox attributes',
  args: {
    sandbox: 'allow-scripts allow-popups allow-top-navigation allow-same-origin'
  }
}`,...M.parameters?.docs?.source}}},N=[`Default`,`CustomSandbox`]}));P();export{M as CustomSandbox,j as Default,N as __namedExportsOrder,A as default,P as t};