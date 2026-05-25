import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,WithTranslations as u,t as d}from"./atomic-commerce-text.new.stories-W3Wav5fV.js";function f(e){let n={code:`code`,h3:`h3`,p:`p`,pre:`pre`,...t(),...e.components};return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(r,{of:c}),`
`,(0,m.jsxs)(s,{stories:{Default:l,WithTranslations:u},githubPath:`commerce/atomic-commerce-text/atomic-commerce-text.ts`,tagName:`atomic-commerce-text`,className:`AtomicCommerceText`,children:[(0,m.jsxs)(n.p,{children:[`The `,(0,m.jsx)(n.code,{children:`atomic-commerce-text`}),` component leverages the I18n translation module through the atomic-commerce-interface. It is used to display internationalized text content within your commerce interface.`]}),(0,m.jsx)(n.p,{children:`This component is typically used within product templates or other parts of your commerce interface where you need to display translatable text.`}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-html`,children:`<atomic-commerce-interface>
  ...
  <atomic-commerce-text value="product-name"></atomic-commerce-text>
  ...
</atomic-commerce-interface>
`})}),(0,m.jsx)(n.h3,{id:`basic-usage`,children:`Basic Usage`}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-html`,children:`<atomic-commerce-text value="your-translation-key"></atomic-commerce-text>
`})}),(0,m.jsx)(n.h3,{id:`with-pluralization`,children:`With Pluralization`}),(0,m.jsxs)(n.p,{children:[`For text that needs to change based on count (for example, "1 item" vs "5 items"), you can use the `,(0,m.jsx)(n.code,{children:`count`}),` attribute:`]}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-html`,children:`<atomic-commerce-text value="items-count" count="1"></atomic-commerce-text>
<atomic-commerce-text value="items-count" count="5"></atomic-commerce-text>
`})}),(0,m.jsx)(n.p,{children:`Make sure your translation resources include both singular and plural forms:`}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-javascript`,children:`{
  "items-count": "{{count}} item",
  "items-count_other": "{{count}} items"
}
`})})]})]})}function p(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,m.jsx)(n,{...e,children:(0,m.jsx)(f,{...e})}):f(e)}var m;e((()=>{m=n(),a(),i(),d(),o()}))();export{p as default};