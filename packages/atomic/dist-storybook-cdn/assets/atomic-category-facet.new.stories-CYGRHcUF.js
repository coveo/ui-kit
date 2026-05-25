import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n}from"./iframe-cSkD6HDI.js";import{n as r,t as i}from"./common-meta-parameters-BmIbTEf7.js";import{r as a,t as o}from"./search-interface-wrapper-DyJSRxFL.js";import{n as s,t as c}from"./mock-C5ckzz_b.js";import{n as l,t as u}from"./facets-decorator-DYB9S-w4.js";var d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M=e((()=>{t(),s(),i(),l(),o(),d=new c,f=[{value:`North America`,numberOfResults:245,path:[`North America`],state:`idle`,moreValuesAvailable:!0,isLeafValue:!1,children:[]},{value:`Europe`,numberOfResults:189,path:[`Europe`],state:`idle`,moreValuesAvailable:!0,isLeafValue:!1,children:[]},{value:`Asia`,numberOfResults:156,path:[`Asia`],state:`idle`,moreValuesAvailable:!0,isLeafValue:!1,children:[]},{value:`South America`,numberOfResults:87,path:[`South America`],state:`idle`,moreValuesAvailable:!0,isLeafValue:!1,children:[]},{value:`Africa`,numberOfResults:65,path:[`Africa`],state:`idle`,moreValuesAvailable:!1,isLeafValue:!1,children:[]},{value:`Oceania`,numberOfResults:42,path:[`Oceania`],state:`idle`,moreValuesAvailable:!1,isLeafValue:!1,children:[]},{value:`Antarctica`,numberOfResults:12,path:[`Antarctica`],state:`idle`,moreValuesAvailable:!1,isLeafValue:!0,children:[]},{value:`Central America`,numberOfResults:34,path:[`Central America`],state:`idle`,moreValuesAvailable:!1,isLeafValue:!1,children:[]}],p=[{value:`United States`,numberOfResults:145,path:[`North America`,`United States`],state:`idle`,moreValuesAvailable:!0,isLeafValue:!1,children:[]},{value:`Canada`,numberOfResults:67,path:[`North America`,`Canada`],state:`idle`,moreValuesAvailable:!0,isLeafValue:!1,children:[]},{value:`Mexico`,numberOfResults:33,path:[`North America`,`Mexico`],state:`idle`,moreValuesAvailable:!1,isLeafValue:!1,children:[]}],m=[{value:`California`,numberOfResults:45,path:[`North America`,`United States`,`California`],state:`idle`,moreValuesAvailable:!1,isLeafValue:!0,children:[]},{value:`New York`,numberOfResults:38,path:[`North America`,`United States`,`New York`],state:`idle`,moreValuesAvailable:!1,isLeafValue:!0,children:[]},{value:`Texas`,numberOfResults:32,path:[`North America`,`United States`,`Texas`],state:`idle`,moreValuesAvailable:!1,isLeafValue:!0,children:[]}],h=(e,t=`geographicalhierarchy`)=>({facetId:t,field:`geographicalhierarchy`,moreValuesAvailable:e.length>=5,values:e,indexScore:0}),g=(e,t,n=`geographicalhierarchy`)=>{let r=(e,n=0)=>{if(n>=e.length)return null;let i=e[n],a=n===e.length-1,o=r(e,n+1);return{value:i,numberOfResults:245-n*50,path:e.slice(0,n+1),state:a?`selected`:`idle`,moreValuesAvailable:!a,isLeafValue:!1,children:a?t:o?[o]:[]}},i=r(e);return{facetId:n,field:`geographicalhierarchy`,moreValuesAvailable:!1,values:i?[i]:[],indexScore:0}},_=(e=`geographicalhierarchy`)=>{d.searchEndpoint.mockOnce(t=>`facets`in t?{...t,facets:[...t.facets||[],h(f,e)]}:t)},v=(e=`geographicalhierarchy`)=>{d.searchEndpoint.mockOnce(t=>`facets`in t?{...t,facets:[...t.facets||[],g([`North America`],p,e)]}:t)},y=(e=`geographicalhierarchy`)=>{d.searchEndpoint.mockOnce(t=>`facets`in t?{...t,facets:[...t.facets||[],g([`North America`,`United States`],m,e)]}:t)},b=(e=`geographicalhierarchy`)=>{d.searchEndpoint.mockOnce(t=>`facets`in t?{...t,facets:[...t.facets||[],{facetId:e,field:`geographicalhierarchy`,moreValuesAvailable:!1,indexScore:0,values:[{value:`North America`,numberOfResults:245,path:[`North America`],state:`idle`,moreValuesAvailable:!1,isLeafValue:!1,children:[{value:`United States`,numberOfResults:145,path:[`North America`,`United States`],state:`selected`,moreValuesAvailable:!0,isLeafValue:!1,children:m}]}]}]}:t)},{decorator:x,play:S}=a(),{events:C,argTypes:w}=n(`atomic-category-facet`,{excludeCategories:[`methods`]}),{template:T}=n(`atomic-category-facet`,{excludeCategories:[`methods`,`cssParts`]}),E={component:`atomic-category-facet`,title:`Search/Facet (Category)`,id:`atomic-category-facet`,render:e=>T(e),decorators:[x],parameters:{...r,actions:{handles:C},msw:{handlers:[...d.handlers]}},argTypes:w,beforeEach:()=>{d.searchEndpoint.clear(),d.facetSearchEndpoint.clear(),d.facetSearchEndpoint.mock(()=>({values:[{displayValue:`North America`,rawValue:`North America`,count:245,path:[`North America`]},{displayValue:`New York`,rawValue:`New York`,count:87,path:[`North America`,`United States`,`New York`]},{displayValue:`California`,rawValue:`California`,count:65,path:[`North America`,`United States`,`California`]}],moreValuesAvailable:!0}))},play:S},D={args:{field:`geographicalhierarchy`,label:`Geographical Hierarchy`,"with-search":!0},decorators:[u],beforeEach:()=>{_()}},O={name:`With Selected Root Value`,tags:[`test`],args:{field:`geographicalhierarchy`,label:`Geographical Hierarchy`,"with-search":!0},decorators:[u],beforeEach:()=>{v()}},k={name:`With Selected Child Value`,tags:[`test`],args:{field:`geographicalhierarchy`,label:`Geographical Hierarchy`,"with-search":!0},decorators:[u],beforeEach:()=>{y()}},A={name:`With Selected Child Value And More Available`,tags:[`test`],args:{field:`geographicalhierarchy`,label:`Geographical Hierarchy`,"with-search":!0},decorators:[u],beforeEach:()=>{b()}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    field: 'geographicalhierarchy',
    label: 'Geographical Hierarchy',
    'with-search': true
  },
  decorators: [facetDecorator],
  beforeEach: () => {
    mockDefaultCategoryFacetResponse();
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  name: 'With Selected Root Value',
  tags: ['test'],
  args: {
    field: 'geographicalhierarchy',
    label: 'Geographical Hierarchy',
    'with-search': true
  },
  decorators: [facetDecorator],
  beforeEach: () => {
    mockSelectedRootValue();
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  name: 'With Selected Child Value',
  tags: ['test'],
  args: {
    field: 'geographicalhierarchy',
    label: 'Geographical Hierarchy',
    'with-search': true
  },
  decorators: [facetDecorator],
  beforeEach: () => {
    mockSelectedChildValue();
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  name: 'With Selected Child Value And More Available',
  tags: ['test'],
  args: {
    field: 'geographicalhierarchy',
    label: 'Geographical Hierarchy',
    'with-search': true
  },
  decorators: [facetDecorator],
  beforeEach: () => {
    mockSelectedChildValueWithMoreAvailable();
  }
}`,...A.parameters?.docs?.source}}},j=[`Default`,`WithSelectedRootValue`,`WithSelectedChildValue`,`WithSelectedChildValueAndMoreAvailable`]}));M();export{D as Default,k as WithSelectedChildValue,A as WithSelectedChildValueAndMoreAvailable,O as WithSelectedRootValue,j as __namedExportsOrder,E as default,M as t};