import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,t as u}from"./atomic-product-text.new.stories-CjXz6pNF.js";function d(e){let n={code:`code`,h3:`h3`,li:`li`,ol:`ol`,p:`p`,pre:`pre`,...t(),...e.components};return(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(r,{of:c}),`
`,(0,p.jsxs)(s,{stories:{Default:l},githubPath:`commerce/atomic-product-text/atomic-product-text.ts`,tagName:`atomic-product-text`,className:`AtomicProductText`,children:[(0,p.jsxs)(n.p,{children:[`The `,(0,p.jsx)(n.code,{children:`atomic-product-text`}),` component renders the value of a string product field.`]}),(0,p.jsxs)(n.p,{children:[`This component is used within `,(0,p.jsx)(n.code,{children:`atomic-product-template`}),` components inside the product list:`]}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-commerce-interface>
  ...
  <atomic-commerce-product-list>
    <atomic-product-template>
      <template>
        <atomic-product-text field="name"></atomic-product-text>
        <atomic-product-text field="excerpt"></atomic-product-text>
        <atomic-product-text field="brand" default="no-brand"></atomic-product-text>
      </template>
    </atomic-product-template>
  </atomic-commerce-product-list>
  ...
</atomic-commerce-interface>
`})}),(0,p.jsx)(n.h3,{id:`basic-usage`,children:`Basic Usage`}),(0,p.jsx)(n.p,{children:`To display a specific product field:`}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-product-text field="excerpt"></atomic-product-text>
`})}),(0,p.jsx)(n.h3,{id:`with-default-value`,children:`With Default Value`}),(0,p.jsx)(n.p,{children:`When a field might not have a value, you can provide a fallback:`}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-product-text field="brand" default="no-brand-available"></atomic-product-text>
`})}),(0,p.jsx)(n.h3,{id:`with-highlighting`,children:`With Highlighting`}),(0,p.jsxs)(n.p,{children:[`By default, the component will highlight search terms in supported fields (`,(0,p.jsx)(n.code,{children:`excerpt`}),` and `,(0,p.jsx)(n.code,{children:`ec_name`}),`). You can disable this behavior:`]}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-product-text field="excerpt" should-highlight="false"></atomic-product-text>
`})}),(0,p.jsx)(n.h3,{id:`supported-fields`,children:`Supported Fields`}),(0,p.jsx)(n.p,{children:`The component looks for fields in this order:`}),(0,p.jsxs)(n.ol,{children:[`
`,(0,p.jsx)(n.li,{children:`First in the Product object properties`}),`
`,(0,p.jsxs)(n.li,{children:[`Then in the `,(0,p.jsx)(n.code,{children:`product.additionalFields`}),` object`]}),`
`]})]})]})}function f(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,p.jsx)(n,{...e,children:(0,p.jsx)(d,{...e})}):d(e)}var p;e((()=>{p=n(),a(),i(),u(),o()}))();export{f as default};