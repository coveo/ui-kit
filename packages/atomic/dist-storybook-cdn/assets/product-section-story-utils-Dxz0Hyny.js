import{n as e}from"./chunk-jRWAZmH_.js";import{St as t,Tt as n,wt as r}from"./iframe-cSkD6HDI.js";import{i,r as a}from"./commerce-interface-wrapper-BFOjNQs_.js";import{n as o,t as s}from"./commerce-product-list-wrapper-CNTwHksc.js";var c,l=e((()=>{t(),c=()=>({decorator:e=>{let t=document.createElement(`template`),i=document.createElement(`div`),a=e(),o=``;a&&typeof a==`object`&&`_$litType$`in a?(r(a,i),o=i.innerHTML):o=String(a);let s=o.match(/<(atomic-product-section-[\w-]+)/),c=s?s[1]:null,l=o.match(/default-slot="([^"]*)"/s),u=l?l[1]:``,d=document.createElement(`div`);d.innerHTML=u;let f=d.textContent||``,p=[{tag:`atomic-product-section-name`,content:`<h3 class="text-lg font-semibold text-gray-900">Sony WH-1000XM4 Wireless Headphones</h3>`},{tag:`atomic-product-section-children`,content:`
      <div class="border border-gray-200 rounded-lg p-3 bg-gray-50 mt-2 ml-4">
        <div class="text-sm font-medium text-gray-700 mb-2">Related Products:</div>
        <div class="space-y-1">
          <div class="text-sm text-gray-600">• Wireless Charging Case - $79.99</div>
          <div class="text-sm text-gray-600">• Premium Foam Tips - $29.99</div>
        </div>
      </div>
    `},{tag:`atomic-product-section-visual`,content:`<img src="https://images.barca.group/Sports/mj/Clothing/Pants/67_Men_Gray_Elastane/cb1a7d3c9ac3_bottom_left.webp" alt="Product Image" class="w-full h-auto rounded-lg">`},{tag:`atomic-product-section-metadata`,content:`<span class="text-sm text-gray-500">SKU: WH-1000XM4</span>`},{tag:`atomic-product-section-emphasized`,content:`<span class="text-2xl font-bold text-green-600">$299.99</span>`},{tag:`atomic-product-section-description`,content:`<p class="text-sm text-gray-600">Premium wireless headphones with industry-leading noise cancellation and superior sound quality.</p>`},{tag:`atomic-product-section-actions`,content:`<button class="p-1 btn btn-primary">Add to Cart</button>`},{tag:`atomic-product-section-badges`,content:`
      <div>
        <span class="badge badge-primary" style="background: #0F0F0F; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">NEW</span>
        <span class="badge badge-secondary" style="background: #0F0F0F; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">SALE</span>
        <span class="badge badge-success" style="background: #0F0F0F; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">BESTSELLER</span>
      </div>
    `},{tag:`atomic-product-section-bottom-metadata`,content:`<div class="text-xs text-gray-500">
        <span>Free shipping • 2-day delivery</span>
      </div>
    `}],m=``;return p.forEach(e=>{e.tag===c?m+=`<${e.tag} style="border: 2px dashed mediumpurple; border-radius: 8px; padding: 8px; box-sizing: content-box;">${f}</${e.tag}>`:m+=`<${e.tag}>${e.content}</${e.tag}>`}),t.innerHTML=m,n`
      <atomic-product-template>${t}</atomic-product-template>
    `}})})),u,d,f,p,m,h=e((()=>{t(),s(),a(),l(),u=e=>{let{decorator:t}=o(e,!1,e===`list`?`max-width: 100%; width: 768px;`:void 0);return t},d=()=>(e,t)=>n`
      <style>
        ${(t.args.layout||`list`)===`grid`?`atomic-commerce-product-list::part(result-list) {
            grid-template-columns: 1fr;
            width: 24em;
          }`:``}
      </style>
      ${e()}
    `,f=(e={})=>{let{includeCodeRoot:t=!1,engineConfig:n}=e,{decorator:r}=c(),{decorator:a}=i({engineConfig:n||{preprocessRequest:e=>{let t=JSON.parse(e.body);return t.perPage=1,e.body=JSON.stringify(t),e}},includeCodeRoot:t});return[r,(e,t)=>u(t.args.layout||`list`)(e,t),a,d()]},p=()=>({layout:{control:`radio`,options:[`list`,`grid`],description:`The display layout for the list`,table:{category:`Story`}}}),m=()=>({layout:`grid`})}));export{h as i,m as n,f as r,p as t};