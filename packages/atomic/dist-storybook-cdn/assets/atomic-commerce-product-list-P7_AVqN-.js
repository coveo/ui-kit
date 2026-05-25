import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,GridDisplayBeforeQuery as u,GridDisplayWithTemplate as d,ListDisplay as f,ListDisplayBeforeQuery as p,ListDisplayWithTemplate as m,NoProducts as h,TableDisplay as g,TableDisplayBeforeQuery as _,t as v}from"./atomic-commerce-product-list.new.stories-C6ZHpeNt.js";function y(e){let n={a:`a`,code:`code`,h3:`h3`,li:`li`,p:`p`,pre:`pre`,ul:`ul`,...t(),...e.components};return(0,x.jsxs)(x.Fragment,{children:[(0,x.jsx)(r,{of:c}),`
`,(0,x.jsxs)(s,{stories:{Default:l,GridDisplayWithTemplate:d,GridDisplayBeforeQuery:u,ListDisplay:f,ListDisplayWithTemplate:m,ListDisplayBeforeQuery:p,TableDisplay:g,TableDisplayBeforeQuery:_,NoProducts:h},githubPath:`commerce/atomic-commerce-product-list/atomic-commerce-product-list.ts`,tagName:`atomic-commerce-product-list`,className:`AtomicCommerceProductList`,children:[(0,x.jsxs)(n.p,{children:[`This component is typically placed within the `,(0,x.jsx)(n.code,{children:`products`}),` section of the layout.`]}),(0,x.jsx)(n.pre,{children:(0,x.jsx)(n.code,{className:`language-html`,children:`<atomic-commerce-interface>
  ...
  <atomic-commerce-layout>
    ...
    <atomic-layout-section section="main">
      ...
      <atomic-layout-section section="products">
        <atomic-commerce-product-list></atomic-commerce-product-list>
      </atomic-layout-section>
    </atomic-layout-section>
  </atomic-commerce-layout>
</atomic-commerce-interface>
`})}),(0,x.jsxs)(n.p,{children:[`The components supports three `,(0,x.jsx)(n.code,{children:`display`}),` modes:`]}),(0,x.jsxs)(n.ul,{children:[`
`,(0,x.jsxs)(n.li,{children:[(0,x.jsx)(n.code,{children:`grid`}),` (default)`]}),`
`,(0,x.jsx)(n.li,{children:(0,x.jsx)(n.code,{children:`list`})}),`
`,(0,x.jsx)(n.li,{children:(0,x.jsx)(n.code,{children:`table`})}),`
`]}),(0,x.jsxs)(n.p,{children:[`When `,(0,x.jsx)(n.a,{href:`https://docs.coveo.com/en/atomic/latest/usage/displaying-results/list-or-grid/`,rel:`nofollow`,children:`displaying products as a list or grid`}),`, the component applies a basic template by default. You can also `,(0,x.jsx)(n.a,{href:`https://docs.coveo.com/en/atomic/latest/usage/displaying-results/#defining-a-result-template`,rel:`nofollow`,children:`define custom templates`}),`.`]}),(0,x.jsx)(n.pre,{children:(0,x.jsx)(n.code,{className:`language-html`,children:`<atomic-commerce-product-list>
  <atomic-product-template>
    <template>
      <!-- ... -->
    </template>
  </atomic-product-template>
</atomic-commerce-product-list>
`})}),(0,x.jsxs)(n.p,{children:[`When `,(0,x.jsx)(n.a,{href:`https://docs.coveo.com/en/atomic/latest/usage/displaying-results/table/`,rel:`nofollow`,children:`displaying products as a table`}),`, there is no default template. You must define a template that includes at least one `,(0,x.jsx)(n.code,{children:`atomic-table-element`}),` component, which serve as columns.`]}),(0,x.jsx)(n.pre,{children:(0,x.jsx)(n.code,{className:`language-html`,children:`<atomic-commerce-product-list display="table">
  <atomic-product-template>
    <template>
      <atomic-table-element label="Product">
        <atomic-product-link></atomic-product-link>
      </atomic-table-element>
      <atomic-table-element label="ID">
        <atomic-product-text field="permanentid"></atomic-product-text>
      </atomic-table-element>
      <atomic-table-element label="Price">
        <atomic-product-price></atomic-product-price>
      </atomic-table-element>
    </template>
  </atomic-product-template>
</atomic-commerce-product-list>
`})}),(0,x.jsx)(n.h3,{id:`displaying-a-specific-product-listing`,children:`Displaying a specific product listing`}),(0,x.jsxs)(n.p,{children:[`If you want `,(0,x.jsx)(n.code,{children:`atomic-commerce-product-list`}),` to display a specific product listing, you will need to ensure that the `,(0,x.jsx)(n.code,{children:`atomic-commerce-interface`}),` at
level component of the hierarchy for this interface has its type set to `,(0,x.jsx)(n.code,{children:`product-listing`}),`.`]}),(0,x.jsxs)(n.p,{children:[`You will also need to ensure that configuration being used to initialize the interface has the `,(0,x.jsx)(n.code,{children:`view`}),` url of the configuration
`,(0,x.jsx)(n.a,{href:`https://docs.coveo.com/en/headless/latest/reference/interfaces/Commerce.ContextOptions.html`,rel:`nofollow`,children:(0,x.jsx)(n.code,{children:`context`})}),` set to a configured listing page.`]}),(0,x.jsx)(n.p,{children:`For example,`}),(0,x.jsx)(n.pre,{children:(0,x.jsx)(n.code,{className:`language-html`,children:`<script type="module">
  const {
    getSampleSearchEngineConfiguration
  } = await import('https://static.cloud.coveo.com/headless/v3/headless.esm.js');
  const {context, ...restOfConfiguration} = getSampleCommerceEngineConfiguration();

  const configuration = {
    context: {
      ...context,
      view: {
        url: \`\${context.view.url}/browse/promotions/ui-kit-testing\`,
      },
    },
    ...restOfConfiguration,
  };

  await customElements.whenDefined('atomic-commerce-interface');
  const commerceInterface = document.querySelector('atomic-commerce-interface');
  await commerceInterface.initialize(configuration);
  await commerceInterface.executeFirstRequest();
<\/script>

`})})]})]})}function b(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,x.jsx)(n,{...e,children:(0,x.jsx)(y,{...e})}):y(e)}var x;e((()=>{x=n(),a(),i(),v(),o()}))();export{b as default};