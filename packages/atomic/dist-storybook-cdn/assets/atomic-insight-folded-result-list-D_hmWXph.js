import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,t as u}from"./atomic-insight-folded-result-list.new.stories-BJLMKBHU.js";function d(e){let n={a:`a`,code:`code`,h2:`h2`,p:`p`,pre:`pre`,...t(),...e.components};return(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(r,{of:c}),`
`,(0,p.jsxs)(s,{stories:{Default:l},githubPath:`insight/atomic-insight-folded-result-list/atomic-insight-folded-result-list.ts`,tagName:`atomic-insight-folded-result-list`,className:`AtomicInsightFoldedResultList`,children:[(0,p.jsxs)(n.p,{children:[`The `,(0,p.jsx)(n.code,{children:`atomic-insight-folded-result-list`}),` component is responsible for displaying folded insight query results by applying one or more result templates. Folded results group related documents together, such as email threads or document versions.`]}),(0,p.jsxs)(n.p,{children:[`This component should be placed within an `,(0,p.jsx)(n.code,{children:`atomic-insight-interface`}),` component, typically inside an `,(0,p.jsx)(n.code,{children:`atomic-insight-layout`}),` with a results section.`]}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-insight-interface>
  <atomic-insight-layout>
    <atomic-layout-section section="results">
      <atomic-insight-folded-result-list>
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
      </atomic-insight-folded-result-list>
    </atomic-layout-section>
  </atomic-insight-layout>
</atomic-insight-interface>
`})}),(0,p.jsx)(n.h2,{id:`result-templates`,children:`Result Templates`}),(0,p.jsxs)(n.p,{children:[`The component requires at least one `,(0,p.jsx)(n.code,{children:`atomic-insight-result-template`}),` child to define how results should be rendered. You can define multiple templates with conditions to display different layouts based on result properties.`]}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-insight-folded-result-list>
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
</atomic-insight-folded-result-list>
`})}),(0,p.jsx)(n.h2,{id:`folded-results-children`,children:`Folded Results (Children)`}),(0,p.jsxs)(n.p,{children:[`To display child results (e.g., replies in an email thread), use the `,(0,p.jsx)(n.code,{children:`atomic-insight-result-children`}),` component with a children template:`]}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-insight-folded-result-list>
  <atomic-insight-result-template>
    <template>
      <atomic-result-section-title>
        <atomic-result-link></atomic-result-link>
      </atomic-result-section-title>
      <atomic-result-section-excerpt>
        <atomic-result-text field="excerpt"></atomic-result-text>
      </atomic-result-section-excerpt>
      <atomic-result-section-children>
        <atomic-insight-result-children image-size="icon">
          <atomic-insight-result-children-template>
            <template>
              <atomic-result-section-title>
                <atomic-result-link></atomic-result-link>
              </atomic-result-section-title>
            </template>
          </atomic-insight-result-children-template>
        </atomic-insight-result-children>
      </atomic-result-section-children>
    </template>
  </atomic-insight-result-template>
</atomic-insight-folded-result-list>
`})}),(0,p.jsxs)(n.p,{children:[`For more information on Result Folding, see `,(0,p.jsx)(n.a,{href:`https://docs.coveo.com/en/1884`,rel:`nofollow`,children:`Result Folding`}),`.`]})]})]})}function f(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,p.jsx)(n,{...e,children:(0,p.jsx)(d,{...e})}):d(e)}var p;e((()=>{p=n(),a(),i(),u(),o()}))();export{f as default};