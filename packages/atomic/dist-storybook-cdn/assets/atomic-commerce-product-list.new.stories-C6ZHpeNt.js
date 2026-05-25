import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n}from"./iframe-cSkD6HDI.js";import{i as r,r as i,t as a}from"./commerce-interface-wrapper-BFOjNQs_.js";import{n as o,t as s}from"./common-meta-parameters-BmIbTEf7.js";var c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D=e((()=>{t(),i(),s(),{events:c,args:l,argTypes:u,template:d}=n(`atomic-commerce-product-list`,{excludeCategories:[`methods`]}),{decorator:f,play:p}=r({skipFirstRequest:!1,engineConfig:{preprocessRequest:e=>{let t=JSON.parse(e.body);return t.perPage=4,e.body=JSON.stringify(t),e}}}),{play:m}=r({skipFirstRequest:!0}),{play:h}=r({skipFirstRequest:!1,engineConfig:{preprocessRequest:e=>{let t=JSON.parse(e.body);return t.query=`show me no products`,e.body=JSON.stringify(t),e}}}),g={args:{...l,"number-of-placeholders":4,display:`grid`,density:`normal`,"image-size":`small`},component:`atomic-commerce-product-list`,title:`Commerce/Product List`,id:`atomic-commerce-product-list`,render:e=>d(e),decorators:[f],parameters:{...o,chromatic:{disableSnapshot:!0},actions:{handles:c}},argTypes:u,play:p},_={name:`Using grid display`},v={name:`Using grid display with template`,args:{"default-slot":`<atomic-product-template>
  <template>
    <atomic-product-section-name id="product-name-section">
      <atomic-product-link class="font-bold"></atomic-product-link>
    </atomic-product-section-name>
    <atomic-product-section-visual>
      <atomic-product-field-condition if-defined="ec_thumbnails">
        <atomic-product-image field="ec_thumbnails"></atomic-product-image>
      </atomic-product-field-condition>
    </atomic-product-section-visual>
    <atomic-product-section-metadata>
      <atomic-product-field-condition if-defined="ec_brand">
        <atomic-product-text field="ec_brand"></atomic-product-text>
      </atomic-product-field-condition>
      <atomic-product-field-condition if-defined="cat_available_sizes">
        <atomic-product-multi-value-text
          field="cat_available_sizes"
        ></atomic-product-multi-value-text>
      </atomic-product-field-condition>
      <atomic-product-field-condition if-defined="ec_rating">
        <atomic-product-rating field="ec_rating"></atomic-product-rating>
      </atomic-product-field-condition>
      <atomic-product-field-condition if-defined="concepts">
        <atomic-product-multi-value-text field="concepts"></atomic-product-multi-value-text>
      </atomic-product-field-condition>
    </atomic-product-section-metadata>
    <atomic-product-section-emphasized>
      <atomic-product-price currency="USD"></atomic-product-price>
    </atomic-product-section-emphasized>
    <atomic-product-section-description>
      <atomic-product-excerpt></atomic-product-excerpt>
    </atomic-product-section-description>
    <atomic-product-section-children>
      <atomic-product-children></atomic-product-children>
    </atomic-product-section-children>
  </template>
</atomic-product-template>`}},y={name:`Using grid display before query`,play:async e=>{await m(e)}},b={name:`Using list display`,args:{display:`list`}},x={name:`Using list display with template`,args:{display:`list`,"default-slot":`<atomic-product-template>
  <template>
    <atomic-product-section-name id="product-name-section">
      <atomic-product-link class="font-bold"></atomic-product-link>
    </atomic-product-section-name>
    <atomic-product-section-visual>
      <atomic-product-field-condition if-defined="ec_thumbnails">
        <atomic-product-image field="ec_thumbnails"></atomic-product-image>
      </atomic-product-field-condition>
    </atomic-product-section-visual>
    <atomic-product-section-metadata>
      <atomic-product-field-condition if-defined="ec_brand">
        <atomic-product-text field="ec_brand"></atomic-product-text>
      </atomic-product-field-condition>
      <atomic-product-field-condition if-defined="cat_available_sizes">
        <atomic-product-multi-value-text
          field="cat_available_sizes"
        ></atomic-product-multi-value-text>
      </atomic-product-field-condition>
      <atomic-product-field-condition if-defined="ec_rating">
        <atomic-product-rating field="ec_rating"></atomic-product-rating>
      </atomic-product-field-condition>
      <atomic-product-field-condition if-defined="concepts">
        <atomic-product-multi-value-text field="concepts"></atomic-product-multi-value-text>
      </atomic-product-field-condition>
    </atomic-product-section-metadata>
    <atomic-product-section-emphasized>
      <atomic-product-price currency="USD"></atomic-product-price>
    </atomic-product-section-emphasized>
    <atomic-product-section-description>
      <atomic-product-excerpt></atomic-product-excerpt>
    </atomic-product-section-description>
    <atomic-product-section-children>
      <atomic-product-children></atomic-product-children>
    </atomic-product-section-children>
  </template>
</atomic-product-template>`}},S={name:`Using list display before query`,args:{display:`list`},play:async e=>{await m(e)}},C={name:`Using table display`,args:{display:`table`,"default-slot":`<atomic-product-template>
  <template>
    <atomic-table-element label="Product">
      <atomic-product-link></atomic-product-link>
      <atomic-product-field-condition if-defined="ec_brand">
        <atomic-product-text field="ec_brand" class="text-neutral-dark block"></atomic-product-text>
      </atomic-product-field-condition>
    </atomic-table-element>
    <atomic-table-element label="ID">
      <atomic-product-text field="permanentid"></atomic-product-text>
    </atomic-table-element>
    <atomic-table-element label="Price">
      <atomic-product-price></atomic-product-price>
    </atomic-table-element>

  </template>
</atomic-product-template>`}},w={name:`Using table display before query`,args:{display:`table`},play:async e=>{await m(e)}},T={tags:[`!dev`],name:`No products`,decorators:[e=>e()],play:async e=>{await h(e),await a(e)}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  name: 'Using grid display'
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'Using grid display with template',
  args: {
    'default-slot': \`<atomic-product-template>
  <template>
    <atomic-product-section-name id="product-name-section">
      <atomic-product-link class="font-bold"></atomic-product-link>
    </atomic-product-section-name>
    <atomic-product-section-visual>
      <atomic-product-field-condition if-defined="ec_thumbnails">
        <atomic-product-image field="ec_thumbnails"></atomic-product-image>
      </atomic-product-field-condition>
    </atomic-product-section-visual>
    <atomic-product-section-metadata>
      <atomic-product-field-condition if-defined="ec_brand">
        <atomic-product-text field="ec_brand"></atomic-product-text>
      </atomic-product-field-condition>
      <atomic-product-field-condition if-defined="cat_available_sizes">
        <atomic-product-multi-value-text
          field="cat_available_sizes"
        ></atomic-product-multi-value-text>
      </atomic-product-field-condition>
      <atomic-product-field-condition if-defined="ec_rating">
        <atomic-product-rating field="ec_rating"></atomic-product-rating>
      </atomic-product-field-condition>
      <atomic-product-field-condition if-defined="concepts">
        <atomic-product-multi-value-text field="concepts"></atomic-product-multi-value-text>
      </atomic-product-field-condition>
    </atomic-product-section-metadata>
    <atomic-product-section-emphasized>
      <atomic-product-price currency="USD"></atomic-product-price>
    </atomic-product-section-emphasized>
    <atomic-product-section-description>
      <atomic-product-excerpt></atomic-product-excerpt>
    </atomic-product-section-description>
    <atomic-product-section-children>
      <atomic-product-children></atomic-product-children>
    </atomic-product-section-children>
  </template>
</atomic-product-template>\`
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'Using grid display before query',
  play: async context => {
    await playNoFirstQuery(context);
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'Using list display',
  args: {
    display: 'list'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'Using list display with template',
  args: {
    display: 'list',
    'default-slot': \`<atomic-product-template>
  <template>
    <atomic-product-section-name id="product-name-section">
      <atomic-product-link class="font-bold"></atomic-product-link>
    </atomic-product-section-name>
    <atomic-product-section-visual>
      <atomic-product-field-condition if-defined="ec_thumbnails">
        <atomic-product-image field="ec_thumbnails"></atomic-product-image>
      </atomic-product-field-condition>
    </atomic-product-section-visual>
    <atomic-product-section-metadata>
      <atomic-product-field-condition if-defined="ec_brand">
        <atomic-product-text field="ec_brand"></atomic-product-text>
      </atomic-product-field-condition>
      <atomic-product-field-condition if-defined="cat_available_sizes">
        <atomic-product-multi-value-text
          field="cat_available_sizes"
        ></atomic-product-multi-value-text>
      </atomic-product-field-condition>
      <atomic-product-field-condition if-defined="ec_rating">
        <atomic-product-rating field="ec_rating"></atomic-product-rating>
      </atomic-product-field-condition>
      <atomic-product-field-condition if-defined="concepts">
        <atomic-product-multi-value-text field="concepts"></atomic-product-multi-value-text>
      </atomic-product-field-condition>
    </atomic-product-section-metadata>
    <atomic-product-section-emphasized>
      <atomic-product-price currency="USD"></atomic-product-price>
    </atomic-product-section-emphasized>
    <atomic-product-section-description>
      <atomic-product-excerpt></atomic-product-excerpt>
    </atomic-product-section-description>
    <atomic-product-section-children>
      <atomic-product-children></atomic-product-children>
    </atomic-product-section-children>
  </template>
</atomic-product-template>\`
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'Using list display before query',
  args: {
    display: 'list'
  },
  play: async context => {
    await playNoFirstQuery(context);
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'Using table display',
  args: {
    display: 'table',
    'default-slot': \`<atomic-product-template>
  <template>
    <atomic-table-element label="Product">
      <atomic-product-link></atomic-product-link>
      <atomic-product-field-condition if-defined="ec_brand">
        <atomic-product-text field="ec_brand" class="text-neutral-dark block"></atomic-product-text>
      </atomic-product-field-condition>
    </atomic-table-element>
    <atomic-table-element label="ID">
      <atomic-product-text field="permanentid"></atomic-product-text>
    </atomic-table-element>
    <atomic-table-element label="Price">
      <atomic-product-price></atomic-product-price>
    </atomic-table-element>

  </template>
</atomic-product-template>\`
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'Using table display before query',
  args: {
    display: 'table'
  },
  play: async context => {
    await playNoFirstQuery(context);
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  tags: ['!dev'],
  name: 'No products',
  decorators: [story => story()],
  play: async context => {
    await playNoProducts(context);
    await executeFirstRequestHook(context);
  }
}`,...T.parameters?.docs?.source}}},E=[`Default`,`GridDisplayWithTemplate`,`GridDisplayBeforeQuery`,`ListDisplay`,`ListDisplayWithTemplate`,`ListDisplayBeforeQuery`,`TableDisplay`,`TableDisplayBeforeQuery`,`NoProducts`]}));D();export{_ as Default,y as GridDisplayBeforeQuery,v as GridDisplayWithTemplate,b as ListDisplay,S as ListDisplayBeforeQuery,x as ListDisplayWithTemplate,T as NoProducts,C as TableDisplay,w as TableDisplayBeforeQuery,E as __namedExportsOrder,g as default,D as t};