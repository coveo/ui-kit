import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{InAProductList as l,InARecommendationList as u,InASearchBoxInstantProducts as d,t as f}from"./atomic-product-template.new.stories-ZZX0U-0z.js";function p(e){let n={code:`code`,h2:`h2`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,ul:`ul`,...t(),...e.components};return(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(r,{of:c}),`
`,(0,h.jsxs)(s,{stories:{InAProductList:l,InARecommendationList:u,InASearchBoxInstantProducts:d},defaultStory:`InAProductList`,githubPath:`commerce/atomic-product-template/atomic-product-template.ts`,tagName:`atomic-product-template`,className:`AtomicProductTemplate`,children:[(0,h.jsxs)(n.p,{children:[`This component defines the UI display of your products.
A `,(0,h.jsx)(n.code,{children:`template`}),` element must be the child of an `,(0,h.jsx)(n.code,{children:`atomic-product-template`}),`. Furthermore, an `,(0,h.jsx)(n.code,{children:`atomic-commerce-product-list`}),`, `,(0,h.jsx)(n.code,{children:`atomic-commerce-recommendation-list`}),`, or `,(0,h.jsx)(n.code,{children:`atomic-commerce-search-box-instant-products`}),` must be the parent of each `,(0,h.jsx)(n.code,{children:`atomic-product-template`}),`.`]}),(0,h.jsxs)(n.ul,{children:[`
`,(0,h.jsxs)(n.li,{children:[(0,h.jsx)(n.strong,{children:`Note:`}),` Any `,(0,h.jsx)(n.code,{children:`<script>`}),` tags that are defined inside a `,(0,h.jsx)(n.code,{children:`<template>`}),` element will not be executed when the products are being rendered.`]}),`
`]}),(0,h.jsxs)(n.p,{children:[`Example using the `,(0,h.jsx)(n.code,{children:`atomic-commerce-product-list`}),`:`]}),(0,h.jsx)(n.pre,{children:(0,h.jsx)(n.code,{className:`language-html`,children:`<atomic-commerce-product-list>
  <atomic-product-template>
    <template>
      <atomic-product-section-name>
        <atomic-product-link class="font-bold"></atomic-product-link>
      </atomic-product-section-name>

      <atomic-product-section-metadata>
        <atomic-product-field-condition if-defined="ec_brand">
          <atomic-product-text
            field="ec_brand"
            class="block text-neutral-dark"
          ></atomic-product-text>
        </atomic-product-field-condition>

        <atomic-product-field-condition if-defined="ec_rating">
          <atomic-product-rating field="ec_rating"></atomic-product-rating>
        </atomic-product-field-condition>
      </atomic-product-section-metadata>

      <atomic-product-section-description>
        <atomic-product-text
          field="excerpt"
          class="block text-neutral-dark"
        ></atomic-product-text>
      </atomic-product-section-description>

      <atomic-product-section-emphasized>
        <atomic-product-price currency="USD"></atomic-product-price>
      </atomic-product-section-emphasized>
    </template>
  </atomic-product-template>
</atomic-commerce-product-list>
`})}),(0,h.jsx)(n.h2,{id:`template-conditions`,children:`Template Conditions`}),(0,h.jsxs)(n.p,{children:[`You can use conditions to display different templates based on product properties. You can specify as many `,(0,h.jsx)(n.code,{children:`must-match-*`}),` and `,(0,h.jsx)(n.code,{children:`must-not-match-*`}),` attributes as you want on a template, each targeting a different field. Each attribute can accept multiple comma-separated values.`]}),(0,h.jsxs)(n.p,{children:[(0,h.jsx)(n.strong,{children:`Comma represents OR:`}),` Within a single attribute, comma-separated values represent a logical OR. For example, `,(0,h.jsx)(n.code,{children:`must-match-ec_brand="Nike,Adidas"`}),` means the brand must be Nike OR Adidas.`]}),(0,h.jsxs)(n.p,{children:[(0,h.jsx)(n.strong,{children:`Multiple attributes represent AND:`}),` All conditions from different attributes must be met (logical AND) for the template to apply to a product.`]}),(0,h.jsxs)(n.p,{children:[`If you set both `,(0,h.jsx)(n.code,{children:`must-match-*`}),` and `,(0,h.jsx)(n.code,{children:`must-not-match-*`}),` for the same field and there is any overlap in values, the template will be ignored (it will never match any product).`]}),(0,h.jsxs)(n.p,{children:[(0,h.jsx)(n.strong,{children:`Order of declaration matters:`}),` The first template whose conditions are met will be applied. If a default template (without conditions) is declared first, it will apply to all products, even if other templates with conditions are declared later.`]}),(0,h.jsx)(n.p,{children:(0,h.jsx)(n.strong,{children:`Examples:`})}),(0,h.jsx)(n.pre,{children:(0,h.jsx)(n.code,{className:`language-html`,children:`<!-- Template applies if brand is Nike or Adidas, and product is in stock -->
<atomic-product-template
  must-match-ec_brand="Nike,Adidas"
  must-match-ec_in_stock="true"
>
  <template>
    <!-- ... -->
  </template>
</atomic-product-template>

<!-- This template will never apply, because the same value is required and forbidden -->
<atomic-product-template
  must-match-ec_brand="Nike"
  must-not-match-ec_brand="Nike"
>
  <template>
    <!-- ... -->
  </template>
</atomic-product-template>
`})}),(0,h.jsx)(n.pre,{children:(0,h.jsx)(n.code,{className:`language-html`,children:`<atomic-commerce-product-list>
  <!-- Template for luxury brands -->
  <atomic-product-template must-match-ec_brand="Gucci,Prada,Louis Vuitton">
    <template>
      <atomic-product-section-name>
        <atomic-product-link class="font-bold text-gold"></atomic-product-link>
      </atomic-product-section-name>
      
      <atomic-product-section-metadata>
        <atomic-product-text field="ec_brand" class="block text-luxury-gold"></atomic-product-text>
        <span class="luxury-badge">✨ Luxury</span>
      </atomic-product-section-metadata>

      <atomic-product-section-emphasized>
        <atomic-product-price currency="USD" class="text-gold"></atomic-product-price>
      </atomic-product-section-emphasized>
    </template>
  </atomic-product-template>

  <!-- Template for out-of-stock products -->
  <atomic-product-template must-match-ec_in_stock="false">
    <template>
      <atomic-product-section-name>
        <atomic-product-link class="font-bold opacity-60"></atomic-product-link>
      </atomic-product-section-name>
      
      <atomic-product-section-metadata>
        <atomic-product-field-condition if-defined="ec_brand">
          <atomic-product-text field="ec_brand" class="block text-neutral-dark"></atomic-product-text>
        </atomic-product-field-condition>
        <span class="out-of-stock-badge text-red-600">Out of Stock</span>
      </atomic-product-section-metadata>

      <atomic-product-section-emphasized>
        <atomic-product-price currency="USD" class="opacity-60"></atomic-product-price>
      </atomic-product-section-emphasized>
    </template>
  </atomic-product-template>

  <!-- Default template for all other products -->
  <atomic-product-template>
    <template>
      <atomic-product-section-name>
        <atomic-product-link class="font-bold"></atomic-product-link>
      </atomic-product-section-name>

      <atomic-product-section-metadata>
        <atomic-product-field-condition if-defined="ec_brand">
          <atomic-product-text field="ec_brand" class="block text-neutral-dark"></atomic-product-text>
        </atomic-product-field-condition>

        <atomic-product-field-condition if-defined="ec_rating">
          <atomic-product-rating field="ec_rating"></atomic-product-rating>
        </atomic-product-field-condition>
      </atomic-product-section-metadata>

      <atomic-product-section-description>
        <atomic-product-text field="excerpt" class="block text-neutral-dark"></atomic-product-text>
      </atomic-product-section-description>

      <atomic-product-section-emphasized>
        <atomic-product-price currency="USD"></atomic-product-price>
      </atomic-product-section-emphasized>
    </template>
  </atomic-product-template>
</atomic-commerce-product-list>
`})})]})]})}function m(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,h.jsx)(n,{...e,children:(0,h.jsx)(p,{...e})}):p(e)}var h;e((()=>{h=n(),a(),i(),f(),o()}))();export{m as default};