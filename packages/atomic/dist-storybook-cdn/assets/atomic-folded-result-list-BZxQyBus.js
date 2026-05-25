import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,WithFewResultChildren as u,WithMoreResultsAvailableAndNoChildren as d,WithNoResultChildren as f,t as p}from"./atomic-folded-result-list.new.stories-CnqWED4h.js";function m(e){let n={a:`a`,code:`code`,h2:`h2`,p:`p`,pre:`pre`,...t(),...e.components};return(0,g.jsxs)(g.Fragment,{children:[(0,g.jsx)(r,{of:c}),`
`,(0,g.jsxs)(s,{stories:{Default:l,WithNoResultChildren:f,WithFewResultChildren:u,WithMoreResultsAvailableAndNoChildren:d},githubPath:`search/atomic-folded-result-list/atomic-folded-result-list.ts`,tagName:`atomic-folded-result-list`,className:`AtomicFoldedResultList`,children:[(0,g.jsxs)(n.p,{children:[`This component is typically placed within the `,(0,g.jsx)(n.code,{children:`results`}),` section of the layout to display folded query results. Folded results group related documents together, such as email threads or document versions.`]}),(0,g.jsx)(n.pre,{children:(0,g.jsx)(n.code,{className:`language-html`,children:`<atomic-search-interface>
  ...
  <atomic-search-layout>
    ...
    <atomic-layout-section section="main">
      ...
      <atomic-layout-section section="results">
        <atomic-folded-result-list></atomic-folded-result-list>
      </atomic-layout-section>
    </atomic-layout-section>
  </atomic-search-layout>
</atomic-search-interface>
`})}),(0,g.jsx)(n.h2,{id:`defining-result-templates`,children:`Defining Result Templates`}),(0,g.jsxs)(n.p,{children:[`You can `,(0,g.jsx)(n.a,{href:`https://docs.coveo.com/en/atomic/latest/usage/displaying-results/#defining-a-result-template`,rel:`nofollow`,children:`define custom templates`}),` for how results and their children are displayed:`]}),(0,g.jsx)(n.pre,{children:(0,g.jsx)(n.code,{className:`language-html`,children:`<atomic-folded-result-list>
  <atomic-result-template>
    <template>
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
              <atomic-result-section-title>
                <atomic-result-link></atomic-result-link>
              </atomic-result-section-title>
            </template>
          </atomic-result-children-template>
        </atomic-result-children>
      </atomic-result-section-children>
    </template>
  </atomic-result-template>
</atomic-folded-result-list>
`})}),(0,g.jsxs)(n.p,{children:[`For more information on Result Folding, see `,(0,g.jsx)(n.a,{href:`https://docs.coveo.com/en/1884`,rel:`nofollow`,children:`Result Folding`}),`.`]})]})]})}function h(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,g.jsx)(n,{...e,children:(0,g.jsx)(m,{...e})}):m(e)}var g;e((()=>{g=n(),a(),i(),p(),o()}))();export{h as default};