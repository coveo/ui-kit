import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,St as r,Tt as i}from"./iframe-cSkD6HDI.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{n as s,t as c}from"./search-box-suggestions-parameters-Cvhsyu4s.js";import{r as l,t as u}from"./search-interface-wrapper-DyJSRxFL.js";import{n as d,t as f}from"./mock-C5ckzz_b.js";var p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k=e((()=>{t(),r(),d(),o(),c(),u(),p=new f,m=`<template>
  <atomic-result-section-visual>
    <atomic-result-image field="ytthumbnailurl" fallback="https://picsum.photos/seed/picsum/350"></atomic-result-image>
  </atomic-result-section-visual>
  <atomic-result-section-badges>
    <atomic-field-condition must-match-sourcetype="YouTube">
      <atomic-result-badge
        label="YouTube"
        class="youtube-badge"
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
  <atomic-result-section-title>
    <atomic-result-link></atomic-result-link>
  </atomic-result-section-title>
  <atomic-result-section-excerpt>
    <atomic-result-text field="excerpt"></atomic-result-text>
  </atomic-result-section-excerpt>
  <atomic-result-section-bottom-metadata>
    <atomic-result-fields-list>
      <atomic-field-condition class="field" if-defined="source">
        <span class="field-label">
          <atomic-text value="source"></atomic-text>:
        </span>
        <atomic-result-text field="source"></atomic-result-text>
      </atomic-field-condition>
      <atomic-field-condition class="field" if-defined="author">
        <span class="field-label">
          <atomic-text value="author"></atomic-text>:
        </span>
        <atomic-result-text field="author"></atomic-result-text>
      </atomic-field-condition>
      <atomic-field-condition class="field" if-defined="date">
        <span class="field-label">
          <atomic-text value="date"></atomic-text>:
        </span>
        <atomic-result-date></atomic-result-date>
      </atomic-field-condition>
    </atomic-result-fields-list>
  </atomic-result-section-bottom-metadata>
</template>`,h=`<template>
  <style>
    .field {
      display: inline-flex;
      align-items: center;
    }

    .field-label {
      font-weight: bold;
      margin-right: 0.25rem;
    }

    .thumbnail {
      border-radius: var(--atomic-border-radius);
    }
  </style>
  <atomic-result-section-visual>
    <atomic-result-image field="ytthumbnailurl" fallback="https://picsum.photos/seed/picsum/350" class="thumbnail"></atomic-result-image>
  </atomic-result-section-visual>
  <atomic-result-section-title>
    <atomic-result-link></atomic-result-link>
  </atomic-result-section-title>
  <atomic-result-section-excerpt>
    <atomic-result-text field="excerpt"></atomic-result-text>
  </atomic-result-section-excerpt>
  <atomic-result-section-bottom-metadata>
    <atomic-result-fields-list>
      <atomic-field-condition class="field" if-defined="inat_kingdom">
        <span class="field-label">Kingdom:</span>
        <atomic-result-text field="inat_kingdom"></atomic-result-text>
      </atomic-field-condition>
      <atomic-field-condition class="field" if-defined="inat_family">
        <span class="field-label">Family:</span>
        <atomic-result-text field="inat_family"></atomic-result-text>
      </atomic-field-condition>
      <atomic-field-condition class="field" if-defined="inat_class">
        <span class="field-label">Class:</span>
        <atomic-result-text field="inat_class"></atomic-result-text>
      </atomic-field-condition>
    </atomic-result-fields-list>
  </atomic-result-section-bottom-metadata>
  <atomic-result-section-children>
    <atomic-result-children image-size="icon">
      <atomic-result-children-template>
        <template>
          <style>
            .field {
              display: inline-flex;
              align-items: center;
            }

            .field-label {
              font-weight: bold;
              margin-right: 0.25rem;
            }

            .child-thumbnail {
              border-radius: var(--atomic-border-radius);
            }
          </style>
          <atomic-result-section-visual>
            <atomic-result-image field="ytthumbnailurl" fallback="https://picsum.photos/seed/child/200" class="child-thumbnail"></atomic-result-image>
          </atomic-result-section-visual>
          <atomic-result-section-title>
            <atomic-result-link></atomic-result-link>
          </atomic-result-section-title>
          <atomic-result-section-excerpt>
            <atomic-result-text field="excerpt"></atomic-result-text>
          </atomic-result-section-excerpt>
          <atomic-result-section-bottom-metadata>
            <atomic-result-fields-list>
              <atomic-field-condition class="field" if-defined="inat_kingdom">
                <span class="field-label">Kingdom:</span>
                <atomic-result-text field="inat_kingdom"></atomic-result-text>
              </atomic-field-condition>
              <atomic-field-condition class="field" if-defined="inat_family">
                <span class="field-label">Family:</span>
                <atomic-result-text field="inat_family"></atomic-result-text>
              </atomic-field-condition>
              <atomic-field-condition class="field" if-defined="inat_class">
                <span class="field-label">Class:</span>
                <atomic-result-text field="inat_class"></atomic-result-text>
              </atomic-field-condition>
            </atomic-result-fields-list>
          </atomic-result-section-bottom-metadata>
          <atomic-result-section-children>
            <atomic-result-children inherit-templates></atomic-result-children>
          </atomic-result-section-children>
        </template>
      </atomic-result-children-template>
    </atomic-result-children>
  </atomic-result-section-children>
