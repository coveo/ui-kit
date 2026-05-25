import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,St as r,Tt as i}from"./iframe-cSkD6HDI.js";import{i as a,r as o,t as s}from"./commerce-interface-wrapper-BFOjNQs_.js";import{n as c,t as l}from"./common-meta-parameters-BmIbTEf7.js";var u,d,f,p,m,h,g,_,v,y=e((()=>{t(),r(),o(),l(),{events:u,args:d,argTypes:f,template:p}=n(`atomic-commerce-no-products`,{excludeCategories:[`methods`]}),{decorator:m,play:h}=a({skipFirstRequest:!0,engineConfig:{preprocessRequest:e=>{let t=JSON.parse(e.body);return t.query=`NOT @URI`,e.body=JSON.stringify(t),e}}}),g={component:`atomic-commerce-no-products`,title:`Commerce/No Products`,id:`atomic-commerce-no-products`,render:e=>p(e),decorators:[m],parameters:{...c,chromatic:{disableSnapshot:!0},actions:{handles:u}},args:d,argTypes:f,play:h},_={decorators:[e=>i` <atomic-commerce-layout>
        <atomic-layout-section section="search">
          <atomic-commerce-search-box></atomic-commerce-search-box>
        </atomic-layout-section>

        <atomic-layout-section section="main">
          <atomic-layout-section section="products" id="code-root">
            ${e()}
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-commerce-layout>`],play:async e=>{await h(e),await s(e)}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  decorators: [story => html\` <atomic-commerce-layout>
        <atomic-layout-section section="search">
          <atomic-commerce-search-box></atomic-commerce-search-box>
        </atomic-layout-section>

        <atomic-layout-section section="main">
          <atomic-layout-section section="products" id="code-root">
            \${story()}
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-commerce-layout>\`],
  play: async context => {
    await preprocessedPlayed(context);
    await executeFirstRequestHook(context);
  }
}`,..._.parameters?.docs?.source}}},v=[`Default`]}));y();export{_ as Default,v as __namedExportsOrder,g as default,y as t};