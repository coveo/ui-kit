import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,InActionBar as u,t as d}from"./atomic-insight-result-action.new.stories-BhKapJ3m.js";function f(e){let n={code:`code`,h2:`h2`,h3:`h3`,p:`p`,pre:`pre`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,...t(),...e.components};return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(r,{of:c}),`
`,(0,m.jsxs)(s,{stories:{Default:l,InActionBar:u},defaultStory:`Default`,githubPath:`insight/atomic-insight-result-action/atomic-insight-result-action.ts`,tagName:`atomic-insight-result-action`,className:`AtomicInsightResultAction`,children:[(0,m.jsxs)(n.p,{children:[`Place this component directly inside `,(0,m.jsx)(n.code,{children:`atomic-result-section-actions`}),` for always-visible actions, or inside an `,(0,m.jsx)(n.code,{children:`atomic-insight-result-action-bar`}),` for actions that appear on hover.`]}),(0,m.jsx)(n.h3,{id:`always-visible`,children:`Always visible`}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-html`,children:`<atomic-insight-result-template>
  <template>
    <atomic-result-section-actions>
      <atomic-insight-result-action
        action="copyToClipboard"
        tooltip="Copy"
        tooltip-on-click="Copied!"
      ></atomic-insight-result-action>
    </atomic-result-section-actions>
  </template>
</atomic-insight-result-template>
`})}),(0,m.jsx)(n.h3,{id:`visible-on-hover`,children:`Visible on hover`}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-html`,children:`<atomic-insight-result-template>
  <template>
    <atomic-result-section-actions>
      <atomic-insight-result-action-bar>
        <atomic-insight-result-action
          action="copyToClipboard"
          tooltip="Copy"
          tooltip-on-click="Copied!"
        ></atomic-insight-result-action>
      </atomic-insight-result-action-bar>
    </atomic-result-section-actions>
  </template>
</atomic-insight-result-template>
`})}),(0,m.jsx)(n.h2,{id:`available-actions`,children:`Available actions`}),(0,m.jsx)(n.p,{children:`The component supports the following built-in action types, each with a default icon:`}),(0,m.jsxs)(n.table,{children:[(0,m.jsx)(n.thead,{children:(0,m.jsxs)(n.tr,{children:[(0,m.jsx)(n.th,{children:`Action`}),(0,m.jsx)(n.th,{children:`Description`}),(0,m.jsx)(n.th,{children:`Default Icon`})]})}),(0,m.jsxs)(n.tbody,{children:[(0,m.jsxs)(n.tr,{children:[(0,m.jsx)(n.td,{children:(0,m.jsx)(n.code,{children:`copyToClipboard`})}),(0,m.jsx)(n.td,{children:`Copies the result's click URI to the clipboard`}),(0,m.jsx)(n.td,{children:`Copy icon`})]}),(0,m.jsxs)(n.tr,{children:[(0,m.jsx)(n.td,{children:(0,m.jsx)(n.code,{children:`attachToCase`})}),(0,m.jsx)(n.td,{children:`Attaches the result to a case`}),(0,m.jsx)(n.td,{children:`Attach icon`})]}),(0,m.jsxs)(n.tr,{children:[(0,m.jsx)(n.td,{children:(0,m.jsx)(n.code,{children:`quickview`})}),(0,m.jsx)(n.td,{children:`Opens a quickview of the result`}),(0,m.jsx)(n.td,{children:`Preview icon`})]}),(0,m.jsxs)(n.tr,{children:[(0,m.jsx)(n.td,{children:(0,m.jsx)(n.code,{children:`postToFeed`})}),(0,m.jsx)(n.td,{children:`Posts the result to a feed`}),(0,m.jsx)(n.td,{children:`Share icon`})]}),(0,m.jsxs)(n.tr,{children:[(0,m.jsx)(n.td,{children:(0,m.jsx)(n.code,{children:`sendAsEmail`})}),(0,m.jsx)(n.td,{children:`Sends the result as an email`}),(0,m.jsx)(n.td,{children:`Email icon`})]})]})]}),(0,m.jsx)(n.h2,{id:`handling-events`,children:`Handling events`}),(0,m.jsxs)(n.p,{children:[`Listen for the `,(0,m.jsx)(n.code,{children:`atomicInsightResultActionClicked`}),` event to implement custom logic:`]}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-javascript`,children:`document.addEventListener('atomicInsightResultActionClicked', (event) => {
  const { action, result } = event.detail;
  
  switch (action) {
    case 'copyToClipboard':
      // The component automatically copies to clipboard,
      // but you can add additional logic here
      console.log('Copied:', result.clickUri);
      break;
    case 'attachToCase':
      // Implement your attach-to-case logic
      break;
    case 'quickview':
      // Implement your quickview logic
      break;
    case 'postToFeed':
      // Implement your post-to-feed logic
      break;
    case 'sendAsEmail':
      // Implement your send-as-email logic
      break;
    default:
      // Handle custom actions
      console.log('Custom action:', action);
  }
});
`})}),(0,m.jsx)(n.h2,{id:`custom-icons`,children:`Custom icons`}),(0,m.jsxs)(n.p,{children:[`You can provide a custom SVG icon using the `,(0,m.jsx)(n.code,{children:`icon`}),` property:`]}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-html`,children:`<atomic-insight-result-action
  action="customAction"
  tooltip="Custom action"
  icon="<svg>...</svg>"
></atomic-insight-result-action>
`})})]})]})}function p(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,m.jsx)(n,{...e,children:(0,m.jsx)(f,{...e})}):f(e)}var m;e((()=>{m=n(),a(),i(),d(),o()}))();export{p as default};