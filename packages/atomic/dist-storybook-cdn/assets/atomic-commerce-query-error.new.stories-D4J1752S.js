import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n}from"./iframe-cSkD6HDI.js";import{i as r,r as i}from"./commerce-interface-wrapper-BFOjNQs_.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{n as s,t as c}from"./mock-eNEo2dE0.js";var l,u,d,f,p,m,h,g,_,v,y,b=e((()=>{t(),s(),i(),o(),l=new c,{decorator:u,play:d}=r(),{events:f,args:p,argTypes:m,template:h}=n(`atomic-commerce-query-error`,{excludeCategories:[`methods`]}),g={component:`atomic-commerce-query-error`,title:`Commerce/Query Error`,id:`atomic-commerce-query-error`,render:e=>h(e),decorators:[u],parameters:{...a,actions:{handles:f},msw:{handlers:[...l.handlers]}},args:p,argTypes:m,beforeEach:async()=>{l.searchEndpoint.clear()},play:d},_={beforeEach:async()=>{l.searchEndpoint.mockErrorOnce()}},v={name:`With 418 error`,beforeEach:async()=>{l.searchEndpoint.mockOnce(()=>({ok:!1,status:418,statusCode:418,message:`Something very weird just happened`,type:`ClientError`}),{status:418})}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  beforeEach: async () => {
    mockCommerceApi.searchEndpoint.mockErrorOnce();
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'With 418 error',
  beforeEach: async () => {
    mockCommerceApi.searchEndpoint.mockOnce(() => ({
      ok: false,
      status: 418,
      statusCode: 418,
      message: 'Something very weird just happened',
      type: 'ClientError'
    }), {
      status: 418
    });
  }
}`,...v.parameters?.docs?.source}}},y=[`Default`,`With418Error`]}));b();export{_ as Default,v as With418Error,y as __namedExportsOrder,g as default,b as t};