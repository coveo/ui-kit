import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{CustomIcon as l,Default as u,WithACustomNumberOfPages as d,t as f}from"./atomic-pager.new.stories-sRN0Hm1h.js";function p(e){let n={code:`code`,h2:`h2`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,ul:`ul`,...t(),...e.components};return(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(r,{of:c}),`
`,(0,h.jsxs)(s,{stories:{Default:u,CustomIcon:l,WithACustomNumberOfPages:d},githubPath:`search/atomic-pager/atomic-pager.ts`,tagName:`atomic-pager`,className:`AtomicPager`,children:[(0,h.jsxs)(n.p,{children:[`The `,(0,h.jsx)(n.code,{children:`atomic-pager`}),` component provides buttons that allow the end user to navigate through the different result pages.`]}),(0,h.jsxs)(n.p,{children:[`This component should be placed within an `,(0,h.jsx)(n.code,{children:`atomic-search-interface`}),` component, usually in the "pagination" section of the layout.`]}),(0,h.jsxs)(n.p,{children:[(0,h.jsx)(n.strong,{children:`Note:`}),` Use either `,(0,h.jsx)(n.code,{children:`atomic-pager`}),` OR `,(0,h.jsx)(n.code,{children:`atomic-load-more-results`}),` for pagination, but not both. These components provide alternative pagination approaches:`]}),(0,h.jsxs)(n.ul,{children:[`
`,(0,h.jsxs)(n.li,{children:[(0,h.jsx)(n.code,{children:`atomic-pager`}),`: Provides traditional page-based navigation with numbered pages. It is often used along with the `,(0,h.jsx)(n.code,{children:`atomic-results-per-page`}),` component.`]}),`
`,(0,h.jsxs)(n.li,{children:[(0,h.jsx)(n.code,{children:`atomic-load-more-results`}),`: Allows users to incrementally load additional results with a "Load More" button.`]}),`
`]}),(0,h.jsx)(n.pre,{children:(0,h.jsx)(n.code,{className:`language-html`,children:`<atomic-search-interface>
  ...
  <atomic-search-layout>
    ...
    <atomic-layout-section section="main">
      ...
      <atomic-layout-section section="pagination">

        <atomic-pager></atomic-pager>

      </atomic-layout-section>
    </atomic-layout-section>
  </atomic-search-layout>
</atomic-search-interface>
`})}),(0,h.jsx)(n.h2,{id:`customization`,children:`Customization`}),(0,h.jsx)(n.p,{children:`You can customize the number of page buttons displayed and the icons used for the previous/next buttons:`}),(0,h.jsx)(n.pre,{children:(0,h.jsx)(n.code,{className:`language-html`,children:`<atomic-pager 
  number-of-pages="7" 
  previous-button-icon="assets://chevron-left.svg"
  next-button-icon="assets://chevron-right.svg">
</atomic-pager>
`})}),(0,h.jsx)(n.p,{children:`The component automatically hides when there are no search results or when there's an error state.`})]})]})}function m(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,h.jsx)(n,{...e,children:(0,h.jsx)(p,{...e})}):p(e)}var h;e((()=>{h=n(),a(),i(),f(),o()}))();export{m as default};