import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n,St as r,Tt as i}from"./iframe-cSkD6HDI.js";import{i as a,r as o}from"./commerce-interface-wrapper-BFOjNQs_.js";import{n as s,t as c}from"./common-meta-parameters-BmIbTEf7.js";import{n as l,t as u}from"./commerce-product-list-wrapper-CNTwHksc.js";import{n as d,t as f}from"./commerce-product-template-wrapper-BOcgCT4i.js";var p,m,h,g,_,v,y,b,x,S,C,w,T,E,D=e((()=>{t(),r(),o(),u(),f(),c(),{decorator:p,play:m}=a({type:`product-listing`,engineConfig:{context:{view:{url:`https://sports.barca.group/browse/promotions/ui-kit-testing`},language:`en`,country:`US`,currency:`USD`},preprocessRequest:e=>{let t=JSON.parse(e.body);return t.perPage=1,e.body=JSON.stringify(t),e}},includeCodeRoot:!1}),{decorator:h}=l(`list`,!1),{decorator:g}=d(),{events:_,args:v,argTypes:y,template:b}=n(`atomic-product-link`,{excludeCategories:[`methods`]}),x={component:`atomic-product-link`,title:`Commerce/Product Link`,id:`atomic-product-link`,render:e=>b(e),decorators:[g,h,p],parameters:{...s,chromatic:{disableSnapshot:!0},actions:{handles:_}},args:v,argTypes:y,play:m},S={},C={name:`With a slot for attributes`,decorators:[()=>i`
        <atomic-product-link>
          <a slot="attributes" target="_blank"></a>
        </atomic-product-link>
      `]},w={name:`With alternative content`,decorators:[()=>i`
        <atomic-product-link>
          <div>
            <img
              src="https://picsum.photos/seed/picsum/350"
              alt="Thumbnail"
              class="thumbnail"
            />
          </div>
        </atomic-product-link>
      `]},T={name:`With an href template`,decorators:[()=>i`
        <atomic-product-link
          href-template="\${clickUri}?source=\${additionalFields.source}"
        ></atomic-product-link>
      `]},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'With a slot for attributes',
  decorators: [() => {
    return html\`
        <atomic-product-link>
          <a slot="attributes" target="_blank"></a>
        </atomic-product-link>
      \`;
  }]
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'With alternative content',
  decorators: [() => {
    return html\`
        <atomic-product-link>
          <div>
            <img
              src="https://picsum.photos/seed/picsum/350"
              alt="Thumbnail"
              class="thumbnail"
            />
          </div>
        </atomic-product-link>
      \`;
  }]
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: 'With an href template',
  decorators: [() => {
    return html\`
        <atomic-product-link
          href-template="\\\${clickUri}?source=\\\${additionalFields.source}"
        ></atomic-product-link>
      \`;
  }]
}`,...T.parameters?.docs?.source}}},E=[`Default`,`WithSlotsAttributes`,`WithAlternativeContent`,`WithHrefTemplate`]}));D();export{S as Default,w as WithAlternativeContent,T as WithHrefTemplate,C as WithSlotsAttributes,E as __namedExportsOrder,x as default,D as t};