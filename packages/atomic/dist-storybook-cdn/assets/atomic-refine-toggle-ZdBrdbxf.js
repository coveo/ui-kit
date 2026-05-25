import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,WithAtomicExternals as u,t as d}from"./atomic-refine-toggle.new.stories-DOTjgX6m.js";function f(e){let n={code:`code`,h2:`h2`,p:`p`,pre:`pre`,...t(),...e.components};return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(r,{of:c,name:`Docs`}),`
`,(0,m.jsxs)(s,{stories:{Default:l,WithAtomicExternals:u},githubPath:`search/atomic-refine-toggle/atomic-refine-toggle.ts`,tagName:`atomic-refine-toggle`,className:`AtomicRefineToggle`,children:[(0,m.jsxs)(n.p,{children:[`The `,(0,m.jsx)(n.code,{children:`atomic-refine-toggle`}),` component displays a button that, when clicked, opens a modal containing facets and sort components. This is particularly useful for mobile or narrow viewport experiences where facets need to be accessed through a modal interface.`]}),(0,m.jsxs)(n.p,{children:[`When this component is added to the `,(0,m.jsx)(n.code,{children:`atomic-search-interface`}),`, an `,(0,m.jsx)(n.code,{children:`atomic-refine-modal`}),` component is automatically created and managed by the toggle.`]}),(0,m.jsx)(n.h2,{id:`usage`,children:`Usage`}),(0,m.jsx)(n.p,{children:`This component is typically placed within the "status" section of the layout:`}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-html`,children:`<atomic-search-interface>
  <atomic-search-layout>
    <atomic-layout-section section="main">
      <atomic-layout-section section="status">
        <atomic-refine-toggle collapse-facets-after="3"></atomic-refine-toggle>
      </atomic-layout-section>
    </atomic-layout-section>
  </atomic-search-layout>
</atomic-search-interface>
`})}),(0,m.jsx)(n.h2,{id:`facet-management`,children:`Facet Management`}),(0,m.jsxs)(n.p,{children:[`The refine modal will automatically include all facets defined in your search interface. You can control how many facets are expanded by default using the `,(0,m.jsx)(n.code,{children:`collapse-facets-after`}),` attribute:`]}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-html`,children:`<!-- Expand the first 3 facets, collapse the rest -->
<atomic-refine-toggle collapse-facets-after="3"></atomic-refine-toggle>

<!-- Collapse all facets by default -->
<atomic-refine-toggle collapse-facets-after="0"></atomic-refine-toggle>
`})})]})]})}function p(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,m.jsx)(n,{...e,children:(0,m.jsx)(f,{...e})}):f(e)}var m;e((()=>{m=n(),a(),i(),d(),o()}))();export{p as default};