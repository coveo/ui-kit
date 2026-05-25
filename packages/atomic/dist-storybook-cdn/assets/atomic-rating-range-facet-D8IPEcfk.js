import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,t as u}from"./atomic-rating-range-facet.new.stories-v81ujpKm.js";function d(e){let n={code:`code`,h2:`h2`,h3:`h3`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,ul:`ul`,...t(),...e.components};return(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(r,{of:c}),`
`,(0,p.jsxs)(s,{stories:{Default:l},githubPath:`search/facets/atomic-rating-range-facet/atomic-rating-range-facet.ts`,tagName:`atomic-rating-range-facet`,className:`AtomicRatingRangeFacet`,children:[(0,p.jsxs)(n.p,{children:[`The `,(0,p.jsx)(n.code,{children:`atomic-rating-range-facet`}),` component displays a facet of the results for the current query as star ratings. It allows users to filter results based on rating ranges (e.g., "4 and up", "3 and up").`]}),(0,p.jsx)(n.p,{children:`This component only supports numeric fields and is designed to work with rating data typically stored as numeric values (e.g., 1-5 stars).`}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-search-interface>
  ...
  <atomic-search-layout>
    <atomic-layout-section section="facets">
      
      <atomic-rating-range-facet
        field="rating"
        label="Customer Rating"
        number-of-intervals="5">
      </atomic-rating-range-facet>
      
    </atomic-layout-section>
    ...
  </atomic-search-layout>
</atomic-search-interface>
`})}),(0,p.jsx)(n.h2,{id:`key-features`,children:`Key Features`}),(0,p.jsxs)(n.ul,{children:[`
`,(0,p.jsxs)(n.li,{children:[(0,p.jsx)(n.strong,{children:`Visual Rating Display`}),`: Shows ratings as star icons for intuitive user understanding`]}),`
`,(0,p.jsxs)(n.li,{children:[(0,p.jsx)(n.strong,{children:`Range-Based Filtering`}),`: Provides "and up" filtering (e.g., "4 stars and up")`]}),`
`,(0,p.jsxs)(n.li,{children:[(0,p.jsx)(n.strong,{children:`Customizable Intervals`}),`: Configure the number of rating levels to display`]}),`
`,(0,p.jsxs)(n.li,{children:[(0,p.jsx)(n.strong,{children:`Custom Icons`}),`: Use custom SVG icons instead of default stars`]}),`
`,(0,p.jsxs)(n.li,{children:[(0,p.jsx)(n.strong,{children:`Tab Integration`}),`: Show/hide facet based on active tabs`]}),`
`,(0,p.jsxs)(n.li,{children:[(0,p.jsx)(n.strong,{children:`Conditional Display`}),`: Show facet based on other facet selections using `,(0,p.jsx)(n.code,{children:`depends-on`})]}),`
`]}),(0,p.jsx)(n.h2,{id:`configuration`,children:`Configuration`}),(0,p.jsx)(n.h3,{id:`basic-configuration`,children:`Basic Configuration`}),(0,p.jsxs)(n.p,{children:[`The `,(0,p.jsx)(n.code,{children:`field`}),` attribute specifies which numeric field in your index contains the rating data:`]}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-rating-range-facet
  field="snrating"
  label="Star Rating">
</atomic-rating-range-facet>
`})}),(0,p.jsx)(n.h3,{id:`customizing-rating-levels`,children:`Customizing Rating Levels`}),(0,p.jsx)(n.p,{children:`Control the number of rating levels and the maximum/minimum values:`}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-rating-range-facet
  field="rating"
  number-of-intervals="5"
  max-value-in-index="5"
  min-value-in-index="1">
</atomic-rating-range-facet>
`})}),(0,p.jsxs)(n.ul,{children:[`
`,(0,p.jsxs)(n.li,{children:[(0,p.jsx)(n.strong,{children:(0,p.jsx)(n.code,{children:`number-of-intervals`})}),`: Number of rating options to display (default: 5)`]}),`
`,(0,p.jsxs)(n.li,{children:[(0,p.jsx)(n.strong,{children:(0,p.jsx)(n.code,{children:`max-value-in-index`})}),`: Maximum rating value in your data (default: same as `,(0,p.jsx)(n.code,{children:`number-of-intervals`}),`)`]}),`
`,(0,p.jsxs)(n.li,{children:[(0,p.jsx)(n.strong,{children:(0,p.jsx)(n.code,{children:`min-value-in-index`})}),`: Minimum rating value in your data (default: 1)`]}),`
`]}),(0,p.jsx)(n.h3,{id:`custom-icons`,children:`Custom Icons`}),(0,p.jsx)(n.p,{children:`Replace the default star icon with a custom SVG:`}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-rating-range-facet
  field="rating"
  icon="assets://heart.svg">
</atomic-rating-range-facet>
`})}),(0,p.jsx)(n.p,{children:`You can use:`}),(0,p.jsxs)(n.ul,{children:[`
`,(0,p.jsxs)(n.li,{children:[`URLs starting with `,(0,p.jsx)(n.code,{children:`http://`}),`, `,(0,p.jsx)(n.code,{children:`https://`}),`, `,(0,p.jsx)(n.code,{children:`./`}),`, or `,(0,p.jsx)(n.code,{children:`../`}),` to load external icons`]}),`
`,(0,p.jsxs)(n.li,{children:[(0,p.jsx)(n.code,{children:`assets://`}),` prefix to use icons from the Atomic package`]}),`
`,(0,p.jsx)(n.li,{children:`Inline SVG strings`}),`
`]}),(0,p.jsxs)(n.p,{children:[`Make sure your custom icon includes `,(0,p.jsx)(n.code,{children:`fill="currentColor"`}),` to allow color customization via CSS variables:`]}),(0,p.jsxs)(n.ul,{children:[`
`,(0,p.jsxs)(n.li,{children:[(0,p.jsx)(n.code,{children:`--atomic-rating-icon-active-color`}),`: Color for filled/active icons`]}),`
`,(0,p.jsxs)(n.li,{children:[(0,p.jsx)(n.code,{children:`--atomic-rating-icon-inactive-color`}),`: Color for unfilled/inactive icons`]}),`
`]}),(0,p.jsx)(n.h3,{id:`tab-based-display`,children:`Tab-Based Display`}),(0,p.jsx)(n.p,{children:`Control which tabs display the facet:`}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<!-- Show only on specific tabs -->
<atomic-rating-range-facet
  field="rating"
  tabs-included='["reviews", "products"]'>
</atomic-rating-range-facet>

<!-- Hide on specific tabs -->
<atomic-rating-range-facet
  field="rating"
  tabs-excluded='["documentation"]'>
</atomic-rating-range-facet>
`})}),(0,p.jsx)(n.h3,{id:`conditional-facets-depends-on`,children:`Conditional Facets (depends-on)`}),(0,p.jsx)(n.p,{children:`Display the facet only when specific values are selected in other facets:`}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-facet facet-id="producttype" field="producttype"></atomic-facet>

<!-- Show rating facet only when "Electronics" is selected -->
<atomic-rating-range-facet
  field="rating"
  depends-on-producttype="Electronics">
</atomic-rating-range-facet>
`})}),(0,p.jsx)(n.h2,{id:`accessibility`,children:`Accessibility`}),(0,p.jsx)(n.p,{children:`The component is built with accessibility in mind:`}),(0,p.jsxs)(n.ul,{children:[`
`,(0,p.jsx)(n.li,{children:`Proper ARIA labels for screen readers`}),`
`,(0,p.jsx)(n.li,{children:`Keyboard navigation support`}),`
`,(0,p.jsx)(n.li,{children:`Focus management for improved usability`}),`
`,(0,p.jsx)(n.li,{children:`High-contrast mode support`}),`
`]}),(0,p.jsx)(n.h2,{id:`performance-considerations`,children:`Performance Considerations`}),(0,p.jsxs)(n.p,{children:[`Use `,(0,p.jsx)(n.code,{children:`injection-depth`}),` to control how many results are scanned when generating facet values. Higher values provide more accurate facet counts but may impact performance:`]}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-rating-range-facet
  field="rating"
  injection-depth="2000">
</atomic-rating-range-facet>
`})}),(0,p.jsx)(n.p,{children:`Default: 1000. Minimum: 0.`})]})]})}function f(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,p.jsx)(n,{...e,children:(0,p.jsx)(d,{...e})}):d(e)}var p;e((()=>{p=n(),a(),i(),u(),o()}))();export{f as default};