import {h, VNode} from '@stencil/core';
import CloseIcon from 'coveo-styleguide/resources/icons/svg/close.svg';
import {FacetManager, QuerySummary} from '@coveo/headless';
import {InsightFacetManager, InsightQuerySummary} from '../../insight';
import {Button} from '../button';
import {BaseFacetElement} from '../facets/facet-common';
import {AnyBindings} from '../interface/bindings';

interface RefineModalCommonRenderProps {
  isOpen: boolean;
  openButton?: HTMLElement;
}

interface RefineModalCommonOptions {
  host: HTMLElement;
  bindings: AnyBindings;
  initializeQuerySummary(): QuerySummary | InsightQuerySummary;
  onClose(): void;
}

export class RefineModalCommon {
  private host: HTMLElement;
  private bindings: AnyBindings;
  private querySummary: QuerySummary | InsightQuerySummary;
  private onClose: () => void;

  public exportparts =
    'container,header,header-wrapper,header-ruler,body,body-wrapper,footer,footer-wrapper,footer-wrapper';

  constructor(props: RefineModalCommonOptions) {
    this.host = props.host;
    this.bindings = props.bindings;
    this.querySummary = props.initializeQuerySummary();
    this.onClose = props.onClose;
  }

  public showModal() {
    this.host.style.display = '';
  }

  public flushFacetElements() {
    this.host.querySelector('div[slot="facets"]')?.remove();
  }

  public renderHeader() {
    return (
      <div slot="header" class="contents">
        <h1 class="truncate">{this.bindings.i18n.t('sort-and-filter')}</h1>
        <Button
          style="text-transparent"
          class="grid place-items-center"
          part="close-button"
          onClick={this.onClose}
          ariaLabel={this.bindings.i18n.t('close')}
        >
          <atomic-icon class="w-5 h-5" icon={CloseIcon}></atomic-icon>
        </Button>
      </div>
    );
  }

  public renderFooter() {
    return (
      <div slot="footer">
        <Button
          style="primary"
          part="footer-button"
          class="w-full p-3 flex text-lg justify-center"
          onClick={this.onClose}
        >
          <span class="truncate mr-1">
            {this.bindings.i18n.t('view-results')}
          </span>
          <span>
            {this.bindings.i18n.t('between-parentheses', {
              text: this.querySummary.state.total.toLocaleString(
                this.bindings.i18n.language
              ),
            })}
          </span>
        </Button>
      </div>
    );
  }

  public render(
    children: VNode,
    {isOpen, openButton}: RefineModalCommonRenderProps
  ) {
    return (
      <atomic-modal
        fullscreen
        isOpen={isOpen}
        source={openButton}
        container={this.host}
        close={this.onClose}
        onAnimationEnded={() => {
          if (!isOpen) {
            this.flushFacetElements();
          }
        }}
        exportparts="container,header,header-wrapper,header-ruler,body,body-wrapper,footer,footer-wrapper,footer-wrapper"
      >
        {this.renderHeader()}
        {children}
        {this.renderFooter()}
      </atomic-modal>
    );
  }
}

export function getClonedFacetElements(
  facetElements: HTMLElement[],
  facetManager: FacetManager | InsightFacetManager
): HTMLDivElement {
  const divSlot = document.createElement('div');
  divSlot.setAttribute('slot', 'facets');
  divSlot.style.display = 'flex';
  divSlot.style.flexDirection = 'column';
  divSlot.style.gap = 'var(--atomic-refine-modal-facet-margin, 20px)';

  const facetElementsPayload = facetElements.map((f) => ({
    facetId: f.getAttribute('facet-id')!,
    payload: f,
  }));
  const sortedFacetsElements = facetManager
    .sort(facetElementsPayload)
    .map((f) => f.payload);

  sortedFacetsElements.forEach((facetElement) => {
    const clone = facetElement.cloneNode(true) as BaseFacetElement;
    clone.isCollapsed = true;
    divSlot.append(clone);
  });

  return divSlot;
}
