import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,WithCustomLabel as u,WithNextPeriod as d,WithPastPeriod as f,t as p}from"./atomic-timeframe.new.stories-BUrsN9ZH.js";function m(e){let n={a:`a`,code:`code`,h2:`h2`,li:`li`,p:`p`,pre:`pre`,ul:`ul`,...t(),...e.components};return(0,g.jsxs)(g.Fragment,{children:[(0,g.jsx)(r,{of:c}),`
`,(0,g.jsxs)(s,{stories:{Default:l,WithPastPeriod:f,WithNextPeriod:d,WithCustomLabel:u},githubPath:`common/atomic-timeframe/atomic-timeframe.ts`,tagName:`atomic-timeframe`,className:`AtomicTimeframe`,children:[(0,g.jsxs)(n.p,{children:[`The `,(0,g.jsx)(n.code,{children:`atomic-timeframe`}),` component defines a relative date range for filtering results in a timeframe facet. It allows users to filter by periods like "past week", "next month", or other custom time ranges.`]}),(0,g.jsxs)(n.p,{children:[`This component must be placed as a child of `,(0,g.jsx)(n.code,{children:`atomic-timeframe-facet`}),` (for search interfaces) or `,(0,g.jsx)(n.code,{children:`atomic-insight-timeframe-facet`}),` (for insight panels).`]}),(0,g.jsx)(n.pre,{children:(0,g.jsx)(n.code,{className:`language-html`,children:`<atomic-search-interface>
  ...
  <atomic-search-layout>
    ...
    <atomic-layout-section section="facets">
      ...
      <atomic-timeframe-facet field="date" label="Date">
        <atomic-timeframe period="past" unit="week" amount="1"></atomic-timeframe>
      </atomic-timeframe-facet>
    </atomic-layout-section>
  </atomic-search-layout>
</atomic-search-interface>
`})}),(0,g.jsx)(n.h2,{id:`related-components`,children:`Related Components`}),(0,g.jsxs)(n.ul,{children:[`
`,(0,g.jsxs)(n.li,{children:[(0,g.jsx)(n.a,{href:`../?path=/docs/atomic-timeframe-facet--default`,children:`atomic-timeframe-facet`}),` - Search timeframe facet`]}),`
`,(0,g.jsxs)(n.li,{children:[(0,g.jsx)(n.a,{href:`../?path=/docs/atomic-insight-timeframe-facet--default`,children:`atomic-insight-timeframe-facet`}),` - Insight timeframe facet`]}),`
`]})]})]})}function h(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,g.jsx)(n,{...e,children:(0,g.jsx)(m,{...e})}):m(e)}var g;e((()=>{g=n(),a(),i(),p(),o()}))();export{h as default};