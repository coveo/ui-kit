import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,t as u}from"./atomic-facet-manager.new.stories-DGwPtjHb.js";function d(e){let n={a:`a`,code:`code`,h2:`h2`,p:`p`,pre:`pre`,...t(),...e.components};return(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(r,{of:c}),`
`,(0,p.jsxs)(s,{stories:{Default:l},githubPath:`search/atomic-facet-manager/atomic-facet-manager.ts`,tagName:`atomic-facet-manager`,className:`AtomicFacetManager`,children:[(0,p.jsxs)(n.p,{children:[`Place facets inside the `,(0,p.jsx)(n.code,{children:`atomic-facet-manager`}),` component within the "facets" section of your layout:`]}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-search-interface>
  ...
  <atomic-search-layout>
    <atomic-layout-section section="facets">
      <atomic-facet-manager collapse-facets-after="4">
        <atomic-facet field="author" label="Authors"></atomic-facet>
        <atomic-facet field="source" label="Source"></atomic-facet>
        <atomic-category-facet field="geographicalhierarchy" label="Geography"></atomic-category-facet>
        <atomic-numeric-facet field="ytviewcount" label="Views"></atomic-numeric-facet>
        <atomic-automatic-facet-generator desired-count="3"></atomic-automatic-facet-generator>
      </atomic-facet-manager>
    </atomic-layout-section>
  </atomic-search-layout>
</atomic-search-interface>
`})}),(0,p.jsx)(n.h2,{id:`dynamic-navigation-experience-dne`,children:`Dynamic Navigation Experience (DNE)`}),(0,p.jsxs)(n.p,{children:[`The facet manager leverages Coveo's `,(0,p.jsx)(n.a,{href:`https://docs.coveo.com/en/3383`,rel:`nofollow`,children:`Dynamic Navigation Experience`}),` to automatically order facets based on their relevance to the current search query.
It also automatically selects facets to improve the user experience.`]})]})]})}function f(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,p.jsx)(n,{...e,children:(0,p.jsx)(d,{...e})}):d(e)}var p;e((()=>{p=n(),a(),i(),u(),o()}))();export{f as default};