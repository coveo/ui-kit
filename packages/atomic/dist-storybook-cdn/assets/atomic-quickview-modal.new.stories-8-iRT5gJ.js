import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,St as r,Tt as i,n as a,r as o}from"./iframe-cSkD6HDI.js";import{n as s,t as c}from"./common-meta-parameters-BmIbTEf7.js";import{r as l,t as u}from"./search-interface-wrapper-DyJSRxFL.js";import{n as d,t as f}from"./mock-C5ckzz_b.js";import{n as p,t as m}from"./result-list-wrapper-DszKxGnf.js";import{n as h,t as g}from"./result-template-wrapper-BY8u_Pg8.js";var _,v,y,b,x,S,C,w,T,E,D,O,k,A=e((()=>{t(),r(),o(),d(),c(),m(),g(),u(),_=new f,_.searchEndpoint.mock(e=>({...e,results:e.results.slice(0,1).map(e=>({...e,title:`Australia's under-16s social media ban comes into effect | Global News Podcast`,uri:`https://youtube.com/User:bbcnews/Channel:UC16niRr50-MSBwiO3YDb3RA/Video:XjI_iE-sNcM`,printableUri:`https://www.youtube.com/watch?v=XjI_iE-sNcM`,clickUri:`https://www.youtube.com/watch?v=XjI_iE-sNcM`,uniqueId:`42.13613$https://youtube.com/User:bbcnews/Channel:UC16niRr50-MSBwiO3YDb3RA/Video:XjI_iE-sNcM`,excerpt:`Children under the age of 16 in Australia are no longer allowed to use social media. ... The Australian government said it is aimed at protecting kids from cyberbullying, online predators and harmf...`,flags:`HasHtmlVersion;HasThumbnail;HasAllMetaDataStream`,hasHtmlVersion:!0,raw:{...e.raw,sysauthor:[`BBC News`],author:[`BBC News`],syslanguage:[`English`],language:[`English`],date:1765317641e3,sysdate:1765317641e3,sourcetype:`YouTube`,syssourcetype:`YouTube`,filetype:`YouTubeVideo`,sysfiletype:`YouTubeVideo`,source:`Coveo Samples - Youtube BBC News`,syssource:`Coveo Samples - Youtube BBC News`}})),totalCount:1,totalCountFiltered:1})),{decorator:v,play:y}=l({includeCodeRoot:!1}),{decorator:b}=p(`list`,!1),{decorator:x}=h(),{events:S,args:C,argTypes:w,styleTemplate:T}=n(`atomic-quickview-modal`,{excludeCategories:[`methods`]}),E={component:`atomic-quickview-modal`,title:`Search/Quickview Modal`,id:`atomic-quickview-modal`,render:()=>i`<atomic-quickview></atomic-quickview>`,decorators:[x,b,v,(e,{args:t})=>i` ${T(t)} ${e()} `],parameters:{...s,actions:{handles:S},docs:{...s.docs,story:{...s.docs?.story,height:`600px`}},msw:{handlers:[..._.handlers]}},args:C,argTypes:w,play:y},D={play:async e=>{await y(e);let{canvasElement:t,step:n,userEvent:r}=e;await new Promise(e=>setTimeout(e,500));let i=await a(t).findByShadowTitle(`Quick View`);await n(`Open quickview modal`,async()=>{await r.click(i)}),await new Promise(e=>setTimeout(e,600))}},O={tags:[`!dev`]},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  play: async context => {
    await play(context);
    const {
      canvasElement,
      step,
      userEvent
    } = context;
    // Wait for result to load and quickview button to be available
    await new Promise(resolve => setTimeout(resolve, 500));
    const canvas = within(canvasElement);
    const quickviewButton = await canvas.findByShadowTitle('Quick View');
    await step('Open quickview modal', async () => {
      await userEvent.click(quickviewButton);
    });
    // Wait for the modal animation to complete (animation duration is 500ms)
    await new Promise(resolve => setTimeout(resolve, 600));
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  tags: ['!dev']
}`,...O.parameters?.docs?.source}}},k=[`Default`,`Closed`]}));A();export{O as Closed,D as Default,k as __namedExportsOrder,E as default,A as t};