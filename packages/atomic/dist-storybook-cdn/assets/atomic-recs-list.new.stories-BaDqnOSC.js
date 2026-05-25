import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,St as r,Tt as i}from"./iframe-cSkD6HDI.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{n as s,t as c}from"./mock-C5ckzz_b.js";import{n as l,t as u}from"./recs-interface-wrapper-BzT2wBsL.js";var d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O=e((()=>{t(),r(),s(),o(),u(),d=new c,d.searchEndpoint.mock(e=>({...e,results:e.results.slice(0,30),totalCount:30,totalCountFiltered:30})),{decorator:f,play:p}=l(),{events:m,args:h,argTypes:g,template:_}=n(`atomic-recs-list`,{excludeCategories:[`methods`]}),v={component:`atomic-recs-list`,title:`Recommendations/Recs List`,id:`atomic-recs-list`,render:e=>_(e),decorators:[f],parameters:{...a,actions:{handles:m},msw:{handlers:[...d.handlers]}},beforeEach:()=>{d.searchEndpoint.clear()},args:h,argTypes:g},y={decorators:[e=>i` <style>
          atomic-recs-list {
            margin: 24px;
          }
        </style>
        ${e()}`],play:p},{play:b}=l({skipFirstQuery:!0}),x={play:b},S={args:{"default-slot":`<atomic-recs-result-template>
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
          </atomic-recs-result-template>`},play:p},C={args:{"default-slot":`<atomic-recs-result-template>
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
          </atomic-recs-result-template>`},play:p},w={args:{"number-of-recommendations-per-page":4},play:p},T={name:`Not enough recommendations for carousel`,beforeEach:()=>{d.searchEndpoint.mockOnce(e=>({...e,results:e.results.slice(0,3),totalCount:3,totalCountFiltered:3}))},play:p},E={name:`No recommendations`,beforeEach:async()=>{d.searchEndpoint.mockOnce(e=>({...e,totalCount:0,totalCountFiltered:0,results:[]}))},play:p},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  decorators: [story => html\` <style>
          atomic-recs-list {
            margin: 24px;
          }
        </style>
        \${story()}\`],
  play
}`,...y.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  play: playNoFirstQuery
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    'number-of-recommendations-per-page': 4
  },
  play
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  name: 'No recommendations',
  beforeEach: async () => {
    mockedSearchApi.searchEndpoint.mockOnce(response => ({
      ...response,
      totalCount: 0,
      totalCountFiltered: 0,
      results: []
    }));
  },
  play
}`,...E.parameters?.docs?.source}}},D=[`Default`,`RecsBeforeQuery`,`RecsWithFullTemplate`,`RecsOpeningInNewTab`,`RecsAsCarousel`,`NotEnoughRecsForCarousel`,`NoRecommendations`]}));O();export{y as Default,E as NoRecommendations,T as NotEnoughRecsForCarousel,w as RecsAsCarousel,x as RecsBeforeQuery,C as RecsOpeningInNewTab,S as RecsWithFullTemplate,D as __namedExportsOrder,v as default,O as t};