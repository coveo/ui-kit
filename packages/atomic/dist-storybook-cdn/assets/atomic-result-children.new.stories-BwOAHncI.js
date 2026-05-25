import{n as e}from"./chunk-jRWAZmH_.js";import{St as t,Tt as n}from"./iframe-cSkD6HDI.js";import{n as r,t as i}from"./common-meta-parameters-BmIbTEf7.js";import{r as a,t as o}from"./search-interface-wrapper-DyJSRxFL.js";import{a as s,n as c,r as l,t as u}from"./mock-C5ckzz_b.js";var d,f,p,m,h,g,_,v=e((()=>{t(),c(),i(),o(),d=new u,d.searchEndpoint.mock(()=>l),{decorator:f,play:p}=a(),m={component:`atomic-result-children`,title:`Search/Result Children`,id:`atomic-result-children`,decorators:[f],parameters:{...r,msw:{handlers:[...d.handlers]}},play:p},h={render:()=>n`
    <atomic-folded-result-list>
      <atomic-result-template>
        <template>
          <atomic-result-section-title>
            <atomic-result-link></atomic-result-link>
          </atomic-result-section-title>
          <atomic-result-section-children>
            <atomic-result-children image-size="icon">
              <atomic-result-children-template>
                <template>
                  <atomic-result-section-title>
                    <atomic-result-link></atomic-result-link>
                  </atomic-result-section-title>
                  <atomic-result-section-excerpt>
                    <atomic-result-text field="excerpt"></atomic-result-text>
                  </atomic-result-section-excerpt>
                </template>
              </atomic-result-children-template>
            </atomic-result-children>
          </atomic-result-section-children>
        </template>
      </atomic-result-template>
    </atomic-folded-result-list>
  `},g={name:`With inherit-templates`,beforeEach:async()=>(d.searchEndpoint.mock(()=>s),()=>{d.searchEndpoint.reset(),d.searchEndpoint.mock(()=>l)}),render:()=>n`
    <atomic-folded-result-list>
      <atomic-result-template>
        <template>
          <atomic-result-section-title>
            <atomic-result-link></atomic-result-link>
          </atomic-result-section-title>
          <atomic-result-section-children>
            <atomic-result-children image-size="icon">
              <atomic-result-children-template>
                <template>
                  <atomic-result-section-title>
                    <atomic-result-link></atomic-result-link>
                  </atomic-result-section-title>
                  <atomic-result-section-children>
                    <atomic-result-children inherit-templates>
                    </atomic-result-children>
                  </atomic-result-section-children>
                </template>
              </atomic-result-children-template>
            </atomic-result-children>
          </atomic-result-section-children>
        </template>
      </atomic-result-template>
    </atomic-folded-result-list>
  `},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <atomic-folded-result-list>
      <atomic-result-template>
        <template>
          <atomic-result-section-title>
            <atomic-result-link></atomic-result-link>
          </atomic-result-section-title>
          <atomic-result-section-children>
            <atomic-result-children image-size="icon">
              <atomic-result-children-template>
                <template>
                  <atomic-result-section-title>
                    <atomic-result-link></atomic-result-link>
                  </atomic-result-section-title>
                  <atomic-result-section-excerpt>
                    <atomic-result-text field="excerpt"></atomic-result-text>
                  </atomic-result-section-excerpt>
                </template>
              </atomic-result-children-template>
            </atomic-result-children>
          </atomic-result-section-children>
        </template>
      </atomic-result-template>
    </atomic-folded-result-list>
  \`
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: 'With inherit-templates',
  beforeEach: async () => {
    searchApiHarness.searchEndpoint.mock(() => nestedFoldedResponse);
    return () => {
      searchApiHarness.searchEndpoint.reset();
      searchApiHarness.searchEndpoint.mock(() => baseFoldedResponse);
    };
  },
  render: () => html\`
    <atomic-folded-result-list>
      <atomic-result-template>
        <template>
          <atomic-result-section-title>
            <atomic-result-link></atomic-result-link>
          </atomic-result-section-title>
          <atomic-result-section-children>
            <atomic-result-children image-size="icon">
              <atomic-result-children-template>
                <template>
                  <atomic-result-section-title>
                    <atomic-result-link></atomic-result-link>
                  </atomic-result-section-title>
                  <atomic-result-section-children>
                    <atomic-result-children inherit-templates>
                    </atomic-result-children>
                  </atomic-result-section-children>
                </template>
              </atomic-result-children-template>
            </atomic-result-children>
          </atomic-result-section-children>
        </template>
      </atomic-result-template>
    </atomic-folded-result-list>
  \`
}`,...g.parameters?.docs?.source}}},_=[`Default`,`WithInheritTemplates`]}));v();export{h as Default,g as WithInheritTemplates,_ as __namedExportsOrder,m as default,v as t};