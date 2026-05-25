import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";function o(e){let n={a:`a`,code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,li:`li`,p:`p`,pre:`pre`,ul:`ul`,...t(),...e.components};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(r,{title:`Search/Introduction`}),`
`,(0,c.jsx)(n.h1,{id:`atomic-search-components`,children:`Atomic Search Components`}),`
`,(0,c.jsxs)(n.p,{children:[`This section showcases interactive documentation for the `,(0,c.jsx)(n.a,{href:`https://docs.coveo.com/en/atomic/latest/`,rel:`nofollow`,children:`Coveo Atomic Search`}),` web components.`]}),`
`,(0,c.jsx)(n.p,{children:`You can explore the individual Search components in the sidebar.
Each component includes:`}),`
`,(0,c.jsxs)(n.ul,{children:[`
`,(0,c.jsx)(n.li,{children:`Interactive examples with configurable properties`}),`
`,(0,c.jsx)(n.li,{children:`Code snippets showing implementation details`}),`
`,(0,c.jsx)(n.li,{children:`Documentation for available attributes and events`}),`
`]}),`
`,(0,c.jsx)(n.h2,{id:`getting-started`,children:`Getting Started`}),`
`,(0,c.jsxs)(n.p,{children:[`These stories provide example usages of the Coveo Atomic web components for Search.
Each of the components must be placed correctly within the component hierarchy in order to function.
The top level of the tree must match the interface being initialized by the Headless engine.
For example, Coveo Search pages must start have `,(0,c.jsx)(n.code,{children:`atomic-search-interface`}),` at the top of the component hierarchy.`]}),`
`,(0,c.jsx)(n.h3,{id:`initialization`,children:`Initialization`}),`
`,(0,c.jsxs)(n.p,{children:[`Here is an example of how to initialize an `,(0,c.jsx)(n.code,{children:`atomic-search-interface`}),`.
This uses `,(0,c.jsx)(n.code,{children:`getSampleSearchEngineConfiguration`}),` from `,(0,c.jsx)(n.code,{children:`@coveo/headless`}),` as its initialization configuration.
This will not work in a production environment.`]}),`
`,(0,c.jsxs)(n.p,{children:[`For a detailed breakdown of how to configure a Search engine, please refer to the Coveo Headless documentation for `,(0,c.jsx)(n.a,{href:`https://docs.coveo.com/en/headless/latest/reference/functions/Search.buildSearchEngine.html`,rel:`nofollow`,children:(0,c.jsx)(n.code,{children:`buildSearchEngine`})}),`.`]}),`
`,(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:`language-html`,children:`<html>
  <head>
    <title>Example Search Page</title>
      <script
          type="module"
          src="https://static.cloud.coveo.com/atomic/v3/atomic.esm.js">
      <\/script>
      <link
          rel="stylesheet"
          href="https://static.cloud.coveo.com/atomic/v3/themes/coveo.css"/>
      <script type="module">
        const {
          getSampleSearchEngineConfiguration
        } = await import('https://static.cloud.coveo.com/headless/v3/headless.esm.js');

        await customElements.whenDefined('atomic-search-interface');
        const searchInterface = document.querySelector('atomic-search-interface');
        await searchInterface.initialize(getSampleSearchEngineConfiguration());
        searchInterface.executeFirstSearch();
      <\/script>
  </head>
  <body>
    <atomic-search-interface>
      <!-- The rest of your component hierarchy -->
    </atomic-search-interface>
  </body>
</html>
`})}),`
`,(0,c.jsx)(n.h3,{id:`initialization-with-an-engine`,children:`Initialization with an engine`}),`
`,(0,c.jsxs)(n.p,{children:[`Here is an example of how to initialize an `,(0,c.jsx)(n.code,{children:`atomic-search-interface`}),` with an engine from `,(0,c.jsx)(n.code,{children:`@coveo/headless`}),`.
The primary difference in the use cases between a standard Initialization and using an engine is that an engine allows for a single instance to be shared across multiple interfaces.`]}),`
`,(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:`language-javascript`,children:`// engine.mjs
const {
  buildSearchEngine, 
  getSampleSearchEngineConfiguration
} = await import('http://static.cloud.coveo.com/headless/v3/headless.esm.js');


export const searchEngine = buildSearchEngine({
  configuration: getSampleSearchEngineConfiguration(),
});
`})}),`
`,(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:`language-html`,children:`<!-- index.html -->
<html>
  <head>
    <title>Example Search Page</title>
      <script
          type="module"
          src="https://static.cloud.coveo.com/atomic/v3/atomic.esm.js">
      <\/script>
      <link
          rel="stylesheet"
          href="https://static.cloud.coveo.com/atomic/v3/themes/coveo.css"/>
      <script type="module">
        import {searchEngine} from './engine.mjs';

        await customElements.whenDefined('atomic-search-interface');
        const searchInterface = document.querySelector('atomic-search-interface');
        await searchInterface.initializeWithSearchEngine(searchEngine);
        searchInterface.executeFirstSearch();
      <\/script>
  </head>
  <body>
    <atomic-search-interface>
      <!-- The rest of your component hierarchy -->
    </atomic-search-interface>
  </body>
</html>
`})}),`
`,(0,c.jsx)(n.h2,{id:`advanced-examples`,children:`Advanced Examples`}),`
`,(0,c.jsx)(n.p,{children:`If you are looking to implement Coveo in a framework, you can find reference code in our GitHub repo:`}),`
`,(0,c.jsxs)(n.ul,{children:[`
`,(0,c.jsx)(n.li,{children:(0,c.jsx)(n.a,{href:`https://github.com/coveo/ui-kit/tree/main/samples/atomic/search-nextjs`,rel:`nofollow`,children:`NextJS - Search`})}),`
`,(0,c.jsx)(n.li,{children:(0,c.jsx)(n.a,{href:`https://github.com/coveo/ui-kit/tree/main/samples/atomic/search-vuejs`,rel:`nofollow`,children:`Vue - Search`})}),`
`]})]})}function s(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,c.jsx)(n,{...e,children:(0,c.jsx)(o,{...e})}):o(e)}var c;e((()=>{c=n(),a(),i()}))();export{s as default};