import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,O as r,St as i,Tt as a,k as o}from"./iframe-cSkD6HDI.js";import{n as s,t as c}from"./common-meta-parameters-BmIbTEf7.js";import{r as l,t as u}from"./search-interface-wrapper-DyJSRxFL.js";import{n as d,t as f}from"./result-list-wrapper-DszKxGnf.js";import{n as p,t as m}from"./result-template-wrapper-BY8u_Pg8.js";var h,g,_,v,y,b,x,S,C,w,T,E,D,O,k=e((()=>{t(),i(),r(),c(),f(),m(),u(),{events:h,args:g,argTypes:_,template:v}=n(`atomic-result-number`,{excludeCategories:[`methods`]}),{decorator:y,play:b}=l({config:{preprocessRequest:e=>{let t=JSON.parse(e.body);return t.fieldsToInclude=[...t.fieldsToInclude,`size`],t.numberOfResults=1,e.body=JSON.stringify(t),e}},includeCodeRoot:!1}),{decorator:x}=d(`list`,!1),{decorator:S}=p(!1),C={component:`atomic-result-number`,title:`Search/Result Number`,id:`atomic-result-number`,render:e=>v(e),decorators:[S,x,y],parameters:{...s,chromatic:{disableSnapshot:!0},actions:{handles:h}},args:g,argTypes:_,play:b},w={args:{field:`size`}},T={name:`With currency formatting`,args:{field:`size`},render:e=>a`<atomic-result-number field=${e.field}>
      ${o(`<atomic-format-currency currency="USD" currency-display="code" minimum-fraction-digits="2" maximum-fraction-digits="2"></atomic-format-currency>`)}
    </atomic-result-number>`},E={name:`With number formatting`,args:{field:`size`},render:e=>a`<atomic-result-number field=${e.field}>
      ${o(`<atomic-format-number minimum-fraction-digits="2" maximum-fraction-digits="2"></atomic-format-number>`)}
    </atomic-result-number>`},D={name:`With unit formatting`,args:{field:`size`},render:e=>a`<atomic-result-number field=${e.field}>
      ${o(`<atomic-format-unit unit="byte" unit-display="long"></atomic-format-unit>`)}
    </atomic-result-number>`},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    field: 'size'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: 'With currency formatting',
  args: {
    field: 'size'
  },
  render: args => html\`<atomic-result-number field=\${args.field}>
      \${unsafeHTML('<atomic-format-currency currency="USD" currency-display="code" minimum-fraction-digits="2" maximum-fraction-digits="2"></atomic-format-currency>')}
    </atomic-result-number>\`
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  name: 'With number formatting',
  args: {
    field: 'size'
  },
  render: args => html\`<atomic-result-number field=\${args.field}>
      \${unsafeHTML('<atomic-format-number minimum-fraction-digits="2" maximum-fraction-digits="2"></atomic-format-number>')}
    </atomic-result-number>\`
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  name: 'With unit formatting',
  args: {
    field: 'size'
  },
  render: args => html\`<atomic-result-number field=\${args.field}>
      \${unsafeHTML('<atomic-format-unit unit="byte" unit-display="long"></atomic-format-unit>')}
    </atomic-result-number>\`
}`,...D.parameters?.docs?.source}}},O=[`Default`,`WithCurrencyFormatting`,`WithNumberFormatting`,`WithUnitFormatting`]}));k();export{w as Default,T as WithCurrencyFormatting,E as WithNumberFormatting,D as WithUnitFormatting,O as __namedExportsOrder,C as default,k as t};