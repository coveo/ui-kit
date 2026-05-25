import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Collapsed as l,Default as u,DisplayAsLink as d,WithDependsOn as f,WithInputInteger as p,WithSelectedValue as m,t as h}from"./atomic-numeric-facet.new.stories-FMy3HZCu.js";function g(e){let n={a:`a`,code:`code`,h2:`h2`,li:`li`,p:`p`,pre:`pre`,ul:`ul`,...t(),...e.components};return(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(r,{of:c}),`
`,(0,v.jsxs)(s,{stories:{Default:u,WithInputInteger:p,WithDependsOn:f,DisplayAsLink:d,Collapsed:l,WithSelectedValue:m},githubPath:`search/atomic-numeric-facet/atomic-numeric-facet.ts`,tagName:`atomic-numeric-facet`,className:`AtomicNumericFacet`,children:[(0,v.jsx)(n.p,{children:`This component is typically placed within the "facets" section of the layout. It displays numeric ranges as checkboxes or links, commonly used for filtering by price, ratings, or view counts.`}),(0,v.jsx)(n.pre,{children:(0,v.jsx)(n.code,{className:`language-html`,children:`<atomic-search-interface>
  ...
  <atomic-layout-section section="facets">
    <atomic-facet-manager>

      <atomic-numeric-facet
        field="ec_price"
        label="Price"
        with-input="integer"
      ></atomic-numeric-facet>

    </atomic-facet-manager>
  </atomic-layout-section>
</atomic-search-interface>
`})}),(0,v.jsx)(n.h2,{id:`ux-best-practices`,children:`UX Best Practices`}),(0,v.jsxs)(n.ul,{children:[`
`,(0,v.jsx)(n.li,{children:`Checkboxes let users select multiple values and are the most commonly used selection, being more visual and presenting more values in small spaces.`}),`
`,(0,v.jsx)(n.li,{children:`Links allow the user to select only one value at a time, behaving like a normal navigational link.`}),`
`,(0,v.jsx)(n.li,{children:`Best used in cases where the value has units, such as height, width, screen sizes, etc.`}),`
`]}),(0,v.jsx)(n.h2,{id:`reference`,children:`Reference`}),(0,v.jsx)(n.p,{children:(0,v.jsx)(n.a,{href:`https://source.coveo.com/2018/04/18/facets/`,rel:`nofollow`,children:`Don't Lose Face with Facets`})})]})]})}function _(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,v.jsx)(n,{...e,children:(0,v.jsx)(g,{...e})}):g(e)}var v;e((()=>{v=n(),a(),i(),h(),o()}))();export{_ as default};