import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,t as u}from"./atomic-result-children-template.new.stories-Ccyo3vno.js";function d(e){let n={code:`code`,h2:`h2`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,ul:`ul`,...t(),...e.components};return(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(r,{of:c}),`
`,(0,p.jsxs)(s,{stories:{Default:l},defaultStory:`Default`,githubPath:`search/atomic-result-children-template/atomic-result-children-template.ts`,tagName:`atomic-result-children-template`,className:`AtomicResultChildrenTemplate`,children:[(0,p.jsxs)(n.p,{children:[`A `,(0,p.jsx)(n.code,{children:`template`}),` element must be the child of an `,(0,p.jsx)(n.code,{children:`atomic-result-children-template`}),`, and an `,(0,p.jsx)(n.code,{children:`atomic-result-children`}),` must be the parent of each `,(0,p.jsx)(n.code,{children:`atomic-result-children-template`}),`.`]}),(0,p.jsxs)(n.ul,{children:[`
`,(0,p.jsxs)(n.li,{children:[`Note: Any `,(0,p.jsx)(n.code,{children:`<script>`}),` tags defined inside of a `,(0,p.jsx)(n.code,{children:`<template>`}),` element will not be executed when results are being rendered.`]}),`
`]}),(0,p.jsxs)(n.p,{children:[`Example using `,(0,p.jsx)(n.code,{children:`atomic-result-children`}),` with `,(0,p.jsx)(n.code,{children:`atomic-folded-result-list`}),`:`]}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-folded-result-list>
  <atomic-result-template>
    <template>
      <atomic-result-section-visual>
        <atomic-result-image field="ytthumbnailurl" fallback="https://picsum.photos/seed/picsum/350"></atomic-result-image>
      </atomic-result-section-visual>
      
      <atomic-result-section-title>
        <atomic-result-link></atomic-result-link>
      </atomic-result-section-title>
      
      <atomic-result-section-excerpt>
        <atomic-result-text field="excerpt"></atomic-result-text>
      </atomic-result-section-excerpt>

      <atomic-result-section-children>
        <atomic-result-children>
          <atomic-result-children-template>
            <template>
              <atomic-result-section-visual>
                <atomic-result-image field="ytthumbnailurl" fallback="https://picsum.photos/seed/picsum/350"></atomic-result-image>
              </atomic-result-section-visual>
              
              <atomic-result-section-title>
                <atomic-result-link></atomic-result-link>
              </atomic-result-section-title>
              
              <atomic-result-section-excerpt>
                <atomic-result-text field="excerpt"></atomic-result-text>
              </atomic-result-section-excerpt>
            </template>
          </atomic-result-children-template>
        </atomic-result-children>
      </atomic-result-section-children>
    </template>
  </atomic-result-template>
</atomic-folded-result-list>
`})}),(0,p.jsx)(n.h2,{id:`template-conditions`,children:`Template Conditions`}),(0,p.jsxs)(n.p,{children:[`You can use conditions to display different child result templates based on result properties. You can specify as many `,(0,p.jsx)(n.code,{children:`must-match-*`}),` and `,(0,p.jsx)(n.code,{children:`must-not-match-*`}),` attributes as you want on a template, each targeting a different field. Each attribute can accept multiple comma-separated values.`]}),(0,p.jsxs)(n.p,{children:[(0,p.jsx)(n.strong,{children:`Comma represents OR:`}),` Within a single attribute, comma-separated values represent a logical OR. For example, `,(0,p.jsx)(n.code,{children:`must-match-filetype="lithiummessage,YouTubePlaylist"`}),` means the filetype must be lithiummessage OR YouTubePlaylist.`]}),(0,p.jsxs)(n.p,{children:[(0,p.jsx)(n.strong,{children:`Multiple attributes represent AND:`}),` All conditions from different attributes must be met (logical AND) for the template to apply to a child result.`]}),(0,p.jsxs)(n.p,{children:[`If you set both `,(0,p.jsx)(n.code,{children:`must-match-*`}),` and `,(0,p.jsx)(n.code,{children:`must-not-match-*`}),` for the same field and there is any overlap in values, the template will be ignored (it will never match any result).`]}),(0,p.jsxs)(n.p,{children:[(0,p.jsx)(n.strong,{children:`Order of declaration matters:`}),` The first template whose conditions are met will be applied. If a default template (without conditions) is declared first, it will apply to all child results, even if other templates with conditions are declared later.`]}),(0,p.jsx)(n.p,{children:(0,p.jsx)(n.strong,{children:`Examples:`})}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<!-- Template applies if filetype is lithiummessage or YoutubePlaylist, and language is NOT fr -->
<atomic-result-children-template
  must-match-filetype="lithiummessage,YouTubePlaylist"
  must-not-match-language="fr"
>
  <template>
    <!-- ... -->
  </template>
</atomic-result-children-template>

<!-- This template will never apply, because the same value is required and forbidden -->
<atomic-result-children-template
  must-match-filetype="lithiummessage"
  must-not-match-filetype="lithiummessage"
>
  <template>
    <!-- ... -->
  </template>
</atomic-result-children-template>
`})}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-result-children>
  <!-- Template for YouTube video children -->
  <atomic-result-children-template must-match-sourcetype="YouTube">
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
  </atomic-result-children-template>

  <!-- Default template for all other child results -->
  <atomic-result-children-template>
    <template>
      <atomic-result-section-title>
        <atomic-result-link></atomic-result-link>
      </atomic-result-section-title>
      <atomic-result-section-excerpt>
        <atomic-result-text field="excerpt"></atomic-result-text>
      </atomic-result-section-excerpt>
    </template>
  </atomic-result-children-template>
</atomic-result-children>
`})}),(0,p.jsx)(n.h2,{id:`nested-folding-with-inherit-templates`,children:`Nested Folding with Inherit Templates`}),(0,p.jsxs)(n.p,{children:[`For deeply nested hierarchical results, you can use `,(0,p.jsx)(n.code,{children:`inherit-templates`}),` on `,(0,p.jsx)(n.code,{children:`atomic-result-children`}),` to reuse the same template structure:`]}),(0,p.jsx)(n.pre,{children:(0,p.jsx)(n.code,{className:`language-html`,children:`<atomic-result-children-template>
  <template>
    <atomic-result-section-title>
      <atomic-result-link></atomic-result-link>
    </atomic-result-section-title>
    <atomic-result-section-excerpt>
      <atomic-result-text field="excerpt"></atomic-result-text>
    </atomic-result-section-excerpt>
    
    <!-- Nested children inherit the same template -->
    <atomic-result-section-children>
      <atomic-result-children inherit-templates></atomic-result-children>
    </atomic-result-section-children>
  </template>
</atomic-result-children-template>
`})})]})]})}function f(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,p.jsx)(n,{...e,children:(0,p.jsx)(d,{...e})}):d(e)}var p;e((()=>{p=n(),a(),i(),u(),o()}))();export{f as default};