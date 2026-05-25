import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,t as u}from"./atomic-insight-smart-snippet.new.stories-BYeDtgQL.js";function d(e){let n={code:`code`,h2:`h2`,h3:`h3`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,ul:`ul`,...t(),...e.components};return(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(r,{of:c}),`
`,(0,p.jsxs)(s,{stories:{Default:l},githubPath:`insight/atomic-insight-smart-snippet/atomic-insight-smart-snippet.ts`,tagName:`atomic-insight-smart-snippet`,className:`AtomicInsightSmartSnippet`,children:[(0,p.jsxs)(n.p,{children:[`The `,(0,p.jsx)(n.code,{children:`atomic-insight-smart-snippet`}),` component displays the excerpt of a document that would be most likely to answer a particular query in an Insight Panel interface. It provides users with quick answers directly in the search results.`]}),(0,p.jsxs)(n.p,{children:[`This component is used within the `,(0,p.jsx)(n.code,{children:`atomic-insight-interface`}),`:`]}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-insight-interface>
  <atomic-insight-layout>
    <atomic-layout-section section="main">
      <atomic-insight-smart-snippet></atomic-insight-smart-snippet>
      <atomic-insight-result-list></atomic-insight-result-list>
    </atomic-layout-section>
  </atomic-insight-layout>
</atomic-insight-interface>
`})}),(0,p.jsx)(n.h2,{id:`features`,children:`Features`}),(0,p.jsxs)(n.ul,{children:[`
`,(0,p.jsxs)(n.li,{children:[(0,p.jsx)(n.strong,{children:`Question Display`}),`: Shows the question that the snippet answers`]}),`
`,(0,p.jsxs)(n.li,{children:[(0,p.jsx)(n.strong,{children:`Answer Excerpt`}),`: Displays the relevant portion of the document with highlighted terms`]}),`
`,(0,p.jsxs)(n.li,{children:[(0,p.jsx)(n.strong,{children:`Source Information`}),`: Links to the source document (URL and title)`]}),`
`,(0,p.jsxs)(n.li,{children:[(0,p.jsx)(n.strong,{children:`User Feedback`}),`: Allows users to like or dislike the answer`]}),`
`,(0,p.jsxs)(n.li,{children:[(0,p.jsx)(n.strong,{children:`Expandable Content`}),`: Shows/hides full answer based on configured heights`]}),`
`]}),(0,p.jsx)(n.h2,{id:`basic-usage`,children:`Basic Usage`}),(0,p.jsx)(n.p,{children:`To add a smart snippet to your interface:`}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-insight-smart-snippet></atomic-insight-smart-snippet>
`})}),(0,p.jsx)(n.h2,{id:`customization`,children:`Customization`}),(0,p.jsx)(n.h3,{id:`heading-level`,children:`Heading Level`}),(0,p.jsx)(n.p,{children:`Set the heading level for the question (from 1 to 5):`}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-insight-smart-snippet heading-level="2"></atomic-insight-smart-snippet>
`})}),(0,p.jsx)(n.h3,{id:`height-configuration`,children:`Height Configuration`}),(0,p.jsx)(n.p,{children:`Control when the "show more/less" buttons appear:`}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-insight-smart-snippet
  maximum-height="250"
  collapsed-height="180"
></atomic-insight-smart-snippet>
`})}),(0,p.jsxs)(n.ul,{children:[`
`,(0,p.jsxs)(n.li,{children:[(0,p.jsx)(n.code,{children:`maximum-height`}),`: Maximum height (in pixels) before the component truncates and shows "show more"`]}),`
`,(0,p.jsxs)(n.li,{children:[(0,p.jsx)(n.code,{children:`collapsed-height`}),`: How much of the answer's height (in pixels) is visible when collapsed`]}),`
`]}),(0,p.jsx)(n.h3,{id:`custom-styling`,children:`Custom Styling`}),(0,p.jsxs)(n.p,{children:[`You can style the snippet content using the `,(0,p.jsx)(n.code,{children:`snippet-style`}),` attribute:`]}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-insight-smart-snippet snippet-style="b { color: blue; }"></atomic-insight-smart-snippet>
`})}),(0,p.jsx)(n.p,{children:`Or apply more complex styles:`}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-insight-smart-snippet
  snippet-style="
    b {
      color: blue;
    }
    a {
      color: darkblue;
      text-decoration: underline;
    }
  "
></atomic-insight-smart-snippet>
`})}),(0,p.jsx)(n.h3,{id:`source-link-attributes`,children:`Source Link Attributes`}),(0,p.jsx)(n.p,{children:`Pass custom attributes to the source links using slots:`}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-insight-smart-snippet>
  <a slot="source-anchor-attributes" target="_blank" rel="noopener"></a>
</atomic-insight-smart-snippet>
`})}),(0,p.jsx)(n.h2,{id:`user-feedback`,children:`User Feedback`}),(0,p.jsx)(n.p,{children:`The component includes a feedback mechanism that allows users to:`}),(0,p.jsxs)(n.ul,{children:[`
`,(0,p.jsx)(n.li,{children:`Like the answer (helpful)`}),`
`,(0,p.jsx)(n.li,{children:`Dislike the answer (not helpful)`}),`
`,(0,p.jsx)(n.li,{children:`Provide detailed feedback when disliking (opens a modal)`}),`
`]}),(0,p.jsx)(n.p,{children:`The feedback is automatically tracked via analytics.`}),(0,p.jsx)(n.h2,{id:`behavior`,children:`Behavior`}),(0,p.jsxs)(n.ul,{children:[`
`,(0,p.jsx)(n.li,{children:`The component only appears when a smart snippet answer is found for the query`}),`
`,(0,p.jsx)(n.li,{children:`Inline links in the answer are tracked when clicked`}),`
`,(0,p.jsx)(n.li,{children:`The answer can be expanded/collapsed if it exceeds the configured height`}),`
`,(0,p.jsx)(n.li,{children:`User feedback state is preserved within the same search session`}),`
`]})]})]})}function f(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,p.jsx)(n,{...e,children:(0,p.jsx)(d,{...e})}):d(e)}var p;e((()=>{p=n(),a(),i(),u(),o()}))();export{f as default};