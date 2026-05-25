import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,St as r,Tt as i}from"./iframe-cSkD6HDI.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{n as s,t as c}from"./mock-C5ckzz_b.js";import{n as l,t as u}from"./recs-interface-wrapper-BzT2wBsL.js";var d,f,p,m,h,g,_,v,y,b,x,S,C,w,T=e((()=>{t(),r(),s(),o(),u(),d=new c,d.searchEndpoint.mock(e=>({...e,results:e.results.slice(0,30),totalCount:30,totalCountFiltered:30})),{decorator:f,play:p}=l(),{events:m,args:h,argTypes:g,template:_}=n(`atomic-ipx-recs-list`,{excludeCategories:[`methods`]}),v={component:`atomic-ipx-recs-list`,title:`IPX/Recs List`,id:`atomic-ipx-recs-list`,render:e=>_(e),decorators:[f],parameters:{...a,actions:{handles:m},msw:{handlers:[...d.handlers]}},beforeEach:()=>{d.searchEndpoint.clear()},args:h,argTypes:g},y={decorators:[e=>i` <style>
          atomic-ipx-recs-list {
            margin: 24px;
          }
        </style>
        ${e()}`],play:p},b={tags:[`test`],args:{"default-slot":`<atomic-recs-result-template>
            <template>
              <atomic-result-section-visual>
                <span>Visual Section</span>
              </atomic-result-section-visual>
              <atomic-result-section-badge>
                <span>Badge Section</span>
              </atomic-result-section-badge>
              <atomic-result-section-actions>
                <span>Actions Section</span>
              </atomic-result-section-actions>
              <atomic-result-section-title>
                <span>Title Section</span>
              </atomic-result-section-title>
              <atomic-result-section-title-metadata>
                  <span>Title Metadata Section</span>
              </atomic-result-section-title-metadata>
              <atomic-result-section-emphasized>
                <span>Emphasized Section</span>
              </atomic-result-section-emphasized>
              <atomic-result-section-excerpt>
                <span>Excerpt Section</span>
              </atomic-result-section-excerpt>
              <atomic-result-section-bottom-metadata>
                <span>Bottom Metadata Section</span>
              </atomic-result-section-bottom-metadata>
            </template>
          </atomic-recs-result-template>`},play:p},x={tags:[`test`],args:{"default-slot":`<atomic-recs-result-template>
            <template slot="link">
              <atomic-result-link>
                <a slot="attributes" target="_blank"></a>
              </atomic-result-link>
            </template>
            <template>
              <atomic-result-section-title>
                <atomic-result-text field="title"></atomic-result-text>
              </atomic-result-section-title>
            </template>
          </atomic-recs-result-template>`},play:p},S={args:{"number-of-recommendations-per-page":4},play:p},C={name:`Not enough recommendations for carousel`,beforeEach:()=>{d.searchEndpoint.mockOnce(e=>({...e,results:e.results.slice(0,3),totalCount:3,totalCountFiltered:3}))},play:p},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  decorators: [story => html\` <style>
          atomic-ipx-recs-list {
            margin: 24px;
          }
        </style>
        \${story()}\`],
  play
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  tags: ['test'],
  args: {
    'default-slot': \`<atomic-recs-result-template>
            <template>
              <atomic-result-section-visual>
                <span>Visual Section</span>
              </atomic-result-section-visual>
              <atomic-result-section-badge>
                <span>Badge Section</span>
              </atomic-result-section-badge>
              <atomic-result-section-actions>
                <span>Actions Section</span>
              </atomic-result-section-actions>
              <atomic-result-section-title>
                <span>Title Section</span>
              </atomic-result-section-title>
              <atomic-result-section-title-metadata>
                  <span>Title Metadata Section</span>
              </atomic-result-section-title-metadata>
              <atomic-result-section-emphasized>
                <span>Emphasized Section</span>
              </atomic-result-section-emphasized>
              <atomic-result-section-excerpt>
                <span>Excerpt Section</span>
              </atomic-result-section-excerpt>
              <atomic-result-section-bottom-metadata>
                <span>Bottom Metadata Section</span>
              </atomic-result-section-bottom-metadata>
            </template>
          </atomic-recs-result-template>\`
  },
  play
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  tags: ['test'],
  args: {
    'default-slot': \`<atomic-recs-result-template>
            <template slot="link">
              <atomic-result-link>
                <a slot="attributes" target="_blank"></a>
              </atomic-result-link>
            </template>
            <template>
              <atomic-result-section-title>
                <atomic-result-text field="title"></atomic-result-text>
              </atomic-result-section-title>
            </template>
          </atomic-recs-result-template>\`
  },
  play
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    'number-of-recommendations-per-page': 4
  },
  play
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'Not enough recommendations for carousel',
  beforeEach: () => {
    mockedSearchApi.searchEndpoint.mockOnce(response => ({
      ...response,
      results: response.results.slice(0, 3),
      totalCount: 3,
      totalCountFiltered: 3
    }));
  },
  play
}`,...C.parameters?.docs?.source}}},w=[`Default`,`RecsWithFullTemplate`,`RecsOpeningInNewTab`,`RecsAsCarousel`,`NotEnoughRecsForCarousel`]}));T();export{y as Default,C as NotEnoughRecsForCarousel,S as RecsAsCarousel,x as RecsOpeningInNewTab,b as RecsWithFullTemplate,w as __namedExportsOrder,v as default,T as t};