import {Decorator} from '@storybook/web-components';
import {html} from 'lit-html';

export const wrapInCommerceProductList = (): {
  decorator: Decorator;
} => ({
  decorator: (story) => html`
    <atomic-commerce-product-list
      id="code-root"
      number-of-placeholders="24"
      display="list"
      density="compact"
      image-size="small"
    >
      ${story()}
    </atomic-commerce-product-list>
  `,
});

// export const wrapInCommerceProductList = ({
//   engineConfig,
//   skipFirstSearch,
// }: {
//   engineConfig?: Partial<CommerceEngineConfiguration>;
//   skipFirstSearch?: boolean;
//   productListAttributes?: string;
// }): {
//   decorator: Decorator;
//   play: (context: StoryContext) => Promise<void>;
// } => {
//   const {play} = wrapInCommerceInterface({
//     engineConfig,
//     skipFirstSearch,
//   });

//   const decorator: Decorator = (story) => {
//     // lit-html does not support adding expressions to `template` tags
//     // https://lit.dev/docs/templates/expressions/#invalid-locations

//     const templateTag = document.createElement('template');
//     templateTag.innerHTML = `${(story() as TemplateResult).strings.join('')}`;
//     templateTag.id = 'code-root';
//     return html`
//       <atomic-commerce-interface data-testid="root-interface">
//         <atomic-layout-section section="products">
//           <atomic-commerce-product-list
//             display="list"
//             density="compact"
//             image-size="small"
//           >
//             <atomic-product-template>${templateTag}</atomic-product-template>
//           </atomic-commerce-product-list>
//         </atomic-layout-section>
//       </atomic-commerce-interface>
//     `;
//   };
//   return {
//     decorator,
//     play,
//   };
// };
