import{n as e}from"./chunk-jRWAZmH_.js";import{St as t,Tt as n}from"./iframe-cSkD6HDI.js";import{n as r,t as i}from"./common-meta-parameters-BmIbTEf7.js";import{n as a,t as o}from"./mock-CijMLWxR.js";import{n as s,t as c}from"./insight-interface-wrapper-BwybnAhf.js";import{n as l,t as u}from"./insight-layout-wrapper-ByxKkP0j.js";import{a as d,n as f,r as p,t as m}from"./insight-result-template-wrapper-vZ5uGLfk.js";var h,g,_,v,y,b,x,S,C,w,T=e((()=>{t(),a(),i(),c(),u(),p(),m(),h=new o,{decorator:g,play:_}=s({},!1,!1),{decorator:v}=l(!1),{decorator:y}=d(`list`,!1),{decorator:b}=f(!1),x={component:`atomic-insight-result-action`,title:`Insight/Result Action`,id:`atomic-insight-result-action`,render:e=>n`
    <atomic-result-section-actions id="code-root">
      <atomic-insight-result-action
        action=${e.action}
        tooltip=${e.tooltip}
        tooltip-on-click=${e.tooltipOnClick}
        icon=${e.icon}
      ></atomic-insight-result-action>
    </atomic-result-section-actions>
  `,args:{action:`copyToClipboard`,tooltip:`Copy to clipboard`,tooltipOnClick:`Copied!`,icon:``},argTypes:{action:{control:`select`,options:[`copyToClipboard`,`attachToCase`,`quickview`,`postToFeed`,`sendAsEmail`],description:`The type of action to perform when clicked`},tooltip:{control:`text`,description:`The text tooltip to show on the result action icon`},tooltipOnClick:{control:`text`,description:`The text tooltip to show after clicking the button`},icon:{control:`text`,description:`Custom SVG icon to display. If not provided, uses a default icon based on the action type.`}},decorators:[e=>n`
      <atomic-result-section-title>
        <atomic-result-link></atomic-result-link>
      </atomic-result-section-title>
      <atomic-result-section-excerpt>
        <atomic-result-text field="excerpt"></atomic-result-text>
      </atomic-result-section-excerpt>
      ${e()}
    `,b,y,v,g],parameters:{...r,msw:{handlers:[...h.handlers]}},play:_},S={},C={render:e=>n`
    <atomic-result-section-actions id="code-root">
      <atomic-insight-result-action-bar>
        <atomic-insight-result-action
          action=${e.action}
          tooltip=${e.tooltip}
          tooltip-on-click=${e.tooltipOnClick}
          icon=${e.icon}
        ></atomic-insight-result-action>
      </atomic-insight-result-action-bar>
    </atomic-result-section-actions>
  `},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <atomic-result-section-actions id="code-root">
      <atomic-insight-result-action-bar>
        <atomic-insight-result-action
          action=\${args.action}
          tooltip=\${args.tooltip}
          tooltip-on-click=\${args.tooltipOnClick}
          icon=\${args.icon}
        ></atomic-insight-result-action>
      </atomic-insight-result-action-bar>
    </atomic-result-section-actions>
  \`
}`,...C.parameters?.docs?.source}}},w=[`Default`,`InActionBar`]}));T();export{S as Default,C as InActionBar,w as __namedExportsOrder,x as default,T as t};