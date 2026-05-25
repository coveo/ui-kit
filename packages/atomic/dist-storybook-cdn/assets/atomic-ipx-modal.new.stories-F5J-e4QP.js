import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,St as r,Tt as i}from"./iframe-cSkD6HDI.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{r as s,t as c}from"./search-interface-wrapper-DyJSRxFL.js";var l,u,d,f,p,m,h,g,_,v,y,b=e((()=>{t(),r(),o(),c(),{decorator:l,play:u}=s(),{events:d,args:f,argTypes:p,template:m}=n(`atomic-ipx-modal`,{excludeCategories:[`methods`]}),h={component:`atomic-ipx-modal`,title:`IPX/Modal`,id:`atomic-ipx-modal`,render:e=>m(e),decorators:[l,e=>i`
      <style>
        atomic-ipx-modal {
          position: relative;
          inset: auto;
          margin: 1rem;
        }
      </style>
      ${e()}
    `],parameters:{...a,chromatic:{disableSnapshot:!0},layout:`centered`,docs:{...a.docs,story:{...a.docs?.story,height:`800px`}},actions:{handles:d}},args:{...f,"is-open":!0,"header-slot":`<h2>Modal Header</h2>
      <button style="margin-bottom: 0.5rem;" onclick="this.closest('atomic-ipx-modal').isOpen = false">Close</button>`,"body-slot":`<p>This is the modal body content.</p>
      <p>The modal provides a way to display In-Product Experience content in a focused overlay.</p>`,"footer-slot":`<button>Action Button</button>`},argTypes:{...p,source:{...p.source,control:{disable:!0},table:{defaultValue:{summary:void 0}}},container:{...p.container,control:{disable:!0},table:{defaultValue:{summary:void 0}}}},play:async e=>{await u(e)}},g={name:`Default`},_={name:`Without Footer`,args:{"header-slot":`<h2>Modal Without Footer</h2>
      <button style="margin-bottom: 0.5rem;" onclick="this.closest('atomic-ipx-modal').isOpen = false">Close</button>`,"body-slot":`<p>This modal does not have a footer slot.</p>
      <p>The footer will be automatically hidden.</p>`,"footer-slot":``}},v={name:`Closed (not visible)`,args:{"is-open":!1,"header-slot":`<h2>The modal is now open</h2>
      <button style="margin-bottom: 0.5rem;" onclick="this.closest('atomic-ipx-modal').isOpen = false">Close</button>`,"body-slot":`<p>You are now seeing this because the modal is no longer closed.</p>`,"footer-slot":``},render:e=>i`${m(e)}
      <div style="padding: 2rem;">
        <p>
          The modal is present in the DOM but not visible. Set
          <code>is-open="true"</code> to display it.
        </p>
        <button
          onclick="this.closest('atomic-search-interface').querySelector('atomic-ipx-modal').isOpen = true"
        >
          Open Modal
        </button>
      </div>`},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: 'Default'
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  name: 'Without Footer',
  args: {
    'header-slot': \`<h2>Modal Without Footer</h2>
      <button style="margin-bottom: 0.5rem;" onclick="this.closest('atomic-ipx-modal').isOpen = false">Close</button>\`,
    'body-slot': \`<p>This modal does not have a footer slot.</p>
      <p>The footer will be automatically hidden.</p>\`,
    'footer-slot': ''
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'Closed (not visible)',
  args: {
    'is-open': false,
    'header-slot': \`<h2>The modal is now open</h2>
      <button style="margin-bottom: 0.5rem;" onclick="this.closest('atomic-ipx-modal').isOpen = false">Close</button>\`,
    'body-slot': \`<p>You are now seeing this because the modal is no longer closed.</p>\`,
    'footer-slot': ''
  },
  render: args => html\`\${template(args)}
      <div style="padding: 2rem;">
        <p>
          The modal is present in the DOM but not visible. Set
          <code>is-open="true"</code> to display it.
        </p>
        <button
          onclick="this.closest('atomic-search-interface').querySelector('atomic-ipx-modal').isOpen = true"
        >
          Open Modal
        </button>
      </div>\`
}`,...v.parameters?.docs?.source}}},y=[`Default`,`WithoutFooter`,`Closed`]}));b();export{v as Closed,g as Default,_ as WithoutFooter,y as __namedExportsOrder,h as default,b as t};