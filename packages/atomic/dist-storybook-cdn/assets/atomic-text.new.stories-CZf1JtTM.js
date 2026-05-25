import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n}from"./iframe-cSkD6HDI.js";import{n as r,t as i}from"./common-meta-parameters-BmIbTEf7.js";import{r as a,t as o}from"./search-interface-wrapper-DyJSRxFL.js";var s,c,l,u,d,f,p,m,h,g,_=e((()=>{t(),i(),o(),{decorator:s,play:c}=a({skipFirstSearch:!0}),{events:l,args:u,argTypes:d,template:f}=n(`atomic-text`,{excludeCategories:[`methods`]}),p={component:`atomic-text`,title:`Search/Text`,id:`atomic-text`,render:e=>f(e),decorators:[s],parameters:{...r,chromatic:{disableSnapshot:!0},actions:{handles:l}},args:u,argTypes:d,play:c},m={args:{value:`Atomic Text`}},h={name:`With translations`,play:async e=>{let t=e.canvasElement.querySelector(`atomic-search-interface`);await e.step(`Load translations`,async()=>{await customElements.whenDefined(`atomic-search-interface`),t.i18n.addResourceBundle(`en`,`translation`,{[e.args.value]:e.args.translationValue,[`${e.args.value}_other`]:e.args.translationValueOther})}),await c(e)},args:{value:`translation-key`,count:1,translationValue:`A single result`,translationValueOther:`{{count}} results`}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    value: 'Atomic Text'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: 'With translations',
  play: async context => {
    const searchInterface = context.canvasElement.querySelector<AtomicSearchInterface>('atomic-search-interface')!;
    await context.step('Load translations', async () => {
      await customElements.whenDefined('atomic-search-interface');
      searchInterface.i18n.addResourceBundle('en', 'translation', {
        // "translation-key": "A single result"
        [context.args.value]: context.args.translationValue,
        // "translation-key_other": "{{count}} results"
        [\`\${context.args.value}_other\`]: context.args.translationValueOther
      });
    });
    await play(context);
  },
  args: {
    value: 'translation-key',
    count: 1,
    translationValue: 'A single result',
    translationValueOther: '{{count}} results'
  }
}`,...h.parameters?.docs?.source}}},g=[`Default`,`WithTranslations`]}));_();export{m as Default,h as WithTranslations,g as __namedExportsOrder,p as default,_ as t};