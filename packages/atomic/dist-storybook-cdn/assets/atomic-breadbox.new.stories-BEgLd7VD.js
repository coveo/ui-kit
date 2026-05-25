import{n as e}from"./chunk-jRWAZmH_.js";import{A as t,D as n,E as r,M as i}from"./iframe-cSkD6HDI.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{r as s,t as c}from"./search-interface-wrapper-DyJSRxFL.js";var l,u,d,f,p,m,h,g,_,v,y,b=e((()=>{n(),t(),o(),c(),{expect:l,waitFor:u}=__STORYBOOK_MODULE_TEST__,{decorator:d,play:f}=s(),{events:p,args:m,argTypes:h,template:g}=r(`atomic-breadbox`,{excludeCategories:[`methods`]}),_={component:`atomic-breadbox`,title:`Search/Breadbox`,id:`atomic-breadbox`,render:e=>g(e),decorators:[d],parameters:{...a,chromatic:{disableSnapshot:!0},actions:{handles:p}},args:m,argTypes:h,play:f},v={name:`atomic-breadbox`,decorators:[e=>i`
      ${e()}
      <div style="margin:20px 0">
        Select facet value(s) to see the Breadbox component.
      </div>
      <div style="display: flex; justify-content: flex-start;">
        <atomic-facet
          field="objecttype"
          style="flex-grow:1"
          label="Object type"
        ></atomic-facet>
        <atomic-facet
          field="filetype"
          style="flex-grow:1"
          label="File type"
        ></atomic-facet>
        <atomic-facet
          field="source"
          style="flex-grow:1"
          label="Source"
        ></atomic-facet>
      </div>
    `],play:async e=>{await f(e);let{canvas:t,step:n}=e;await n(`Wait for the facet values to render`,async()=>{await u(()=>l(t.getByShadowTitle(`People`)).toBeInTheDocument(),{timeout:3e4})})}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'atomic-breadbox',
  decorators: [story => html\`
      \${story()}
      <div style="margin:20px 0">
        Select facet value(s) to see the Breadbox component.
      </div>
      <div style="display: flex; justify-content: flex-start;">
        <atomic-facet
          field="objecttype"
          style="flex-grow:1"
          label="Object type"
        ></atomic-facet>
        <atomic-facet
          field="filetype"
          style="flex-grow:1"
          label="File type"
        ></atomic-facet>
        <atomic-facet
          field="source"
          style="flex-grow:1"
          label="Source"
        ></atomic-facet>
      </div>
    \`],
  play: async context => {
    await play(context);
    const {
      canvas,
      step
    } = context;
    await step('Wait for the facet values to render', async () => {
      await waitFor(() => expect(canvas.getByShadowTitle('People')).toBeInTheDocument(), {
        timeout: 30e3
      });
    });
  }
}`,...v.parameters?.docs?.source}}},y=[`Default`]}));b();export{v as Default,y as __namedExportsOrder,_ as default,b as t};