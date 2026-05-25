import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,WithAltTextField as u,WithFallback as d,t as f}from"./atomic-result-image.new.stories-Bxqju6Rv.js";function p(e){let n={code:`code`,p:`p`,pre:`pre`,...t(),...e.components};return(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(r,{of:c}),`
`,(0,h.jsxs)(s,{stories:{Default:l,WithAltTextField:u,WithFallback:d},githubPath:`search/atomic-result-image/atomic-result-image.ts`,tagName:`atomic-result-image`,className:`AtomicResultImage`,children:[(0,h.jsxs)(n.p,{children:[`Use this component within `,(0,h.jsx)(n.code,{children:`atomic-result-template`}),` to display an image from a result field. The component handles image loading errors gracefully and supports fallback images.`]}),(0,h.jsxs)(n.p,{children:[`For accessibility, you can specify a result field to provide custom alt text for the image using the `,(0,h.jsx)(n.code,{children:`image-alt-field`}),` property. If not specified, the component falls back to a default alt text based on the result title.`]}),(0,h.jsx)(n.pre,{children:(0,h.jsx)(n.code,{className:`language-html`,children:`<atomic-result-template>
  <template>
    <atomic-result-section-visual>
      <!-- Basic usage -->
      <atomic-result-image field="thumbnail"></atomic-result-image>
      
      <!-- With fallback image -->
      <atomic-result-image 
        field="thumbnail" 
        fallback="https://example.com/placeholder.png">
      </atomic-result-image>
      
      <!-- With custom alt text from a field -->
      <atomic-result-image 
        field="thumbnail" 
        image-alt-field="alt_description">
      </atomic-result-image>
    </atomic-result-section-visual>
  </template>
</atomic-result-template>
`})})]})]})}function m(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,h.jsx)(n,{...e,children:(0,h.jsx)(p,{...e})}):p(e)}var h;e((()=>{h=n(),a(),i(),f(),o()}))();export{m as default};