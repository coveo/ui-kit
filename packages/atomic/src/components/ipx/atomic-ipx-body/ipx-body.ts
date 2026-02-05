import {
  type CSSResultGroup,
  css,
  html,
  nothing,
  type TemplateResult,
} from 'lit';
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
 * Children for the IPX body component.
 */
export interface IpxBodyChildren {
  /**
   * Header content to render.
   */
  header: TemplateResult | typeof nothing;

  /**
   * Body content to render.
   */
  body: TemplateResult | typeof nothing;

  /**
   * Footer content to render.
   */
  footer?: TemplateResult | typeof nothing;
}

const styles: CSSResultGroup = css`
  [part='container'] {
    position: relative;
    overflow: hidden;
    height: inherit;
    max-height: calc(100vh - 4.25rem);
    border-radius: 0.375rem;
    background-color: var(--atomic-background);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    grid-area: modal;
    box-shadow: rgb(0 0 0 / 50%) 0 0 0.5rem;
  }

  [part='header-wrapper'] {
    background-color: var(--atomic-neutral-light);
    display: grid;
    width: 100%;
    padding: 1.5rem 1.5rem 0 1.5rem;
  }

  [part='header'] {
    font-weight: bold;
    min-width: 0;
  }

  [part='header-ruler'] {
    border: none;
    border-top: 1px solid var(--atomic-neutral);
  }

  [part='body-wrapper'] {
    padding: 1rem 1.5rem 1rem 1.5rem;
  }

  [part='footer-wrapper'] {
    background-color: var(--atomic-neutral-light);
    align-items: stretch;
    padding: 1rem 1.75rem;
  }

  /* Chrome, Edge & Safari */
  .scrollbar::-webkit-scrollbar {
    width: 0.8rem;
  }

  .scrollbar::-webkit-scrollbar-track {
    background: var(--atomic-background);
  }

  .scrollbar::-webkit-scrollbar-thumb {
    background: var(--atomic-primary);
    border: 0.15rem solid var(--atomic-background);
    border-radius: 100vh;
  }

  .scrollbar::-webkit-scrollbar-thumb:hover {
    background: var(--atomic-primary-light);
  }

  /* Firefox */
  .scrollbar {
    scrollbar-color: var(--atomic-primary) var(--atomic-background);
    scrollbar-width: auto;
  }
`;

/**
 * Renders the IPX body component with header, body, and footer sections.
 *
 * The component provides a structured layout for IPX (In-Product Experience) interfaces.
 * It includes slots for header, body, and footer content.
 *
 * **Note:** This is an internal component used by the `atomic-ipx-modal` and
 * `atomic-ipx-embedded` components. Do not use directly.
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
      <style>
        ${styles}
      </style>
      <article
        part="container"
        class=${visibilityClass}
        @animationend=${() => props.onAnimationEnd?.()}
      >
        <header part="header-wrapper" class="flex flex-col items-center">
          <div part="header">
            ${props.header ?? nothing}
          </div>
        </header>
        <hr part="header-ruler" class="border-neutral" />
        <div
          part="body-wrapper"
          class="scrollbar flex w-full grow flex-col overflow-auto"
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
      class="border-neutral bg-background z-10 flex w-full flex-col items-center border-t"
    >
      <div part="footer">
        ${footerContent}
      </div>
    </footer>
  `;
}