</template>`,{events:g,args:_,argTypes:v,template:y}=n(`atomic-result-template`,{excludeCategories:[`methods`]}),b={component:`atomic-result-template`,title:`Search/Result Template`,id:`atomic-result-template`,render:e=>y(e),parameters:{...a,actions:{handles:g},msw:{handlers:[...p.handlers]}},beforeEach:()=>{p.clearAll()},args:{..._,"default-slot":m},argTypes:{...v,"must-match":{...v[`must-match`],control:!1},"must-not-match":{...v[`must-not-match`],control:!1},conditions:{...v.conditions,control:!1}}},{decorator:x,play:S}=l({config:{preprocessRequest:e=>{let t=JSON.parse(e.body);return t.numberOfResults=4,e.body=JSON.stringify(t),e}},skipFirstSearch:!1,includeCodeRoot:!1}),{decorator:C,play:w}=l({config:{preprocessRequest:e=>{let t=JSON.parse(e.body);return t.numberOfResults=4,t.aq=`@source=iNaturalistTaxons`,e.body=JSON.stringify(t),e}},skipFirstSearch:!1,includeCodeRoot:!1}),T={name:`In a result list`,decorators:[e=>i`
      <atomic-result-list display="list" density="normal" image-size="icon">
        ${e()}
      </atomic-result-list>
    `,x],play:S},E={name:`In a folded result list`,args:{..._,"default-slot":h},decorators:[e=>i`
      <atomic-folded-result-list
        image-size="small"
        display="grid"
        collection-field="foldingcollection"
        parent-field="foldingparent"
        child-field="foldingchild"
      >
        ${e()}
      </atomic-folded-result-list>
    `,C],parameters:{docs:{source:{code:`<atomic-folded-result-list
  image-size="small"
  display="grid"
  collection-field="foldingcollection"
  parent-field="foldingparent"
  child-field="foldingchild"
>
  <atomic-result-template>
${h}
  </atomic-result-template>
</atomic-folded-result-list>`}}},play:w},D={name:`In a search box instant results`,decorators:[e=>i`
      <atomic-search-box suggestion-timeout="30000" style="width: 600px;">
        <atomic-search-box-query-suggestions>
          <atomic-search-box-instant-results>
            ${e()}
          </atomic-search-box-instant-results>
        </atomic-search-box-query-suggestions>
      </atomic-search-box>
    `,x],parameters:s,play:async e=>{await S(e);let{canvas:t,step:n}=e;await n(`Click Searchbox`,async()=>{(await t.findAllByShadowTitle(`Search field with suggestions.`,{exact:!1}))?.find(e=>e.getAttribute(`part`)===`textarea`)?.focus()})}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: 'In a result list',
  decorators: [story => html\`
      <atomic-result-list display="list" density="normal" image-size="icon">
        \${story()}
      </atomic-result-list>
    \`, searchInterfaceDecorator],
  play: initializeSearchInterface
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  name: 'In a folded result list',
  args: {
    ...args,
    'default-slot': FOLDED_TEMPLATE_EXAMPLE
  },
  decorators: [story => html\`
      <atomic-folded-result-list
        image-size="small"
        display="grid"
        collection-field="foldingcollection"
        parent-field="foldingparent"
        child-field="foldingchild"
      >
        \${story()}
      </atomic-folded-result-list>
    \`, foldedSearchInterfaceDecorator],
  parameters: {
    docs: {
      source: {
        code: \`<atomic-folded-result-list
  image-size="small"
  display="grid"
  collection-field="foldingcollection"
  parent-field="foldingparent"
  child-field="foldingchild"
>
  <atomic-result-template>
\${FOLDED_TEMPLATE_EXAMPLE}
  </atomic-result-template>
</atomic-folded-result-list>\`
      }
    }
  },
  play: initializeFoldedSearchInterface
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  name: 'In a search box instant results',
  decorators: [story => html\`
      <atomic-search-box suggestion-timeout="30000" style="width: 600px;">
        <atomic-search-box-query-suggestions>
          <atomic-search-box-instant-results>
            \${story()}
          </atomic-search-box-instant-results>
        </atomic-search-box-query-suggestions>
      </atomic-search-box>
    \`, searchInterfaceDecorator],
  parameters: searchBoxParameters,
  play: async context => {
    await initializeSearchInterface(context);
    const {
      canvas,
      step
    } = context;
    await step('Click Searchbox', async () => {
      (await canvas.findAllByShadowTitle('Search field with suggestions.', {
        exact: false
      }))?.find(el => el.getAttribute('part') === 'textarea')?.focus();
    });
  }
}`,...D.parameters?.docs?.source}}},O=[`Default`,`InAFoldedResultList`,`InASearchBoxInstantResults`]}));k();export{T as Default,E as InAFoldedResultList,D as InASearchBoxInstantResults,O as __namedExportsOrder,b as default,k as t};