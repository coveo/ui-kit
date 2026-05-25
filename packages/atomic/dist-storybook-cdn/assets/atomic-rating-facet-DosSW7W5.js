import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,DisplayAsLink as u,t as d}from"./atomic-rating-facet.new.stories-CPhSCnVk.js";function f(e){let n={a:`a`,code:`code`,h2:`h2`,h3:`h3`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,ul:`ul`,...t(),...e.components};return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(r,{of:c}),`
`,(0,m.jsxs)(s,{stories:{Default:l,DisplayAsLink:u},githubPath:`search/facets/atomic-rating-facet/atomic-rating-facet.ts`,tagName:`atomic-rating-facet`,className:`AtomicRatingFacet`,children:[(0,m.jsxs)(n.p,{children:[`The `,(0,m.jsx)(n.code,{children:`atomic-rating-facet`}),` component displays facet values as star ratings, making it ideal for rating fields in your search results. It supports numeric fields and displays values as configurable star ratings.`]}),(0,m.jsx)(n.p,{children:`This component is typically placed within the "facets" section of the search interface layout.`}),(0,m.jsxs)(n.p,{children:[`You can also place rating facets inside an `,(0,m.jsx)(n.code,{children:`atomic-facet-manager`}),` component to ensure the effective functioning of DNE (Dynamic Navigation Experience).
More info here: `,(0,m.jsx)(n.a,{href:`https://docs.coveo.com/en/2918`,rel:`nofollow`,children:`atomic-facet-manager`}),`.`]}),(0,m.jsx)(n.h2,{id:`key-features`,children:`Key Features`}),(0,m.jsxs)(n.ul,{children:[`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.strong,{children:`Star Rating Display`}),`: Visualizes numeric values as star ratings`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.strong,{children:`Flexible Display Modes`}),`: Support for checkbox (multi-select) or link (single-select) modes`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.strong,{children:`Customizable Icons`}),`: Use custom SVG icons for rating display`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.strong,{children:`Configurable Intervals`}),`: Set the number of rating intervals and their range`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.strong,{children:`Tab Integration`}),`: Support for included/excluded tabs`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.strong,{children:`Facet Dependencies`}),`: Can depend on other facet selections`]}),`
`]}),(0,m.jsx)(n.h2,{id:`basic-usage`,children:`Basic Usage`}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-html`,children:`<atomic-search-interface>
  ...
  <atomic-search-layout>
    ...
    <atomic-layout-section section="facets">
      ...
        <atomic-rating-facet field="snrating" label="Rating"></atomic-rating-facet>

    </atomic-layout-section>
  </atomic-search-layout>
</atomic-search-interface>
`})}),(0,m.jsx)(n.h2,{id:`display-modes`,children:`Display Modes`}),(0,m.jsx)(n.h3,{id:`checkbox-mode-default`,children:`Checkbox Mode (Default)`}),(0,m.jsx)(n.p,{children:`Allows multiple rating selections:`}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-html`,children:`<atomic-rating-facet 
  field="rating" 
  label="Customer Rating"
  display-values-as="checkbox">
</atomic-rating-facet>
`})}),(0,m.jsx)(n.h3,{id:`link-mode`,children:`Link Mode`}),(0,m.jsx)(n.p,{children:`Allows single rating selection:`}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-html`,children:`<atomic-rating-facet 
  field="rating" 
  label="Customer Rating"
  display-values-as="link">
</atomic-rating-facet>
`})}),(0,m.jsx)(n.h2,{id:`custom-rating-intervals`,children:`Custom Rating Intervals`}),(0,m.jsx)(n.p,{children:`Configure the number of stars and value ranges:`}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-html`,children:`<atomic-rating-facet 
  field="rating" 
  label="Rating"
  number-of-intervals="10"
  max-value-in-index="10"
  min-value-in-index="1">
</atomic-rating-facet>
`})}),(0,m.jsx)(n.h2,{id:`custom-icon`,children:`Custom Icon`}),(0,m.jsx)(n.p,{children:`Use a custom SVG icon for the rating display:`}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-html`,children:`<atomic-rating-facet 
  field="rating" 
  label="Rating"
  icon="<svg>...</svg>">
</atomic-rating-facet>
`})}),(0,m.jsxs)(n.p,{children:[`The custom icon should include `,(0,m.jsx)(n.code,{children:`fill="currentColor"`}),` to properly support active/inactive color states.`]}),(0,m.jsx)(n.h2,{id:`related-components`,children:`Related Components`}),(0,m.jsxs)(n.ul,{children:[`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.strong,{children:(0,m.jsx)(n.a,{href:`/?path=/docs/search-facet--docs`,children:`atomic-facet`})}),` - Standard text facet`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.strong,{children:(0,m.jsx)(n.a,{href:`/?path=/docs/search-numericfacet--docs`,children:`atomic-numeric-facet`})}),` - Numeric range facet`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.strong,{children:(0,m.jsx)(n.a,{href:`https://docs.coveo.com/en/2918`,rel:`nofollow`,children:`atomic-facet-manager`})}),` - Dynamic facet management`]}),`
`]}),(0,m.jsx)(n.h2,{id:`ux-best-practices`,children:`UX Best Practices`}),(0,m.jsxs)(n.ul,{children:[`
`,(0,m.jsx)(n.li,{children:`Use the Rating Facet when social proof is important in guiding the user's decisions.`}),`
`,(0,m.jsx)(n.li,{children:`Ratings help users understand what others think, or how they have rated the item.`}),`
`,(0,m.jsx)(n.li,{children:`The Rating Facet only works with numeric field values.`}),`
`,(0,m.jsx)(n.li,{children:`Don't use a range that's too large, keep it below ten.`}),`
`,(0,m.jsx)(n.li,{children:`A five star rating system is ideal; this is a common system that's familiar to most people.`}),`
`]}),(0,m.jsx)(n.h3,{id:`use-cases-and-examples`,children:`Use Cases and Examples`}),(0,m.jsx)(n.p,{children:`On an ecommerce website, a user may want to filter their results to display only the items that have a rating of four stars or above.`})]})]})}function p(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,m.jsx)(n,{...e,children:(0,m.jsx)(f,{...e})}):f(e)}var m;e((()=>{m=n(),a(),i(),d(),o()}))();export{p as default};