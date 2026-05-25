import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,t as u}from"./atomic-sort-dropdown.new.stories-D87LgDqM.js";function d(e){let n={code:`code`,h2:`h2`,h3:`h3`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,ul:`ul`,...t(),...e.components};return(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(r,{of:c}),`
`,(0,p.jsxs)(s,{stories:{Default:l},githubPath:`search/atomic-sort-dropdown/atomic-sort-dropdown.ts`,tagName:`atomic-sort-dropdown`,className:`AtomicSortDropdown`,children:[(0,p.jsx)(n.p,{children:`This component renders a dropdown that the end user can interact with to select the criteria to use when sorting query results.`}),(0,p.jsxs)(n.p,{children:[`It must contain one or more `,(0,p.jsx)(n.code,{children:`atomic-sort-expression`}),` child elements, each representing a sort option.`]}),(0,p.jsx)(n.h2,{id:`usage`,children:`Usage`}),(0,p.jsx)(n.p,{children:`This component is typically placed within the status section of the search interface:`}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-search-interface>
  ...
  <atomic-search-layout>
    ...
    <atomic-layout-section section="status">

      <atomic-sort-dropdown>
        <atomic-sort-expression label="relevance" expression="relevancy"></atomic-sort-expression>
        <atomic-sort-expression label="most-recent" expression="date descending"></atomic-sort-expression>
        <atomic-sort-expression label="price-ascending" expression="sncost ascending"></atomic-sort-expression>
      </atomic-sort-dropdown>

    </atomic-layout-section>
  </atomic-search-layout>
</atomic-search-interface>
`})}),(0,p.jsx)(n.h2,{id:`sort-expressions`,children:`Sort Expressions`}),(0,p.jsxs)(n.p,{children:[`Each `,(0,p.jsx)(n.code,{children:`atomic-sort-expression`}),` child element defines a sort option with:`]}),(0,p.jsxs)(n.ul,{children:[`
`,(0,p.jsxs)(n.li,{children:[(0,p.jsx)(n.strong,{children:`label`}),`: The display text for the option`]}),`
`,(0,p.jsxs)(n.li,{children:[(0,p.jsx)(n.strong,{children:`expression`}),`: The sort criteria (e.g., "relevancy", "date descending", "field ascending")`]}),`
`,(0,p.jsxs)(n.li,{children:[(0,p.jsx)(n.strong,{children:`tabs-included`}),` (optional): Tabs where this option should be available`]}),`
`,(0,p.jsxs)(n.li,{children:[(0,p.jsx)(n.strong,{children:`tabs-excluded`}),` (optional): Tabs where this option should be hidden`]}),`
`]}),(0,p.jsx)(n.h3,{id:`supported-sort-criteria`,children:`Supported Sort Criteria`}),(0,p.jsxs)(n.ul,{children:[`
`,(0,p.jsxs)(n.li,{children:[(0,p.jsx)(n.code,{children:`relevancy`}),` - Sort by relevance (default)`]}),`
`,(0,p.jsxs)(n.li,{children:[(0,p.jsx)(n.code,{children:`qre`}),` - Sort by query ranking expression`]}),`
`,(0,p.jsxs)(n.li,{children:[(0,p.jsx)(n.code,{children:`date ascending`}),` / `,(0,p.jsx)(n.code,{children:`date descending`}),` - Sort by date`]}),`
`,(0,p.jsxs)(n.li,{children:[(0,p.jsx)(n.code,{children:`<FIELD> ascending`}),` / `,(0,p.jsx)(n.code,{children:`<FIELD> descending`}),` - Sort by a specific field (e.g., "sncost ascending")`]}),`
`,(0,p.jsx)(n.li,{children:`Multiple criteria separated by commas (e.g., "sncost ascending, date descending")`}),`
`]}),(0,p.jsx)(n.h2,{id:`related-components`,children:`Related Components`}),(0,p.jsxs)(n.ul,{children:[`
`,(0,p.jsxs)(n.li,{children:[(0,p.jsx)(n.strong,{children:`atomic-sort-expression`}),`: Defines individual sort options`]}),`
`,(0,p.jsxs)(n.li,{children:[(0,p.jsx)(n.strong,{children:`atomic-commerce-sort-dropdown`}),`: Equivalent component for commerce interfaces`]}),`
`]})]})]})}function f(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,p.jsx)(n,{...e,children:(0,p.jsx)(d,{...e})}):d(e)}var p;e((()=>{p=n(),a(),i(),u(),o()}))();export{f as default};