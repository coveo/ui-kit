import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,WithCurrencyFormatting as u,WithNumberFormatting as d,WithUnitFormatting as f,t as p}from"./atomic-result-number.new.stories-CScgNSA7.js";function m(e){let n={code:`code`,h2:`h2`,p:`p`,pre:`pre`,...t(),...e.components};return(0,g.jsxs)(g.Fragment,{children:[(0,g.jsx)(r,{of:c}),`
`,(0,g.jsxs)(s,{stories:{Default:l,WithCurrencyFormatting:u,WithNumberFormatting:d,WithUnitFormatting:f},githubPath:`search/atomic-result-number/atomic-result-number.ts`,tagName:`atomic-result-number`,className:`AtomicResultNumber`,children:[(0,g.jsxs)(n.p,{children:[`This component is used within `,(0,g.jsx)(n.code,{children:`atomic-result-template`}),` components inside an `,(0,g.jsx)(n.code,{children:`atomic-result-list`}),`:`]}),(0,g.jsx)(n.pre,{children:(0,g.jsx)(n.code,{className:`language-html`,children:`<atomic-search-interface>
  <atomic-search-layout>
    <atomic-layout-section section="main">
      <atomic-result-list>
        <atomic-result-template>
          <template>
            <atomic-result-number field="size"></atomic-result-number>
          </template>
        </atomic-result-template>
      </atomic-result-list>
    </atomic-layout-section>
  </atomic-search-layout>
</atomic-search-interface>
`})}),(0,g.jsx)(n.h2,{id:`number-formatting`,children:`Number Formatting`}),(0,g.jsx)(n.p,{children:`By default, the component formats the value based on the language of the search interface.`}),(0,g.jsxs)(n.p,{children:[`For instance, if the language is `,(0,g.jsx)(n.code,{children:`fr`}),`, the number `,(0,g.jsx)(n.code,{children:`12345.67`}),` will be displayed as `,(0,g.jsx)(n.code,{children:`12 345,67`}),`; if the language is `,(0,g.jsx)(n.code,{children:`en`}),`, it will be displayed as `,(0,g.jsx)(n.code,{children:`12,345.67`}),`.`]}),(0,g.jsxs)(n.p,{children:[`You can include an `,(0,g.jsx)(n.code,{children:`atomic-format-number`}),`, `,(0,g.jsx)(n.code,{children:`atomic-format-currency`}),`, or `,(0,g.jsx)(n.code,{children:`atomic-format-unit`}),` component as a child of the `,(0,g.jsx)(n.code,{children:`atomic-result-number`}),` to customize the format:`]}),(0,g.jsx)(n.pre,{children:(0,g.jsx)(n.code,{className:`language-html`,children:`<atomic-result-number field="size">
  <atomic-format-unit unit="byte" unit-display="long"></atomic-format-unit>
</atomic-result-number>
`})})]})]})}function h(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,g.jsx)(n,{...e,children:(0,g.jsx)(m,{...e})}):m(e)}var g;e((()=>{g=n(),a(),i(),p(),o()}))();export{h as default};