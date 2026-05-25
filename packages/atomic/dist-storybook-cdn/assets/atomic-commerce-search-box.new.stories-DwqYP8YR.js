import{n as e}from"./chunk-jRWAZmH_.js";import{a as t,r as n}from"./_base-PxGi1l6K.js";import{D as r,E as i,St as a,Tt as o,m as s}from"./iframe-cSkD6HDI.js";import{i as c,r as l}from"./commerce-interface-wrapper-BFOjNQs_.js";import{n as u,t as d}from"./common-meta-parameters-BmIbTEf7.js";import{n as f,t as p}from"./mock-eNEo2dE0.js";var m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A=e((()=>{r(),a(),n(),f(),l(),d(),m=new p,{events:h,args:g,argTypes:_,template:v}=i(`atomic-commerce-search-box`,{excludeCategories:[`methods`]}),{decorator:y,play:b}=c({skipFirstRequest:!0,includeCodeRoot:!1}),x=e=>o`
  <div style="min-width: 600px;" id="code-root">${e()}</div>
`,S={component:`atomic-commerce-search-box`,title:`Commerce/Search Box`,id:`atomic-commerce-search-box`,render:e=>v(e),decorators:[x,y],parameters:{...u,msw:{handlers:[...m.handlers]},actions:{handles:h}},beforeEach:()=>{m.clearAll()},args:{...g,"minimum-query-length":`0`},argTypes:_,play:b},C={},w={name:`With suggestions, recent queries and instant products`,args:{"default-slot":` <atomic-commerce-search-box-recent-queries></atomic-commerce-search-box-recent-queries>
      <atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>
      <atomic-commerce-search-box-instant-products
        image-size="small"
      ></atomic-commerce-search-box-instant-products>`}},T={name:`As a standalone search box`,args:{"redirection-url":`./iframe.html?id=atomic-commerce-interface--with-product-list`}},E={name:`With custom suggestions`,args:{"default-slot":`<atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>`,"minimum-query-length":`0`},parameters:{msw:{handlers:[t.post(`**/v2/search/querySuggest`,()=>{let e=Array.from({length:5},(e,t)=>({expression:`query-suggestion-${t}`,highlighted:`query-suggestion-${t}`}));return s.json({completions:e})})]}}},D={name:`With suggestions and recent queries`,args:{"default-slot":`
      <atomic-commerce-search-box-recent-queries></atomic-commerce-search-box-recent-queries>
      <atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>
    `,"minimum-query-length":`0`},parameters:{msw:{handlers:[t.post(`**/v2/search/querySuggest`,()=>{let e=Array.from({length:10},(e,t)=>({expression:`query-suggestion-${t}`,highlighted:`query-suggestion-${t}`}));return s.json({completions:e})})]}},beforeEach:()=>{let e=`coveo-recent-queries`,t=Array.from({length:4},(e,t)=>`recent query ${t}`),n=JSON.stringify(t);return localStorage.setItem(e,n),()=>{localStorage.removeItem(e)}}},O={name:`With no suggestions`,args:{"default-slot":`<atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>`,"minimum-query-length":`0`},parameters:{msw:{handlers:[t.post(`**/v2/search/querySuggest`,()=>s.json({completions:[]}))]}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'With suggestions, recent queries and instant products',
  args: {
    'default-slot': \` <atomic-commerce-search-box-recent-queries></atomic-commerce-search-box-recent-queries>
      <atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>
      <atomic-commerce-search-box-instant-products
        image-size="small"
      ></atomic-commerce-search-box-instant-products>\`
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: 'As a standalone search box',
  args: {
    'redirection-url': './iframe.html?id=atomic-commerce-interface--with-product-list'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  name: 'With custom suggestions',
  args: {
    'default-slot': \`<atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>\`,
    'minimum-query-length': '0'
  },
  parameters: {
    msw: {
      handlers: [http.post('**/v2/search/querySuggest', () => {
        const completions = Array.from({
          length: 5
        }, (_, i) => ({
          expression: \`query-suggestion-\${i}\`,
          highlighted: \`query-suggestion-\${i}\`
        }));
        return HttpResponse.json({
          completions
        });
      })]
    }
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  name: 'With suggestions and recent queries',
  args: {
    'default-slot': \`
      <atomic-commerce-search-box-recent-queries></atomic-commerce-search-box-recent-queries>
      <atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>
    \`,
    'minimum-query-length': '0'
  },
  parameters: {
    msw: {
      handlers: [http.post('**/v2/search/querySuggest', () => {
        const completions = Array.from({
          length: 10
        }, (_, i) => ({
          expression: \`query-suggestion-\${i}\`,
          highlighted: \`query-suggestion-\${i}\`
        }));
        return HttpResponse.json({
          completions
        });
      })]
    }
  },
  beforeEach: () => {
    const count = 4;
    const localStorageKey = 'coveo-recent-queries';
    const recentQueries = Array.from({
      length: count
    }, (_, i) => \`recent query \${i}\`);
    const stringified = JSON.stringify(recentQueries);
    localStorage.setItem(localStorageKey, stringified);
    return () => {
      localStorage.removeItem(localStorageKey);
    };
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  name: 'With no suggestions',
  args: {
    'default-slot': \`<atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>\`,
    'minimum-query-length': '0'
  },
  parameters: {
    msw: {
      handlers: [http.post('**/v2/search/querySuggest', () => {
        return HttpResponse.json({
          completions: []
        });
      })]
    }
  }
}`,...O.parameters?.docs?.source}}},k=[`Default`,`RichSearchBox`,`StandaloneSearchBox`,`WithSuggestions`,`WithSuggestionsAndRecentQueries`,`WithNoSuggestions`]}));A();export{C as Default,w as RichSearchBox,T as StandaloneSearchBox,O as WithNoSuggestions,E as WithSuggestions,D as WithSuggestionsAndRecentQueries,k as __namedExportsOrder,S as default,A as t};