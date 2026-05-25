import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,O as r,St as i,Tt as a,k as o}from"./iframe-cSkD6HDI.js";import{n as s,t as c}from"./common-meta-parameters-BmIbTEf7.js";import{n as l,t as u}from"./recs-interface-wrapper-BzT2wBsL.js";import{n as d,t as f}from"./mock-CSDYADVl.js";var p,m,h,g,_,v,y,b,x,S,C,w,T=e((()=>{t(),i(),r(),d(),c(),u(),p=new f,{decorator:m,play:h}=l(),{events:g,args:_,argTypes:v}=n(`atomic-recs-interface`,{excludeCategories:[`methods`]}),y={component:`atomic-recs-interface`,title:`Recommendations/Interface`,id:`atomic-recs-interface`,render:e=>a`${o(e[`default-slot`]||``)}`,decorators:[m],parameters:{...s,msw:{handlers:[...p.handlers]},actions:{handles:g}},argTypes:{...v,engine:{...v,control:{disable:!0},table:{defaultValue:{summary:void 0}}},i18n:{...v.i18n,control:{disable:!0},table:{defaultValue:{summary:void 0}}}},args:{..._,engine:void 0,i18n:void 0,language:`en`,"default-slot":`<span>Interface content</span>`}},b={play:h},{play:x}=l({skipFirstQuery:!0,skipInitialization:!0}),S={tags:[`!dev`],play:async e=>{await x(e),await e.canvasElement.querySelector(`atomic-recs-interface`)?.getRecommendations()}},C={args:{"default-slot":`<atomic-recs-list label="Recommended articles" display="list" density="normal" image-size="small" number-of-recommendations="10">
          <atomic-recs-result-template>
            <template>
              <atomic-result-section-visual>
                <atomic-result-image field="image" aria-hidden="true"></atomic-result-image>
              </atomic-result-section-visual>
              <atomic-result-section-badges>
                <atomic-result-badge field="category"></atomic-result-badge>
              </atomic-result-section-badges>
              <atomic-result-section-title>
                <atomic-result-link></atomic-result-link>
              </atomic-result-section-title>
              <atomic-result-section-excerpt>
                <atomic-result-text field="excerpt"></atomic-result-text>
              </atomic-result-section-excerpt>
              <atomic-result-section-bottom-metadata>
                <atomic-result-fields-list>
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
            </template>
          </atomic-recs-result-template>
        </atomic-recs-list>`},play:h},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  play
}`,...b.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  tags: ['!dev'],
  play: async context => {
    await playNoFirstQuery(context);
    const recsInterface = context.canvasElement.querySelector('atomic-recs-interface');
    await recsInterface?.getRecommendations();
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    'default-slot': \`<atomic-recs-list label="Recommended articles" display="list" density="normal" image-size="small" number-of-recommendations="10">
          <atomic-recs-result-template>
            <template>
              <atomic-result-section-visual>
                <atomic-result-image field="image" aria-hidden="true"></atomic-result-image>
              </atomic-result-section-visual>
              <atomic-result-section-badges>
                <atomic-result-badge field="category"></atomic-result-badge>
              </atomic-result-section-badges>
              <atomic-result-section-title>
                <atomic-result-link></atomic-result-link>
              </atomic-result-section-title>
              <atomic-result-section-excerpt>
                <atomic-result-text field="excerpt"></atomic-result-text>
              </atomic-result-section-excerpt>
              <atomic-result-section-bottom-metadata>
                <atomic-result-fields-list>
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
            </template>
          </atomic-recs-result-template>
        </atomic-recs-list>\`
  },
  play
}`,...C.parameters?.docs?.source}}},w=[`Default`,`RecsBeforeInit`,`WithRecsList`]}));T();export{b as Default,S as RecsBeforeInit,C as WithRecsList,w as __namedExportsOrder,y as default,T as t};