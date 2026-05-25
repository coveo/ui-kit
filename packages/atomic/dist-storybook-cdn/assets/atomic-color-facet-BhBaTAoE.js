import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{CheckboxDisplay as l,Default as u,WithSelectedValue as d,t as f}from"./atomic-color-facet.new.stories-_Sr9xU3E.js";function p(e){let n={a:`a`,code:`code`,h2:`h2`,h3:`h3`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,ul:`ul`,...t(),...e.components};return(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(r,{of:c}),`
`,(0,h.jsxs)(s,{stories:{Default:u,CheckboxDisplay:l,WithSelectedValue:d},githubPath:`search/atomic-color-facet/atomic-color-facet.ts`,tagName:`atomic-color-facet`,className:`AtomicColorFacet`,children:[(0,h.jsx)(n.p,{children:`Use this component when facet values benefit from visual color representation—such as file types, status indicators, or product categories. Unlike standard facets that display only text labels, color facets provide immediate visual recognition through customizable color boxes or color-coded checkboxes.`}),(0,h.jsxs)(n.p,{children:[`Place this component within the "facets" section of your search layout. For Dynamic Navigation Experience (DNE) support, nest it inside an `,(0,h.jsx)(n.code,{children:`atomic-facet-manager`}),` component (see `,(0,h.jsx)(n.a,{href:`https://docs.coveo.com/en/2918`,rel:`nofollow`,children:`DNE documentation`}),`).`]}),(0,h.jsx)(n.h2,{id:`usage`,children:`Usage`}),(0,h.jsx)(n.pre,{children:(0,h.jsx)(n.code,{className:`language-html`,children:`<atomic-search-interface>
  ...
  <atomic-search-layout>
    ...
    <atomic-layout-section section="facets">
      ...
      <atomic-color-facet field="filetype" label="File Type"></atomic-color-facet>
    </atomic-layout-section>
  </atomic-search-layout>
</atomic-search-interface>
`})}),(0,h.jsx)(n.h2,{id:`customizing-colors`,children:`Customizing Colors`}),(0,h.jsx)(n.p,{children:`You can customize the colors for specific facet values using CSS shadow parts. The component provides dynamic parts for each facet value:`}),(0,h.jsxs)(n.ul,{children:[`
`,(0,h.jsxs)(n.li,{children:[(0,h.jsx)(n.code,{children:`value-{value}`}),` - Specific styling for a particular facet value (case-sensitive, matching the raw facet value)`]}),`
`,(0,h.jsxs)(n.li,{children:[(0,h.jsx)(n.code,{children:`default-color-value`}),` - Default styling applied to all color boxes`]}),`
`]}),(0,h.jsx)(n.h3,{id:`example-customizing-file-type-colors`,children:`Example: Customizing File Type Colors`}),(0,h.jsx)(n.pre,{children:(0,h.jsx)(n.code,{className:`language-html`,children:`<style>
  atomic-color-facet::part(value-pdf) {
    background-image: url('atomic/assets/pdf.svg');
    background-color: rgb(255, 0, 0);
    background-position: center;
    background-size: contain;
    background-repeat: no-repeat;
  }
  
  atomic-color-facet::part(value-doc) {
    background-image: url('atomic/assets/document.svg');
    background-color: rgb(146, 151, 196);
    background-position: center;
    background-size: contain;
    background-repeat: no-repeat;
  }
</style>

<atomic-color-facet field="filetype" label="File Type"></atomic-color-facet>
`})}),(0,h.jsx)(n.h2,{id:`customizing-layout`,children:`Customizing Layout`}),(0,h.jsx)(n.p,{children:`You can customize the number of color boxes displayed per row using CSS custom properties:`}),(0,h.jsx)(n.pre,{children:(0,h.jsx)(n.code,{className:`language-html`,children:`<style>
  atomic-color-facet {
    --atomic-facet-color-boxes-per-row: 4;
    --atomic-facet-color-boxes-gap: 1rem;
  }
</style>
`})}),(0,h.jsx)(n.h2,{id:`ux-best-practices`,children:`UX Best Practices`}),(0,h.jsx)(n.h3,{id:`usage-notes`,children:`Usage Notes`}),(0,h.jsxs)(n.ul,{children:[`
`,(0,h.jsx)(n.li,{children:`A color facet is best for placing emphasis on the visual aspect of a facet value.`}),`
`,(0,h.jsxs)(n.li,{children:[`The two available options to display the facet values are `,(0,h.jsx)(n.code,{children:`box`}),` and `,(0,h.jsx)(n.code,{children:`checkbox`}),`.`,`
`,(0,h.jsxs)(n.ul,{children:[`
`,(0,h.jsxs)(n.li,{children:[`The `,(0,h.jsx)(n.code,{children:`box`}),` display option will present the facet values in a grid with a larger tile format.`]}),`
`,(0,h.jsxs)(n.li,{children:[`The `,(0,h.jsx)(n.code,{children:`checkbox`}),` display option will present the values in a list with a smaller icon or color tile.`]}),`
`]}),`
`]}),`
`,(0,h.jsxs)(n.li,{children:[`When the facet doesn't have too many values to display and the text labels are short, it's best practice to use the `,(0,h.jsx)(n.code,{children:`box`}),` display option.`]}),`
`,(0,h.jsxs)(n.li,{children:[`When using an image instead of a color tile or icon, it's best practice to use the `,(0,h.jsx)(n.code,{children:`box`}),` display.`]}),`
`]}),(0,h.jsx)(n.h3,{id:`use-cases-and-examples`,children:`Use Cases and Examples`}),(0,h.jsx)(n.p,{children:`Use a color facet when color or an image-based swatch provides faster recognition than plain text. For example:`}),(0,h.jsxs)(n.ul,{children:[`
`,(0,h.jsxs)(n.li,{children:[(0,h.jsx)(n.strong,{children:`Commerce product colors:`}),` A person shopping for a t-shirt can select the colors they want (for example, `,(0,h.jsx)(n.code,{children:`red`}),`, `,(0,h.jsx)(n.code,{children:`blue`}),`, or `,(0,h.jsx)(n.code,{children:`green`}),`) to immediately see only products available in those colors.`]}),`
`,(0,h.jsxs)(n.li,{children:[(0,h.jsx)(n.strong,{children:`Product variants or finishes:`}),` A person choosing furniture or appliances can filter by finishes such as `,(0,h.jsx)(n.code,{children:`matte black`}),`, `,(0,h.jsx)(n.code,{children:`brushed steel`}),`, or `,(0,h.jsx)(n.code,{children:`oak`}),` using image swatches or color tiles.`]}),`
`,(0,h.jsxs)(n.li,{children:[(0,h.jsx)(n.strong,{children:`Document or content types:`}),` An internal knowledge base can use different colors or icons for `,(0,h.jsx)(n.code,{children:`PDF`}),`, `,(0,h.jsx)(n.code,{children:`DOC`}),`, `,(0,h.jsx)(n.code,{children:`PPT`}),`, and `,(0,h.jsx)(n.code,{children:`Image`}),` file types so people can visually scan for the type they need.`]}),`
`,(0,h.jsxs)(n.li,{children:[(0,h.jsx)(n.strong,{children:`Status indicators:`}),` A support or operations dashboard can map colors to statuses like `,(0,h.jsx)(n.code,{children:`Open`}),`, `,(0,h.jsx)(n.code,{children:`In Progress`}),`, or `,(0,h.jsx)(n.code,{children:`Resolved`}),`, helping people quickly understand the distribution of work items.`]}),`
`]}),(0,h.jsx)(n.h2,{id:`reference`,children:`Reference`}),(0,h.jsxs)(n.p,{children:[(0,h.jsx)(n.a,{href:`https://source.coveo.com/2018/04/18/facets/`,rel:`nofollow`,children:`Don't Lose Face with Facets`}),`
`,(0,h.jsx)(n.a,{href:`https://www.wayfair.com/furniture/sb0/bar-stools-counter-stools-c1767662.html`,rel:`nofollow`,children:`Wayfair implementation of a visual facet`})]})]})]})}function m(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,h.jsx)(n,{...e,children:(0,h.jsx)(p,{...e})}):p(e)}var h;e((()=>{h=n(),a(),i(),f(),o()}))();export{m as default};