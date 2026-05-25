import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,St as r,Tt as i}from"./iframe-cSkD6HDI.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{r as s,t as c}from"./search-interface-wrapper-DyJSRxFL.js";import{n as l,t as u}from"./mock-C5ckzz_b.js";import{n as d,t as f}from"./result-template-wrapper-BY8u_Pg8.js";var p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O=e((()=>{t(),r(),l(),o(),f(),c(),p=new u,p.searchEndpoint.mock(e=>({...e,results:e.results.slice(0,1),totalCount:1,totalCountFiltered:1})),{decorator:m,play:h}=s({skipFirstSearch:!1,includeCodeRoot:!1}),g=e=>i`
  <atomic-result-list
    display="list"
    number-of-placeholders="1"
    density="compact"
    image-size="small"
  >
    ${e()}
  </atomic-result-list>
`,{decorator:_}=d(!1),{events:v,args:y,argTypes:b,template:x}=n(`atomic-result-link`,{excludeCategories:[`methods`]}),S={component:`atomic-result-link`,title:`Search/Result Link`,id:`atomic-result-link`,render:e=>x(e),decorators:[_,g,m],parameters:{...a,actions:{handles:v},msw:{handlers:[...p.handlers]}},args:y,argTypes:b,play:h},C={},w={name:`With a slot for attributes`,decorators:[()=>i`
        <atomic-result-link>
          <a slot="attributes" target="_blank"></a>
        </atomic-result-link>
      `]},T={name:`With alternative content`,decorators:[()=>i`
        <atomic-result-link>
          <div style="display: flex; align-items: center; gap: 8px;">
            <img
              src="https://picsum.photos/seed/atomic-result-link/100/100"
              alt="Thumbnail"
              style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;"
            />
          </div>
        </atomic-result-link>
      `]},E={name:`With an href template`,decorators:[()=>i`
        <atomic-result-link
          href-template="\${clickUri}?source=\${raw.source}"
        ></atomic-result-link>
      `]},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'With a slot for attributes',
  decorators: [() => {
    return html\`
        <atomic-result-link>
          <a slot="attributes" target="_blank"></a>
        </atomic-result-link>
      \`;
  }]
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: 'With alternative content',
  decorators: [() => {
    return html\`
        <atomic-result-link>
          <div style="display: flex; align-items: center; gap: 8px;">
            <img
              src="https://picsum.photos/seed/atomic-result-link/100/100"
              alt="Thumbnail"
              style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;"
            />
          </div>
        </atomic-result-link>
      \`;
  }]
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  name: 'With an href template',
  decorators: [() => {
    return html\`
        <atomic-result-link
          href-template="\\\${clickUri}?source=\\\${raw.source}"
        ></atomic-result-link>
      \`;
  }]
}`,...E.parameters?.docs?.source}}},D=[`Default`,`WithSlotsAttributes`,`WithAlternativeContent`,`WithHrefTemplate`]}));O();export{C as Default,T as WithAlternativeContent,E as WithHrefTemplate,w as WithSlotsAttributes,D as __namedExportsOrder,S as default,O as t};