import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,NoRecommendations as u,NotEnoughRecsForCarousel as d,RecsAsCarousel as f,RecsBeforeQuery as p,RecsOpeningInNewTab as m,RecsWithFullTemplate as h,t as g}from"./atomic-recs-list.new.stories-BaDqnOSC.js";function _(e){let n={code:`code`,h2:`h2`,p:`p`,pre:`pre`,...t(),...e.components};return(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(r,{of:c}),`
`,(0,y.jsxs)(s,{stories:{Default:l,RecsBeforeQuery:p,RecsWithFullTemplate:h,RecsOpeningInNewTab:m,RecsAsCarousel:f,NotEnoughRecsForCarousel:d,NoRecommendations:u},githubPath:`recommendations/atomic-recs-list/atomic-recs-list.ts`,tagName:`atomic-recs-list`,className:`AtomicRecsList`,children:[(0,y.jsxs)(n.p,{children:[`The `,(0,y.jsx)(n.code,{children:`atomic-recs-list`}),` component displays recommendations by applying one or more result templates.`]}),(0,y.jsx)(n.pre,{children:(0,y.jsx)(n.code,{className:`language-html`,children:`<atomic-recs-interface>
  <atomic-recs-list label="Recommended for you">
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
  </atomic-recs-list>
</atomic-recs-interface>
`})}),(0,y.jsx)(n.h2,{id:`carousel-mode`,children:`Carousel Mode`}),(0,y.jsxs)(n.p,{children:[`Setting `,(0,y.jsx)(n.code,{children:`number-of-recommendations-per-page`}),` to a value greater than 0 and less than `,(0,y.jsx)(n.code,{children:`number-of-recommendations`}),` enables carousel mode, which allows users to navigate through pages of recommendations.`]}),(0,y.jsx)(n.pre,{children:(0,y.jsx)(n.code,{className:`language-html`,children:`<atomic-recs-list
  number-of-recommendations="10"
  number-of-recommendations-per-page="4"
  label="Recommended for you"
>
  ...
</atomic-recs-list>
`})})]})]})}function v(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,y.jsx)(n,{...e,children:(0,y.jsx)(_,{...e})}):_(e)}var y;e((()=>{y=n(),a(),i(),g(),o()}))();export{v as default};