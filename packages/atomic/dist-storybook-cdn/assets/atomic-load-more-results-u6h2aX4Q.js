import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,t as u}from"./atomic-load-more-results.new.stories-w-52sR2q.js";function d(e){let n={a:`a`,code:`code`,h2:`h2`,h3:`h3`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,ul:`ul`,...t(),...e.components};return(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(r,{of:c}),`
`,(0,p.jsxs)(s,{stories:{Default:l},githubPath:`search/atomic-load-more-results/atomic-load-more-results.ts`,tagName:`atomic-load-more-results`,className:`AtomicLoadMoreResults`,children:[(0,p.jsx)(n.p,{children:`This component is typically placed within the "pagination" section of the layout.`}),(0,p.jsxs)(n.p,{children:[(0,p.jsx)(n.strong,{children:`Note:`}),` Use either `,(0,p.jsx)(n.code,{children:`atomic-load-more-results`}),` OR `,(0,p.jsx)(n.code,{children:`atomic-pager`}),` for pagination, but not both. These components provide alternative pagination approaches:`]}),(0,p.jsxs)(n.ul,{children:[`
`,(0,p.jsxs)(n.li,{children:[(0,p.jsx)(n.code,{children:`atomic-pager`}),`: Provides traditional page-based navigation with numbered pages. It is often used along with the `,(0,p.jsx)(n.code,{children:`atomic-results-per-page`}),` component.`]}),`
`,(0,p.jsxs)(n.li,{children:[(0,p.jsx)(n.code,{children:`atomic-load-more-results`}),`: Allows users to incrementally load additional results with a "Load More" button.`]}),`
`]}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-search-interface>
  ...
  <atomic-search-layout>
    ...
    <atomic-layout-section section="main">
      ...
      <atomic-layout-section section="pagination">
        
        <atomic-load-more-results></atomic-load-more-results>

      </atomic-layout-section>
    </atomic-layout-section>
  </atomic-search-layout>
</atomic-search-interface>
`})}),(0,p.jsx)(n.h2,{id:`ux-best-practices`,children:`UX Best Practices`}),(0,p.jsx)(n.h3,{id:`usage-notes`,children:`Usage Notes`}),(0,p.jsxs)(n.ul,{children:[`
`,(0,p.jsx)(n.li,{children:`The Load More Results component is especially useful when you want your user to browse more results, rather than return to and refine facets or reconsider their query.`}),`
`,(0,p.jsx)(n.li,{children:`Users browse longer than with Load More than with Pagination.`}),`
`,(0,p.jsx)(n.li,{children:`Load More is less effective when the items in a source are highly specific or when they require comparison.`}),`
`]}),(0,p.jsx)(n.h3,{id:`use-cases-and-examples`,children:`Use Cases and Examples`}),(0,p.jsxs)(n.ul,{children:[`
`,(0,p.jsx)(n.li,{children:`On an ecommerce site, users will often view more products using a Load More button than with a Pager.`}),`
`,(0,p.jsx)(n.li,{children:`When designing for mobile, a Load More button can provide a better experience for many users.`}),`
`]}),(0,p.jsx)(n.h2,{id:`reference`,children:`Reference`}),(0,p.jsx)(n.p,{children:(0,p.jsx)(n.a,{href:`https://crocoblock.com/blog/pagination-vs-infinite-scroll/`,rel:`nofollow`,children:`Pagination vs. Infinite Scroll vs. Load More Explained`})})]})]})}function f(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,p.jsx)(n,{...e,children:(0,p.jsx)(d,{...e})}):d(e)}var p;e((()=>{p=n(),a(),i(),u(),o()}))();export{f as default};