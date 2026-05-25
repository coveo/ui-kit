import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";import{n as o,t as s}from"./atomic-doc-template-BrmV5DRP.js";import c,{Default as l,WithCustomText as u,WithHrefTemplate as d,WithTargetBlank as f,t as p}from"./atomic-ipx-result-link.new.stories-SBx2Xkgx.js";function m(e){let n={code:`code`,h2:`h2`,p:`p`,pre:`pre`,...t(),...e.components};return(0,g.jsxs)(g.Fragment,{children:[(0,g.jsx)(r,{of:c,name:`Docs`}),`
`,(0,g.jsxs)(s,{stories:{Default:l,WithCustomText:u,WithHrefTemplate:d,WithTargetBlank:f},githubPath:`ipx/atomic-ipx-result-link/atomic-ipx-result-link.ts`,tagName:`atomic-ipx-result-link`,className:`AtomicIpxResultLink`,children:[(0,g.jsxs)(n.p,{children:[`This component is typically used within an `,(0,g.jsx)(n.code,{children:`atomic-result-template`}),` or `,(0,g.jsx)(n.code,{children:`atomic-recs-result-template`}),` in an IPX context:`]}),(0,g.jsx)(n.pre,{children:(0,g.jsx)(n.code,{className:`language-html`,children:`<atomic-result-list>
  <atomic-result-template>
    <template>
      <atomic-result-section-title>
        <atomic-ipx-result-link></atomic-ipx-result-link>
      </atomic-result-section-title>
    </template>
  </atomic-result-template>
</atomic-result-list>
`})}),(0,g.jsx)(n.pre,{children:(0,g.jsx)(n.code,{className:`language-html`,children:`<atomic-recs-interface>
  <atomic-recs-list>
    <atomic-recs-result-template>
      <template>
        <atomic-result-section-title>
          <atomic-ipx-result-link></atomic-ipx-result-link>
        </atomic-result-section-title>
      </template>
    </atomic-recs-result-template>
  </atomic-recs-list>
</atomic-recs-interface>
`})}),(0,g.jsx)(n.h2,{id:`custom-link-text`,children:`Custom Link Text`}),(0,g.jsx)(n.p,{children:`You can provide custom content within the link by using the default slot:`}),(0,g.jsx)(n.pre,{children:(0,g.jsx)(n.code,{className:`language-html`,children:`<atomic-ipx-result-link>
  <atomic-result-text field="title"></atomic-result-text>
  - Click here
</atomic-ipx-result-link>
`})}),(0,g.jsx)(n.h2,{id:`custom-href-template`,children:`Custom href Template`}),(0,g.jsxs)(n.p,{children:[`Use the `,(0,g.jsx)(n.code,{children:`href-template`}),` attribute to customize the link URL using result properties:`]}),(0,g.jsx)(n.pre,{children:(0,g.jsx)(n.code,{className:`language-html`,children:`<atomic-ipx-result-link href-template="\${clickUri}?source=ipx"></atomic-ipx-result-link>
`})}),(0,g.jsx)(n.h2,{id:`custom-attributes`,children:`Custom Attributes`}),(0,g.jsxs)(n.p,{children:[`Use the `,(0,g.jsx)(n.code,{children:`attributes`}),` slot to add custom attributes to the link element:`]}),(0,g.jsx)(n.pre,{children:(0,g.jsx)(n.code,{className:`language-html`,children:`<atomic-ipx-result-link>
  <a slot="attributes" target="_blank" rel="noopener"></a>
</atomic-ipx-result-link>
`})}),(0,g.jsx)(n.h2,{id:`ipx-actions-history`,children:`IPX Actions History`}),(0,g.jsxs)(n.p,{children:[`The component automatically tracks page views in the IPX actions history when a result has a `,(0,g.jsx)(n.code,{children:`permanentid`}),` field, enabling better analytics and recommendations.`]})]})]})}function h(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,g.jsx)(n,{...e,children:(0,g.jsx)(m,{...e})}):m(e)}var g;e((()=>{g=n(),a(),i(),p(),o()}))();export{h as default};