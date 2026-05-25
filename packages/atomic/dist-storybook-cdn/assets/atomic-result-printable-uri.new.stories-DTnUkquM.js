import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n}from"./iframe-cSkD6HDI.js";import{n as r,t as i}from"./common-meta-parameters-BmIbTEf7.js";import{r as a,t as o}from"./search-interface-wrapper-DyJSRxFL.js";import{n as s,t as c}from"./mock-C5ckzz_b.js";import{n as l,t as u}from"./result-list-wrapper-DszKxGnf.js";import{n as d,t as f}from"./result-template-wrapper-BY8u_Pg8.js";var p,m,h,g,_,v,y,b,x,S,C,w,T,E=e((()=>{t(),s(),i(),u(),f(),o(),p=new c,p.searchEndpoint.mock(e=>`results`in e?{...e,results:[{...e.results[0],printableUri:`https://www.example.com/path/to/document.html`}],totalCount:1,totalCountFiltered:1}:e),{decorator:m,play:h}=a({includeCodeRoot:!1}),{decorator:g}=l(`list`,!1),{decorator:_}=d(),{events:v,args:y,argTypes:b,template:x}=n(`atomic-result-printable-uri`,{excludeCategories:[`methods`]}),S={component:`atomic-result-printable-uri`,title:`Search/Result Printable URI`,id:`atomic-result-printable-uri`,render:e=>x(e),decorators:[_,g,m],parameters:{...r,msw:{handlers:[...p.handlers]},actions:{handles:v}},args:{...y,"max-number-of-parts":5},argTypes:b,play:h},C={},w={name:`With Ellipsis Button`,parameters:{msw:{handlers:[...(()=>{let e=new c;return e.searchEndpoint.mock(e=>`results`in e?{...e,results:e.results.slice(0,1).map(e=>({...e,printableUri:`https://www.example.com/level1/level2/level3/level4/level5/level6/document.html`,raw:{...e.raw,parents:`<parents>
                  <parent name="Home" uri="https://www.example.com/" />
                  <parent name="Products" uri="https://www.example.com/products/" />
                  <parent name="Electronics" uri="https://www.example.com/products/electronics/" />
                  <parent name="Computers" uri="https://www.example.com/products/electronics/computers/" />
                  <parent name="Laptops" uri="https://www.example.com/products/electronics/computers/laptops/" />
                  <parent name="Gaming" uri="https://www.example.com/products/electronics/computers/laptops/gaming/" />
                  <parent name="High-End" uri="https://www.example.com/products/electronics/computers/laptops/gaming/high-end/" />
                </parents>`}})),totalCount:1,totalCountFiltered:1}:e),e.handlers})()]}},args:{"max-number-of-parts":5}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'With Ellipsis Button',
  parameters: {
    msw: {
      handlers: [...(() => {
        const ellipsisSearchApi = new MockSearchApi();
        ellipsisSearchApi.searchEndpoint.mock(response => {
          if ('results' in response) {
            return {
              ...response,
              // oxlint-disable-next-line @typescript-eslint/no-explicit-any -- Mock response type needs flexibility
              results: response.results.slice(0, 1).map((r: any) => ({
                ...r,
                printableUri: 'https://www.example.com/level1/level2/level3/level4/level5/level6/document.html',
                raw: {
                  ...r.raw,
                  parents: \`<parents>
                  <parent name="Home" uri="https://www.example.com/" />
                  <parent name="Products" uri="https://www.example.com/products/" />
                  <parent name="Electronics" uri="https://www.example.com/products/electronics/" />
                  <parent name="Computers" uri="https://www.example.com/products/electronics/computers/" />
                  <parent name="Laptops" uri="https://www.example.com/products/electronics/computers/laptops/" />
                  <parent name="Gaming" uri="https://www.example.com/products/electronics/computers/laptops/gaming/" />
                  <parent name="High-End" uri="https://www.example.com/products/electronics/computers/laptops/gaming/high-end/" />
                </parents>\`
                }
              })),
              totalCount: 1,
              totalCountFiltered: 1
            };
          }
          return response;
        });
        return ellipsisSearchApi.handlers;
      })()]
    }
  },
  args: {
    'max-number-of-parts': 5
  }
}`,...w.parameters?.docs?.source}}},T=[`Default`,`WithEllipsis`]}));E();export{C as Default,w as WithEllipsis,T as __namedExportsOrder,S as default,E as t};