import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,WithEllipsis as u,t as d}from"./atomic-result-printable-uri.new.stories-DTnUkquM.js";function f(e){let n={code:`code`,p:`p`,pre:`pre`,...t(),...e.components};return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(r,{of:c}),`
`,(0,m.jsxs)(s,{stories:{Default:l,WithEllipsis:u},githubPath:`search/atomic-result-printable-uri/atomic-result-printable-uri.ts`,tagName:`atomic-result-printable-uri`,className:`AtomicResultPrintableUri`,children:[(0,m.jsxs)(n.p,{children:[`Use this component within `,(0,m.jsx)(n.code,{children:`atomic-result-template`}),` to display the URI path to access a result. The component parses hierarchical URI structures and displays them as a breadcrumb-style navigation, with arrow separators between path segments.`]}),(0,m.jsxs)(n.p,{children:[`When the number of path segments exceeds the `,(0,m.jsx)(n.code,{children:`max-number-of-parts`}),` property value, an ellipsis button appears. Clicking this button expands the full path.`]}),(0,m.jsxs)(n.p,{children:[`You can customize link attributes using the `,(0,m.jsx)(n.code,{children:`attributes`}),` slot to add properties like `,(0,m.jsx)(n.code,{children:`target="_blank"`}),` or `,(0,m.jsx)(n.code,{children:`download`}),` to all links.`]}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-html`,children:`<atomic-result-template>
  <!-- Basic usage -->
  <atomic-result-printable-uri></atomic-result-printable-uri>

  <!-- Limit to 3 path segments before showing ellipsis -->
  <atomic-result-printable-uri max-number-of-parts="3"></atomic-result-printable-uri>

  <!-- Open links in new tab -->
  <atomic-result-printable-uri>
    <a slot="attributes" target="_blank"></a>
  </atomic-result-printable-uri>
</atomic-result-template>
`})})]})]})}function p(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,m.jsx)(n,{...e,children:(0,m.jsx)(f,{...e})}):f(e)}var m;e((()=>{m=n(),a(),i(),d(),o()}))();export{p as default};