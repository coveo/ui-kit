import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,WithLinkSlot as u,WithMinimalTemplate as d,t as f}from"./atomic-recs-result-template.new.stories-DGKyONh1.js";function p(e){let n={code:`code`,h2:`h2`,p:`p`,pre:`pre`,strong:`strong`,...t(),...e.components};return(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(r,{of:c}),`
`,(0,h.jsxs)(s,{stories:{Default:l,WithMinimalTemplate:d,WithLinkSlot:u},defaultStory:`Default`,githubPath:`recommendations/atomic-recs-result-template/atomic-recs-result-template.ts`,tagName:`atomic-recs-result-template`,className:`AtomicRecsResultTemplate`,children:[(0,h.jsxs)(n.p,{children:[`This component defines the UI display of your recommendation results.
A `,(0,h.jsx)(n.code,{children:`template`}),` element must be the child of an `,(0,h.jsx)(n.code,{children:`atomic-recs-result-template`}),`. Furthermore, an `,(0,h.jsx)(n.code,{children:`atomic-recs-list`}),` or `,(0,h.jsx)(n.code,{children:`atomic-ipx-recs-list`}),` must be the parent of each `,(0,h.jsx)(n.code,{children:`atomic-recs-result-template`}),`.`]}),(0,h.jsxs)(n.p,{children:[(0,h.jsx)(n.strong,{children:`Note:`}),` Any `,(0,h.jsx)(n.code,{children:`<script>`}),` tags that are defined inside a `,(0,h.jsx)(n.code,{children:`<template>`}),` element will not be executed when the results are being rendered.`]}),(0,h.jsxs)(n.p,{children:[`Example using the `,(0,h.jsx)(n.code,{children:`atomic-recs-list`}),`:`]}),(0,h.jsx)(n.pre,{children:(0,h.jsx)(n.code,{className:`language-html`,children:`<atomic-recs-list>
  <atomic-recs-result-template>
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
        </atomic-result-fields-list>
      </atomic-result-section-bottom-metadata>
    </template>
  </atomic-recs-result-template>
</atomic-recs-list>
`})}),(0,h.jsx)(n.h2,{id:`link-slot`,children:`Link Slot`}),(0,h.jsxs)(n.p,{children:[`You can use the `,(0,h.jsx)(n.code,{children:`link`}),` slot to customize how the entire result item behaves as a link. This is useful when you want the result to open in a new tab or have custom link attributes:`]}),(0,h.jsx)(n.pre,{children:(0,h.jsx)(n.code,{className:`language-html`,children:`<atomic-recs-result-template>
  <template slot="link">
    <atomic-result-link>
      <a slot="attributes" target="_blank"></a>
    </atomic-result-link>
  </template>
  <template>
    <atomic-result-section-title>
      <atomic-result-text field="title"></atomic-result-text>
    </atomic-result-section-title>
  </template>
</atomic-recs-result-template>
`})})]})]})}function m(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,h.jsx)(n,{...e,children:(0,h.jsx)(p,{...e})}):p(e)}var h;e((()=>{h=n(),a(),i(),f(),o()}))();export{m as default};