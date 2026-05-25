import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,OpenedModal as u,t as d}from"./atomic-smart-snippet-feedback-modal.new.stories-CG5-h5mi.js";function f(e){let n={code:`code`,h2:`h2`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,ul:`ul`,...t(),...e.components};return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(r,{of:c}),`
`,(0,m.jsxs)(s,{stories:{Default:l,OpenedModal:u},githubPath:`search/atomic-smart-snippet-feedback-modal/atomic-smart-snippet-feedback-modal.ts`,tagName:`atomic-smart-snippet-feedback-modal`,className:`AtomicSmartSnippetFeedbackModal`,children:[(0,m.jsxs)(n.p,{children:[`The `,(0,m.jsx)(n.code,{children:`atomic-smart-snippet-feedback-modal`}),` component is automatically created as a child of the `,(0,m.jsx)(n.code,{children:`atomic-search-interface`}),` when the `,(0,m.jsx)(n.code,{children:`atomic-smart-snippet`}),` component is initialized. It displays a modal dialog that allows users to provide feedback on why a smart snippet answer was not helpful.`]}),(0,m.jsxs)(n.p,{children:[`When the modal is opened, the class `,(0,m.jsx)(n.code,{children:`atomic-modal-opened`}),` is added to the body, allowing further customization.`]}),(0,m.jsx)(n.h2,{id:`key-features`,children:`Key Features`}),(0,m.jsxs)(n.ul,{children:[`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.strong,{children:`Feedback Collection`}),`: Collects user feedback when a smart snippet answer is not helpful`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.strong,{children:`Multiple Reasons`}),`: Provides predefined reasons for why the answer was not useful`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.strong,{children:`Custom Details`}),`: Allows users to provide additional details about their feedback`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.strong,{children:`Modal Dialog`}),`: Displays as a modal overlay with backdrop`]}),`
`]}),(0,m.jsx)(n.h2,{id:`usage`,children:`Usage`}),(0,m.jsxs)(n.p,{children:[`This component is typically not used directly. It is automatically created and managed by the `,(0,m.jsx)(n.code,{children:`atomic-smart-snippet`}),` component when a user clicks the "dislike" button.`]}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-html`,children:`<atomic-search-interface>
  <atomic-smart-snippet></atomic-smart-snippet>
</atomic-search-interface>
`})}),(0,m.jsx)(n.h2,{id:`parts`,children:`Parts`}),(0,m.jsx)(n.p,{children:`The component exposes the following CSS parts for styling:`}),(0,m.jsxs)(n.ul,{children:[`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`backdrop`}),` - The transparent backdrop hiding the content behind the modal`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`container`}),` - The modal's outermost container with the outline and background`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`header-wrapper`}),` - The wrapper around the header`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`header`}),` - The header of the modal, containing the title`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`header-ruler`}),` - The horizontal ruler underneath the header`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`body-wrapper`}),` - The wrapper around the body`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`body`}),` - The body of the modal, between the header and the footer`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`form`}),` - The wrapper around the reason and details`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`reason-title`}),` - The title above the reason radio buttons`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`reason`}),` - A wrapper around the radio button and the label of a reason`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`reason-radio`}),` - A radio button representing a reason`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`reason-label`}),` - A label linked to a radio button representing a reason`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`details-title`}),` - The title above the details input`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`details-input`}),` - The input to specify additional details`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`footer-wrapper`}),` - The wrapper with a shadow around the footer`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`footer`}),` - The footer at the bottom of the modal`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`buttons`}),` - The wrapper around the cancel and submit buttons`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`cancel-button`}),` - The cancel button`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`submit-button`}),` - The submit button`]}),`
`]})]})]})}function p(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,m.jsx)(n,{...e,children:(0,m.jsx)(f,{...e})}):f(e)}var m;e((()=>{m=n(),a(),i(),d(),o()}))();export{p as default};