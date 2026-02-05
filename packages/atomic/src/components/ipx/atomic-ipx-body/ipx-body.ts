import {html, nothing, type TemplateResult} from 'lit';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

export interface IpxBodyProps {
  visibility?: 'open' | 'closed' | 'embedded';
  displayFooterSlot?: boolean;
  onAnimationEnd?: () => void;
  header?: TemplateResult | typeof nothing;
  body?: TemplateResult | typeof nothing;
  footer?: TemplateResult | typeof nothing;
}

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
