import {html, nothing, type TemplateResult} from 'lit';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

/**
 * Props for the IPX body component.
 */
export interface IpxBodyProps {
  /**
   * The visibility mode of the component.
   * - 'open': Modal is visible
   * - 'closed': Modal is hidden
   * - 'embedded': Always visible, no modal behavior
   */
  visibility?: 'open' | 'closed' | 'embedded';

  /**
   * Whether to display the footer slot.
   */
  displayFooterSlot?: boolean;

  /**
   * Callback fired when the container animation ends.
   */
  onAnimationEnd?: () => void;

  /**
   * Header content to render.
   */
  header?: TemplateResult | typeof nothing;

  /**
   * Body content to render.
   */
  body?: TemplateResult | typeof nothing;

  /**
   * Footer content to render.
   */
  footer?: TemplateResult | typeof nothing;
}

/**
 * Renders the IPX body component with header, body, and footer sections.
 *
 * The component provides a structured layout for IPX (In-Product Experience) interfaces.
 * It includes slots for header, body, and footer content.
 *
 * **Note:** This is an internal component used by the `atomic-ipx-modal` and
 * `atomic-ipx-embedded` components. Do not use directly. Parent components must
 * include the `ipxBodyStyles` in their static styles for scrollbar styling.
 *
 * @part container - The main container element
 * @part header-wrapper - The wrapper around the header section
 * @part header - The header content container
 * @part header-ruler - The horizontal rule separating header and body
 * @part body-wrapper - The wrapper around the body section (scrollable)
 * @part body - The body content container
 * @part footer-wrapper - The wrapper around the footer section
 * @part footer - The footer content container
 *
 * @example
 * ```typescript
 * const headerContent = html`<h1>Title</h1>`;
 * const bodyContent = html`<p>Content</p>`;
 * const footerContent = html`<button>Close</button>`;
 *
 * renderIpxBody({props: {
 *   visibility: 'open',
 *   displayFooterSlot: true,
 *   header: headerContent,
 *   body: bodyContent,
 *   footer: footerContent
 * }});
 * ```
 */
export const renderIpxBody: FunctionalComponent<IpxBodyProps> = ({props}) => {
  const visibilityClass =
    props.visibility === 'embedded'
      ? ''
      : props.visibility === 'open'
        ? 'visible'
        : 'invisible';

  return html`
    <article
      part="container"
      class="ipx-body-container bg-background box-border flex flex-col justify-between overflow-hidden rounded ${visibilityClass}"
      @animationend=${() => props.onAnimationEnd?.()}
    >
      <header
        part="header-wrapper"
        class="bg-neutral-light grid w-full items-center px-6 pt-6"
      >
        <div part="header" class="min-w-0 font-bold">
          ${props.header ?? nothing}
        </div>
      </header>
      <hr part="header-ruler" class="border-neutral border-0 border-t" />
      <div
        part="body-wrapper"
        class="ipx-body-scrollbar flex w-full grow flex-col overflow-auto px-6 py-4"
        tabindex="0"
        role="region"
        aria-label="Content area"
      >
        <div part="body" class="w-full">
          ${props.body ?? nothing}
        </div>
      </div>
      ${props.displayFooterSlot !== false ? renderFooter(props.footer ?? nothing) : nothing}
    </article>
  `;
};

function renderFooter(footerContent: TemplateResult | typeof nothing) {
  return html`
    <footer
      part="footer-wrapper"
      class="border-neutral bg-neutral-light z-10 flex w-full flex-col items-stretch border-t px-7 py-4"
    >
      <div part="footer">
        ${footerContent}
      </div>
    </footer>
  `;
}
