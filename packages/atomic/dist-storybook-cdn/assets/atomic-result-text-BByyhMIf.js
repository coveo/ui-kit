import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,WithFirstSentences as u,WithPrintableUri as d,WithSummary as f,WithTitle as p,WithoutHighlights as m,t as h}from"./atomic-result-text.new.stories-CkG5JzFP.js";function g(e){let n={code:`code`,h3:`h3`,li:`li`,ol:`ol`,p:`p`,pre:`pre`,...t(),...e.components};return(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(r,{of:c}),`
`,(0,v.jsxs)(s,{stories:{Default:l,WithTitle:p,WithFirstSentences:u,WithPrintableUri:d,WithSummary:f,WithoutHighlights:m},githubPath:`search/atomic-result-text/atomic-result-text.ts`,tagName:`atomic-result-text`,className:`AtomicResultText`,children:[(0,v.jsxs)(n.p,{children:[`The `,(0,v.jsx)(n.code,{children:`atomic-result-text`}),` component renders the value of a string result field.`]}),(0,v.jsxs)(n.p,{children:[`This component is used within `,(0,v.jsx)(n.code,{children:`atomic-result-template`}),` components inside the result list:`]}),(0,v.jsx)(n.pre,{children:(0,v.jsx)(n.code,{className:`language-html`,children:`<atomic-search-interface>
  ...
  <atomic-result-list>
    <atomic-result-template>
      <template>
        <atomic-result-text field="title"></atomic-result-text>
        <atomic-result-text field="excerpt"></atomic-result-text>
        <atomic-result-text field="author" default="no-author"></atomic-result-text>
      </template>
    </atomic-result-template>
  </atomic-result-list>
  ...
</atomic-search-interface>
`})}),(0,v.jsx)(n.h3,{id:`basic-usage`,children:`Basic Usage`}),(0,v.jsx)(n.p,{children:`To display a specific result field:`}),(0,v.jsx)(n.pre,{children:(0,v.jsx)(n.code,{className:`language-html`,children:`<atomic-result-text field="excerpt"></atomic-result-text>
`})}),(0,v.jsx)(n.h3,{id:`with-default-value`,children:`With Default Value`}),(0,v.jsx)(n.p,{children:`When a field might not have a value, you can provide a fallback:`}),(0,v.jsx)(n.pre,{children:(0,v.jsx)(n.code,{className:`language-html`,children:`<atomic-result-text field="brand" default="no-brand-available"></atomic-result-text>
`})}),(0,v.jsx)(n.h3,{id:`with-highlighting`,children:`With Highlighting`}),(0,v.jsxs)(n.p,{children:[`By default, the component will highlight search terms in supported fields (`,(0,v.jsx)(n.code,{children:`title`}),`, `,(0,v.jsx)(n.code,{children:`excerpt`}),`, `,(0,v.jsx)(n.code,{children:`firstSentences`}),`, `,(0,v.jsx)(n.code,{children:`printableUri`}),`  and `,(0,v.jsx)(n.code,{children:`summary`}),`  ). You can disable this behavior:`]}),(0,v.jsx)(n.pre,{children:(0,v.jsx)(n.code,{className:`language-html`,children:`<atomic-result-text field="excerpt" should-highlight="false"></atomic-result-text>
`})}),(0,v.jsx)(n.h3,{id:`supported-fields`,children:`Supported Fields`}),(0,v.jsx)(n.p,{children:`The component looks for fields in this order:`}),(0,v.jsxs)(n.ol,{children:[`
`,(0,v.jsx)(n.li,{children:`First in the Result object properties`}),`
`,(0,v.jsxs)(n.li,{children:[`Then in the `,(0,v.jsx)(n.code,{children:`result.raw`}),` object`]}),`
`]})]})]})}function _(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,v.jsx)(n,{...e,children:(0,v.jsx)(g,{...e})}):g(e)}var v;e((()=>{v=n(),a(),i(),h(),o()}))();export{_ as default};