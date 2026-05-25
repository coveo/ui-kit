import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Facet as l,Result as u,t as d}from"./atomic-format-number.new.stories-B07D7hHx.js";function f(e){let n={code:`code`,h3:`h3`,li:`li`,p:`p`,pre:`pre`,ul:`ul`,...t(),...e.components};return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(r,{of:c}),`
`,(0,m.jsxs)(s,{stories:{Facet:l,Result:u},githubPath:`search/atomic-format-number/atomic-format-number.ts`,tagName:`atomic-format-number`,className:`AtomicFormatNumber`,defaultStory:`Facet`,children:[(0,m.jsxs)(n.p,{children:[`The `,(0,m.jsx)(n.code,{children:`atomic-format-number`}),` component is used for number formatting.
The numerical format of compatible parents will be set according to the properties of this component.`]}),(0,m.jsxs)(n.p,{children:[`This component is used within compatible parent components such as `,(0,m.jsx)(n.code,{children:`atomic-result-number`}),` or `,(0,m.jsx)(n.code,{children:`atomic-numeric-facet`}),`:`]}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-html`,children:`<atomic-search-interface>
  ...
  <atomic-result-list>
    <atomic-result-template>
      <template>
        <atomic-result-number field="size">
          <atomic-format-number minimum-fraction-digits="2"></atomic-format-number>
        </atomic-result-number>
      </template>
    </atomic-result-template>
  </atomic-result-list>
  ...
</atomic-search-interface>
`})}),(0,m.jsx)(n.h3,{id:`within-a-numeric-facet`,children:`Within a Numeric Facet`}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-html`,children:`<atomic-numeric-facet field="size">
  <atomic-format-number maximum-fraction-digits="0"></atomic-format-number>
</atomic-numeric-facet>
`})}),(0,m.jsx)(n.h3,{id:`formatting-options`,children:`Formatting Options`}),(0,m.jsx)(n.p,{children:`The component supports several formatting options:`}),(0,m.jsxs)(n.ul,{children:[`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`minimum-integer-digits`}),`: The minimum number of integer digits to use`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`minimum-fraction-digits`}),`: The minimum number of fraction digits to use`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`maximum-fraction-digits`}),`: The maximum number of fraction digits to use`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`minimum-significant-digits`}),`: The minimum number of significant digits to use`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`maximum-significant-digits`}),`: The maximum number of significant digits to use`]}),`
`]})]})]})}function p(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,m.jsx)(n,{...e,children:(0,m.jsx)(f,{...e})}):f(e)}var m;e((()=>{m=n(),a(),i(),d(),o()}))();export{p as default};