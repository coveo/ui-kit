import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,DisableCitationAnchoring as u,t as d}from"./atomic-insight-generated-answer.new.stories-B6K8JQl4.js";function f(e){let n={a:`a`,code:`code`,h2:`h2`,h3:`h3`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,ul:`ul`,...t(),...e.components};return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(r,{of:c}),`
`,(0,m.jsxs)(s,{stories:{Default:l,DisableCitationAnchoring:u},githubPath:`insight/atomic-insight-generated-answer/atomic-insight-generated-answer.ts`,tagName:`atomic-insight-generated-answer`,className:`AtomicInsightGeneratedAnswer`,children:[(0,m.jsxs)(n.p,{children:[`The `,(0,m.jsx)(n.code,{children:`atomic-insight-generated-answer`}),` component uses Coveo Machine Learning (Coveo ML) models to automatically generate an answer to a query executed by the user within an Insight Panel context. For more information, see `,(0,m.jsx)(n.a,{href:`https://docs.coveo.com/en/n9de0370/`,rel:`nofollow`,children:`About Relevance Generative Answering (RGA)`}),`.`]}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-html`,children:`<atomic-insight-interface>
  ...
  <atomic-insight-layout>
    
    <atomic-insight-generated-answer></atomic-insight-generated-answer>
    
  </atomic-insight-layout>
</atomic-insight-interface>
`})}),(0,m.jsx)(n.h2,{id:`key-features`,children:`Key Features`}),(0,m.jsxs)(n.ul,{children:[`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.strong,{children:`AI-Generated Answers`}),`: Automatically generates answers to user queries using Coveo ML`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.strong,{children:`Source Citations`}),`: Displays citations to the sources used to generate the answer`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.strong,{children:`Feedback Collection`}),`: Built-in like/dislike buttons to collect user feedback`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.strong,{children:`Copy to Clipboard`}),`: Users can easily copy the generated answer`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.strong,{children:`Collapsible Mode`}),`: Allows long answers to be collapsed for better UI management`]}),`
`]}),(0,m.jsx)(n.h2,{id:`configuration`,children:`Configuration`}),(0,m.jsx)(n.h3,{id:`basic-configuration`,children:`Basic Configuration`}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-html`,children:`<atomic-insight-generated-answer></atomic-insight-generated-answer>
`})}),(0,m.jsx)(n.h3,{id:`with-toggle-button`,children:`With Toggle Button`}),(0,m.jsx)(n.p,{children:`Display a toggle button that lets users hide or show the answer:`}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-html`,children:`<atomic-insight-generated-answer with-toggle></atomic-insight-generated-answer>
`})}),(0,m.jsx)(n.h3,{id:`collapsible-mode`,children:`Collapsible Mode`}),(0,m.jsx)(n.p,{children:`Allow the answer to be collapsed when it's taller than a specified height:`}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-html`,children:`<atomic-insight-generated-answer
  collapsible
  max-collapsed-height="20">
</atomic-insight-generated-answer>
`})}),(0,m.jsxs)(n.ul,{children:[`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.strong,{children:(0,m.jsx)(n.code,{children:`collapsible`})}),`: Enables collapsible mode`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.strong,{children:(0,m.jsx)(n.code,{children:`max-collapsed-height`})}),`: Maximum height in rem units when collapsed (default: 16, range: 9-32)`]}),`
`]}),(0,m.jsx)(n.h3,{id:`answer-configuration`,children:`Answer Configuration`}),(0,m.jsx)(n.p,{children:`Specify a particular answer configuration to use:`}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-html`,children:`<atomic-insight-generated-answer
  answer-configuration-id="my-config-id">
</atomic-insight-generated-answer>
`})}),(0,m.jsx)(n.h3,{id:`citation-configuration`,children:`Citation Configuration`}),(0,m.jsx)(n.p,{children:`Include additional fields with citations and control citation anchoring:`}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-html`,children:`<atomic-insight-generated-answer
  fields-to-include-in-citations="author,date,category"
  disable-citation-anchoring>
</atomic-insight-generated-answer>
`})}),(0,m.jsx)(n.h3,{id:`custom-no-answer-message`,children:`Custom No-Answer Message`}),(0,m.jsx)(n.p,{children:`Provide a custom message when no answer can be generated:`}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-html`,children:`<atomic-insight-generated-answer>
  <div slot="no-answer-message">
    Sorry, we couldn't generate an answer for your query.
    Please try rephrasing your question.
  </div>
</atomic-insight-generated-answer>
`})}),(0,m.jsx)(n.h2,{id:`accessibility`,children:`Accessibility`}),(0,m.jsx)(n.p,{children:`The component is built with accessibility in mind:`}),(0,m.jsxs)(n.ul,{children:[`
`,(0,m.jsx)(n.li,{children:`ARIA live regions announce answer generation status`}),`
`,(0,m.jsx)(n.li,{children:`Keyboard-accessible feedback buttons and toggle`}),`
`,(0,m.jsx)(n.li,{children:`Proper focus management`}),`
`,(0,m.jsx)(n.li,{children:`Screen reader support for all interactive elements`}),`
`]}),(0,m.jsx)(n.h2,{id:`styling`,children:`Styling`}),(0,m.jsx)(n.p,{children:`The component supports various CSS parts for customization:`}),(0,m.jsxs)(n.ul,{children:[`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`container`}),` - Main container`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`header-label`}),` - Answer header`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`toggle`}),` - Visibility toggle switch`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`feedback-button`}),` - Like/dislike buttons`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`copy-button`}),` - Copy answer button`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`generated-text`}),` - Answer text content`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`citations-label`}),` - Citations section header`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`citation`}),` - Individual citation links`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`citation-popover`}),` - Citation preview popups`]}),`
`]}),(0,m.jsx)(n.p,{children:`Custom CSS properties:`}),(0,m.jsxs)(n.ul,{children:[`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`--atomic-crga-collapsed-height`}),` - Height of collapsed answer container`]}),`
`]})]})]})}function p(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,m.jsx)(n,{...e,children:(0,m.jsx)(f,{...e})}):f(e)}var m;e((()=>{m=n(),a(),i(),d(),o()}))();export{p as default};