import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,WithCollapsedFacets as u,t as d}from"./atomic-ipx-refine-toggle.new.stories-DlaOsVjW.js";function f(e){let n={code:`code`,h2:`h2`,p:`p`,pre:`pre`,...t(),...e.components};return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(r,{of:c,name:`Docs`}),`
`,(0,m.jsxs)(s,{stories:{Default:l,WithCollapsedFacets:u},githubPath:`ipx/atomic-ipx-refine-toggle/atomic-ipx-refine-toggle.ts`,tagName:`atomic-ipx-refine-toggle`,className:`AtomicIpxRefineToggle`,children:[(0,m.jsxs)(n.p,{children:[`This component is used inside an `,(0,m.jsx)(n.code,{children:`atomic-ipx-modal`}),` or `,(0,m.jsx)(n.code,{children:`atomic-ipx-embedded`}),` within an `,(0,m.jsx)(n.code,{children:`atomic-search-interface`}),`. When clicked, it automatically creates and opens an `,(0,m.jsx)(n.code,{children:`atomic-ipx-refine-modal`}),` populated with cloned facets from the interface.`]}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-html`,children:`<atomic-search-interface>
  <atomic-ipx-modal>
    <div slot="header">
      <atomic-ipx-refine-toggle></atomic-ipx-refine-toggle>
    </div>
    <atomic-layout-section section="facets">
      <atomic-facet field="author" label="Author"></atomic-facet>
      <atomic-facet field="source" label="Source"></atomic-facet>
    </atomic-layout-section>
    <div slot="body"></div>
    <div slot="footer"></div>
  </atomic-ipx-modal>
</atomic-search-interface>
`})}),(0,m.jsx)(n.h2,{id:`facet-management`,children:`Facet Management`}),(0,m.jsxs)(n.p,{children:[`You can control how many facets are expanded by default in the refine modal using the `,(0,m.jsx)(n.code,{children:`collapse-facets-after`}),` attribute:`]}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-html`,children:`<!-- Expand the first 3 facets, collapse the rest -->
<atomic-ipx-refine-toggle collapse-facets-after="3"></atomic-ipx-refine-toggle>

<!-- Collapse all facets by default (default behavior) -->
<atomic-ipx-refine-toggle collapse-facets-after="0"></atomic-ipx-refine-toggle>
`})})]})]})}function p(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,m.jsx)(n,{...e,children:(0,m.jsx)(f,{...e})}):f(e)}var m;e((()=>{m=n(),a(),i(),d(),o()}))();export{p as default};