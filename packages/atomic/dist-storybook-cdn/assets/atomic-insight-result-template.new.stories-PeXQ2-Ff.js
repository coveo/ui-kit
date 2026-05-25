import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,St as r,Tt as i}from"./iframe-cSkD6HDI.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{n as s,t as c}from"./mock-CijMLWxR.js";import{n as l,t as u}from"./insight-interface-wrapper-BwybnAhf.js";var d,f,p,m,h,g,_,v,y,b,x,S,C,w,T=e((()=>{t(),r(),s(),o(),u(),d=new c,f=`<template>
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
</template>`,p=`<template>
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
      <atomic-field-condition class="field" if-defined="source">
        <span class="field-label">Source:</span>
        <atomic-result-text field="source"></atomic-result-text>
      </atomic-field-condition>
      <atomic-field-condition class="field" if-defined="author">
        <span class="field-label">Author:</span>
        <atomic-result-text field="author"></atomic-result-text>
      </atomic-field-condition>
    </atomic-result-fields-list>
  </atomic-result-section-bottom-metadata>
  <atomic-result-section-children>
    <atomic-insight-result-children image-size="icon">
      <atomic-insight-result-children-template>
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
          <atomic-result-section-children>
            <atomic-insight-result-children inherit-templates></atomic-insight-result-children>
          </atomic-result-section-children>
        </template>
      </atomic-insight-result-children-template>
    </atomic-insight-result-children>
  </atomic-result-section-children>
</template>`,{events:m,args:h,argTypes:g,template:_}=n(`atomic-insight-result-template`,{excludeCategories:[`methods`]}),v={component:`atomic-insight-result-template`,title:`Insight/Result Template`,id:`atomic-insight-result-template`,render:e=>_(e),parameters:{...a,actions:{handles:m},msw:{handlers:[...d.handlers]}},args:{...h,"default-slot":f},argTypes:{...g,"must-match":{...g[`must-match`],control:!1},"must-not-match":{...g[`must-not-match`],control:!1},conditions:{...g.conditions,control:!1}}},{decorator:y,play:b}=l(),x={name:`In a result list`,decorators:[e=>i`
      <atomic-insight-layout>
        <atomic-layout-section section="results">
          <atomic-insight-result-list
            display="list"
            density="normal"
            image-size="icon"
          >
            ${e()}
          </atomic-insight-result-list>
        </atomic-layout-section>
      </atomic-insight-layout>
    `,y],play:b},S={name:`In a folded result list`,args:{...h,"default-slot":p},decorators:[e=>i`
      <atomic-insight-layout>
        <atomic-layout-section section="results">
          <atomic-insight-folded-result-list
            image-size="small"
            display="list"
            collection-field="foldingcollection"
            parent-field="foldingparent"
            child-field="foldingchild"
          >
            ${e()}
          </atomic-insight-folded-result-list>
        </atomic-layout-section>
      </atomic-insight-layout>
    `,y],parameters:{docs:{source:{code:`<atomic-insight-folded-result-list
  image-size="small"
  display="list"
  collection-field="foldingcollection"
  parent-field="foldingparent"
  child-field="foldingchild"
>
  <atomic-insight-result-template>
${p}
  </atomic-insight-result-template>
</atomic-insight-folded-result-list>`}}},play:b},C={name:`With conditions`,args:{...h,"default-slot":f},decorators:[e=>i`
      <atomic-insight-layout>
        <atomic-layout-section section="results">
          <atomic-insight-result-list
            display="list"
            density="normal"
            image-size="icon"
          >
            <!-- Template for specific source types -->
            <atomic-insight-result-template must-match-sourcetype="YouTube">
              <template>
                <atomic-result-section-badges>
                  <atomic-result-badge
                    label="YouTube Video"
                    class="youtube-badge"
                  ></atomic-result-badge>
                </atomic-result-section-badges>
                <atomic-result-section-title>
                  <atomic-result-link></atomic-result-link>
                </atomic-result-section-title>
                <atomic-result-section-excerpt>
                  <atomic-result-text field="excerpt"></atomic-result-text>
                </atomic-result-section-excerpt>
              </template>
            </atomic-insight-result-template>
            <!-- Default template -->
            ${e()}
          </atomic-insight-result-list>
        </atomic-layout-section>
      </atomic-insight-layout>
    `,y],play:b},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'In a result list',
  decorators: [story => html\`
      <atomic-insight-layout>
        <atomic-layout-section section="results">
          <atomic-insight-result-list
            display="list"
            density="normal"
            image-size="icon"
          >
            \${story()}
          </atomic-insight-result-list>
        </atomic-layout-section>
      </atomic-insight-layout>
    \`, insightInterfaceDecorator],
  play: initializeInsightInterface
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'In a folded result list',
  args: {
    ...args,
    'default-slot': FOLDED_TEMPLATE_EXAMPLE
  },
  decorators: [story => html\`
      <atomic-insight-layout>
        <atomic-layout-section section="results">
          <atomic-insight-folded-result-list
            image-size="small"
            display="list"
            collection-field="foldingcollection"
            parent-field="foldingparent"
            child-field="foldingchild"
          >
            \${story()}
          </atomic-insight-folded-result-list>
        </atomic-layout-section>
      </atomic-insight-layout>
    \`, insightInterfaceDecorator],
  parameters: {
    docs: {
      source: {
        code: \`<atomic-insight-folded-result-list
  image-size="small"
  display="list"
  collection-field="foldingcollection"
  parent-field="foldingparent"
  child-field="foldingchild"
>
  <atomic-insight-result-template>
\${FOLDED_TEMPLATE_EXAMPLE}
  </atomic-insight-result-template>
</atomic-insight-folded-result-list>\`
      }
    }
  },
  play: initializeInsightInterface
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'With conditions',
  args: {
    ...args,
    'default-slot': TEMPLATE_EXAMPLE
  },
  decorators: [story => html\`
      <atomic-insight-layout>
        <atomic-layout-section section="results">
          <atomic-insight-result-list
            display="list"
            density="normal"
            image-size="icon"
          >
            <!-- Template for specific source types -->
            <atomic-insight-result-template must-match-sourcetype="YouTube">
              <template>
                <atomic-result-section-badges>
                  <atomic-result-badge
                    label="YouTube Video"
                    class="youtube-badge"
                  ></atomic-result-badge>
                </atomic-result-section-badges>
                <atomic-result-section-title>
                  <atomic-result-link></atomic-result-link>
                </atomic-result-section-title>
                <atomic-result-section-excerpt>
                  <atomic-result-text field="excerpt"></atomic-result-text>
                </atomic-result-section-excerpt>
              </template>
            </atomic-insight-result-template>
            <!-- Default template -->
            \${story()}
          </atomic-insight-result-list>
        </atomic-layout-section>
      </atomic-insight-layout>
    \`, insightInterfaceDecorator],
  play: initializeInsightInterface
}`,...C.parameters?.docs?.source}}},w=[`Default`,`InAFoldedResultList`,`WithConditions`]}));T();export{x as Default,S as InAFoldedResultList,C as WithConditions,w as __namedExportsOrder,v as default,T as t};