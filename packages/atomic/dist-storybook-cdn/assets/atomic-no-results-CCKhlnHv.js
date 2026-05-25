import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,t as u}from"./atomic-no-results.new.stories-BnTyMLYO.js";function d(e){let n={code:`code`,h2:`h2`,h3:`h3`,li:`li`,p:`p`,pre:`pre`,ul:`ul`,...t(),...e.components};return(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(r,{of:c}),`
`,(0,p.jsxs)(s,{stories:{Default:l},githubPath:`search/atomic-no-results/atomic-no-results.ts`,tagName:`atomic-no-results`,className:`AtomicNoResults`,children:[(0,p.jsxs)(n.p,{children:[`The `,(0,p.jsx)(n.code,{children:`atomic-no-results`}),` component displays search tips and a "Cancel last action" button when there are no results. Any additional content slotted inside of its element will be displayed as well.`]}),(0,p.jsx)(n.p,{children:`This component is typically placed within the results section of the search interface layout.`}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-search-interface>
  ...
  <atomic-search-layout>
    ...
    <atomic-layout-section section="main">
      ...
      <atomic-layout-section section="results">

        <atomic-no-results></atomic-no-results>

      </atomic-layout-section>
    </atomic-layout-section>
  </atomic-search-layout>
</atomic-search-interface>
`})}),(0,p.jsx)(n.h2,{id:`ux-best-practices`,children:`UX best practices`}),(0,p.jsxs)(n.ul,{children:[`
`,(0,p.jsx)(n.li,{children:`Used when the query returns no results.`}),`
`,(0,p.jsxs)(n.li,{children:[`Displaying additional content from this component using a `,(0,p.jsx)(n.code,{children:`<slot>`}),` element is also possible.`]}),`
`,(0,p.jsxs)(n.li,{children:[`The `,(0,p.jsx)(n.code,{children:`<slot>`}),` element acts as a placeholder inside the Atomic component, into which you can place your own markup to offer custom content such as messages, images, or links.`]}),`
`,(0,p.jsx)(n.li,{children:`Use this opportunity to provide support to your users in the form of advice and tools for query reformulation.`}),`
`,(0,p.jsx)(n.li,{children:`If applicable, you should promote exploration and discovery using things like top searches, featured items, or popular items.`}),`
`]}),(0,p.jsx)(n.h3,{id:`use-cases-and-examples`,children:`Use cases and examples`}),(0,p.jsx)(n.p,{children:`When displaying a "no results" message on an ecommerce site, displaying popular products that relate to a selected category can help direct the user to a relevant result.
It may also help increase sales.`})]})]})}function f(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,p.jsx)(n,{...e,children:(0,p.jsx)(d,{...e})}):d(e)}var p;e((()=>{p=n(),a(),i(),u(),o()}))();export{f as default};