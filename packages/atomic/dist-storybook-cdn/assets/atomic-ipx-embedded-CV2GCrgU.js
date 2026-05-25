import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,t as u}from"./atomic-ipx-embedded.new.stories-p8JO3QG0.js";function d(e){let n={code:`code`,h2:`h2`,li:`li`,p:`p`,pre:`pre`,ul:`ul`,...t(),...e.components};return(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(r,{of:c}),`
`,(0,p.jsxs)(s,{stories:{Default:l},githubPath:`ipx/atomic-ipx-embedded/atomic-ipx-embedded.ts`,tagName:`atomic-ipx-embedded`,className:`AtomicIpxEmbedded`,children:[(0,p.jsxs)(n.p,{children:[`The component must be placed inside an `,(0,p.jsx)(n.code,{children:`atomic-search-interface`}),` and provides three named slots for organizing content:`]}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-search-interface>
  <atomic-ipx-embedded>
    <div slot="header">
      <!-- Search box, tabs, and refine toggle -->
      <atomic-layout-section section="search">
        <atomic-search-box></atomic-search-box>
        <atomic-ipx-refine-toggle></atomic-ipx-refine-toggle>
        <atomic-ipx-tabs>
          <atomic-ipx-tab label="All" expression="" active></atomic-ipx-tab>
          <atomic-ipx-tab label="Articles" expression="@source==Knowledge"></atomic-ipx-tab>
        </atomic-ipx-tabs>
      </atomic-layout-section>
    </div>
    <div slot="body">
      <!-- Query summary, results, and pagination -->
      <atomic-layout-section section="status">
        <atomic-query-summary></atomic-query-summary>
        <atomic-did-you-mean></atomic-did-you-mean>
      </atomic-layout-section>
      <atomic-layout-section section="results">
        <atomic-result-list></atomic-result-list>
      </atomic-layout-section>
      <atomic-layout-section section="pagination">
        <atomic-load-more-results></atomic-load-more-results>
      </atomic-layout-section>
    </div>
    <div slot="footer">
      <!-- Footer links and branding -->
      <a href="https://example.com">View full search</a>
    </div>
  </atomic-ipx-embedded>
</atomic-search-interface>
`})}),(0,p.jsx)(n.h2,{id:`embedded-vs-modal`,children:`Embedded vs Modal`}),(0,p.jsxs)(n.p,{children:[`Use `,(0,p.jsx)(n.code,{children:`atomic-ipx-embedded`}),` when:`]}),(0,p.jsxs)(n.ul,{children:[`
`,(0,p.jsx)(n.li,{children:`The search interface should be persistently visible on the page`}),`
`,(0,p.jsx)(n.li,{children:`You want to embed search within a specific section or container`}),`
`,(0,p.jsx)(n.li,{children:`The search experience is a primary feature of the page`}),`
`]}),(0,p.jsxs)(n.p,{children:[`Use `,(0,p.jsx)(n.code,{children:`atomic-ipx-modal`}),` when:`]}),(0,p.jsxs)(n.ul,{children:[`
`,(0,p.jsx)(n.li,{children:`Search should appear on demand via a button click`}),`
`,(0,p.jsx)(n.li,{children:`You want an overlay experience that doesn't take permanent page space`}),`
`,(0,p.jsx)(n.li,{children:`The search is a secondary feature accessed occasionally`}),`
`]})]})]})}function f(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,p.jsx)(n,{...e,children:(0,p.jsx)(d,{...e})}):d(e)}var p;e((()=>{p=n(),a(),i(),u(),o()}))();export{f as default};