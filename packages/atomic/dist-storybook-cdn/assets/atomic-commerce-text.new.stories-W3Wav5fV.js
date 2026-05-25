import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n}from"./iframe-cSkD6HDI.js";import{i as r,r as i}from"./commerce-interface-wrapper-BFOjNQs_.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";var s,c,l,u,d,f,p,m,h,g,_=e((()=>{t(),i(),o(),{decorator:s,play:c}=r({skipFirstRequest:!0}),{events:l,args:u,argTypes:d,template:f}=n(`atomic-commerce-text`,{excludeCategories:[`methods`]}),p={component:`atomic-commerce-text`,title:`Commerce/Text`,id:`atomic-commerce-text`,render:e=>f(e),decorators:[s],parameters:{...a,chromatic:{disableSnapshot:!0},actions:{handles:l}},args:u,argTypes:d,play:c},m={args:{value:`Atomic Commerce Text`}},h={name:`With translations`,play:async e=>{let t=e.canvasElement.querySelector(`atomic-commerce-interface`);await e.step(`Load translations`,async()=>{await customElements.whenDefined(`atomic-commerce-interface`),t.i18n.addResourceBundle(`en`,`translation`,{[e.args.value]:e.args.translationValue,[`${e.args.value}_other`]:e.args.translationValueOther})}),await c(e)},args:{value:`translation-key`,count:1,translationValue:`A single product`,translationValueOther:`{{count}} products`}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    value: 'Atomic Commerce Text'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: 'With translations',
  play: async context => {
    const commerceInterface = context.canvasElement.querySelector<AtomicCommerceInterface>('atomic-commerce-interface')!;
    await context.step('Load translations', async () => {
      await customElements.whenDefined('atomic-commerce-interface');
      commerceInterface.i18n.addResourceBundle('en', 'translation', {
        // "translation-key": "A single product"
        [context.args.value]: context.args.translationValue,
        // "translation-key_other": "{{count}} products"
        [\`\${context.args.value}_other\`]: context.args.translationValueOther
      });
    });
    await play(context);
  },
  args: {
    value: 'translation-key',
    count: 1,
    translationValue: 'A single product',
    translationValueOther: '{{count}} products'
  }
}`,...h.parameters?.docs?.source}}},g=[`Default`,`WithTranslations`]}));_();export{m as Default,h as WithTranslations,g as __namedExportsOrder,p as default,_ as t};