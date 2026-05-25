import{n as e}from"./chunk-jRWAZmH_.js";import{St as t,Tt as n,wt as r}from"./iframe-cSkD6HDI.js";import{r as i,t as a}from"./search-interface-wrapper-DyJSRxFL.js";import{n as o,t as s}from"./result-list-wrapper-DszKxGnf.js";var c,l=e((()=>{t(),c=()=>({decorator:e=>{let t=document.createElement(`template`),i=document.createElement(`div`),a=e(),o=``;a&&typeof a==`object`&&`_$litType$`in a?(r(a,i),o=i.innerHTML):o=String(a);let s=o.match(/<(atomic-result-section-[\w-]+)/),c=s?s[1]:null,l=o.match(/default-slot="([^"]*)"/s),u=l?l[1]:``,d=document.createElement(`div`);d.innerHTML=u;let f=d.textContent||``,p=[{tag:`atomic-result-section-title`,content:`<h3 class="text-lg font-semibold text-gray-900">Palm cockatoo: Why a unique ‘drumming’ bird is in peril - BBC News</h3>`},{tag:`atomic-result-section-children`,content:`<div class="p-3 mt-2 ml-4 border border-gray-200 rounded-lg bg-gray-50">
        <div class="mb-2 text-sm font-medium text-gray-700">Related Articles:</div>
        <div class="space-y-1">
          <div class="text-sm text-gray-600">• How to train for a marathon</div>
          <div class="text-sm text-gray-600">• Running 101</div>
        </div>
      </div>`},{tag:`atomic-result-section-visual`,content:`<img src="https://picsum.photos/seed/picsum/200" alt="Result Image" class="w-full h-auto rounded-lg">`},{tag:`atomic-result-section-title-metadata`,content:`<span class="text-sm text-gray-500">fileType:
txt</span>`},{tag:`atomic-result-section-emphasized`,content:`<span class="text-2xl font-bold">Breaking News!</span>`},{tag:`atomic-result-section-excerpt`,content:`<p class="text-sm text-gray-600">The palm cockatoo is thought to be the only bird species to use tools musically – drumming wood to attract a mate.</p>`},{tag:`atomic-result-section-actions`,content:`<button class="p-1 btn btn-primary">Show Details</button>`},{tag:`atomic-result-section-badges`,content:`<div>
        <span class="badge badge-primary" style="background: #0F0F0F; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">NEW</span>
        <span class="badge badge-secondary" style="background: #0F0F0F; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">DOCUMENTATION</span>
        <span class="badge badge-success" style="background: #0F0F0F; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">ARTICLE</span>
      </div>`},{tag:`atomic-result-section-bottom-metadata`,content:`<div class="text-xs text-gray-500">
        <span>Author: Mark Twain</span>
      </div>`}],m=``;return p.forEach(e=>{e.tag===c?m+=`<${e.tag} style="border: 2px dashed mediumpurple; border-radius: 8px; padding: 8px; box-sizing: content-box;">${f}</${e.tag}>`:m+=`<${e.tag}>${e.content}</${e.tag}>`}),t.innerHTML=m,n`
      <atomic-result-template>${t}</atomic-result-template>
    `}})})),u,d,f,p,m,h=e((()=>{t(),s(),a(),l(),u=e=>{let{decorator:t}=o(e,!1,e===`list`?`max-width: 100%; width: 768px;`:void 0);return t},d=()=>(e,t)=>n`
      <style>
        ${(t.args.layout||`list`)===`grid`?`atomic-result-list::part(result-list) {
            grid-template-columns: 1fr;
            width: 24em;
          }`:``}
      </style>
      ${e()}
    `,f=(e={})=>{let{includeCodeRoot:t=!1,config:n,skipFirstSearch:r}=e,{decorator:a}=c(),{decorator:o}=i({config:n,skipFirstSearch:r,includeCodeRoot:t});return[a,(e,t)=>u(t.args.layout||`list`)(e,t),o,d()]},p=()=>({layout:{control:`radio`,options:[`list`,`grid`],description:`The display layout for the list`,table:{category:`Story`}}}),m=()=>({layout:`list`})}));export{h as i,m as n,f as r,p as t};