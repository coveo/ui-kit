import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n}from"./iframe-cSkD6HDI.js";import{n as r,t as i}from"./common-meta-parameters-BmIbTEf7.js";import{n as a,r as o,t as s}from"./search-interface-wrapper-DyJSRxFL.js";var c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O=e((()=>{t(),i(),s(),c=`<atomic-result-template>
  <template>
      <atomic-result-section-actions><atomic-quickview></atomic-quickview></atomic-result-section-actions>
      <atomic-result-section-visual>
        <atomic-result-icon class="icon"></atomic-result-icon>
        <img loading="lazy" src="https://picsum.photos/seed/picsum/350" class="thumbnail" />
      </atomic-result-section-visual>
      <atomic-result-section-badges>
        <atomic-field-condition must-match-sourcetype="Salesforce">
          <atomic-result-badge label="Salesforce" class="salesforce-badge"></atomic-result-badge>
        </atomic-field-condition>
        <atomic-result-badge
          icon="https://raw.githubusercontent.com/Rush/Font-Awesome-SVG-PNG/master/black/svg/language.svg"
        >
          <atomic-result-multi-value-text field="language"></atomic-result-multi-value-text>
        </atomic-result-badge>
        <atomic-field-condition must-match-is-recommendation="true">
          <atomic-result-badge label="Recommended"></atomic-result-badge>
        </atomic-field-condition>
        <atomic-field-condition must-match-is-top-result="true">
          <atomic-result-badge label="Top Result"></atomic-result-badge>
        </atomic-field-condition>
      </atomic-result-section-badges>
      <atomic-result-section-title><atomic-result-link></atomic-result-link></atomic-result-section-title>
      <atomic-result-section-title-metadata>
        <atomic-field-condition class="field" if-defined="snrating">
          <atomic-result-rating field="snrating"></atomic-result-rating>
        </atomic-field-condition>
        <atomic-field-condition class="field" if-not-defined="snrating">
          <atomic-result-printable-uri max-number-of-parts="3"></atomic-result-printable-uri>
        </atomic-field-condition>
      </atomic-result-section-title-metadata>
      <atomic-result-section-excerpt
        ><atomic-result-text field="excerpt"></atomic-result-text
      ></atomic-result-section-excerpt>
      <atomic-result-section-bottom-metadata>
        <atomic-result-fields-list>
          <atomic-field-condition class="field" if-defined="source">
            <span class="field-label"><atomic-text value="source"></atomic-text>:</span>
            <atomic-result-text field="source"></atomic-result-text>
          </atomic-field-condition>
          </span>
        </atomic-result-fields-list>
      </atomic-result-section-bottom-metadata>
  </template>
</atomic-result-template>`,{decorator:l,play:u}=o({config:{search:{preprocessSearchResponseMiddleware:e=>{let[t]=e.body.results;return t.title=`Manage the Coveo In-Product Experiences (IPX)`,t.clickUri=`https://docs.coveo.com/en/3160`,e}}}}),{play:d}=o({skipFirstSearch:!0}),{events:f,args:p,argTypes:m,template:h}=n(`atomic-result-list`,{excludeCategories:[`methods`]}),{play:g}=o({skipFirstSearch:!1,config:{preprocessRequest:e=>{let t=JSON.parse(e.body);return t.query=`show me no result`,e.body=JSON.stringify(t),e}}}),_={component:`atomic-result-list`,title:`Search/Result List`,id:`atomic-result-list`,render:e=>h(e),decorators:[l],parameters:{...r,chromatic:{disableSnapshot:!0},layout:`fullscreen`,actions:{handles:f}},args:{...p,"number-of-placeholders":10,display:`list`,density:`normal`,"image-size":`small`},argTypes:m,play:u},v={name:`Using list display`},y={name:`Using list display with template`,args:{"default-slot":c}},b={name:`Using list display before query`,play:async e=>{await d(e)}},x={name:`Using grid display`,args:{display:`grid`}},S={name:`Using grid display with template`,args:{display:`grid`,"default-slot":c}},C={name:`Using grid display before query`,args:{display:`grid`},play:async e=>{await d(e)}},w={name:`Using table display`,args:{display:`table`,"default-slot":`<atomic-result-template>
  <template>
    <atomic-table-element label="Result">
      <atomic-result-link></atomic-result-link>
      <atomic-result-field-condition if-defined="source">
        <atomic-result-text field="source" class="text-neutral-dark block"></atomic-result-text>
      </atomic-result-field-condition>
    </atomic-table-element>
    <atomic-table-element label="ID">
      <atomic-result-text field="permanentid"></atomic-result-text>
    </atomic-table-element>
    <atomic-table-element label="Date">
       <atomic-result-date field="date" class="text-neutral-dark block"></atomic-result-date>
    </atomic-table-element>
  </template>
</atomic-result-template>`}},T={name:`Using table display before query`,args:{display:`table`},play:async e=>{await d(e)}},E={tags:[`!dev`],name:`No results`,decorators:[e=>e()],play:async e=>{await g(e),await a(e)}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'Using list display'
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'Using list display with template',
  args: {
    'default-slot': defaultTemplateContent
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'Using list display before query',
  play: async context => {
    await playNoFirstQuery(context);
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'Using grid display',
  args: {
    display: 'grid'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'Using grid display with template',
  args: {
    display: 'grid',
    'default-slot': defaultTemplateContent
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'Using grid display before query',
  args: {
    display: 'grid'
  },
  play: async context => {
    await playNoFirstQuery(context);
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'Using table display',
  args: {
    display: 'table',
    'default-slot': \`<atomic-result-template>
  <template>
    <atomic-table-element label="Result">
      <atomic-result-link></atomic-result-link>
      <atomic-result-field-condition if-defined="source">
        <atomic-result-text field="source" class="text-neutral-dark block"></atomic-result-text>
      </atomic-result-field-condition>
    </atomic-table-element>
    <atomic-table-element label="ID">
      <atomic-result-text field="permanentid"></atomic-result-text>
    </atomic-table-element>
    <atomic-table-element label="Date">
       <atomic-result-date field="date" class="text-neutral-dark block"></atomic-result-date>
    </atomic-table-element>
  </template>
</atomic-result-template>\`
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: 'Using table display before query',
  args: {
    display: 'table'
  },
  play: async context => {
    await playNoFirstQuery(context);
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  tags: ['!dev'],
  name: 'No results',
  decorators: [story => story()],
  play: async context => {
    await playNoResults(context);
    await playExecuteFirstSearch(context);
  }
}`,...E.parameters?.docs?.source}}},D=[`Default`,`ListDisplayWithTemplate`,`ListDisplayBeforeQuery`,`GridDisplay`,`GridDisplayWithTemplate`,`GridDisplayBeforeQuery`,`TableDisplay`,`TableDisplayBeforeQuery`,`NoResults`]}));O();export{v as Default,x as GridDisplay,C as GridDisplayBeforeQuery,S as GridDisplayWithTemplate,b as ListDisplayBeforeQuery,y as ListDisplayWithTemplate,E as NoResults,w as TableDisplay,T as TableDisplayBeforeQuery,D as __namedExportsOrder,_ as default,O as t};