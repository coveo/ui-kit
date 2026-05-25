import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,WithOtherActions as u,t as d}from"./atomic-insight-result-attach-to-case-action.new.stories-NgZQG_yP.js";function f(e){let n={code:`code`,h2:`h2`,p:`p`,pre:`pre`,...t(),...e.components};return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(r,{of:c}),`
`,(0,m.jsxs)(s,{stories:{Default:l,WithOtherActions:u},defaultStory:`Default`,githubPath:`insight/atomic-insight-result-attach-to-case-action/atomic-insight-result-attach-to-case-action.ts`,tagName:`atomic-insight-result-attach-to-case-action`,className:`AtomicInsightResultAttachToCaseAction`,children:[(0,m.jsxs)(n.p,{children:[`This is a result template component that should be nested inside an `,(0,m.jsx)(n.code,{children:`atomic-insight-result-actions`}),` element within an `,(0,m.jsx)(n.code,{children:`atomic-insight-result-template`}),`:`]}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-html`,children:`<atomic-insight-result-template>
  <template>
    <atomic-result-section-title>
      <atomic-result-link></atomic-result-link>
    </atomic-result-section-title>
    <atomic-result-section-actions>
      <atomic-insight-result-attach-to-case-action></atomic-insight-result-attach-to-case-action>
    </atomic-result-section-actions>
  </template>
</atomic-insight-result-template>
`})}),(0,m.jsx)(n.h2,{id:`handling-events`,children:`Handling events`}),(0,m.jsx)(n.p,{children:`Listen for the custom events to implement your attach/detach logic:`}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-javascript`,children:`document.addEventListener('atomic/insight/attachToCase/attach', (event) => {
  const { callback, result } = event.detail;
  // Perform your attach logic here
  callback(); // Call to update the component state
});

document.addEventListener('atomic/insight/attachToCase/detach', (event) => {
  const { callback, result } = event.detail;
  // Perform your detach logic here
  callback(); // Call to update the component state
});
`})})]})]})}function p(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,m.jsx)(n,{...e,children:(0,m.jsx)(f,{...e})}):f(e)}var m;e((()=>{m=n(),a(),i(),d(),o()}))();export{p as default};