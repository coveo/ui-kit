import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n}from"./iframe-cSkD6HDI.js";import{n as r,t as i}from"./common-meta-parameters-BmIbTEf7.js";import{r as a,t as o}from"./search-interface-wrapper-DyJSRxFL.js";import{n as s,t as c}from"./mock-C5ckzz_b.js";var l,u,d,f,p,m,h,g,_,v,y=e((()=>{t(),s(),i(),o(),l=new c,l.searchEndpoint.mock(e=>({...e,facets:[{facetId:`objecttype`,field:`objecttype`,values:[{value:`Article`,numberOfResults:45,state:`idle`},{value:`Documentation`,numberOfResults:32,state:`idle`},{value:`Video`,numberOfResults:28,state:`idle`},{value:`Tutorial`,numberOfResults:15,state:`idle`}]}],categoryFacets:[{facetId:`geographicalhierarchy`,field:`geographicalhierarchy`,values:[{value:`North America`,path:[`North America`],numberOfResults:55,state:`idle`,children:[{value:`United States`,path:[`North America`,`United States`],numberOfResults:40,state:`idle`},{value:`Canada`,path:[`North America`,`Canada`],numberOfResults:15,state:`idle`}]},{value:`Europe`,path:[`Europe`],numberOfResults:45,state:`idle`}]}]})),{decorator:u,play:d}=a(),{events:f,args:p,argTypes:m,template:h}=n(`atomic-popover`,{excludeCategories:[`methods`]}),g={component:`atomic-popover`,title:`Search/Popover`,id:`atomic-popover`,render:e=>h(e),decorators:[u],parameters:{...r,actions:{handles:f},msw:{handlers:[...l.handlers]},layout:`centered`},args:p,argTypes:m,play:d},_={name:`Default`,args:{"default-slot":`
      <atomic-facet
        field="objecttype"
        label="Object type"
      ></atomic-facet>`}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  name: 'Default',
  args: {
    'default-slot': \`
      <atomic-facet
        field="objecttype"
        label="Object type"
      ></atomic-facet>\`
  }
}`,..._.parameters?.docs?.source}}},v=[`Default`]}));y();export{_ as Default,v as __namedExportsOrder,g as default,y as t};