import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,t as u}from"./atomic-field-condition.new.stories-CX23QKEX.js";function d(e){let n={code:`code`,p:`p`,pre:`pre`,strong:`strong`,...t(),...e.components};return(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(r,{of:c}),`
`,(0,p.jsxs)(s,{stories:{Default:l},githubPath:`search/result-template-components/atomic-field-condition/atomic-field-condition.ts`,tagName:`atomic-field-condition`,className:`AtomicFieldCondition`,children:[(0,p.jsxs)(n.p,{children:[`Use this component within `,(0,p.jsx)(n.code,{children:`atomic-result-template`}),` to conditionally render content based on result properties. It evaluates conditions and only displays its children when all conditions are satisfied. Conditions can target any top-level result property, not just fields (e.g., `,(0,p.jsx)(n.code,{children:`isRecommendation`}),`).`]}),(0,p.jsxs)(n.p,{children:[`You can specify multiple `,(0,p.jsx)(n.code,{children:`must-match-*`}),` and `,(0,p.jsx)(n.code,{children:`must-not-match-*`}),` attributes, each targeting a different field. Each attribute accepts multiple comma-separated values. The `,(0,p.jsx)(n.code,{children:`if-defined`}),` and `,(0,p.jsx)(n.code,{children:`if-not-defined`}),` attributes also support comma-separated field names.`]}),(0,p.jsxs)(n.p,{children:[(0,p.jsx)(n.strong,{children:`Comma represents OR:`}),` Within a single attribute, comma-separated values represent a logical OR. For example, `,(0,p.jsx)(n.code,{children:`must-match-filetype="pdf,docx"`}),` means the filetype must be pdf OR docx. Similarly, `,(0,p.jsx)(n.code,{children:`if-defined="author,editor"`}),` means author OR editor must be defined.`]}),(0,p.jsxs)(n.p,{children:[(0,p.jsx)(n.strong,{children:`Multiple attributes represent AND:`}),` All conditions from different attributes must be met (logical AND) for content to render.`]}),(0,p.jsxs)(n.p,{children:[`If you set both `,(0,p.jsx)(n.code,{children:`must-match-*`}),` and `,(0,p.jsx)(n.code,{children:`must-not-match-*`}),` for the same field with overlapping values, the condition will never be satisfied. Similarly, setting both `,(0,p.jsx)(n.code,{children:`if-defined`}),` and `,(0,p.jsx)(n.code,{children:`if-not-defined`}),` for the same field will make the condition impossible to satisfy.`]}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-result-template>
  <!-- Show only if author field exists -->
  <atomic-field-condition if-defined="author">
    <span>Written by: <atomic-result-text field="author"></atomic-result-text></span>
  </atomic-field-condition>

  <!-- Show badge for PDF or Word documents -->
  <atomic-field-condition must-match-filetype="pdf,docx">
    <span class="document-badge">Document</span>
  </atomic-field-condition>

  <!-- Show if author exists AND source is not internal -->
  <atomic-field-condition if-defined="author" must-not-match-source="internal">
    <span>External author: <atomic-result-text field="author"></atomic-result-text></span>
  </atomic-field-condition>

  <!-- This will never render (conflicting conditions) -->
  <atomic-field-condition must-match-filetype="pdf" must-not-match-filetype="pdf">
    <span>Impossible</span>
  </atomic-field-condition>
</atomic-result-template>
`})}),(0,p.jsxs)(n.p,{children:[(0,p.jsx)(n.strong,{children:`Casing:`}),` Kebab-case attribute names for camelCase result properties in `,(0,p.jsx)(n.code,{children:`must-match-*`}),` and `,(0,p.jsx)(n.code,{children:`must-not-match-*`}),`. For example, when targeting the `,(0,p.jsx)(n.code,{children:`isRecommendation`}),` property, use `,(0,p.jsx)(n.code,{children:`must-match-is-recommendation`}),`:`]}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-field-condition must-match-is-recommendation="true">
  <!-- ... -->
</atomic-field-condition>
`})}),(0,p.jsxs)(n.p,{children:[(0,p.jsx)(n.strong,{children:`Rendering behavior:`}),` The component initially renders itself and its children regardless of whether the condition is satisfied. If the condition isn't met, it removes itself and its children from the DOM. Be mindful when nesting components that expect defined fields, as they may briefly render and then be removed, potentially logging warnings if a referenced field is undefined.`]}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-field-condition if-not-defined="thumbnailurl">
  <atomic-result-icon class="icon"></atomic-result-icon>
  <!-- Renders and stays when thumbnailurl isn't defined -->
  <!-- Nested component is safe here because it doesn't reference thumbnailurl -->
</atomic-field-condition>

<atomic-field-condition if-defined="thumbnailurl">
  <!-- This first renders and is removed if thumbnailurl isn't defined, which can produce a console warning -->
  <atomic-result-image field="thumbnailurl"></atomic-result-image>
</atomic-field-condition>
`})})]})]})}function f(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,p.jsx)(n,{...e,children:(0,p.jsx)(d,{...e})}):d(e)}var p;e((()=>{p=n(),a(),i(),u(),o()}))();export{f as default};