import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,NotEnoughRecsForCarousel as u,RecsAsCarousel as d,RecsOpeningInNewTab as f,RecsWithFullTemplate as p,t as m}from"./atomic-ipx-recs-list.new.stories-GzNrUB_T.js";function h(e){let n={code:`code`,h2:`h2`,p:`p`,pre:`pre`,...t(),...e.components};return(0,_.jsxs)(_.Fragment,{children:[(0,_.jsx)(r,{of:c}),`
`,(0,_.jsxs)(s,{stories:{Default:l,RecsWithFullTemplate:p,RecsOpeningInNewTab:f,RecsAsCarousel:d,NotEnoughRecsForCarousel:u},githubPath:`ipx/atomic-ipx-recs-list/atomic-ipx-recs-list.ts`,tagName:`atomic-ipx-recs-list`,className:`AtomicIpxRecsList`,defaultStory:`Default`,children:[(0,_.jsxs)(n.p,{children:[`The `,(0,_.jsx)(n.code,{children:`atomic-ipx-recs-list`}),` component displays recommendations for the In-Product Experience (IPX) use case by applying one or more result templates.
It supports carousel pagination, customizable display layouts, and integrates with the IPX actions history for tracking user interactions.`]}),(0,_.jsxs)(n.p,{children:[`The component must be placed within an `,(0,_.jsx)(n.code,{children:`atomic-recs-interface`}),` and requires result templates to define how recommendations are displayed:`]}),(0,_.jsx)(n.pre,{children:(0,_.jsx)(n.code,{className:`language-html`,children:`<atomic-recs-interface>
  <atomic-ipx-recs-list
    recommendation="MyRecommendations"
    label="Recommended for you"
    heading-level="2"
    number-of-recommendations="10"
  >
    <atomic-recs-result-template>
      <template>
        <atomic-result-section-title>
          <atomic-result-link></atomic-result-link>
        </atomic-result-section-title>
        <atomic-result-section-excerpt>
          <atomic-result-text field="excerpt"></atomic-result-text>
        </atomic-result-section-excerpt>
      </template>
    </atomic-recs-result-template>
  </atomic-ipx-recs-list>
</atomic-recs-interface>
`})}),(0,_.jsx)(n.h2,{id:`carousel-mode`,children:`Carousel Mode`}),(0,_.jsxs)(n.p,{children:[`Enable carousel pagination by setting `,(0,_.jsx)(n.code,{children:`number-of-recommendations-per-page`}),` to a value less than `,(0,_.jsx)(n.code,{children:`number-of-recommendations`}),`:`]}),(0,_.jsx)(n.pre,{children:(0,_.jsx)(n.code,{className:`language-html`,children:`<atomic-ipx-recs-list
  number-of-recommendations="12"
  number-of-recommendations-per-page="4"
>
  <!-- templates -->
</atomic-ipx-recs-list>
`})}),(0,_.jsx)(n.h2,{id:`grid-layout`,children:`Grid Layout`}),(0,_.jsxs)(n.p,{children:[`Customize the number of columns using the `,(0,_.jsx)(n.code,{children:`--atomic-recs-number-of-columns`}),` CSS variable:`]}),(0,_.jsx)(n.pre,{children:(0,_.jsx)(n.code,{className:`language-html`,children:`<style>
  atomic-ipx-recs-list {
    --atomic-recs-number-of-columns: 3;
  }
</style>
`})})]})]})}function g(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,_.jsx)(n,{...e,children:(0,_.jsx)(h,{...e})}):h(e)}var _;e((()=>{_=n(),a(),i(),m(),o()}))();export{g as default};