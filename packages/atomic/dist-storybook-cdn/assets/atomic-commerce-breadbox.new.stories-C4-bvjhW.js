import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,St as r,Tt as i}from"./iframe-cSkD6HDI.js";import{i as a,r as o}from"./commerce-interface-wrapper-BFOjNQs_.js";import{n as s,t as c}from"./common-meta-parameters-BmIbTEf7.js";import{getSampleCommerceEngineConfiguration as l}from"/headless/v3.50.1/commerce/headless.esm.js";var u,d,f,p,m,h,g,_,v,y,b,x=e((()=>{t(),r(),o(),c(),{context:u,...d}=l(),{decorator:f,play:p}=a({engineConfig:{context:{...u,country:`US`,currency:`USD`,language:`en`,view:{url:`${u.view.url}/browse/promotions/ui-kit-testing`}},...d},type:`product-listing`,includeCodeRoot:!1}),{events:m,args:h,argTypes:g,template:_}=n(`atomic-commerce-breadbox`,{excludeCategories:[`methods`]}),v={component:`atomic-commerce-breadbox`,title:`Commerce/Breadbox`,id:`atomic-commerce-breadbox`,render:e=>_(e),decorators:[f],parameters:{...s,chromatic:{disableSnapshot:!0},layout:`fullscreen`,actions:{handles:m}},args:h,argTypes:g,play:p},y={decorators:[e=>i`
      <div id="code-root">${e()}</div>
      <div style="margin:20px 0">
        Select facet value(s) to see the Breadbox component.
      </div>
      <div style="display: flex; justify-content: flex-start;">
        <atomic-commerce-facets> </atomic-commerce-facets>
      </div>
    `]},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  decorators: [story => html\`
      <div id="code-root">\${story()}</div>
      <div style="margin:20px 0">
        Select facet value(s) to see the Breadbox component.
      </div>
      <div style="display: flex; justify-content: flex-start;">
        <atomic-commerce-facets> </atomic-commerce-facets>
      </div>
    \`]
}`,...y.parameters?.docs?.source}}},b=[`Default`]}));x();export{y as Default,b as __namedExportsOrder,v as default,x as t};