import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,InAFoldedResultList as u,InASearchBoxInstantResults as d,t as f}from"./atomic-result-template.new.stories-CTJH95_j.js";function p(e){let n={code:`code`,h2:`h2`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,ul:`ul`,...t(),...e.components};return(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(r,{of:c}),`
`,(0,h.jsxs)(s,{stories:{Default:l,InAFoldedResultList:u,InASearchBoxInstantResults:d},defaultStory:`Default`,githubPath:`search/atomic-result-template/atomic-result-template.ts`,tagName:`atomic-result-template`,className:`AtomicResultTemplate`,children:[(0,h.jsxs)(n.p,{children:[`This component defines the UI display of your search results.
A `,(0,h.jsx)(n.code,{children:`template`}),` element must be the child of an `,(0,h.jsx)(n.code,{children:`atomic-result-template`}),`. Furthermore, an `,(0,h.jsx)(n.code,{children:`atomic-result-list`}),`, `,(0,h.jsx)(n.code,{children:`atomic-folded-result-list`}),`, or `,(0,h.jsx)(n.code,{children:`atomic-search-box-instant-results`}),` must be the parent of each `,(0,h.jsx)(n.code,{children:`atomic-result-template`}),`.`]}),(0,h.jsxs)(n.ul,{children:[`
`,(0,h.jsxs)(n.li,{children:[(0,h.jsx)(n.strong,{children:`Note:`}),` Any `,(0,h.jsx)(n.code,{children:`<script>`}),` tags that are defined inside a `,(0,h.jsx)(n.code,{children:`<template>`}),` element will not be executed when the results are being rendered.`]}),`
`]}),(0,h.jsxs)(n.p,{children:[`Example using the `,(0,h.jsx)(n.code,{children:`atomic-result-list`}),`:`]}),(0,h.jsx)(n.pre,{children:(0,h.jsx)(n.code,{className:`language-html`,children:`<atomic-result-list>
  <atomic-result-template>
    <template>
      <atomic-result-section-visual>
        <atomic-result-image field="ytthumbnailurl" fallback="https://picsum.photos/seed/picsum/350"></atomic-result-image>
      </atomic-result-section-visual>
      
      <atomic-result-section-badges>
        <atomic-field-condition must-match-sourcetype="YouTube">
          <atomic-result-badge
            label="YouTube"
            class="youtube-badge"
          ></atomic-result-badge>
        </atomic-field-condition>
        
        <atomic-result-badge
          icon="https://raw.githubusercontent.com/Rush/Font-Awesome-SVG-PNG/master/black/svg/language.svg"
        >
          <atomic-result-multi-value-text
            field="language"
          ></atomic-result-multi-value-text>
        </atomic-result-badge>
      </atomic-result-section-badges>

      <atomic-result-section-title>
        <atomic-result-link></atomic-result-link>
      </atomic-result-section-title>

      <atomic-result-section-excerpt>
        <atomic-result-text field="excerpt"></atomic-result-text>
      </atomic-result-section-excerpt>

      <atomic-result-section-bottom-metadata>
        <atomic-result-fields-list>
          <atomic-field-condition class="field" if-defined="source">
            <span class="field-label">
              <atomic-text value="source"></atomic-text>:
            </span>
            <atomic-result-text field="source"></atomic-result-text>
          </atomic-field-condition>
          
          <atomic-field-condition class="field" if-defined="author">
            <span class="field-label">
              <atomic-text value="author"></atomic-text>:
            </span>
            <atomic-result-text field="author"></atomic-result-text>
          </atomic-field-condition>
          
          <atomic-field-condition class="field" if-defined="date">
            <span class="field-label">
              <atomic-text value="date"></atomic-text>:
            </span>
            <atomic-result-date></atomic-result-date>
          </atomic-field-condition>
        </atomic-result-fields-list>
      </atomic-result-section-bottom-metadata>
    </template>
  </atomic-result-template>
</atomic-result-list>
`})}),(0,h.jsx)(n.h2,{id:`template-conditions`,children:`Template Conditions`}),(0,h.jsxs)(n.p,{children:[`You can use conditions to display different templates based on result properties. You can specify as many `,(0,h.jsx)(n.code,{children:`must-match-*`}),` and `,(0,h.jsx)(n.code,{children:`must-not-match-*`}),` attributes as you want on a template, each targeting a different field. Each attribute can accept multiple comma-separated values.`]}),(0,h.jsxs)(n.p,{children:[(0,h.jsx)(n.strong,{children:`Comma represents OR:`}),` Within a single attribute, comma-separated values represent a logical OR. For example, `,(0,h.jsx)(n.code,{children:`must-match-sourcetype="YouTube,Salesforce"`}),` means the sourcetype must be YouTube OR Salesforce.`]}),(0,h.jsxs)(n.p,{children:[(0,h.jsx)(n.strong,{children:`Multiple attributes represent AND:`}),` All conditions from different attributes must be met (logical AND) for the template to apply to a result.`]}),(0,h.jsxs)(n.p,{children:[`If you set both `,(0,h.jsx)(n.code,{children:`must-match-*`}),` and `,(0,h.jsx)(n.code,{children:`must-not-match-*`}),` for the same field and there is any overlap in values, the template will be ignored (it will never match any result).`]}),(0,h.jsxs)(n.p,{children:[(0,h.jsx)(n.strong,{children:`Order of declaration matters:`}),` The first template whose conditions are met will be applied. If a default template (without conditions) is declared first, it will apply to all results, even if other templates with conditions are declared later.`]}),(0,h.jsx)(n.p,{children:(0,h.jsx)(n.strong,{children:`Examples:`})}),(0,h.jsx)(n.pre,{children:(0,h.jsx)(n.code,{className:`language-html`,children:`<!-- Template applies if sourcetype is YouTube or Salesforce, and language is NOT fr -->
<atomic-result-template
  must-match-sourcetype="YouTube,Salesforce"
  must-not-match-language="fr"
>
  <template>
    <!-- ... -->
  </template>
</atomic-result-template>

<!-- This template will never apply, because the same value is required and forbidden -->
<atomic-result-template
  must-match-sourcetype="YouTube"
  must-not-match-sourcetype="YouTube"
>
  <template>
    <!-- ... -->
  </template>
</atomic-result-template>
`})}),(0,h.jsx)(n.pre,{children:(0,h.jsx)(n.code,{className:`language-html`,children:`<atomic-result-list>
  <!-- Template for YouTube videos -->
  <atomic-result-template must-match-sourcetype="YouTube">
    <template>
      <atomic-result-section-visual>
        <atomic-result-image field="ytthumbnailurl"></atomic-result-image>
      </atomic-result-section-visual>
      <atomic-result-section-title>
        <atomic-result-link></atomic-result-link>
      </atomic-result-section-title>
      <atomic-result-section-excerpt>
        <atomic-result-text field="excerpt"></atomic-result-text>
      </atomic-result-section-excerpt>
    </template>
  </atomic-result-template>

  <!-- Default template for all other results -->
  <atomic-result-template>
    <template>
      <atomic-result-section-title>
        <atomic-result-link></atomic-result-link>
      </atomic-result-section-title>
      <atomic-result-section-excerpt>
        <atomic-result-text field="excerpt"></atomic-result-text>
      </atomic-result-section-excerpt>
    </template>
  </atomic-result-template>
</atomic-result-list>
`})})]})]})}function m(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,h.jsx)(n,{...e,children:(0,h.jsx)(p,{...e})}):p(e)}var h;e((()=>{h=n(),a(),i(),f(),o()}))();export{m as default};