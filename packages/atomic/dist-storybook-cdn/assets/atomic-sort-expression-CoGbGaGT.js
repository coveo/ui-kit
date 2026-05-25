import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{ComplexExpression as l,DateDescending as u,Default as d,WithTabsExcluded as f,WithTabsIncluded as p,t as m}from"./atomic-sort-expression.new.stories-RrA2TfW8.js";function h(e){let n={a:`a`,blockquote:`blockquote`,code:`code`,h2:`h2`,h3:`h3`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,ul:`ul`,...t(),...e.components};return(0,_.jsxs)(_.Fragment,{children:[(0,_.jsx)(r,{of:c}),`
`,(0,_.jsxs)(s,{stories:{Default:d,DateDescending:u,WithTabsIncluded:p,WithTabsExcluded:f,ComplexExpression:l},githubPath:`search/atomic-sort-expression/atomic-sort-expression.ts`,tagName:`atomic-sort-expression`,className:`AtomicSortExpression`,children:[(0,_.jsxs)(n.p,{children:[`The `,(0,_.jsx)(n.code,{children:`atomic-sort-expression`}),` component defines a sort expression. This component must be inside an `,(0,_.jsx)(n.code,{children:`atomic-sort-dropdown`}),` component.`]}),(0,_.jsxs)(n.p,{children:[`This component is not used standalone. It must be a child of `,(0,_.jsx)(n.code,{children:`atomic-sort-dropdown`}),`.`]}),(0,_.jsxs)(n.p,{children:[`See the `,(0,_.jsx)(n.a,{href:`?path=/docs/atomic-sort-dropdown--docs`,children:`atomic-sort-dropdown documentation`}),` for additional usage examples.`]}),(0,_.jsx)(n.pre,{children:(0,_.jsx)(n.code,{className:`language-html`,children:`<atomic-search-interface>
  <!-- other components -->
  
  <atomic-sort-dropdown>
    <atomic-sort-expression label="Relevance" expression="relevancy"></atomic-sort-expression>
    <atomic-sort-expression label="Newest" expression="date descending"></atomic-sort-expression>
    <atomic-sort-expression label="Oldest" expression="date ascending"></atomic-sort-expression>
    <atomic-sort-expression label="Size" expression="size descending"></atomic-sort-expression>
  </atomic-sort-dropdown>

  <!-- other components -->
</atomic-search-interface>
`})}),(0,_.jsx)(n.h2,{id:`sort-criteria`,children:`Sort Criteria`}),(0,_.jsx)(n.p,{children:`The available sort criteria are:`}),(0,_.jsxs)(n.ul,{children:[`
`,(0,_.jsxs)(n.li,{children:[(0,_.jsx)(n.code,{children:`relevancy`}),` - Sort by relevance score`]}),`
`,(0,_.jsxs)(n.li,{children:[(0,_.jsx)(n.code,{children:`date ascending`}),` / `,(0,_.jsx)(n.code,{children:`date descending`}),` - Sort by date`]}),`
`,(0,_.jsxs)(n.li,{children:[(0,_.jsx)(n.code,{children:`qre`}),` - Sort using Query Ranking Expression`]}),`
`,(0,_.jsxs)(n.li,{children:[(0,_.jsx)(n.code,{children:`<FIELD> ascending`}),` / `,(0,_.jsx)(n.code,{children:`<FIELD> descending`}),` - Sort by a specific field (e.g., `,(0,_.jsx)(n.code,{children:`size ascending`}),`)`]}),`
`]}),(0,_.jsx)(n.h3,{id:`complex-sort-expressions`,children:`Complex Sort Expressions`}),(0,_.jsx)(n.p,{children:`You can specify multiple sort criteria separated by commas. The API applies them sequentially:`}),(0,_.jsx)(n.pre,{children:(0,_.jsx)(n.code,{className:`language-html`,children:`<atomic-sort-expression 
  label="Size then Date" 
  expression="size ascending, date descending">
</atomic-sort-expression>
`})}),(0,_.jsx)(n.p,{children:`Valid combinations:`}),(0,_.jsxs)(n.ul,{children:[`
`,(0,_.jsx)(n.li,{children:`A relevancy criterion followed by field or date criteria`}),`
`,(0,_.jsx)(n.li,{children:`A qre criterion followed by field or date criteria`}),`
`,(0,_.jsx)(n.li,{children:`Two or more field criteria`}),`
`,(0,_.jsx)(n.li,{children:`A date criterion and one or more field criteria`}),`
`]}),(0,_.jsx)(n.h2,{id:`tab-filtering`,children:`Tab Filtering`}),(0,_.jsx)(n.h3,{id:`tabs-included`,children:`tabs-included`}),(0,_.jsx)(n.p,{children:`Specify which tabs should display this sort expression:`}),(0,_.jsx)(n.pre,{children:(0,_.jsx)(n.code,{className:`language-html`,children:`<atomic-sort-expression 
  label="Relevance" 
  expression="relevancy"
  tabs-included='["all", "documents"]'>
</atomic-sort-expression>
`})}),(0,_.jsx)(n.h3,{id:`tabs-excluded`,children:`tabs-excluded`}),(0,_.jsx)(n.p,{children:`Specify which tabs should NOT display this sort expression:`}),(0,_.jsx)(n.pre,{children:(0,_.jsx)(n.code,{className:`language-html`,children:`<atomic-sort-expression 
  label="Date" 
  expression="date descending"
  tabs-excluded='["images"]'>
</atomic-sort-expression>
`})}),(0,_.jsxs)(n.blockquote,{children:[`
`,(0,_.jsxs)(n.p,{children:[(0,_.jsx)(n.strong,{children:`Note:`}),` Do not use both `,(0,_.jsx)(n.code,{children:`tabs-included`}),` and `,(0,_.jsx)(n.code,{children:`tabs-excluded`}),` on the same component, as this may lead to unexpected behavior.`]}),`
`]}),(0,_.jsx)(n.h2,{id:`related-components`,children:`Related Components`}),(0,_.jsxs)(n.ul,{children:[`
`,(0,_.jsxs)(n.li,{children:[(0,_.jsx)(n.a,{href:`?path=/docs/atomic-sort-dropdown--docs`,children:`atomic-sort-dropdown`}),`: Renders a dropdown that allows users to select sort criteria`]}),`
`]})]})]})}function g(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,_.jsx)(n,{...e,children:(0,_.jsx)(h,{...e})}):h(e)}var _;e((()=>{_=n(),a(),i(),m(),o()}))();export{g as default};