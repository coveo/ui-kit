import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,WithSelectedChildValue as u,WithSelectedChildValueAndMoreAvailable as d,WithSelectedRootValue as f,t as p}from"./atomic-category-facet.new.stories-CYGRHcUF.js";function m(e){let n={a:`a`,code:`code`,em:`em`,h2:`h2`,h3:`h3`,li:`li`,ol:`ol`,p:`p`,pre:`pre`,ul:`ul`,...t(),...e.components};return(0,g.jsxs)(g.Fragment,{children:[(0,g.jsx)(r,{of:c}),`
`,(0,g.jsxs)(s,{stories:{Default:l,WithSelectedRootValue:f,WithSelectedChildValue:u,WithSelectedChildValueAndMoreAvailable:d},githubPath:`search/atomic-category-facet/atomic-category-facet.ts`,tagName:`atomic-category-facet`,className:`AtomicCategoryFacet`,children:[(0,g.jsx)(n.p,{children:`Use this component to display hierarchical facet values in a navigable tree structure. Category facets are ideal for taxonomies like product categories, geographical locations, or organizational hierarchies where values have parent-child relationships.`}),(0,g.jsxs)(n.p,{children:[`Place this component within the "facets" section of your search layout. For Dynamic Navigation Experience (DNE) support, nest it inside an `,(0,g.jsx)(n.code,{children:`atomic-facet-manager`}),` component (see `,(0,g.jsx)(n.a,{href:`https://docs.coveo.com/en/2918`,rel:`nofollow`,children:`DNE documentation`}),`).`]}),(0,g.jsx)(n.pre,{children:(0,g.jsx)(n.code,{className:`language-html`,children:`<atomic-search-interface>
  ...
  <atomic-search-layout>
    ...
    <atomic-layout-section section="facets">
      ...
        <atomic-category-facet field="geographicalhierarchy" label="Location"></atomic-category-facet>

    </atomic-layout-section>
  </atomic-search-layout>
</atomic-search-interface>
`})}),(0,g.jsx)(n.h2,{id:`hierarchical-navigation`,children:`Hierarchical Navigation`}),(0,g.jsx)(n.p,{children:`The category facet allows users to drill down through levels of a hierarchy:`}),(0,g.jsxs)(n.ol,{children:[`
`,(0,g.jsx)(n.li,{children:`Initially, only root-level values are displayed`}),`
`,(0,g.jsx)(n.li,{children:`Selecting a value shows its child values`}),`
`,(0,g.jsx)(n.li,{children:`Breadcrumb navigation allows users to navigate back up the hierarchy`}),`
`,(0,g.jsx)(n.li,{children:`An "All Categories" button resets to the root level`}),`
`]}),(0,g.jsx)(n.h2,{id:`facet-search`,children:`Facet Search`}),(0,g.jsx)(n.p,{children:`Enable facet search to allow users to find values across all levels of the hierarchy:`}),(0,g.jsx)(n.pre,{children:(0,g.jsx)(n.code,{className:`language-html`,children:`<atomic-category-facet 
  field="geographicalhierarchy" 
  label="Location"
  with-search
></atomic-category-facet>
`})}),(0,g.jsx)(n.p,{children:`Search results display the full path to each matching value, helping users understand where values exist in the hierarchy.`}),(0,g.jsx)(n.h2,{id:`customizing-the-all-categories-label`,children:`Customizing the "All Categories" Label`}),(0,g.jsx)(n.p,{children:`You can customize the "All Categories" button label using i18n. The component looks for translation keys in this order:`}),(0,g.jsxs)(n.ol,{children:[`
`,(0,g.jsxs)(n.li,{children:[(0,g.jsx)(n.code,{children:`all-categories-{facet-id}`}),` - Custom label for a specific facet by ID`]}),`
`,(0,g.jsxs)(n.li,{children:[(0,g.jsx)(n.code,{children:`all-categories-{field}`}),` - Custom label for facets using a specific field`]}),`
`,(0,g.jsxs)(n.li,{children:[(0,g.jsx)(n.code,{children:`all-categories`}),` - Default fallback`]}),`
`]}),(0,g.jsx)(n.pre,{children:(0,g.jsx)(n.code,{className:`language-javascript`,children:`// Customize by facet ID
searchInterface.i18n.addResourceBundle('en', 'translation', {
  'all-categories-my-location-facet': 'All Locations'
});

// Or customize by field
searchInterface.i18n.addResourceBundle('en', 'translation', {
  'all-categories-geographicalhierarchy': 'All Regions'
});
`})}),(0,g.jsx)(n.h2,{id:`ux-best-practices`,children:`UX Best Practices`}),(0,g.jsxs)(n.ul,{children:[`
`,(0,g.jsxs)(n.li,{children:[`
`,(0,g.jsx)(n.p,{children:`A Category Facet requires a multi-value field whose values are formatted hierarchically. The facet will determine the filter to apply based on the current selected path of values. This can offer a powerful navigational experience, quickly leading a user to relevant results.`}),`
`,(0,g.jsxs)(n.ul,{children:[`
`,(0,g.jsxs)(n.li,{children:[`This component uses `,(0,g.jsx)(n.code,{children:`;`}),` to separate individual values, and the character that's defined with the `,(0,g.jsx)(n.code,{children:`delimiting-character`}),` attribute to separate hierarchical levels within each value. Set this attribute to `,(0,g.jsx)(n.code,{children:`|`}),` instead of using the default, which is `,(0,g.jsx)(n.code,{children:`;`}),`.`]}),`
`,(0,g.jsxs)(n.li,{children:[`The following is an example of the recommended hierarchical formatting: `,(0,g.jsx)(n.code,{children:`clothing; clothing|sale; clothing|sale|shoes; clothing|sale|shoes|kids; clothing|sale|shoes|kids|sneakers;`})]}),`
`]}),`
`]}),`
`,(0,g.jsxs)(n.li,{children:[`
`,(0,g.jsx)(n.p,{children:`It's only possible to select one value at a time in a category facet.
This is because they're meant to ease navigation through their hierarchically organized content, as opposed to applying multiple hierarchical filters.`}),`
`]}),`
`,(0,g.jsxs)(n.li,{children:[`
`,(0,g.jsx)(n.p,{children:`It's best practice to have hierarchies at five levels or less in depth.`}),`
`]}),`
`]}),(0,g.jsx)(n.h3,{id:`use-cases-and-examples`,children:`Use Cases and Examples`}),(0,g.jsxs)(n.p,{children:[`On an ecommerce website, a user may want to start browsing by the category `,(0,g.jsx)(n.em,{children:`Men`}),`, and then narrow their results to `,(0,g.jsx)(n.em,{children:`Bottoms`}),`, then further to `,(0,g.jsx)(n.em,{children:`Pants`}),`, etc.
Instead of selecting the facet value directly, this allows them to navigate hierarchically and determine the right starting point.`]}),(0,g.jsx)(n.h2,{id:`references`,children:`References`}),(0,g.jsxs)(n.p,{children:[(0,g.jsx)(n.a,{href:`https://www.uxmatters.com/mt/archives/2011/08/categories-facetsand-browsable-facets.php`,rel:`nofollow`,children:`Categories, Facets—and Browsable Facets?`}),`
`,(0,g.jsx)(n.a,{href:`https://source.coveo.com/2018/04/18/facets/`,rel:`nofollow`,children:`Don't Lose Face with Facets`})]})]})]})}function h(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,g.jsx)(n,{...e,children:(0,g.jsx)(m,{...e})}):m(e)}var g;e((()=>{g=n(),a(),i(),p(),o()}))();export{h as default};