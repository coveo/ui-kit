import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Collapsed as l,Default as u,DisplayAsLink as d,WithInputInteger as f,WithSelectedValue as p,t as m}from"./atomic-insight-numeric-facet.new.stories-Rhlc-5GW.js";function h(e){let n={a:`a`,code:`code`,h2:`h2`,li:`li`,p:`p`,pre:`pre`,ul:`ul`,...t(),...e.components};return(0,_.jsxs)(_.Fragment,{children:[(0,_.jsx)(r,{of:c}),`
`,(0,_.jsxs)(s,{stories:{Default:u,WithInputInteger:f,DisplayAsLink:d,Collapsed:l,WithSelectedValue:p},githubPath:`insight/atomic-insight-numeric-facet/atomic-insight-numeric-facet.ts`,tagName:`atomic-insight-numeric-facet`,className:`AtomicInsightNumericFacet`,children:[(0,_.jsx)(n.p,{children:`This component displays numeric ranges as checkboxes or links for the Insight interface, commonly used for filtering by numeric fields such as view counts, ratings, or other quantifiable metrics.`}),(0,_.jsx)(n.pre,{children:(0,_.jsx)(n.code,{className:`language-html`,children:`<atomic-insight-interface>
  ...
  <atomic-insight-layout>
    <atomic-layout-section section="facets">
      <atomic-facet-manager>

        <atomic-insight-numeric-facet
          field="ytviewcount"
          label="View Count"
          with-input="integer"
        ></atomic-insight-numeric-facet>

      </atomic-facet-manager>
    </atomic-layout-section>
  </atomic-insight-layout>
</atomic-insight-interface>
`})}),(0,_.jsx)(n.h2,{id:`ux-best-practices`,children:`UX Best Practices`}),(0,_.jsxs)(n.ul,{children:[`
`,(0,_.jsx)(n.li,{children:`Checkboxes let users select multiple values and are the most commonly used selection, being more visual and presenting more values in small spaces.`}),`
`,(0,_.jsx)(n.li,{children:`Links allow the user to select only one value at a time, behaving like a normal navigational link.`}),`
`,(0,_.jsx)(n.li,{children:`Best used in cases where the value has units, such as height, width, screen sizes, view counts, etc.`}),`
`]}),(0,_.jsx)(n.h2,{id:`reference`,children:`Reference`}),(0,_.jsx)(n.p,{children:(0,_.jsx)(n.a,{href:`https://source.coveo.com/2018/04/18/facets/`,rel:`nofollow`,children:`Don't Lose Face with Facets`})})]})]})}function g(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,_.jsx)(n,{...e,children:(0,_.jsx)(h,{...e})}):h(e)}var _;e((()=>{_=n(),a(),i(),m(),o()}))();export{g as default};