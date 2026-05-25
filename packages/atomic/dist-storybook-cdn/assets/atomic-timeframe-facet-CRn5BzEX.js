import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Collapsed as l,Default as u,WithDatePicker as d,WithDependsOn as f,WithSelectedValue as p,t as m}from"./atomic-timeframe-facet.new.stories-CIgpqXDw.js";function h(e){let n={a:`a`,code:`code`,h2:`h2`,h3:`h3`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,ul:`ul`,...t(),...e.components};return(0,_.jsxs)(_.Fragment,{children:[(0,_.jsx)(r,{of:c}),`
`,(0,_.jsxs)(s,{stories:{Default:u,WithSelectedValue:p,WithDatePicker:d,WithDependsOn:f,Collapsed:l},githubPath:`search/atomic-timeframe-facet/atomic-timeframe-facet.ts`,tagName:`atomic-timeframe-facet`,className:`AtomicTimeframeFacet`,children:[(0,_.jsx)(n.p,{children:`Use this component to filter search results by date ranges. The timeframe facet displays predefined time periods (such as "Past Month" or "Past Year") as facet values, allowing users to quickly filter results to specific time ranges.`}),(0,_.jsxs)(n.p,{children:[`Place this component within the "facets" section of your search layout. For Dynamic Navigation Experience (DNE) support, nest it inside an `,(0,_.jsx)(n.code,{children:`atomic-facet-manager`}),` component (see `,(0,_.jsx)(n.a,{href:`https://docs.coveo.com/en/2918`,rel:`nofollow`,children:`DNE documentation`}),`).`]}),(0,_.jsx)(n.h2,{id:`usage`,children:`Usage`}),(0,_.jsx)(n.h3,{id:`basic-timeframe-facet`,children:`Basic Timeframe Facet`}),(0,_.jsx)(n.pre,{children:(0,_.jsx)(n.code,{className:`language-html`,children:`<atomic-search-interface>
  ...
  <atomic-search-layout>
    ...
    <atomic-layout-section section="facets">
      ...
      <atomic-timeframe-facet field="date" label="Date">
        <atomic-timeframe unit="hour"></atomic-timeframe>
        <atomic-timeframe unit="day"></atomic-timeframe>
        <atomic-timeframe unit="week"></atomic-timeframe>
        <atomic-timeframe unit="month"></atomic-timeframe>
        <atomic-timeframe unit="quarter"></atomic-timeframe>
        <atomic-timeframe unit="year"></atomic-timeframe>
      </atomic-timeframe-facet>
    </atomic-layout-section>
  </atomic-search-layout>
</atomic-search-interface>
`})}),(0,_.jsx)(n.h3,{id:`custom-timeframe-ranges`,children:`Custom Timeframe Ranges`}),(0,_.jsxs)(n.p,{children:[`You can specify custom amounts for each timeframe using the `,(0,_.jsx)(n.code,{children:`amount`}),` attribute on `,(0,_.jsx)(n.code,{children:`atomic-timeframe`}),` elements:`]}),(0,_.jsx)(n.pre,{children:(0,_.jsx)(n.code,{className:`language-html`,children:`<atomic-timeframe-facet field="date" label="Publication Date">
  <atomic-timeframe unit="day" amount="7"></atomic-timeframe>
  <atomic-timeframe unit="month" amount="1"></atomic-timeframe>
  <atomic-timeframe unit="month" amount="3"></atomic-timeframe>
  <atomic-timeframe unit="month" amount="6"></atomic-timeframe>
  <atomic-timeframe unit="year" amount="1"></atomic-timeframe>
</atomic-timeframe-facet>
`})}),(0,_.jsx)(n.h3,{id:`custom-timeframe-labels`,children:`Custom Timeframe Labels`}),(0,_.jsxs)(n.p,{children:[`You can provide custom labels for timeframes using the `,(0,_.jsx)(n.code,{children:`label`}),` attribute:`]}),(0,_.jsx)(n.pre,{children:(0,_.jsx)(n.code,{className:`language-html`,children:`<atomic-timeframe-facet field="date" label="Date Range">
  <atomic-timeframe unit="week" amount="1" label="This Week"></atomic-timeframe>
  <atomic-timeframe unit="month" amount="1" label="This Month"></atomic-timeframe>
  <atomic-timeframe unit="month" amount="3" label="Last Quarter"></atomic-timeframe>
</atomic-timeframe-facet>
`})}),(0,_.jsx)(n.h3,{id:`with-date-picker`,children:`With Date Picker`}),(0,_.jsxs)(n.p,{children:[`Enable users to select custom date ranges by setting the `,(0,_.jsx)(n.code,{children:`with-date-picker`}),` attribute:`]}),(0,_.jsx)(n.pre,{children:(0,_.jsx)(n.code,{className:`language-html`,children:`<atomic-timeframe-facet 
  field="date" 
  label="Date" 
  with-date-picker
  min="2020-01-01"
  max="2025-12-31"
>
  <atomic-timeframe unit="month"></atomic-timeframe>
  <atomic-timeframe unit="year"></atomic-timeframe>
</atomic-timeframe-facet>
`})}),(0,_.jsxs)(n.p,{children:[`When `,(0,_.jsx)(n.code,{children:`with-date-picker`}),` is enabled, users can:`]}),(0,_.jsxs)(n.ul,{children:[`
`,(0,_.jsx)(n.li,{children:`Choose from predefined timeframes`}),`
`,(0,_.jsx)(n.li,{children:`Enter custom start and end dates`}),`
`,(0,_.jsxs)(n.li,{children:[`Apply date range constraints using the `,(0,_.jsx)(n.code,{children:`min`}),` and `,(0,_.jsx)(n.code,{children:`max`}),` attributes`]}),`
`]}),(0,_.jsx)(n.h3,{id:`dependent-facet`,children:`Dependent Facet`}),(0,_.jsxs)(n.p,{children:[`Make the timeframe facet conditional on another facet's selection using `,(0,_.jsx)(n.code,{children:`depends-on`}),`:`]}),(0,_.jsx)(n.pre,{children:(0,_.jsx)(n.code,{className:`language-html`,children:`<atomic-facet facet-id="filetype" field="filetype" label="File Type"></atomic-facet>

<atomic-timeframe-facet 
  field="date" 
  label="Date" 
  depends-on-filetype="PDF"
>
  <atomic-timeframe unit="month"></atomic-timeframe>
  <atomic-timeframe unit="year"></atomic-timeframe>
</atomic-timeframe-facet>
`})}),(0,_.jsx)(n.p,{children:`In this example, the timeframe facet only appears when "PDF" is selected in the file type facet.`}),(0,_.jsx)(n.h2,{id:`customization`,children:`Customization`}),(0,_.jsx)(n.h3,{id:`sorting`,children:`Sorting`}),(0,_.jsxs)(n.p,{children:[`Control the order in which timeframe values appear using the `,(0,_.jsx)(n.code,{children:`sort-criteria`}),` attribute:`]}),(0,_.jsx)(n.pre,{children:(0,_.jsx)(n.code,{className:`language-html`,children:`<atomic-timeframe-facet 
  field="date" 
  label="Date" 
  sort-criteria="ascending"
>
  ...
</atomic-timeframe-facet>
`})}),(0,_.jsxs)(n.ul,{children:[`
`,(0,_.jsxs)(n.li,{children:[(0,_.jsx)(n.code,{children:`descending`}),` (default): Shows most recent timeframes first`]}),`
`,(0,_.jsxs)(n.li,{children:[(0,_.jsx)(n.code,{children:`ascending`}),`: Shows oldest timeframes first`]}),`
`]}),(0,_.jsx)(n.h2,{id:`best-practices`,children:`Best Practices`}),(0,_.jsxs)(n.ul,{children:[`
`,(0,_.jsxs)(n.li,{children:[(0,_.jsx)(n.strong,{children:`Choose meaningful timeframes`}),`: Select time ranges that match your users' search patterns and your content's typical age distribution`]}),`
`,(0,_.jsxs)(n.li,{children:[(0,_.jsx)(n.strong,{children:`Limit the number of timeframes`}),`: Avoid overwhelming users with too many options (5-7 timeframes is typically sufficient)`]}),`
`,(0,_.jsxs)(n.li,{children:[(0,_.jsx)(n.strong,{children:`Use the date picker for flexibility`}),`: Enable `,(0,_.jsx)(n.code,{children:`with-date-picker`}),` when users need precise date range control`]}),`
`,(0,_.jsxs)(n.li,{children:[(0,_.jsx)(n.strong,{children:`Set appropriate min/max values`}),`: When using the date picker, constrain the date range to your content's actual date span`]}),`
`]})]})]})}function g(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,_.jsx)(n,{...e,children:(0,_.jsx)(h,{...e})}):h(e)}var _;e((()=>{_=n(),a(),i(),m(),o()}))();export{g as default};