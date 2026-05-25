import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,St as r,Tt as i}from"./iframe-cSkD6HDI.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{r as s,t as c}from"./search-interface-wrapper-DyJSRxFL.js";import{n as l,t as u}from"./mock-C5ckzz_b.js";var d,f,p,m,h,g,_,v,y,b,x,S=e((()=>{t(),r(),l(),o(),c(),d=new u,{decorator:f,play:p}=s(),{events:m,args:h,argTypes:g,template:_}=n(`atomic-ipx-refine-toggle`,{excludeCategories:[`methods`]}),v={component:`atomic-ipx-refine-toggle`,title:`IPX/Refine Toggle`,id:`atomic-ipx-refine-toggle`,render:e=>i`
    <style>
      atomic-ipx-modal {
        position: relative;
        inset: auto;
      }
    </style>
    <atomic-ipx-modal is-open>
      <div slot="header" style="padding-bottom: 0.875rem;">
        <atomic-layout-section section="search">
          ${_(e)}
        </atomic-layout-section>
      </div>
      <atomic-layout-section section="facets">
        <atomic-facet field="author" label="Author"></atomic-facet>
        <atomic-facet field="source" label="Source"></atomic-facet>
        <atomic-facet field="filetype" label="File Type"></atomic-facet>
      </atomic-layout-section>
      <div slot="body"></div>
      <div slot="footer"></div>
    </atomic-ipx-modal>
  `,decorators:[f],parameters:{...a,layout:`centered`,actions:{handles:m},docs:{...a.docs,story:{...a.docs?.story}},msw:{handlers:[...d.handlers]}},args:h,argTypes:g,beforeEach:()=>{d.searchEndpoint.clear()},play:p},y={name:`Default`},b={name:`With collapsed facets after 1`,args:{"collapse-facets-after":1}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'Default'
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'With collapsed facets after 1',
  args: {
    'collapse-facets-after': 1
  }
}`,...b.parameters?.docs?.source}}},x=[`Default`,`WithCollapsedFacets`]}));S();export{y as Default,b as WithCollapsedFacets,x as __namedExportsOrder,v as default,S as t};