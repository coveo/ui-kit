import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,GridDisplay as u,GridDisplayBeforeQuery as d,GridDisplayWithTemplate as f,ListDisplayBeforeQuery as p,ListDisplayWithTemplate as m,NoResults as h,TableDisplay as g,TableDisplayBeforeQuery as _,t as v}from"./atomic-result-list.new.stories-VKyhOId6.js";function y(e){let n={a:`a`,code:`code`,h2:`h2`,li:`li`,p:`p`,pre:`pre`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,ul:`ul`,...t(),...e.components};return(0,x.jsxs)(x.Fragment,{children:[(0,x.jsx)(r,{of:c}),`
`,(0,x.jsxs)(s,{stories:{Default:l,ListDisplayWithTemplate:m,ListDisplayBeforeQuery:p,GridDisplay:u,GridDisplayWithTemplate:f,GridDisplayBeforeQuery:d,TableDisplay:g,TableDisplayBeforeQuery:_,NoResults:h},githubPath:`search/atomic-result-list/atomic-result-list.ts`,tagName:`atomic-result-list`,className:`AtomicResultList`,children:[(0,x.jsxs)(n.p,{children:[`This component is typically placed within the `,(0,x.jsx)(n.code,{children:`results`}),` section of the layout.`]}),(0,x.jsx)(n.pre,{children:(0,x.jsx)(n.code,{className:`language-html`,children:`<atomic-search-interface>
  ...
  <atomic-search-layout>
    ...
    <atomic-layout-section section="main">
      ...
      <atomic-layout-section section="results">
        <atomic-result-list></atomic-result-list>
      </atomic-layout-section>
    </atomic-layout-section>
  </atomic-search-layout>
</atomic-search-interface>
`})}),(0,x.jsxs)(n.p,{children:[`The components supports three `,(0,x.jsx)(n.code,{children:`display`}),` modes:`]}),(0,x.jsxs)(n.ul,{children:[`
`,(0,x.jsxs)(n.li,{children:[(0,x.jsx)(n.code,{children:`list`}),` (default)`]}),`
`,(0,x.jsx)(n.li,{children:(0,x.jsx)(n.code,{children:`grid`})}),`
`,(0,x.jsx)(n.li,{children:(0,x.jsx)(n.code,{children:`table`})}),`
`]}),(0,x.jsxs)(n.p,{children:[`When `,(0,x.jsx)(n.a,{href:`https://docs.coveo.com/en/atomic/latest/usage/displaying-results/list-or-grid/`,rel:`nofollow`,children:`displaying results as a list or grid`}),`, the component applies a basic template by default. You can also `,(0,x.jsx)(n.a,{href:`https://docs.coveo.com/en/atomic/latest/usage/displaying-results/#defining-a-result-template`,rel:`nofollow`,children:`define custom templates`}),`.`]}),(0,x.jsx)(n.pre,{children:(0,x.jsx)(n.code,{className:`language-html`,children:`<atomic-result-list>
  <atomic-result-template>
    <template>
      <!-- ... -->
    </template>
  </atomic-result-template>
</atomic-result-list>
`})}),(0,x.jsxs)(n.p,{children:[`When `,(0,x.jsx)(n.a,{href:`https://docs.coveo.com/en/atomic/latest/usage/displaying-results/table/`,rel:`nofollow`,children:`displaying results as a table`}),`, there is no default template. You must define a template that includes at least one `,(0,x.jsx)(n.code,{children:`atomic-table-element`}),` component, which serve as columns.`]}),(0,x.jsx)(n.pre,{children:(0,x.jsx)(n.code,{className:`language-html`,children:`<atomic-result-list display="table">
  <atomic-result-template>
    <template>
      <atomic-table-element label="Result">
        <atomic-result-link></atomic-result-link>
      </atomic-table-element>
      <atomic-table-element label="ID">
        <atomic-result-text field="permanentid"></atomic-result-text>
      </atomic-table-element>
      <atomic-table-element label="Price">
        <atomic-result-price></atomic-result-price>
      </atomic-table-element>
    </template>
  </atomic-result-template>
</atomic-result-list>
`})}),(0,x.jsx)(n.h2,{id:`use-cases-and-examples`,children:`Use Cases and Examples`}),(0,x.jsx)(n.p,{children:`The following table outlines the key differences and best use cases for grids, lists, and tables, helping you choose the most appropriate format based on your content and user needs.`}),(0,x.jsxs)(n.table,{children:[(0,x.jsx)(n.thead,{children:(0,x.jsxs)(n.tr,{children:[(0,x.jsx)(n.th,{children:`Layout`}),(0,x.jsx)(n.th,{children:`Description`})]})}),(0,x.jsxs)(n.tbody,{children:[(0,x.jsxs)(n.tr,{children:[(0,x.jsx)(n.td,{children:`Grid`}),(0,x.jsx)(n.td,{children:`Greater emphasis on images than text.  Helps users compare items visually.  Allows displaying more results.  Use when recent, high-quality images are available.`})]}),(0,x.jsxs)(n.tr,{children:[(0,x.jsx)(n.td,{children:`List`}),(0,x.jsx)(n.td,{children:`Use when content or description is most important.  Helps users compare textually and scan content more easily.  Fewer results but reduced cognitive load, as text is heavier than images.  Use when image quality is uncertain.`})]}),(0,x.jsxs)(n.tr,{children:[(0,x.jsx)(n.td,{children:`Table`}),(0,x.jsx)(n.td,{children:`Use when data is best presented in a tabular format.`})]})]})]}),(0,x.jsx)(n.h2,{id:`reference`,children:`Reference`}),(0,x.jsx)(n.p,{children:(0,x.jsx)(n.a,{href:`https://uxdesign.cc/ui-cheat-sheet-list-vs-grids-48151a7262a7`,rel:`nofollow`,children:`UI cheat sheet: list vs grid`})})]})]})}function b(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,x.jsx)(n,{...e,children:(0,x.jsx)(y,{...e})}):y(e)}var x;e((()=>{x=n(),a(),i(),v(),o()}))();export{b as default};