import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{WithAutomaticQueryCorrection as l,WithoutAutomaticQueryCorrection as u,t as d}from"./atomic-did-you-mean.new.stories-kqp72B9x.js";function f(e){let n={code:`code`,em:`em`,p:`p`,pre:`pre`,...t(),...e.components};return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(r,{of:c}),`
`,(0,m.jsxs)(s,{stories:{WithAutomaticQueryCorrection:l,WithoutAutomaticQueryCorrection:u},githubPath:`search/atomic-did-you-mean/atomic-did-you-mean.ts`,tagName:`atomic-did-you-mean`,className:`AtomicDidYouMean`,defaultStory:`WithAutomaticQueryCorrection`,children:[(0,m.jsx)(n.p,{children:`This component is typically placed within the "status" section of the layout.`}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-html`,children:`<atomic-search-interface>
  ...
  <atomic-search-layout>
    ...
    <atomic-layout-section section="main">
      ...
      <atomic-layout-section section="status">
        
        <atomic-did-you-mean></atomic-did-you-mean>

      </atomic-layout-section>
    </atomic-layout-section>
  </atomic-search-layout>
</atomic-search-interface>
`})}),(0,m.jsxs)(n.p,{children:[`Using the `,(0,m.jsx)(n.em,{children:`Did You Mean`}),` component with your search page is a best practice, especially if your index has search terms that can be misinterpreted as an error.
The relevance of the corrections improves with the size of the index, as more terms become available for comparison.`]}),(0,m.jsxs)(n.p,{children:[`It's possible to define certain phrases or terms in an organization’s thesaurus, which will expand or replace the query expression before executing the query.
However, the `,(0,m.jsx)(n.em,{children:`Did You Mean`}),` component won’t process queries expanded by the thesaurus.`]})]})]})}function p(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,m.jsx)(n,{...e,children:(0,m.jsx)(f,{...e})}):f(e)}var m;e((()=>{m=n(),a(),i(),d(),o()}))();export{p as default};