import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,St as r,Tt as i}from"./iframe-cSkD6HDI.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{r as s,t as c}from"./search-interface-wrapper-DyJSRxFL.js";import{n as l,t as u}from"./mock-C5ckzz_b.js";import{n as d,t as f}from"./facets-decorator-DYB9S-w4.js";var p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A=e((()=>{t(),r(),l(),o(),d(),c(),p=new u,m=[{value:`Email`,state:`idle`,numberOfResults:87},{value:`HTML`,state:`idle`,numberOfResults:245},{value:`Message`,state:`idle`,numberOfResults:134},{value:`PDF`,state:`idle`,numberOfResults:43},{value:`Powerpoint`,state:`idle`,numberOfResults:76},{value:`Text`,state:`idle`,numberOfResults:54},{value:`Thread`,state:`idle`,numberOfResults:98},{value:`Video`,state:`idle`,numberOfResults:156}],h=(e,{moreValuesAvailable:t=!0}={})=>({facetId:`filetype`,field:`filetype`,moreValuesAvailable:t,values:e,label:`File Type`}),g=()=>{p.searchEndpoint.mockOnce(e=>`facets`in e?{...e,facets:[...e.facets||[],h(m)]}:e)},{decorator:_,play:v}=s(),{events:y,argTypes:b}=n(`atomic-color-facet`,{excludeCategories:[`methods`]}),{template:x}=n(`atomic-color-facet`,{excludeCategories:[`methods`,`cssParts`]}),S={component:`atomic-color-facet`,title:`Search/Facet (Color)`,id:`atomic-color-facet`,render:e=>x(e),decorators:[_],parameters:{...a,actions:{handles:y},msw:{handlers:[...p.handlers]}},argTypes:b,beforeEach:()=>{p.searchEndpoint.clear(),p.facetSearchEndpoint.clear(),p.facetSearchEndpoint.mock(()=>({values:[{displayValue:`Powerpoint`,rawValue:`Powerpoint`,count:76},{displayValue:`PDF`,rawValue:`PDF`,count:43}],moreValuesAvailable:!1}))},play:v},C={Email:{"background-image":`url("/assets/email.svg")`,"background-color":`rgb(149, 174, 197)`},Video:{"background-image":`url("/assets/video.svg")`,"background-color":`rgb(176, 112, 230)`},Message:{"background-image":`url("/assets/knowledge.svg")`,"background-color":`rgb(236, 148, 237)`},Thread:{"background-image":`url("/assets/post.svg")`,"background-color":`rgb(101, 202, 228)`},HTML:{"background-image":`url("/assets/html.svg")`,"background-color":`transparent`},Text:{"background-image":`url("/assets/document.svg")`,"background-color":`rgb(144, 144, 144)`},PDF:{"background-image":`url("/assets/document.svg")`,"background-color":`rgb(255, 100, 100)`},Powerpoint:{"background-image":`url("/assets/document.svg")`,"background-color":`rgb(170, 62, 152)`}},w={"background-position":`center`,"background-size":`contain`,"background-repeat":`no-repeat`},T=e=>i`
    <style>
      ${Object.entries(C).map(([e,t])=>`atomic-color-facet::part(value-${e.replace(/[^a-z0-9]/gi,``)}) {
          ${Object.entries({...w,...t}).map(([e,t])=>`${e}: ${t};`).join(`
`)}
        }`).join(`
`)}
      ${`
        atomic-color-facet::part(value-checkbox) {
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 0.25rem;
          padding-right: 0.25rem;
          margin-top: 0.5rem;
        }
        atomic-color-facet::part(value-checkbox-label) {
          padding-left: 0.25rem;
          margin-top: 0.5rem;
        }`}
    </style>
    ${e()}
  `,E={args:{field:`filetype`,label:`File Type`},decorators:[f,T],beforeEach:()=>{g()}},D={name:`Checkbox Display Mode`,args:{field:`filetype`,label:`File Type`,"display-values-as":`checkbox`},decorators:[f,T],beforeEach:()=>{g()}},O={name:`With Selected Value`,args:{field:`filetype`,label:`File Type`},decorators:[f,T],beforeEach:()=>{let e=m.map(e=>e.value===`Email`?{...e,state:`selected`}:e);p.searchEndpoint.mockOnce(t=>`facets`in t?{...t,facets:[...t.facets||[],h(e)]}:t)}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    field: 'filetype',
    label: 'File Type'
  },
  decorators: [facetDecorator, colorFacetStylesDecorator],
  beforeEach: () => {
    mockDefaultFacetResponse();
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  name: 'Checkbox Display Mode',
  args: {
    field: 'filetype',
    label: 'File Type',
    'display-values-as': 'checkbox'
  },
  decorators: [facetDecorator, colorFacetStylesDecorator],
  beforeEach: () => {
    mockDefaultFacetResponse();
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  name: 'With Selected Value',
  args: {
    field: 'filetype',
    label: 'File Type'
  },
  decorators: [facetDecorator, colorFacetStylesDecorator],
  beforeEach: () => {
    const selectedValues = baseFacetValues.map(v => v.value === 'Email' ? {
      ...v,
      state: 'selected'
    } : v);
    searchApiHarness.searchEndpoint.mockOnce(response => {
      if ('facets' in response) {
        return {
          ...response,
          facets: [...(response.facets || []), createFacetResponse(selectedValues)]
        };
      }
      return response;
    });
  }
}`,...O.parameters?.docs?.source}}},k=[`Default`,`CheckboxDisplay`,`WithSelectedValue`]}));A();export{D as CheckboxDisplay,E as Default,O as WithSelectedValue,k as __namedExportsOrder,S as default,A as t};