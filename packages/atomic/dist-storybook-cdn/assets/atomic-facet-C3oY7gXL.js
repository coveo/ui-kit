import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{CustomSort as l,Default as u,LowFacetValues as d,monthFacet as f,t as p}from"./atomic-facet.new.stories-DSIg0IeB.js";function m(e){let n={a:`a`,code:`code`,h2:`h2`,h3:`h3`,li:`li`,p:`p`,pre:`pre`,ul:`ul`,...t(),...e.components};return(0,g.jsxs)(g.Fragment,{children:[(0,g.jsx)(r,{of:c}),`
`,(0,g.jsxs)(s,{stories:{Default:u,LowFacetValues:d,monthFacet:f,CustomSort:l},githubPath:`search/facets/atomic-facet/atomic-facet.ts`,tagName:`atomic-facet`,className:`AtomicFacet`,children:[(0,g.jsx)(n.p,{children:`This component is typically placed within the "facets" section of the layout.`}),(0,g.jsxs)(n.p,{children:[`You can also place facets inside an `,(0,g.jsx)(n.code,{children:`atomic-facet-manager`}),` component to ensure the effective functioning of DNE (Dynamic Navigation Experience).
More info here: `,(0,g.jsx)(n.a,{href:`https://docs.coveo.com/en/2918`,rel:`nofollow`,children:`atomic-facet-manager`}),`.`]}),(0,g.jsx)(n.pre,{children:(0,g.jsx)(n.code,{className:`language-html`,children:`<atomic-search-interface>
  ...
  <atomic-search-layout>
    ...
    <atomic-layout-section section="facets">
      ...
        <atomic-facet field="author" label="Authors"></atomic-facet>

    </atomic-layout-section>
  </atomic-search-layout>
</atomic-search-interface>
`})}),(0,g.jsx)(n.h3,{id:`display-options`,children:`Display Options`}),(0,g.jsxs)(n.p,{children:[`The facet component supports three different display modes by setting the `,(0,g.jsx)(n.code,{children:`display-value-as`}),` attribute:`]}),(0,g.jsxs)(n.ul,{children:[`
`,(0,g.jsxs)(n.li,{children:[(0,g.jsx)(n.code,{children:`checkbox`}),` (default): Display facets as checkboxes.
This is the most commonly used display and itallows multiple selections.`]}),`
`,(0,g.jsxs)(n.li,{children:[(0,g.jsx)(n.code,{children:`link`}),`: Display facets as links.
Single selection only, behaves like navigational links.`]}),`
`,(0,g.jsxs)(n.li,{children:[(0,g.jsx)(n.code,{children:`box`}),`: Display facets as boxes.
Multi-select with a more visual appearance, presents more values in compact space.`]}),`
`]}),(0,g.jsx)(n.h3,{id:`common-use-cases`,children:`Common Use Cases`}),(0,g.jsx)(n.p,{children:`Facets are useful for large indexes because they provide multiple filters, one for every specific aspect of the content.
Faceted navigation helps the user get an overview of the content available, helping them understand how to search for it.`}),(0,g.jsx)(n.h2,{id:`ux-best-practices`,children:`UX Best Practices`}),(0,g.jsxs)(n.ul,{children:[`
`,(0,g.jsxs)(n.li,{children:[`If you facet values are are long, consider setting `,(0,g.jsx)(n.code,{children:`display-values-as`}),` to `,(0,g.jsx)(n.code,{children:`link`}),`.
Otherwise you you risk truncating values when they are displayed to users.`]}),`
`,(0,g.jsxs)(n.li,{children:[`It's recommended to use `,(0,g.jsx)(n.code,{children:`<atomic-layout-section section="facets">`}),` to control the display of your facets, which will place facets on the left side
of the search page.`]}),`
`,(0,g.jsx)(n.li,{children:`Enabling facet search can help find specific values inside larger sets.`}),`
`]}),(0,g.jsx)(n.h2,{id:`reference`,children:`Reference`}),(0,g.jsxs)(n.p,{children:[(0,g.jsx)(n.a,{href:`https://source.coveo.com/2018/04/18/facets/`,rel:`nofollow`,children:`Don’t Lose Face with Facets`}),`.`]})]})]})}function h(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,g.jsx)(n,{...e,children:(0,g.jsx)(m,{...e})}):m(e)}var g;e((()=>{g=n(),a(),i(),p(),o()}))();export{h as default};