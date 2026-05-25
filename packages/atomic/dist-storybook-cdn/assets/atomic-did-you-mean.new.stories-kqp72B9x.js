import{n as e}from"./chunk-jRWAZmH_.js";import{A as t,D as n,E as r,M as i}from"./iframe-cSkD6HDI.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{r as s,t as c}from"./search-interface-wrapper-DyJSRxFL.js";import{n as l,t as u}from"./mock-C5ckzz_b.js";var d,f,p,m,h,g,_,v,y,b,x,S=e((()=>{n(),t(),l(),o(),c(),d=new u,{decorator:f,play:p}=s(),{events:m,args:h,argTypes:g,template:_}=r(`atomic-did-you-mean`,{excludeCategories:[`methods`]}),v={title:`Search/Did You Mean`,id:`atomic-did-you-mean`,component:`atomic-did-you-mean`,render:e=>i` <div
    style="display: flex; justify-content: flex-start;"
  >
    ${_(e)}
  </div>`,decorators:[f],parameters:{...a,actions:{handles:m},msw:{handlers:[...d.handlers]}},args:h,argTypes:g,beforeEach:async()=>{d.searchEndpoint.clear()},play:p},y={name:`With automatic query correction`,beforeEach:async()=>{d.searchEndpoint.mockOnce(e=>({...e,queryCorrection:{correctedQuery:`coveo`,originalQuery:`coveoo`,corrections:[]}}))}},b={name:`Without automatic query correction`,beforeEach:async()=>{d.searchEndpoint.mockOnce(e=>({...e,queryCorrection:{corrections:[{correctedQuery:`coveo`,wordCorrections:[{offset:0,length:5,originalWord:`ceveo`,correctedWord:`coveo`}]}]}}))}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'With automatic query correction',
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mockOnce(response => ({
      ...response,
      queryCorrection: {
        correctedQuery: 'coveo',
        originalQuery: 'coveoo',
        corrections: []
      }
    }));
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'Without automatic query correction',
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mockOnce(response => ({
      ...response,
      queryCorrection: {
        corrections: [{
          correctedQuery: 'coveo',
          wordCorrections: [{
            offset: 0,
            length: 5,
            originalWord: 'ceveo',
            correctedWord: 'coveo'
          }]
        }]
      }
    }));
  }
}`,...b.parameters?.docs?.source}}},x=[`WithAutomaticQueryCorrection`,`WithoutAutomaticQueryCorrection`]}));S();export{y as WithAutomaticQueryCorrection,b as WithoutAutomaticQueryCorrection,x as __namedExportsOrder,v as default,S as t};