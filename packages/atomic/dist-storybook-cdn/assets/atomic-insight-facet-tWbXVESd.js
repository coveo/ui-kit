import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{AsBox as l,AsLink as u,Collapsed as d,Default as f,WithExclusion as p,WithSelectedValue as m,t as h}from"./atomic-insight-facet.new.stories-DhIwnvr6.js";function g(e){let n={a:`a`,code:`code`,h2:`h2`,h3:`h3`,li:`li`,p:`p`,pre:`pre`,ul:`ul`,...t(),...e.components};return(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(r,{of:c}),`
`,(0,v.jsxs)(s,{stories:{Default:f,AsLink:u,AsBox:l,WithExclusion:p,WithSelectedValue:m,Collapsed:d},githubPath:`insight/atomic-insight-facet/atomic-insight-facet.ts`,tagName:`atomic-insight-facet`,className:`AtomicInsightFacet`,children:[(0,v.jsx)(n.p,{children:`This component displays a facet of the results for the current query in an Insight interface.
A facet is a list of values for a certain field occurring in the results, ordered using a configurable criteria (for example, number of occurrences).`}),(0,v.jsx)(n.p,{children:`This component is typically placed within the "facets" section of the layout.`}),(0,v.jsx)(n.pre,{children:(0,v.jsx)(n.code,{className:`language-html`,children:`<atomic-insight-interface>
  <atomic-insight-layout>
    <atomic-layout-section section="facets">
      <atomic-insight-facet field="objecttype" label="Type"></atomic-insight-facet>
    </atomic-layout-section>
  </atomic-insight-layout>
</atomic-insight-interface>
`})}),(0,v.jsx)(n.h3,{id:`display-options`,children:`Display Options`}),(0,v.jsxs)(n.p,{children:[`The facet component supports three different display modes by setting the `,(0,v.jsx)(n.code,{children:`display-values-as`}),` attribute:`]}),(0,v.jsxs)(n.ul,{children:[`
`,(0,v.jsxs)(n.li,{children:[(0,v.jsx)(n.code,{children:`checkbox`}),` (default): Display facets as checkboxes.
This is the most commonly used display and allows multiple selections.`]}),`
`,(0,v.jsxs)(n.li,{children:[(0,v.jsx)(n.code,{children:`link`}),`: Display facets as links.
Single selection only, behaves like navigational links.`]}),`
`,(0,v.jsxs)(n.li,{children:[(0,v.jsx)(n.code,{children:`box`}),`: Display facets as boxes.
Multi-select with a more visual appearance, presents more values in compact space.`]}),`
`]}),(0,v.jsx)(n.h3,{id:`exclusion`,children:`Exclusion`}),(0,v.jsxs)(n.p,{children:[`You can enable facet value exclusion by setting the `,(0,v.jsx)(n.code,{children:`enable-exclusion`}),` attribute to `,(0,v.jsx)(n.code,{children:`true`}),`.
This allows users to exclude specific facet values from the results.`]}),(0,v.jsx)(n.h3,{id:`common-use-cases`,children:`Common Use Cases`}),(0,v.jsx)(n.p,{children:`Facets are useful for large indexes because they provide multiple filters, one for every specific aspect of the content.
Faceted navigation helps the user get an overview of the content available, helping them understand how to search for it.`}),(0,v.jsx)(n.p,{children:`In an Insight interface, facets help users filter case data, documents, or other content types to find specific information quickly.`}),(0,v.jsx)(n.h2,{id:`ux-best-practices`,children:`UX Best Practices`}),(0,v.jsxs)(n.ul,{children:[`
`,(0,v.jsxs)(n.li,{children:[`If your facet values are long, consider setting `,(0,v.jsx)(n.code,{children:`display-values-as`}),` to `,(0,v.jsx)(n.code,{children:`link`}),`.
Otherwise you risk truncating values when they are displayed to users.`]}),`
`,(0,v.jsxs)(n.li,{children:[`It's recommended to use `,(0,v.jsx)(n.code,{children:`<atomic-layout-section section="facets">`}),` to control the display of your facets, which will place facets on the left side
of the page.`]}),`
`,(0,v.jsx)(n.li,{children:`Use meaningful labels that clearly describe the type of filter being applied.`}),`
`]}),(0,v.jsx)(n.h2,{id:`reference`,children:`Reference`}),(0,v.jsxs)(n.p,{children:[(0,v.jsx)(n.a,{href:`https://source.coveo.com/2018/04/18/facets/`,rel:`nofollow`,children:`Don't Lose Face with Facets`}),`.`]})]})]})}function _(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,v.jsx)(n,{...e,children:(0,v.jsx)(g,{...e})}):g(e)}var v;e((()=>{v=n(),a(),i(),h(),o()}))();export{_ as default};