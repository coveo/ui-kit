import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,WithInheritTemplates as u,t as d}from"./atomic-result-children.new.stories-BwOAHncI.js";function f(e){let n={code:`code`,p:`p`,pre:`pre`,...t(),...e.components};return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(r,{of:c}),`
`,(0,m.jsxs)(s,{stories:{Default:l,WithInheritTemplates:u},githubPath:`search/atomic-result-children/atomic-result-children.ts`,tagName:`atomic-result-children`,className:`AtomicResultChildren`,children:[(0,m.jsxs)(n.p,{children:[`The `,(0,m.jsx)(n.code,{children:`atomic-result-children`}),` component is responsible for displaying child results by applying one or more child result templates. It is used within `,(0,m.jsx)(n.code,{children:`atomic-folded-result-list`}),` to render hierarchical result structures.`]}),(0,m.jsx)(n.p,{children:`This component includes two slots, "before-children" and "after-children", which allow for rendering content before and after the list of children, only when children exist.`}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-html`,children:`<atomic-result-template>
  <template>
    <atomic-result-section-children>
      <atomic-result-children image-size="icon">
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
    </atomic-result-section-children>
  </template>
</atomic-result-template>
`})}),(0,m.jsxs)(n.p,{children:[`For nested children (grandchildren), you can use the `,(0,m.jsx)(n.code,{children:`inherit-templates`}),` property to inherit templates from the parent `,(0,m.jsx)(n.code,{children:`atomic-result-children`}),`:`]}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-html`,children:`<atomic-result-children>
  <atomic-result-children-template>
    <template>
      <!-- Child template content -->
      <atomic-result-section-children>
        <atomic-result-children inherit-templates>
        </atomic-result-children>
      </atomic-result-section-children>
    </template>
  </atomic-result-children-template>
</atomic-result-children>
`})})]})]})}function p(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,m.jsx)(n,{...e,children:(0,m.jsx)(f,{...e})}):f(e)}var m;e((()=>{m=n(),a(),i(),d(),o()}))();export{p as default};