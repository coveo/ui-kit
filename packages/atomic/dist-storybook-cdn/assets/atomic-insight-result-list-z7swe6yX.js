import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,t as u}from"./atomic-insight-result-list.new.stories-hYUI3J8j.js";function d(e){let n={code:`code`,h2:`h2`,p:`p`,pre:`pre`,...t(),...e.components};return(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(r,{of:c}),`
`,(0,p.jsxs)(s,{stories:{Default:l},githubPath:`insight/atomic-insight-result-list/atomic-insight-result-list.ts`,tagName:`atomic-insight-result-list`,className:`AtomicInsightResultList`,children:[(0,p.jsxs)(n.p,{children:[`The `,(0,p.jsx)(n.code,{children:`atomic-insight-result-list`}),` component is responsible for displaying insight query results by applying one or more result templates.`]}),(0,p.jsxs)(n.p,{children:[`This component should be placed within an `,(0,p.jsx)(n.code,{children:`atomic-insight-interface`}),` component, typically inside an `,(0,p.jsx)(n.code,{children:`atomic-insight-layout`}),` with a results section.`]}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-insight-interface>
  <atomic-insight-layout>
    <atomic-layout-section section="results">
      <atomic-insight-result-list>
        <atomic-insight-result-template>
          <template>
            <atomic-result-section-title>
              <atomic-result-link></atomic-result-link>
            </atomic-result-section-title>
            <atomic-result-section-excerpt>
              <atomic-result-text field="excerpt"></atomic-result-text>
            </atomic-result-section-excerpt>
          </template>
        </atomic-insight-result-template>
      </atomic-insight-result-list>
    </atomic-layout-section>
  </atomic-insight-layout>
</atomic-insight-interface>
`})}),(0,p.jsx)(n.h2,{id:`result-templates`,children:`Result Templates`}),(0,p.jsxs)(n.p,{children:[`The component requires at least one `,(0,p.jsx)(n.code,{children:`atomic-insight-result-template`}),` child to define how results should be rendered. You can define multiple templates with conditions to display different layouts based on result properties.`]}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-insight-result-list>
  <!-- Template for YouTube results -->
  <atomic-insight-result-template must-match-sourcetype="YouTube">
    <template>
      <atomic-result-badge label="YouTube Video"></atomic-result-badge>
      <atomic-result-section-title>
        <atomic-result-link></atomic-result-link>
      </atomic-result-section-title>
    </template>
  </atomic-insight-result-template>
  
  <!-- Default template -->
  <atomic-insight-result-template>
    <template>
      <atomic-result-section-title>
        <atomic-result-link></atomic-result-link>
      </atomic-result-section-title>
      <atomic-result-section-excerpt>
        <atomic-result-text field="excerpt"></atomic-result-text>
      </atomic-result-section-excerpt>
    </template>
  </atomic-insight-result-template>
</atomic-insight-result-list>
`})})]})]})}function f(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,p.jsx)(n,{...e,children:(0,p.jsx)(d,{...e})}):d(e)}var p;e((()=>{p=n(),a(),i(),u(),o()}))();export{f as default};