import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n}from"./iframe-cSkD6HDI.js";import{n as r,t as i}from"./common-meta-parameters-BmIbTEf7.js";import{r as a,t as o}from"./search-interface-wrapper-DyJSRxFL.js";import{n as s,t as c}from"./mock-C5ckzz_b.js";var l,u,d,f,p,m,h,g,_,v,y,b,x,S,C=e((()=>{t(),s(),i(),o(),l=new c,{decorator:u,play:d}=a({config:{accessToken:`invalidtoken`,organizationId:`default-org`}}),{events:f,args:p,argTypes:m,template:h}=n(`atomic-query-error`,{excludeCategories:[`methods`]}),g={component:`atomic-query-error`,title:`Search/Query Error`,id:`atomic-query-error`,render:e=>h(e),decorators:[u],parameters:{...r,actions:{handles:f},msw:{handlers:[...l.handlers]}},args:p,argTypes:m,beforeEach:async()=>{l.searchEndpoint.clear()},play:d},_={beforeEach:async()=>{l.searchEndpoint.mockErrorOnce()}},v={name:`With Invalid Token Error`,beforeEach:async()=>{l.searchEndpoint.mockOnce(()=>({ok:!1,status:401,message:`Token is invalid or expired`,statusCode:401,type:`InvalidTokenException`}),{status:401})}},y={name:`With Disconnected Error`,beforeEach:async()=>{l.searchEndpoint.mockOnce(()=>({ok:!1,status:0,message:`Network connection failed`,statusCode:0,type:`Disconnected`}),{status:500})}},b={name:`With No Endpoints Error`,beforeEach:async()=>{l.searchEndpoint.mockOnce(()=>({ok:!1,status:404,message:`No content sources available`,statusCode:404,type:`NoEndpointsException`}),{status:404})}},x={name:`With Organization Paused Error`,beforeEach:async()=>{l.searchEndpoint.mockOnce(()=>({ok:!1,status:503,message:`Organization is paused due to inactivity`,statusCode:503,type:`OrganizationIsPausedException`}),{status:503})}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mockErrorOnce();
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'With Invalid Token Error',
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mockOnce(() => ({
      ok: false,
      status: 401,
      message: 'Token is invalid or expired',
      statusCode: 401,
      type: 'InvalidTokenException'
    }), {
      status: 401
    });
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'With Disconnected Error',
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mockOnce(() => ({
      ok: false,
      status: 0,
      message: 'Network connection failed',
      statusCode: 0,
      type: 'Disconnected'
    }), {
      status: 500
    });
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'With No Endpoints Error',
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mockOnce(() => ({
      ok: false,
      status: 404,
      message: 'No content sources available',
      statusCode: 404,
      type: 'NoEndpointsException'
    }), {
      status: 404
    });
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'With Organization Paused Error',
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mockOnce(() => ({
      ok: false,
      status: 503,
      message: 'Organization is paused due to inactivity',
      statusCode: 503,
      type: 'OrganizationIsPausedException'
    }), {
      status: 503
    });
  }
}`,...x.parameters?.docs?.source}}},S=[`Default`,`WithInvalidToken`,`WithDisconnected`,`WithNoEndpoints`,`WithOrganizationPaused`]}));C();export{_ as Default,y as WithDisconnected,v as WithInvalidToken,b as WithNoEndpoints,x as WithOrganizationPaused,S as __namedExportsOrder,g as default,C as t};