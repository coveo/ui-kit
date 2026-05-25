import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,WithAfterChildrenSlot as u,WithBeforeChildrenSlot as d,WithBothSlots as f,t as p}from"./atomic-insight-result-children.new.stories-CLe8JEnw.js";function m(e){let n={code:`code`,h2:`h2`,p:`p`,pre:`pre`,...t(),...e.components};return(0,g.jsxs)(g.Fragment,{children:[(0,g.jsx)(r,{of:c}),`
`,(0,g.jsxs)(s,{stories:{Default:l,WithBeforeChildrenSlot:d,WithAfterChildrenSlot:u,WithBothSlots:f},defaultStory:`Default`,githubPath:`insight/atomic-insight-result-children/atomic-insight-result-children.ts`,tagName:`atomic-insight-result-children`,className:`AtomicInsightResultChildren`,children:[(0,g.jsxs)(n.p,{children:[`This component is typically used within `,(0,g.jsx)(n.code,{children:`atomic-insight-folded-result-list`}),` to render hierarchical result structures.`]}),(0,g.jsx)(n.pre,{children:(0,g.jsx)(n.code,{className:`language-html`,children:`<atomic-insight-result-template>
  <template>
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
`})}),(0,g.jsx)(n.h2,{id:`using-slots`,children:`Using slots`}),(0,g.jsx)(n.p,{children:`The component provides slots for adding custom content before or after the children:`}),(0,g.jsx)(n.pre,{children:(0,g.jsx)(n.code,{className:`language-html`,children:`<atomic-insight-result-children image-size="icon">
  <div slot="before-children">Content before children</div>
  <atomic-insight-result-children-template>
    <template>
      <!-- Child template -->
    </template>
  </atomic-insight-result-children-template>
  <div slot="after-children">Content after children</div>
</atomic-insight-result-children>
`})})]})]})}function h(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,g.jsx)(n,{...e,children:(0,g.jsx)(m,{...e})}):m(e)}var g;e((()=>{g=n(),a(),i(),p(),o()}))();export{h as default};