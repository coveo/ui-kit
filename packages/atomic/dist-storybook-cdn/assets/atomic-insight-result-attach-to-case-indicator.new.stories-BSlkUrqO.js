import{n as e}from"./chunk-jRWAZmH_.js";import{A as t,D as n,E as r,M as i,j as a}from"./iframe-cSkD6HDI.js";import{n as o,t as s}from"./common-meta-parameters-BmIbTEf7.js";import{n as c,t as l}from"./mock-CijMLWxR.js";import{n as u,t as d}from"./insight-interface-wrapper-BwybnAhf.js";import{loadAttachedResultsActions as f,loadCaseContextActions as p}from"/headless/v3.50.1/insight/headless.esm.js";var m,h,g,_,v,y,b,x,S,C,w,T=e((()=>{n(),t(),c(),s(),d(),m=new l,h=`test-case-1234`,{decorator:g,play:_}=u(void 0,!0),{events:v,args:y,argTypes:b}=r(`atomic-insight-result-attach-to-case-indicator`,{excludeCategories:[`methods`]}),x=`<template>
  <style>
    .field {
      display: inline-flex;
      align-items: center;
    }
    .field-label {
      font-weight: bold;
      margin-right: 0.25rem;
    }
  </style>
  <atomic-insight-result-action-bar>
    <atomic-insight-result-attach-to-case-action></atomic-insight-result-attach-to-case-action>
  </atomic-insight-result-action-bar>
  <atomic-result-section-actions>
    <atomic-insight-result-attach-to-case-indicator></atomic-insight-result-attach-to-case-indicator>
  </atomic-result-section-actions>
  <atomic-result-section-title>
    <atomic-result-link></atomic-result-link>
  </atomic-result-section-title>
  <atomic-result-section-excerpt>
    <atomic-result-text field="excerpt"></atomic-result-text>
  </atomic-result-section-excerpt>
  <atomic-result-section-bottom-metadata>
    <atomic-result-fields-list>
      <atomic-field-condition class="field" if-defined="source">
        <span class="field-label"><atomic-text value="source"></atomic-text>:</span>
        <atomic-result-text field="source"></atomic-result-text>
      </atomic-field-condition>
    </atomic-result-fields-list>
  </atomic-result-section-bottom-metadata>
</template>`,S={component:`atomic-insight-result-attach-to-case-indicator`,title:`Insight/Result Attach To Case Indicator`,id:`atomic-insight-result-attach-to-case-indicator`,parameters:{...o,actions:{handles:v},msw:{handlers:[...m.handlers]}},args:y,argTypes:b,beforeEach:()=>{m.searchEndpoint.clear()}},C={name:`In a result list`,decorators:[()=>i`
      <atomic-insight-layout>
        <atomic-layout-section section="results">
          <atomic-insight-result-list display="list" density="normal">
            <atomic-insight-result-template>
              ${a(x)}
            </atomic-insight-result-template>
          </atomic-insight-result-list>
        </atomic-layout-section>
      </atomic-insight-layout>
    `,g],render:()=>i``,play:async e=>{let{canvasElement:t,step:n}=e;await _(e);let r=t.querySelector(`atomic-insight-interface`),i=r.engine;await n(`Set case context`,async()=>{let{setCaseId:e}=p(i);i.dispatch(e(h))}),await n(`Pre-attach multiple results`,async()=>{let{attachResult:e}=f(i);for(let t of[0,2,3,7])i.dispatch(e({caseId:h,title:`Support Article ${t}: Troubleshooting Guide`,resultUrl:`https://support.example.com/article/${t}`,permanentId:`insight-perm-id-${t}`,uriHash:`insight-hash-${t}`}))}),await n(`Execute the first search`,async()=>{await r.executeFirstSearch()})}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'In a result list',
  decorators: [() => html\`
      <atomic-insight-layout>
        <atomic-layout-section section="results">
          <atomic-insight-result-list display="list" density="normal">
            <atomic-insight-result-template>
              \${unsafeStatic(TEMPLATE_WITH_INDICATOR)}
            </atomic-insight-result-template>
          </atomic-insight-result-list>
        </atomic-layout-section>
      </atomic-insight-layout>
    \`, insightInterfaceDecorator],
  render: () => html\`\`,
  play: async context => {
    const {
      canvasElement,
      step
    } = context;
    await initializeInsightInterface(context);
    const insightInterface = canvasElement.querySelector<AtomicInsightInterface>('atomic-insight-interface');
    const engine = insightInterface!.engine!;
    await step('Set case context', async () => {
      const {
        setCaseId
      } = loadCaseContextActions(engine);
      engine.dispatch(setCaseId(CASE_ID));
    });
    await step('Pre-attach multiple results', async () => {
      const {
        attachResult
      } = loadAttachedResultsActions(engine);
      const attachedResultIndices = [0, 2, 3, 7];
      for (const index of attachedResultIndices) {
        engine.dispatch(attachResult({
          caseId: CASE_ID,
          title: \`Support Article \${index}: Troubleshooting Guide\`,
          resultUrl: \`https://support.example.com/article/\${index}\`,
          permanentId: \`insight-perm-id-\${index}\`,
          uriHash: \`insight-hash-\${index}\`
        }));
      }
    });
    await step('Execute the first search', async () => {
      await insightInterface!.executeFirstSearch();
    });
  }
}`,...C.parameters?.docs?.source}}},w=[`Default`]}));T();export{C as Default,w as __namedExportsOrder,S as default,T as t};