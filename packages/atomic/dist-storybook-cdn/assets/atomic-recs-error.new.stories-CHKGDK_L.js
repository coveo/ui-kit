import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n}from"./iframe-cSkD6HDI.js";import{n as r,t as i}from"./common-meta-parameters-BmIbTEf7.js";import{n as a,t as o}from"./mock-C5ckzz_b.js";import{n as s,t as c}from"./recs-interface-wrapper-BzT2wBsL.js";var l,u,d,f,p,m,h,g,_,v,y,b,x=e((()=>{t(),a(),i(),c(),l=new o,{decorator:u,play:d}=s({config:{accessToken:`invalidtoken`,organizationId:`default-org`}}),{events:f,args:p,argTypes:m,template:h}=n(`atomic-recs-error`,{excludeCategories:[`methods`]}),g={component:`atomic-recs-error`,title:`Recommendations/Recs Error`,id:`atomic-recs-error`,render:e=>h(e),decorators:[u],parameters:{...r,actions:{handles:f},msw:{handlers:[...l.handlers]}},args:p,argTypes:m,beforeEach:async()=>{l.searchEndpoint.clear()},play:d},_={beforeEach:async()=>{l.searchEndpoint.mockOnce(()=>({ok:!1,status:401,message:`Token is invalid or expired`,statusCode:401,type:`InvalidTokenException`}),{status:401})}},v={name:`With Disconnected Error`,beforeEach:async()=>{l.searchEndpoint.mockOnce(()=>({ok:!1,status:0,message:`Network connection failed`,statusCode:0,type:`Disconnected`}),{status:500})}},y={name:`With Organization Paused Error`,beforeEach:async()=>{l.searchEndpoint.mockOnce(()=>({ok:!1,status:503,message:`Organization is paused due to inactivity`,statusCode:503,type:`OrganizationIsPausedException`}),{status:503})}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b=[`Default`,`WithDisconnected`,`WithOrganizationPaused`]}));x();export{_ as Default,v as WithDisconnected,y as WithOrganizationPaused,b as __namedExportsOrder,g as default,x as t};