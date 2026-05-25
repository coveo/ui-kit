import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n}from"./iframe-cSkD6HDI.js";import{n as r,t as i}from"./common-meta-parameters-BmIbTEf7.js";import{r as a,t as o}from"./search-interface-wrapper-DyJSRxFL.js";import{i as s,n as c,r as l,t as u}from"./mock-C5ckzz_b.js";var d,f,p,m,h,g,_,v,y,b,x,S,C,w,T=e((()=>{t(),c(),s(),i(),o(),d=`
<atomic-result-template>
  <template>
    <atomic-result-section-visual>
      <atomic-result-image class="icon" fallback="https://picsum.photos/seed/picsum/350"></atomic-result-image>
      <img src="https://picsum.photos/seed/picsum/350" alt="Thumbnail" class="thumbnail" />
    </atomic-result-section-visual>
    <atomic-result-section-badges>
      <atomic-field-condition must-match-sourcetype="Salesforce">
        <atomic-result-badge
          label="Salesforce"
          class="salesforce-badge"
        ></atomic-result-badge>
      </atomic-field-condition>             
      <atomic-result-badge
        icon="https://raw.githubusercontent.com/Rush/Font-Awesome-SVG-PNG/master/black/svg/language.svg"
      >
        <atomic-result-multi-value-text
          field="language"
        ></atomic-result-multi-value-text>
      </atomic-result-badge>
      <atomic-field-condition must-match-is-recommendation="true">
        <atomic-result-badge label="Recommended"></atomic-result-badge>
      </atomic-field-condition>
      <atomic-field-condition must-match-is-top-result="true">
        <atomic-result-badge label="Top Result"></atomic-result-badge>
      </atomic-field-condition>
    </atomic-result-section-badges>
    <atomic-result-section-title
      ><atomic-result-link></atomic-result-link
    ></atomic-result-section-title>
    <atomic-result-section-excerpt
      ><atomic-result-text field="excerpt"></atomic-result-text
    ></atomic-result-section-excerpt>
    <atomic-result-section-bottom-metadata>
      <atomic-result-fields-list>
        <atomic-field-condition class="field" if-defined="source">
          <span class="field-label"
            ><atomic-text value="source"></atomic-text>:</span
          >
          <atomic-result-text field="source"></atomic-result-text>
        </atomic-field-condition>
      </atomic-result-fields-list>
    </atomic-result-section-bottom-metadata>
    <atomic-result-section-children>
      <atomic-result-children image-size="icon">
        <atomic-result-children-template>
          <template>
            <atomic-result-section-visual>
              <atomic-result-image class="icon" fallback="https://picsum.photos/seed/picsum/350"></atomic-result-image>
              <img src="https://picsum.photos/seed/picsum/350" alt="Thumbnail" class="thumbnail" />
            </atomic-result-section-visual>
            <atomic-result-section-title
              ><atomic-result-link></atomic-result-link
            ></atomic-result-section-title>
            <atomic-result-section-excerpt
              ><atomic-result-text field="excerpt"></atomic-result-text
            ></atomic-result-section-excerpt>
            <atomic-result-section-bottom-metadata>
              <atomic-result-fields-list>
                <atomic-field-condition class="field" if-defined="author">
                  <span class="field-label"
                    ><atomic-text value="author"></atomic-text>:</span
                  >
                  <atomic-result-text field="author"></atomic-result-text>
                </atomic-field-condition>

                <atomic-field-condition class="field" if-defined="source">
                  <span class="field-label"
                    ><atomic-text value="source"></atomic-text>:</span
                  >
                  <atomic-result-text field="source"></atomic-result-text>
                </atomic-field-condition>

                <atomic-field-condition
                  class="field"
                  if-defined="language"
                >
                  <span class="field-label"
                    ><atomic-text value="language"></atomic-text>:</span
                  >
                  <atomic-result-multi-value-text
                    field="language"
                  ></atomic-result-multi-value-text>
                </atomic-field-condition>

                <atomic-field-condition
                  class="field"
                  if-defined="filetype"
                >
                  <span class="field-label"
                    ><atomic-text value="fileType"></atomic-text>:</span
                  >
                  <atomic-result-text
                    field="filetype"
                  ></atomic-result-text>
                </atomic-field-condition>
              </atomic-result-fields-list>
            </atomic-result-section-bottom-metadata>
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
`,f=new u,{decorator:p,play:m}=a(),{events:h,args:g,argTypes:_,template:v}=n(`atomic-folded-result-list`,{excludeCategories:[`methods`]}),y={component:`atomic-folded-result-list`,title:`Search/Folded Result List`,id:`atomic-folded-result-list`,render:e=>v(e),decorators:[p],parameters:{...r,actions:{handles:h},msw:{handlers:[...f.handlers]}},args:g,argTypes:_,beforeEach:async()=>{f.searchEndpoint.clear()},play:m},b={args:{"default-slot":d},beforeEach:async()=>{f.searchEndpoint.mockOnce(()=>({...l,results:[{...l.results[0],totalNumberOfChildResults:5},l.results[1]]})),f.searchEndpoint.mockOnce(()=>({...l,results:[{...l.results[0],childResults:[...l.results[0].childResults,{title:`Birds`,excerpt:`Bird species`,clickUri:`https://example.com/birds`,uniqueId:`birds-child`,raw:{foldingcollection:`Animals`,foldingchild:[`birds`],foldingparent:`animals`}}],totalNumberOfChildResults:3},l.results[1]]}))},play:m},x={name:`With no result children`,args:{"default-slot":d},beforeEach:async()=>{f.searchEndpoint.mockOnce(()=>({...l,results:[{...l.results[0],parentResult:null,totalNumberOfChildResults:0,childResults:[]}]}))},play:m},S={name:`With result children`,args:{"default-slot":d},beforeEach:async()=>{f.searchEndpoint.mockOnce(()=>({...l,results:[{...l.results[0],totalNumberOfChildResults:1},...l.results.slice(1)]}))},play:m},C={name:`With more results available and no children`,args:{"default-slot":d},beforeEach:async()=>{f.searchEndpoint.mockOnce(()=>({...l,results:[{...l.results[0],totalNumberOfChildResults:10,childResults:[]}]}))},play:m},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    'default-slot': SLOTS_DEFAULT
  },
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mockOnce(() => ({
      ...baseFoldedResponse,
      results: [{
        ...baseFoldedResponse.results[0]!,
        totalNumberOfChildResults: 5
      }, baseFoldedResponse.results[1]!]
    }));
    mockSearchApi.searchEndpoint.mockOnce(() => ({
      ...baseFoldedResponse,
      results: [{
        ...baseFoldedResponse.results[0]!,
        childResults: [...baseFoldedResponse.results[0]!.childResults, {
          title: 'Birds',
          excerpt: 'Bird species',
          clickUri: 'https://example.com/birds',
          uniqueId: 'birds-child',
          raw: {
            foldingcollection: 'Animals',
            foldingchild: ['birds'],
            foldingparent: 'animals'
          }
        }],
        totalNumberOfChildResults: 3
      }, baseFoldedResponse.results[1]!]
    }));
  },
  play
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'With no result children',
  args: {
    'default-slot': SLOTS_DEFAULT
  },
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mockOnce(() => ({
      ...baseFoldedResponse,
      results: [{
        ...baseFoldedResponse.results[0],
        parentResult: null,
        totalNumberOfChildResults: 0,
        childResults: []
      }] as unknown as typeof baseFoldedResponse.results
    }));
  },
  play
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'With result children',
  args: {
    'default-slot': SLOTS_DEFAULT
  },
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mockOnce(() => ({
      ...baseFoldedResponse,
      results: [{
        ...baseFoldedResponse.results[0]!,
        totalNumberOfChildResults: 1
      }, ...baseFoldedResponse.results.slice(1)]
    }));
  },
  play
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'With more results available and no children',
  args: {
    'default-slot': SLOTS_DEFAULT
  },
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mockOnce(() => ({
      ...baseFoldedResponse,
      results: [{
        ...baseFoldedResponse.results[0]!,
        totalNumberOfChildResults: 10,
        childResults: []
      }]
    }));
  },
  play
}`,...C.parameters?.docs?.source}}},w=[`Default`,`WithNoResultChildren`,`WithFewResultChildren`,`WithMoreResultsAvailableAndNoChildren`]}));T();export{b as Default,S as WithFewResultChildren,C as WithMoreResultsAvailableAndNoChildren,x as WithNoResultChildren,w as __namedExportsOrder,y as default,T as t};