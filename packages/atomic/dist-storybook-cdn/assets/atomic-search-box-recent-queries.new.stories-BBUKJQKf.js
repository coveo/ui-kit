import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,St as r,Tt as i}from"./iframe-cSkD6HDI.js";import{n as a,t as o}from"./lit-helpers-d8c58N_k.js";import{n as s,t as c}from"./search-box-suggestions-parameters-Cvhsyu4s.js";import{r as l,t as u}from"./search-interface-wrapper-DyJSRxFL.js";var d,f=e((()=>{o(),r(),d=(e,t=!0)=>({decorator:n=>i`
    <div>
      <div style="min-width: 600px;">
        <atomic-search-box suggestion-timeout="5000">
          ${e}
          <div ${a(t?{id:`code-root`}:{})}>
            ${n()}
          </div>
        </atomic-search-box>
      </div>
    </div>
  `})})),p,m,h,g,_,v,y,b,x,S,C,w=e((()=>{t(),c(),f(),u(),{userEvent:p}=__STORYBOOK_MODULE_TEST__,{decorator:m,play:h}=l({},!1,!1),{decorator:g}=d(),{events:_,args:v,argTypes:y,template:b}=n(`atomic-search-box-recent-queries`,{excludeCategories:[`methods`]}),x={component:`atomic-search-box-recent-queries`,title:`Search/Search Box Recent Queries`,id:`atomic-search-box-recent-queries`,render:e=>b(e),decorators:[g,m],parameters:{...s,chromatic:{disableSnapshot:!0},actions:{handles:_}},args:v,argTypes:y,play:async e=>{await h(e);let t=await e.canvas.findAllByShadowPlaceholderText(`Search`);await p.click(t[0])}},S={},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{}`,...S.parameters?.docs?.source}}},C=[`Default`]}));w();export{S as Default,C as __namedExportsOrder,x as default,w as t};