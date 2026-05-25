import{n as e}from"./chunk-jRWAZmH_.js";import{St as t,Tt as n,wt as r}from"./iframe-cSkD6HDI.js";import{n as i,t as a}from"./common-meta-parameters-BmIbTEf7.js";import{n as o,t as s}from"./mock-C5ckzz_b.js";import{n as c,t as l}from"./recs-interface-wrapper-BzT2wBsL.js";var u,d=e((()=>{t(),u=()=>({decorator:e=>{let t=document.createElement(`template`),i=document.createElement(`div`),a=e();return a&&typeof a==`object`&&`_$litType$`in a?(r(a,i),t.innerHTML=i.innerHTML):t.innerHTML=String(a),n`
      <atomic-recs-list display="list" density="normal" image-size="none">
        <atomic-recs-result-template
          >${t}</atomic-recs-result-template
        >
      </atomic-recs-list>
    `}})})),f,p,m,h,g,_,v,y,b,x,S,C=e((()=>{t(),o(),a(),l(),d(),f=new s,f.searchEndpoint.mock(e=>({...e,results:e.results.slice(0,1),totalCount:1,totalCountFiltered:1})),{decorator:p,play:m}=c(),{decorator:h}=u(),g=e=>n`
  <atomic-result-section-title> ${e()} </atomic-result-section-title>
  <atomic-result-section-excerpt>
    <atomic-result-text field="excerpt"></atomic-result-text>
  </atomic-result-section-excerpt>
`,_={component:`atomic-ipx-result-link`,title:`IPX/Ipx Result Link`,id:`atomic-ipx-result-link`,render:()=>n`<atomic-ipx-result-link></atomic-ipx-result-link>`,decorators:[g,h,p],parameters:{...i,msw:{handlers:[...f.handlers]}},beforeEach:()=>{f.searchEndpoint.clear()},play:m},v={},y={name:`With custom link text`,decorators:[()=>n`
      <atomic-ipx-result-link>
        <atomic-result-text field="title"></atomic-result-text>
        - With Custom Link Text
      </atomic-ipx-result-link>
    `]},b={name:`With href template`,decorators:[()=>n`
      <atomic-ipx-result-link
        href-template="\${clickUri}?source=ipx"
      ></atomic-ipx-result-link>
    `]},x={name:`With target="_blank"`,decorators:[()=>n`
      <atomic-ipx-result-link>
        <a slot="attributes" target="_blank" rel="noopener"></a>
      </atomic-ipx-result-link>
    `]},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'With custom link text',
  decorators: [() => html\`
      <atomic-ipx-result-link>
        <atomic-result-text field="title"></atomic-result-text>
        - With Custom Link Text
      </atomic-ipx-result-link>
    \`]
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'With href template',
  decorators: [() => html\`
      <atomic-ipx-result-link
        href-template="\\\${clickUri}?source=ipx"
      ></atomic-ipx-result-link>
    \`]
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'With target="_blank"',
  decorators: [() => html\`
      <atomic-ipx-result-link>
        <a slot="attributes" target="_blank" rel="noopener"></a>
      </atomic-ipx-result-link>
    \`]
}`,...x.parameters?.docs?.source}}},S=[`Default`,`WithCustomText`,`WithHrefTemplate`,`WithTargetBlank`]}));C();export{v as Default,y as WithCustomText,b as WithHrefTemplate,x as WithTargetBlank,S as __namedExportsOrder,_ as default,C as t};