import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,St as r,Tt as i}from"./iframe-cSkD6HDI.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{r as s,t as c}from"./search-interface-wrapper-DyJSRxFL.js";import{n as l,t as u}from"./facets-decorator-DYB9S-w4.js";var d,f,p,m,h,g,_,v,y,b,x,S,C,w=e((()=>{t(),r(),o(),l(),c(),{decorator:d,play:f}=s(),{events:p,args:m,argTypes:h,template:g}=n(`atomic-facet`,{excludeCategories:[`methods`]}),_=[`alphanumeric`,`alphanumericDescending`,`alphanumericNatural`,`alphanumericNaturalDescending`,`automatic`,`occurrences`,`score`],v={component:`atomic-facet`,title:`Search/Facet`,id:`atomic-facet`,render:e=>g(e),decorators:[d],parameters:{...a,chromatic:{disableSnapshot:!0},actions:{handles:p}},argTypes:{...h,"depends-on":{control:{type:`object`}},"tabs-included":{control:{type:`object`}},"tabs-excluded":{control:{type:`object`}},"custom-sort":{control:{type:`object`}},"allowed-values":{control:{type:`object`}},"sort-criteria":{control:`select`,options:_,type:`string`}},play:f,args:{...m,"number-of-values":8,"tabs-included":`[]`,"tabs-excluded":`[]`,"allowed-values":`[]`,"custom-sort":`[]`,"depends-on":`{}`}},y={name:`atomic-facet`,args:{field:`objecttype`},decorators:[u]},b={tags:[`test`],args:{field:`objecttype`,"number-of-values":2},decorators:[u]},x={tags:[`test`],args:{field:`month`,label:`Month`,"number-of-values":2},decorators:[u]},S={tags:[`test`],args:{field:`cat_available_sizes`,"custom-sort":`["XL", "L", "M", "S"]`,"sort-criteria":`alphanumeric`,"number-of-values":4},decorators:[u,(e,t)=>i`<atomic-facet
        field=${t.args.field}
        custom-sort=${t.args[`custom-sort`]}
        sort-criteria=${t.args[`sort-criteria`]}
        number-of-values=${t.args[`number-of-values`]}
      ></atomic-facet>`]},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'atomic-facet',
  args: {
    field: 'objecttype'
  },
  decorators: [facetDecorator]
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  tags: ['test'],
  args: {
    field: 'objecttype',
    'number-of-values': 2
  },
  decorators: [facetDecorator]
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  tags: ['test'],
  args: {
    field: 'month',
    label: 'Month',
    'number-of-values': 2
  },
  decorators: [facetDecorator]
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  tags: ['test'],
  args: {
    field: 'cat_available_sizes',
    'custom-sort': '["XL", "L", "M", "S"]',
    'sort-criteria': 'alphanumeric',
    'number-of-values': 4
  },
  decorators: [facetDecorator, (_Story, context) => {
    return html\`<atomic-facet
        field=\${context.args.field}
        custom-sort=\${context.args['custom-sort']}
        sort-criteria=\${context.args['sort-criteria']}
        number-of-values=\${context.args['number-of-values']}
      ></atomic-facet>\`;
  }]
}`,...S.parameters?.docs?.source}}},C=[`Default`,`LowFacetValues`,`monthFacet`,`CustomSort`]}));w();export{S as CustomSort,y as Default,b as LowFacetValues,C as __namedExportsOrder,v as default,x as monthFacet,w as t};