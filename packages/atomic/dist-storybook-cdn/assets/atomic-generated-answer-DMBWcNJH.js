import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,DisableCitationAnchoring as u,WithLegacyAnalytics as d,t as f}from"./atomic-generated-answer.new.stories-Cc-PaP1C.js";function p(e){let n={a:`a`,blockquote:`blockquote`,code:`code`,h2:`h2`,h3:`h3`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,ul:`ul`,...t(),...e.components};return(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(r,{of:c}),`
`,(0,h.jsxs)(s,{stories:{Default:l,DisableCitationAnchoring:u,WithLegacyAnalytics:d},githubPath:`search/atomic-generated-answer/atomic-generated-answer.ts`,tagName:`atomic-generated-answer`,className:`AtomicGeneratedAnswer`,children:[(0,h.jsxs)(n.p,{children:[`The `,(0,h.jsx)(n.code,{children:`atomic-generated-answer`}),` component uses Coveo Machine Learning (Coveo ML) models to automatically generate an answer to a query executed by the user. For more information, see `,(0,h.jsx)(n.a,{href:`https://docs.coveo.com/en/n9de0370/`,rel:`nofollow`,children:`About Relevance Generative Answering (RGA)`}),`.`]}),(0,h.jsx)(n.pre,{children:(0,h.jsx)(n.code,{className:`language-html`,children:`<atomic-search-interface>
  ...
  <atomic-search-layout>
    <atomic-layout-section section="main">
      
      <atomic-generated-answer></atomic-generated-answer>
      
    </atomic-layout-section>
    ...
  </atomic-search-layout>
</atomic-search-interface>
`})}),(0,h.jsx)(n.h2,{id:`key-features`,children:`Key Features`}),(0,h.jsxs)(n.ul,{children:[`
`,(0,h.jsxs)(n.li,{children:[(0,h.jsx)(n.strong,{children:`AI-Generated Answers`}),`: Automatically generates answers to user queries using Coveo ML`]}),`
`,(0,h.jsxs)(n.li,{children:[(0,h.jsx)(n.strong,{children:`Conversational Experience`}),`: Ask follow-up questions and maintain context across a multi-turn conversation`]}),`
`,(0,h.jsxs)(n.li,{children:[(0,h.jsx)(n.strong,{children:`Source Citations`}),`: Displays citations to the sources used to generate the answer`]}),`
`,(0,h.jsxs)(n.li,{children:[(0,h.jsx)(n.strong,{children:`Feedback Collection`}),`: Built-in like/dislike buttons to collect user feedback on specific answers`]}),`
`,(0,h.jsxs)(n.li,{children:[(0,h.jsx)(n.strong,{children:`Copy to Clipboard`}),`: Users can easily copy the generated answer`]}),`
`,(0,h.jsxs)(n.li,{children:[(0,h.jsx)(n.strong,{children:`Collapsible Mode`}),`: Allows long answers to be collapsed for better UI management`]}),`
`,(0,h.jsxs)(n.li,{children:[(0,h.jsx)(n.strong,{children:`Tab Integration`}),`: Show/hide the component based on active tabs`]}),`
`]}),(0,h.jsx)(n.h2,{id:`configuration`,children:`Configuration`}),(0,h.jsx)(n.h3,{id:`basic-configuration`,children:`Basic Configuration`}),(0,h.jsx)(n.pre,{children:(0,h.jsx)(n.code,{className:`language-html`,children:`<atomic-generated-answer></atomic-generated-answer>
`})}),(0,h.jsx)(n.h3,{id:`with-toggle-button`,children:`With Toggle Button`}),(0,h.jsx)(n.p,{children:`Display a toggle button that lets users hide or show the answer:`}),(0,h.jsx)(n.pre,{children:(0,h.jsx)(n.code,{className:`language-html`,children:`<atomic-generated-answer with-toggle></atomic-generated-answer>
`})}),(0,h.jsx)(n.h3,{id:`collapsible-mode`,children:`Collapsible Mode`}),(0,h.jsx)(n.p,{children:`Allow the answer to be collapsed when it's taller than a specified height:`}),(0,h.jsx)(n.pre,{children:(0,h.jsx)(n.code,{className:`language-html`,children:`<atomic-generated-answer
  collapsible
  max-collapsed-height="20">
</atomic-generated-answer>
`})}),(0,h.jsxs)(n.ul,{children:[`
`,(0,h.jsxs)(n.li,{children:[(0,h.jsx)(n.strong,{children:(0,h.jsx)(n.code,{children:`collapsible`})}),`: Enables collapsible mode`]}),`
`,(0,h.jsxs)(n.li,{children:[(0,h.jsx)(n.strong,{children:(0,h.jsx)(n.code,{children:`max-collapsed-height`})}),`: Maximum height in rem units when collapsed (default: 16, range: 9-32)`]}),`
`]}),(0,h.jsx)(n.h3,{id:`answer-configuration`,children:`Answer Configuration`}),(0,h.jsx)(n.p,{children:`Specify a particular answer configuration to use:`}),(0,h.jsx)(n.pre,{children:(0,h.jsx)(n.code,{className:`language-html`,children:`<atomic-generated-answer
  answer-configuration-id="my-config-id">
</atomic-generated-answer>
`})}),(0,h.jsx)(n.h3,{id:`conversational-experience-multi-turn`,children:`Conversational Experience (Multi-Turn)`}),(0,h.jsxs)(n.p,{children:[`Enable the conversational experience by providing an `,(0,h.jsx)(n.code,{children:`agent-id`}),`. This activates multi-turn interactions, allowing users to ask follow-up questions after the initial answer is generated.`]}),(0,h.jsxs)(n.blockquote,{children:[`
`,(0,h.jsxs)(n.p,{children:[(0,h.jsx)(n.strong,{children:`Note:`}),` Setting `,(0,h.jsx)(n.code,{children:`agent-id`}),` is required to enable multi-turn, but the conversational UI (threaded timeline and follow-up input) only appears when the follow-up capability is enabled for the configured agent on the server side. If the agent does not support follow-ups, the component behaves like a single-turn answer generation experience.`]}),`
`]}),(0,h.jsxs)(n.p,{children:[`When an `,(0,h.jsx)(n.code,{children:`agent-id`}),` is set and the agent has the follow-up capability enabled, the component:`]}),(0,h.jsxs)(n.ul,{children:[`
`,(0,h.jsx)(n.li,{children:`Displays the initial answer along with a follow-up input field`}),`
`,(0,h.jsx)(n.li,{children:`Lets users ask follow-up questions that maintain the conversation context`}),`
`,(0,h.jsx)(n.li,{children:`Renders the full conversation as a threaded timeline, where each answer has its own citations, feedback buttons, and copy-to-clipboard action`}),`
`,(0,h.jsx)(n.li,{children:`Tracks analytics (citation clicks, hovers, likes/dislikes, copy) independently for each answer in the conversation`}),`
`]}),(0,h.jsxs)(n.p,{children:[`For more information, see `,(0,h.jsx)(n.a,{href:`https://docs.coveo.com/en/q32d5507/leverage-machine-learning/configure-a-search-interface-for-the-search-agent`,rel:`nofollow`,children:`Configure a search interface for the Search Agent`}),`.`]}),(0,h.jsx)(n.pre,{children:(0,h.jsx)(n.code,{className:`language-html`,children:`<atomic-generated-answer
  agent-id="my-agent-id">
</atomic-generated-answer>
`})}),(0,h.jsx)(n.h3,{id:`citation-configuration`,children:`Citation Configuration`}),(0,h.jsx)(n.p,{children:`Include additional fields with citations and control citation anchoring:`}),(0,h.jsx)(n.pre,{children:(0,h.jsx)(n.code,{className:`language-html`,children:`<atomic-generated-answer
  fields-to-include-in-citations="author,date,category"
  disable-citation-anchoring>
</atomic-generated-answer>
`})}),(0,h.jsx)(n.h3,{id:`tab-based-display`,children:`Tab-Based Display`}),(0,h.jsx)(n.p,{children:`Control which tabs display the generated answer:`}),(0,h.jsx)(n.pre,{children:(0,h.jsx)(n.code,{className:`language-html`,children:`<!-- Show only on specific tabs -->
<atomic-generated-answer
  tabs-included='["search", "knowledge"]'>
</atomic-generated-answer>

<!-- Hide on specific tabs -->
<atomic-generated-answer
  tabs-excluded='["images", "videos"]'>
</atomic-generated-answer>
`})}),(0,h.jsx)(n.h3,{id:`custom-no-answer-message`,children:`Custom No-Answer Message`}),(0,h.jsx)(n.p,{children:`Provide a custom message when no answer can be generated:`}),(0,h.jsx)(n.pre,{children:(0,h.jsx)(n.code,{className:`language-html`,children:`<atomic-generated-answer>
  <div slot="no-answer-message">
    Sorry, we couldn't generate an answer for your query.
    Please try rephrasing your question.
  </div>
</atomic-generated-answer>
`})}),(0,h.jsx)(n.h2,{id:`accessibility`,children:`Accessibility`}),(0,h.jsx)(n.p,{children:`The component is built with accessibility in mind:`}),(0,h.jsxs)(n.ul,{children:[`
`,(0,h.jsx)(n.li,{children:`ARIA live regions announce answer generation status`}),`
`,(0,h.jsx)(n.li,{children:`Keyboard-accessible feedback buttons and toggle`}),`
`,(0,h.jsx)(n.li,{children:`Proper focus management`}),`
`,(0,h.jsx)(n.li,{children:`Screen reader support for all interactive elements`}),`
`]}),(0,h.jsx)(n.h2,{id:`styling`,children:`Styling`}),(0,h.jsx)(n.p,{children:`The component supports various CSS parts for customization:`}),(0,h.jsxs)(n.ul,{children:[`
`,(0,h.jsxs)(n.li,{children:[(0,h.jsx)(n.code,{children:`container`}),` - Main container`]}),`
`,(0,h.jsxs)(n.li,{children:[(0,h.jsx)(n.code,{children:`header-label`}),` - Answer header`]}),`
`,(0,h.jsxs)(n.li,{children:[(0,h.jsx)(n.code,{children:`toggle`}),` - Visibility toggle switch`]}),`
`,(0,h.jsxs)(n.li,{children:[(0,h.jsx)(n.code,{children:`feedback-button`}),` - Like/dislike buttons`]}),`
`,(0,h.jsxs)(n.li,{children:[(0,h.jsx)(n.code,{children:`copy-button`}),` - Copy answer button`]}),`
`,(0,h.jsxs)(n.li,{children:[(0,h.jsx)(n.code,{children:`generated-text`}),` - Answer text content`]}),`
`,(0,h.jsxs)(n.li,{children:[(0,h.jsx)(n.code,{children:`citations-label`}),` - Citations section header`]}),`
`,(0,h.jsxs)(n.li,{children:[(0,h.jsx)(n.code,{children:`citation`}),` - Individual citation links`]}),`
`,(0,h.jsxs)(n.li,{children:[(0,h.jsx)(n.code,{children:`citation-popover`}),` - Citation preview popups`]}),`
`]}),(0,h.jsx)(n.p,{children:`Custom CSS properties:`}),(0,h.jsxs)(n.ul,{children:[`
`,(0,h.jsxs)(n.li,{children:[(0,h.jsx)(n.code,{children:`--atomic-crga-collapsed-height`}),` - Height of collapsed answer container`]}),`
`]})]})]})}function m(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,h.jsx)(n,{...e,children:(0,h.jsx)(p,{...e})}):p(e)}var h;e((()=>{h=n(),a(),i(),f(),o()}))();export{m as default};