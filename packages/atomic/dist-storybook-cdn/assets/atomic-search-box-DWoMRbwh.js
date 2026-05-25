import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,RichSearchBox as u,StandaloneSearchBox as d,t as f}from"./atomic-search-box.new.stories-DDS0879g.js";function p(e){let n={a:`a`,code:`code`,h2:`h2`,li:`li`,p:`p`,pre:`pre`,ul:`ul`,...t(),...e.components};return(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(r,{of:c}),`
`,(0,h.jsxs)(s,{stories:{Default:l,RichSearchBox:u,StandaloneSearchBox:d},githubPath:`search/atomic-search-box/atomic-search-box.ts`,tagName:`atomic-search-box`,className:`AtomicSearchBox`,children:[(0,h.jsx)(n.p,{children:`This component is typically placed within the "search" section of the layout.`}),(0,h.jsx)(n.pre,{children:(0,h.jsx)(n.code,{className:`language-html`,children:`<atomic-search-interface>
  ...
  <atomic-search-layout>
    ...
    <atomic-layout-section section="search">

        <atomic-search-box></atomic-search-box>

    </atomic-layout-section>
  </atomic-search-layout>
</atomic-search-interface>
`})}),(0,h.jsxs)(n.p,{children:[`By default, `,(0,h.jsx)(n.a,{href:`/docs/atomic-search-box-recent-queries--docs`,children:`atomic-search-box-recent-queries`}),` and `,(0,h.jsx)(n.a,{href:`/docs/atomic-search-box-query-suggestions--docs`,children:`atomic-search-box-query-suggestions`}),` are enabled.
You can include them inside the search box to customize their properties.`]}),(0,h.jsxs)(n.p,{children:[`To enable instant results, you must explicitly include the `,(0,h.jsx)(n.a,{href:`/docs/atomic-search-box-instant-results--docs`,children:`atomic-search-box-instant-results`}),` component inside the search box.`]}),(0,h.jsx)(n.pre,{children:(0,h.jsx)(n.code,{className:`language-html`,children:`<atomic-search-box>
  <atomic-search-box-recent-queries max-queries="8"></atomic-search-box-recent-queries>
  <atomic-search-box-query-suggestions max-suggestions="6"></atomic-search-box-query-suggestions>
  <atomic-search-box-instant-results image-size="small">
    <atomic-result-template>
       ...
    </atomic-result-template>
  </atomic-search-box-instant-results>
</atomic-search-box>
`})}),(0,h.jsx)(n.h2,{id:`standalone-search-box`,children:`Standalone Search Box`}),(0,h.jsxs)(n.p,{children:[`You can use the `,(0,h.jsx)(n.code,{children:`atomic-search-box`}),` as a standalone search box by setting the `,(0,h.jsx)(n.code,{children:`redirection-url`}),` property. This allows you to use the search box on a page that is not a search results page.`]}),(0,h.jsx)(n.pre,{children:(0,h.jsx)(n.code,{className:`language-html`,children:`<atomic-search-box redirection-url="/search"></atomic-search-box>
`})}),(0,h.jsxs)(n.p,{children:[`When a user submits a query in the standalone search box, they will be redirected to the URL specified in the `,(0,h.jsx)(n.code,{children:`redirection-url`}),` property with the query parameters appended.`]}),(0,h.jsx)(n.h2,{id:`ux-best-practices`,children:`UX Best Practices`}),(0,h.jsxs)(n.ul,{children:[`
`,(0,h.jsx)(n.li,{children:`The search box should be visible and clear to users, with best practices suggesting placement in the top-center or upper-right section of the page.`}),`
`]}),(0,h.jsx)(n.h2,{id:`reference`,children:`Reference`}),(0,h.jsxs)(n.p,{children:[(0,h.jsx)(n.a,{href:`https://source.coveo.com/2017/09/06/search-best-practices-1/`,rel:`nofollow`,children:`Search Best Practices Part 1 - The Search Box^`}),`
`,(0,h.jsx)(n.a,{href:`https://www.nngroup.com/articles/search-visible-and-simple/`,rel:`nofollow`,children:`Search: Visible and Simple^`})]})]})]})}function m(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,h.jsx)(n,{...e,children:(0,h.jsx)(p,{...e})}):p(e)}var h;e((()=>{h=n(),a(),i(),f(),o()}))();export{m as default};