import{n as e}from"./chunk-jRWAZmH_.js";import{r as t}from"./react-FtSvzJ4N.js";import{a as n}from"./chunk-RD3KTAHR-zATRA5tJ.js";import{l as r,p as i}from"./blocks-CvL71tRc.js";import{t as a}from"./mdx-react-shim-DJpA_GAc.js";function o(e){let n={a:`a`,code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,li:`li`,p:`p`,pre:`pre`,ul:`ul`,...t(),...e.components};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(r,{title:`Commerce/Introduction`}),`
`,(0,c.jsx)(n.h1,{id:`atomic-commerce-components`,children:`Atomic Commerce Components`}),`
`,(0,c.jsxs)(n.p,{children:[`This section showcases interactive documentation for the `,(0,c.jsx)(n.a,{href:`https://docs.coveo.com/en/p8bd0068`,rel:`nofollow`,children:`Coveo Atomic for Commerce`}),` web components.`]}),`
`,(0,c.jsx)(n.p,{children:`You can explore the individual Commerce components in the sidebar.
Each component includes:`}),`
`,(0,c.jsxs)(n.ul,{children:[`
`,(0,c.jsx)(n.li,{children:`Interactive examples with configurable properties`}),`
`,(0,c.jsx)(n.li,{children:`Code snippets showing implementation details`}),`
`,(0,c.jsx)(n.li,{children:`Documentation for available attributes and events`}),`
`]}),`
`,(0,c.jsx)(n.p,{children:`You can also find examples of full implementations below:`}),`
`,(0,c.jsxs)(n.ul,{children:[`
`,(0,c.jsx)(n.li,{children:(0,c.jsx)(n.a,{href:`/story/product-listing-page--default`,children:`Product List Page`})}),`
`,(0,c.jsx)(n.li,{children:(0,c.jsx)(n.a,{href:`/story/recommendations--default`,children:`Recommendation Carousel`})}),`
`,(0,c.jsx)(n.li,{children:(0,c.jsx)(n.a,{href:`/story/search-page--default`,children:`Search Page`})}),`
`]}),`
`,(0,c.jsx)(n.h2,{id:`getting-started`,children:`Getting Started`}),`
`,(0,c.jsxs)(n.p,{children:[`These stories provide example usages of the Coveo Atomic web components for Commerce.
Each of the components must be placed correctly within the component hierarchy in order to function.
The top level of the tree must match the interface being initialized by the Headless engine.
For example, most Coveo Commerce interfaces must have `,(0,c.jsx)(n.code,{children:`atomic-commerce-interface`}),` at the top of the component hierarchy.`]}),`
`,(0,c.jsx)(n.h3,{id:`initialization`,children:`Initialization`}),`
`,(0,c.jsxs)(n.p,{children:[`Here is an example of initializing a `,(0,c.jsx)(n.code,{children:`atomic-commerce-interface`}),`.
This example `,(0,c.jsx)(n.code,{children:`getSampleCommerceEngineConfiguration`}),` from `,(0,c.jsx)(n.code,{children:`@coveo/headless/commerce`}),` as its initialization configuration.
This will not work in a production environment.
See `,(0,c.jsx)(n.a,{href:`https://docs.coveo.com/en/o6r70022#initialize-the-headless-commerce-engine`,rel:`nofollow`,children:`Initialize the Headless commerce engine`}),`.`]}),`
`,(0,c.jsxs)(n.p,{children:[`For a detailed breakdown of how to configure a commerce engine, please refer to the Coveo Headless documentation for `,(0,c.jsx)(n.a,{href:`https://docs.coveo.com/en/headless/latest/reference/functions/Commerce.buildCommerceEngine.html`,rel:`nofollow`,children:(0,c.jsx)(n.code,{children:`buildCommerceEngine`})}),`.`]}),`
`,(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:`language-html`,children:`<html>
  <head>
    <title>Example Commerce Interface</title>
        <script
            type="module"
            src="https://static.cloud.coveo.com/atomic/v3/atomic.esm.js">
        <\/script>
        <link
            rel="stylesheet"
            href="https://static.cloud.coveo.com/atomic/v3/themes/coveo.css" />
      <script type="module">
        const { getSampleCommerceEngineConfiguration } = await import('https://static.cloud.coveo.com/headless/v3/commerce/headless.esm.js');

        const siteRoot = 'https://www.example.com/';
        const fallbackResourceUrl = \`\${siteRoot}/search\`;
        const siteConfig = {
          'Example': {href: 'index.html', label: 'Home', resourceUrl: \`\${siteRoot}/search\`},
        };

        const {context, ...restOfConfiguration} = getSampleCommerceEngineConfiguration();

        let viewUrl = siteConfig[document.title]?.resourceUrl;
        if (!viewUrl) {
          console.warn(\`No resource URL found for page title "\${document.title}". Using fallbackResourceUrl.\`);
          viewUrl = fallbackResourceUrl;
        }

        const configuration = {
          context: {
            ...context,
            view: {
              url: viewUrl
            },
          },
          ...restOfConfiguration,
        };

        await customElements.whenDefined('atomic-commerce-interface');
        const commerceInterface = document.querySelector('atomic-commerce-interface');
        await commerceInterface.initialize(configuration);

        commerceInterface.executeFirstRequest();
      <\/script>
  </head>
  <body>
    <atomic-commerce-interface>
      <!-- The rest of your component hierarchy -->
    </atomic-commerce-interface>
  </body>
</html>
`})}),`
`,(0,c.jsx)(n.h3,{id:`initialization-with-an-engine`,children:`Initialization with an engine`}),`
`,(0,c.jsxs)(n.p,{children:[`Here is an example of how to initialize an `,(0,c.jsx)(n.code,{children:`atomic-commerce-interface`}),` with an engine from `,(0,c.jsx)(n.code,{children:`@coveo/headless`}),` .
The primary difference in the use cases between a standard initialization and using an engine is that an engine allows for a single instance to be shared across multiple interfaces.
This eliminates boilerplate when initializing the engine across multiple pages, and it will ensure that all pages have access to the same resources on the engine.`]}),`
`,(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:`language-javascript`,children:`// engine.mjs
const {
  buildCommerceEngine, 
  getSampleCommerceEngineConfiguration
} = await import('https://static.cloud.coveo.com/headless/v3/commerce/headless.esm.js');

const siteRoot = 'https://www.example.com/';
const fallbackResourceUrl = \`\${siteRoot}/search\`;
const siteConfig = {
  'Example': {href: 'index.html', label: 'Home', resourceUrl: \`\${siteRoot}/search\`},
};

const {context, ...restOfConfiguration} = getSampleCommerceEngineConfiguration();

let viewUrl = siteConfig[document.title]?.resourceUrl;
if (!viewUrl) {
  console.warn(\`No resource URL found for page title "\${document.title}". Using fallbackResourceUrl.\`);
  viewUrl = fallbackResourceUrl;
}

export const commerceEngine = buildCommerceEngine({
  configuration: {
    context: {
      ...context,
      view: {
        url: viewUrl
      },
    },
    ...restOfConfiguration,
  },
});
`})}),`
`,(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:`language-html`,children:`<!-- index.html -->
<html>
  <head>
    <title>Example Commerce Interface</title>
        <script
            type="module"
            src="https://static.cloud.coveo.com/atomic/v3/atomic.esm.js">
        <\/script>
        <link
            rel="stylesheet"
            href="https://static.cloud.coveo.com/atomic/v3/themes/coveo.css" />
      <script type="module">
        import {commerceEngine} from './engine.mjs';

        await customElements.whenDefined('atomic-commerce-interface');
        const commerceInterface = document.querySelector('atomic-commerce-interface');
        await commerceInterface.initializeWithEngine(commerceEngine);

        commerceInterface.executeFirstRequest();
      <\/script>
  </head>
  <body>
    <atomic-commerce-interface>
      <!-- The rest of your component hierarchy -->
    </atomic-commerce-interface>
  </body>
</html>
`})}),`
`,(0,c.jsx)(n.h2,{id:`advanced-examples`,children:`Advanced Examples`}),`
`,(0,c.jsx)(n.p,{children:`If you are looking to implement Coveo Atomic for Commerce in a framework, you can find reference code in our GitHub repo:`}),`
`,(0,c.jsxs)(n.ul,{children:[`
`,(0,c.jsx)(n.li,{children:(0,c.jsx)(n.a,{href:`https://github.com/coveo/ui-kit/tree/main/samples/atomic/search-commerce-angular`,rel:`nofollow`,children:`Angular - Commerce Search`})}),`
`,(0,c.jsx)(n.li,{children:(0,c.jsx)(n.a,{href:`https://github.com/coveo/ui-kit/tree/main/samples/atomic/search-commerce-react`,rel:`nofollow`,children:`React - Commerce Search`})}),`
`]}),`
`,(0,c.jsxs)(n.p,{children:[`The Atomic library also provides more in-depth examples in the `,(0,c.jsx)(n.a,{href:`https://github.com/coveo/ui-kit/tree/main/packages/atomic/dev/examples/commerce-website`,rel:`nofollow`,children:`GitHub repo`}),` without using a framework which you can review.`]})]})}function s(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,c.jsx)(n,{...e,children:(0,c.jsx)(o,{...e})}):o(e)}var c;e((()=>{c=n(),a(),i()}))();export{s as default};