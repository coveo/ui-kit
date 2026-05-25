import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,WithDatePicker as u,WithSelectedValue as d,t as f}from"./atomic-insight-timeframe-facet.new.stories-DYfKOFFz.js";function p(e){let n={code:`code`,h3:`h3`,li:`li`,p:`p`,pre:`pre`,ul:`ul`,...t(),...e.components};return(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(r,{of:c}),`
`,(0,h.jsxs)(s,{stories:{Default:l,WithSelectedValue:d,WithDatePicker:u},githubPath:`insight/atomic-insight-timeframe-facet/atomic-insight-timeframe-facet.ts`,tagName:`atomic-insight-timeframe-facet`,className:`AtomicInsightTimeframeFacet`,children:[(0,h.jsx)(n.p,{children:`Use this component to filter insight panel results by date ranges. The timeframe facet displays predefined time periods (such as "Past Month" or "Past Year") as facet values, allowing users to quickly filter results to specific time ranges.`}),(0,h.jsx)(n.p,{children:`Place this component within the facets section of your insight panel layout.`}),(0,h.jsx)(n.h3,{id:`basic-timeframe-facet`,children:`Basic Timeframe Facet`}),(0,h.jsx)(n.pre,{children:(0,h.jsx)(n.code,{className:`language-html`,children:`<atomic-insight-interface>
  ...
  <atomic-insight-timeframe-facet field="date" label="Date">
    <atomic-timeframe unit="hour"></atomic-timeframe>
    <atomic-timeframe unit="day"></atomic-timeframe>
    <atomic-timeframe unit="week"></atomic-timeframe>
    <atomic-timeframe unit="month"></atomic-timeframe>
    <atomic-timeframe unit="quarter"></atomic-timeframe>
    <atomic-timeframe unit="year"></atomic-timeframe>
  </atomic-insight-timeframe-facet>
</atomic-insight-interface>
`})}),(0,h.jsx)(n.h3,{id:`with-date-picker`,children:`With Date Picker`}),(0,h.jsxs)(n.p,{children:[`Enable users to select custom date ranges by setting the `,(0,h.jsx)(n.code,{children:`with-date-picker`}),` attribute:`]}),(0,h.jsx)(n.pre,{children:(0,h.jsx)(n.code,{className:`language-html`,children:`<atomic-insight-timeframe-facet 
  field="date" 
  label="Date" 
  with-date-picker
>
  <atomic-timeframe unit="month"></atomic-timeframe>
  <atomic-timeframe unit="year"></atomic-timeframe>
</atomic-insight-timeframe-facet>
`})}),(0,h.jsxs)(n.p,{children:[`When `,(0,h.jsx)(n.code,{children:`with-date-picker`}),` is enabled, users can:`]}),(0,h.jsxs)(n.ul,{children:[`
`,(0,h.jsx)(n.li,{children:`Choose from predefined timeframes`}),`
`,(0,h.jsx)(n.li,{children:`Enter custom start and end dates`}),`
`]})]})]})}function m(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,h.jsx)(n,{...e,children:(0,h.jsx)(p,{...e})}):p(e)}var h;e((()=>{h=n(),a(),i(),f(),o()}))();export{m as default};