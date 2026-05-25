import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Facet as l,Result as u,t as d}from"./atomic-format-unit.new.stories-Dykbngn0.js";function f(e){let n={a:`a`,code:`code`,h3:`h3`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,ul:`ul`,...t(),...e.components};return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(r,{of:c}),`
`,(0,m.jsxs)(s,{stories:{Facet:l,Result:u},githubPath:`search/atomic-format-unit/atomic-format-unit.ts`,tagName:`atomic-format-unit`,className:`AtomicFormatUnit`,defaultStory:`Facet`,children:[(0,m.jsxs)(n.p,{children:[`The `,(0,m.jsx)(n.code,{children:`atomic-format-unit`}),` component is used for formatting numbers with units.
The numerical format of compatible parents will be set according to the properties of this component.`]}),(0,m.jsxs)(n.p,{children:[`This component is used within compatible parent components such as `,(0,m.jsx)(n.code,{children:`atomic-result-number`}),` or `,(0,m.jsx)(n.code,{children:`atomic-numeric-facet`}),`:`]}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-html`,children:`<atomic-search-interface>
  ...
  <atomic-result-list>
    <atomic-result-template>
      <template>
        <atomic-result-number field="size">
          <atomic-format-unit unit="byte"></atomic-format-unit>
        </atomic-result-number>
      </template>
    </atomic-result-template>
  </atomic-result-list>
  ...
</atomic-search-interface>
`})}),(0,m.jsx)(n.h3,{id:`within-a-numeric-facet`,children:`Within a Numeric Facet`}),(0,m.jsx)(n.pre,{children:(0,m.jsx)(n.code,{className:`language-html`,children:`<atomic-numeric-facet field="size">
  <atomic-format-unit unit="byte" unit-display="long"></atomic-format-unit>
</atomic-numeric-facet>
`})}),(0,m.jsx)(n.h3,{id:`unit-display-styles`,children:`Unit Display Styles`}),(0,m.jsxs)(n.p,{children:[`The `,(0,m.jsx)(n.code,{children:`unit-display`}),` property controls how the unit is displayed:`]}),(0,m.jsxs)(n.ul,{children:[`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`"long"`}),`: Full unit name (e.g., "16 liters")`]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`"short"`}),`: Abbreviated unit (e.g., "16 L") - `,(0,m.jsx)(n.strong,{children:`default`})]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`"narrow"`}),`: Compact format (e.g., "16L")`]}),`
`]}),(0,m.jsx)(n.h3,{id:`sanctioned-units`,children:`Sanctioned Units`}),(0,m.jsxs)(n.p,{children:[`The `,(0,m.jsx)(n.code,{children:`unit`}),` property must be a `,(0,m.jsx)(n.a,{href:`https://tc39.es/proposal-unified-intl-numberformat/section6/locales-currencies-tz_proposed_out.html#sec-issanctionedsimpleunitidentifier`,rel:`nofollow`,children:`sanctioned unit identifier`}),` as defined by the Intl.NumberFormat specification. Common examples include:`]}),(0,m.jsxs)(n.ul,{children:[`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`"byte"`}),`, `,(0,m.jsx)(n.code,{children:`"kilobyte"`}),`, `,(0,m.jsx)(n.code,{children:`"megabyte"`}),`, `,(0,m.jsx)(n.code,{children:`"gigabyte"`})]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`"meter"`}),`, `,(0,m.jsx)(n.code,{children:`"kilometer"`}),`, `,(0,m.jsx)(n.code,{children:`"mile"`})]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`"liter"`}),`, `,(0,m.jsx)(n.code,{children:`"gallon"`})]}),`
`,(0,m.jsxs)(n.li,{children:[(0,m.jsx)(n.code,{children:`"second"`}),`, `,(0,m.jsx)(n.code,{children:`"minute"`}),`, `,(0,m.jsx)(n.code,{children:`"hour"`}),`, `,(0,m.jsx)(n.code,{children:`"day"`})]}),`
`]})]})]})}function p(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,m.jsx)(n,{...e,children:(0,m.jsx)(f,{...e})}):f(e)}var m;e((()=>{m=n(),a(),i(),d(),o()}))();export{p as default};