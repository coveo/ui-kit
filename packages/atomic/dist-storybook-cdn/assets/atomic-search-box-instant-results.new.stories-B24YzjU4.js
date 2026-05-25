import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,St as r,Tt as i}from"./iframe-cSkD6HDI.js";import{n as a,t as o}from"./search-box-suggestions-parameters-Cvhsyu4s.js";import{r as s,t as c}from"./search-interface-wrapper-DyJSRxFL.js";import{n as l,t as u}from"./mock-C5ckzz_b.js";var d,f,p,m,h,g,_,v,y,b,x,S,C,w=e((()=>{t(),r(),l(),o(),c(),{expect:d,userEvent:f}=__STORYBOOK_MODULE_TEST__,p=new u,{decorator:m,play:h}=s(),g=e=>i`<atomic-search-box>
    <atomic-search-box-query-suggestions></atomic-search-box-query-suggestions>
    ${e()}
  </atomic-search-box>`,{events:_,args:v,argTypes:y,template:b}=n(`atomic-search-box-instant-results`,{excludeCategories:[`methods`]}),x={component:`atomic-search-box-instant-results`,title:`Search/Search Box Instant Results`,id:`atomic-search-box-instant-results`,render:e=>b(e),decorators:[g,m],parameters:{...a,actions:{handles:_},msw:{handlers:[...p.handlers]}},tags:[`!test`],args:v,argTypes:y,play:async e=>{let{canvas:t,step:n}=e;await h(e);let r=await t.findAllByShadowPlaceholderText(`Search`);await n(`Click on the search box to show instant results`,async()=>{await f.click(r[0]),await d(await t.findByShadowLabelText(/Sample Result 0, instant result\.( Button\.)? 1 of \d+\. In Right list\./)).toBeVisible()})}},S={name:`atomic-search-box-instant-results`,args:{"default-slot":i`
      <atomic-result-template>
        <template>
          <style>
            div.result-root.with-sections.display-list.image-icon
              atomic-result-section-visual {
              height: 60px;
            }
          </style>
          <atomic-result-section-visual>
            <atomic-result-icon></atomic-result-icon>
          </atomic-result-section-visual>
          <atomic-result-section-title>
            <atomic-result-link></atomic-result-link>
          </atomic-result-section-title>
          <atomic-result-section-excerpt>
            <atomic-result-text field="excerpt"></atomic-result-text>
          </atomic-result-section-excerpt>
          <atomic-result-section-bottom-metadata>
            <atomic-result-printable-uri></atomic-result-printable-uri>
          </atomic-result-section-bottom-metadata>
        </template>
      </atomic-result-template>
    `,imageSize:`icon`},decorators:[e=>i`
      <style>
        atomic-search-box::part(suggestions-left) {
          display: none;
        }
      </style>
      ${e()}
    `]},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'atomic-search-box-instant-results',
  args: {
    'default-slot': html\`
      <atomic-result-template>
        <template>
          <style>
            div.result-root.with-sections.display-list.image-icon
              atomic-result-section-visual {
              height: 60px;
            }
          </style>
          <atomic-result-section-visual>
            <atomic-result-icon></atomic-result-icon>
          </atomic-result-section-visual>
          <atomic-result-section-title>
            <atomic-result-link></atomic-result-link>
          </atomic-result-section-title>
          <atomic-result-section-excerpt>
            <atomic-result-text field="excerpt"></atomic-result-text>
          </atomic-result-section-excerpt>
          <atomic-result-section-bottom-metadata>
            <atomic-result-printable-uri></atomic-result-printable-uri>
          </atomic-result-section-bottom-metadata>
        </template>
      </atomic-result-template>
    \`,
    imageSize: 'icon'
  },
  decorators: [story => html\`
      <style>
        atomic-search-box::part(suggestions-left) {
          display: none;
        }
      </style>
      \${story()}
    \`]
}`,...S.parameters?.docs?.source}}},C=[`Default`]}));w();export{S as Default,C as __namedExportsOrder,x as default,w as t};