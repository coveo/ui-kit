import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,t as u}from"./atomic-result-fields-list.new.stories-BLaVyM7F.js";function d(e){let n={code:`code`,p:`p`,pre:`pre`,...t(),...e.components};return(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(r,{of:c}),`
`,(0,p.jsxs)(s,{stories:{Default:l},githubPath:`search/atomic-result-fields-list/atomic-result-fields-list.ts`,tagName:`atomic-result-fields-list`,className:`AtomicResultFieldsList`,children:[(0,p.jsxs)(n.p,{children:[`The `,(0,p.jsx)(n.code,{children:`atomic-result-fields-list`}),` component selectively renders its children to ensure they fit the parent element and adds dividers between them.`]}),(0,p.jsx)(n.p,{children:`This component is useful for displaying a list of result fields that adapts to the available space, automatically hiding overflow fields when necessary.`}),(0,p.jsxs)(n.p,{children:[`Use inside an `,(0,p.jsx)(n.code,{children:`atomic-result-template`}),` to display multiple fields with automatic overflow handling:`]}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-search-interface>
  ...
  <atomic-result-list>
    <atomic-result-template>
      <template>
        <atomic-result-fields-list>
               <style>
        .field {
          display: inline-flex;
          white-space: nowrap;
          align-items: center;
        }
        .field-label {
          font-weight: bold;
          margin-right: 0.25rem;
        }
      </style>
      <span class="field">
        <span class="field-label"><atomic-text value="author"></atomic-text>:</span>
        <atomic-result-text field="author"></atomic-result-text>
      </span>

      <span class="field">
        <span class="field-label"><atomic-text value="source"></atomic-text>:</span>
        <atomic-result-text field="source"></atomic-result-text>
      </span>

      <span class="field">
        <span class="field-label"><atomic-text value="language"></atomic-text>:</span>
        <atomic-result-multi-value-text field="language"></atomic-result-multi-value-text>
      </span>

      <span class="field">
        <span class="field-label"><atomic-text value="fileType"></atomic-text>:</span>
        <atomic-result-text field="filetype"></atomic-result-text>
      </span>

      <span class="field">
        <span class="field-label">Date:</span>
      </span>
        </atomic-result-fields-list>
      </template>
    </atomic-result-template>
  </atomic-result-list>
  ...
</atomic-search-interface>
`})})]})]})}function f(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,p.jsx)(n,{...e,children:(0,p.jsx)(d,{...e})}):d(e)}var p;e((()=>{p=n(),a(),i(),u(),o()}))();export{f as default};