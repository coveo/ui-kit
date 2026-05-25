import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";function o(e){let n={a:`a`,code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,li:`li`,p:`p`,pre:`pre`,ul:`ul`,...t(),...e.components};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(r,{title:`Recommendations/Introduction`}),`
`,(0,c.jsx)(n.h1,{id:`atomic-recommendation-components`,children:`Atomic Recommendation Components`}),`
`,(0,c.jsx)(n.p,{children:`You can explore the individual Content Recommendation components in the sidebar.
Each component includes:`}),`
`,(0,c.jsxs)(n.ul,{children:[`
`,(0,c.jsx)(n.li,{children:`Interactive examples with configurable properties`}),`
`,(0,c.jsx)(n.li,{children:`Code snippets showing implementation details`}),`
`,(0,c.jsx)(n.li,{children:`Documentation for available attributes and events`}),`
`]}),`
`,(0,c.jsx)(n.p,{children:`You can also find an example of a full implementation below:`}),`
`,(0,c.jsxs)(n.ul,{children:[`
`,(0,c.jsx)(n.li,{children:(0,c.jsx)(n.a,{href:`/story/atomic-recs-interface--with-recs-list`,children:`With Recs List`})}),`
`]}),`
`,(0,c.jsx)(n.h2,{id:`getting-started`,children:`Getting Started`}),`
`,(0,c.jsxs)(n.p,{children:[`These stories provide example usages of the Coveo Atomic web components for Recommendations.
Each of the components must be placed correctly within the component hierarchy in order to function.
The top level of the tree must match the interface being initialized by the Headless engine.
For example, most Coveo Recommendation interfaces must start have `,(0,c.jsx)(n.code,{children:`atomic-recs-interface`}),` at the top of the component hierarchy.`]}),`
`,(0,c.jsx)(n.h3,{id:`initialization`,children:`Initialization`}),`
`,(0,c.jsxs)(n.p,{children:[`Here is an example of how to initialize an `,(0,c.jsx)(n.code,{children:`atomic-recs-interface`}),`.
This uses `,(0,c.jsx)(n.code,{children:`getSampleRecommendationEngineConfiguration`}),` from `,(0,c.jsx)(n.code,{children:`@coveo/headless`}),` as its initialization configuration.
This will not work in a production environment.`]}),`
`,(0,c.jsxs)(n.p,{children:[`For a detailed breakdown of how to configure a recommendation engine, please refer to the Coveo Headless documentation for `,(0,c.jsx)(n.a,{href:`https://docs.coveo.com/en/headless/latest/reference/functions/Recommendation.buildRecommendationEngine.html`,rel:`nofollow`,children:(0,c.jsx)(n.code,{children:`buildRecommendationEngine`})}),`.`]}),`
`,(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:`language-html`,children:`<html>
  <head>
    <title>Example Recommendations</title>
      <script
          type="module"
          src="https://static.cloud.coveo.com/atomic/v3/atomic.esm.js">
      <\/script>
      <link
          rel="stylesheet"
          href="https://static.cloud.coveo.com/atomic/v3/themes/coveo.css" />

    <script type="module">
      const {
        getSampleRecommendationEngineConfiguration,
      } = await import('https://static.cloud.coveo.com/headless/v3/recommendation/headless.esm.js');

      await customElements.whenDefined('atomic-recs-interface');
      const recommendationInterface = document.querySelector('atomic-recs-interface');
      await recommendationInterface.initialize(getSampleRecommendationEngineConfiguration());
      recommendationInterface.getRecommendations();
    <\/script>
  </head>
  <body>
    <atomic-recs-interface>
      <!-- The rest of your component hierarchy -->
    </atomic-recs-interface>
  </body>
`})}),`
`,(0,c.jsx)(n.h3,{id:`initialization-with-an-engine`,children:`Initialization with an engine`}),`
`,(0,c.jsxs)(n.p,{children:[`Here is an example of how to initialize an `,(0,c.jsx)(n.code,{children:`atomic-recs-interface`}),` with an engine from `,(0,c.jsx)(n.code,{children:`@coveo/headless/recommendation`}),` .
The primary difference in the use cases between a standard initialization and using an engine is that an engine allows for a single instance to be shared across multiple interfaces.`]}),`
`,(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:`language-javascript`,children:`// engine.mjs
const {
  buildRecommendationEngine, 
  getSampleRecommendationEngineConfiguration,
} = await import('https://static.cloud.coveo.com/headless/v3/recommendation/headless.esm.js');

export const recommendationEngine = buildRecommendationEngine({
  configuration: getSampleRecommendationEngineConfiguration(),
});
`})}),`
`,(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:`language-html`,children:`<!-- index.html -->
<html>
  <head>
    <title>Example Recommendations</title>
      <script
          type="module"
          src="https://static.cloud.coveo.com/atomic/v3/atomic.esm.js">
      <\/script>
      <link
          rel="stylesheet"
          href="https://static.cloud.coveo.com/atomic/v3/themes/coveo.css" />

    <script type="module">
      import {recommendationEngine} from './engine.mjs';

      await customElements.whenDefined('atomic-recs-interface');
      const recommendationInterface = document.querySelector('atomic-recs-interface');
      await recommendationInterface.initializeWithRecommendationEngine(recommendationEngine);

      recommendationInterface.getRecommendations();
    <\/script>
  </head>
  <body>
    <atomic-recs-interface>
      <!-- The rest of your component hierarchy -->
    </atomic-recs-interface>
  </body>
</html>
`})})]})}function s(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,c.jsx)(n,{...e,children:(0,c.jsx)(o,{...e})}):o(e)}var c;e((()=>{c=n(),a(),i()}))();export{s as default};