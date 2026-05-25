import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,WithConditions as u,WithNestedChildren as d,t as f}from"./atomic-insight-result-children-template.new.stories-BmuYEeDc.js";function p(e){let n={code:`code`,h2:`h2`,h3:`h3`,p:`p`,pre:`pre`,strong:`strong`,...t(),...e.components};return(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(r,{of:c}),`
`,(0,h.jsxs)(s,{stories:{Default:l,WithNestedChildren:d,WithConditions:u},defaultStory:`Default`,githubPath:`insight/atomic-insight-result-children-template/atomic-insight-result-children-template.ts`,tagName:`atomic-insight-result-children-template`,className:`AtomicInsightResultChildrenTemplate`,children:[(0,h.jsxs)(n.p,{children:[`Each `,(0,h.jsx)(n.code,{children:`atomic-insight-result-children-template`}),` must contain a `,(0,h.jsx)(n.code,{children:`<template>`}),` element as a direct child, and must itself be a direct child of `,(0,h.jsx)(n.code,{children:`atomic-insight-result-children`}),`.`]}),(0,h.jsxs)(n.p,{children:[(0,h.jsx)(n.strong,{children:`Note:`}),` Any `,(0,h.jsx)(n.code,{children:`<script>`}),` tags inside a `,(0,h.jsx)(n.code,{children:`<template>`}),` element will not be executed when results are rendered.`]}),(0,h.jsx)(n.p,{children:`Example usage within a folded result list:`}),(0,h.jsx)(n.pre,{children:(0,h.jsx)(n.code,{className:`language-html`,children:`<atomic-insight-folded-result-list>
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
              <atomic-result-section-excerpt>
                <atomic-result-text field="excerpt"></atomic-result-text>
              </atomic-result-section-excerpt>
            </template>
          </atomic-insight-result-children-template>
        </atomic-insight-result-children>
      </atomic-result-section-children>
    </template>
  </atomic-insight-result-template>
</atomic-insight-folded-result-list>
`})}),(0,h.jsx)(n.h2,{id:`template-conditions`,children:`Template Conditions`}),(0,h.jsxs)(n.p,{children:[`You can use conditions to display different templates based on child result properties. You can specify as many `,(0,h.jsx)(n.code,{children:`must-match-*`}),` and `,(0,h.jsx)(n.code,{children:`must-not-match-*`}),` attributes as you want on a template, each targeting a different field. Each attribute can accept multiple comma-separated values.`]}),(0,h.jsxs)(n.p,{children:[(0,h.jsx)(n.strong,{children:`Comma represents OR:`}),` Within a single attribute, comma-separated values represent a logical OR. For example, `,(0,h.jsx)(n.code,{children:`must-match-sourcetype="YouTube,Salesforce"`}),` means the sourcetype must be YouTube OR Salesforce.`]}),(0,h.jsxs)(n.p,{children:[(0,h.jsx)(n.strong,{children:`Multiple attributes represent AND:`}),` All conditions from different attributes must be met (logical AND) for the template to apply to a result.`]}),(0,h.jsx)(n.h3,{id:`example-with-conditions`,children:`Example with Conditions`}),(0,h.jsx)(n.pre,{children:(0,h.jsx)(n.code,{className:`language-html`,children:`<atomic-insight-result-children image-size="icon">
  <!-- Template for YouTube children -->
  <atomic-insight-result-children-template must-match-sourcetype="YouTube">
    <template>
      <atomic-result-section-visual>
        <atomic-result-image field="ytthumbnailurl"></atomic-result-image>
      </atomic-result-section-visual>
      <atomic-result-section-title>
        <atomic-result-link></atomic-result-link>
      </atomic-result-section-title>
    </template>
  </atomic-insight-result-children-template>
  
  <!-- Default template for all other children -->
  <atomic-insight-result-children-template>
    <template>
      <atomic-result-section-title>
        <atomic-result-link></atomic-result-link>
      </atomic-result-section-title>
      <atomic-result-section-excerpt>
        <atomic-result-text field="excerpt"></atomic-result-text>
      </atomic-result-section-excerpt>
    </template>
  </atomic-insight-result-children-template>
</atomic-insight-result-children>
`})}),(0,h.jsx)(n.h2,{id:`nested-children`,children:`Nested Children`}),(0,h.jsxs)(n.p,{children:[`For deeply nested result hierarchies, child result templates can include their own `,(0,h.jsx)(n.code,{children:`atomic-insight-result-children`}),` with `,(0,h.jsx)(n.code,{children:`inherit-templates`}),` to reuse the same template structure:`]}),(0,h.jsx)(n.pre,{children:(0,h.jsx)(n.code,{className:`language-html`,children:`<atomic-insight-result-children image-size="icon">
  <atomic-insight-result-children-template>
    <template>
      <atomic-result-section-title>
        <atomic-result-link></atomic-result-link>
      </atomic-result-section-title>
      <atomic-result-section-children>
        <atomic-insight-result-children inherit-templates></atomic-insight-result-children>
      </atomic-result-section-children>
    </template>
  </atomic-insight-result-children-template>
</atomic-insight-result-children>
`})})]})]})}function m(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,h.jsx)(n,{...e,children:(0,h.jsx)(p,{...e})}):p(e)}var h;e((()=>{h=n(),a(),i(),f(),o()}))();export{m as default};