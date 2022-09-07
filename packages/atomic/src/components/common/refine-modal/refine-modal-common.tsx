import {FunctionalComponent, h} from '@stencil/core';
import CloseIcon from 'coveo-styleguide/resources/icons/svg/close.svg';
import {Button} from '../button';
import {BaseFacetElement} from '../facets/facet-common';
import {AnyBindings} from '../interface/bindings';
import {FacetManager} from '../types';
import {popoverClass} from '../../search/facets/atomic-popover/popover-type';

interface RefineModalCommonProps {
  host: HTMLElement;
  bindings: AnyBindings;
  onClose(): void;
  title: string;
  querySummaryState: {
    total: number;
  };
  isOpen: boolean;
  openButton?: HTMLElement;
}

export const RefineModalCommon: FunctionalComponent<RefineModalCommonProps> = (
  props,
  children
) => {
  const exportparts =
    'container,header,header-wrapper,header-ruler,body,body-wrapper,footer,footer-wrapper,footer-wrapper';

  const flushFacetElements = () => {
    props.host.querySelector('div[slot="facets"]')?.remove();
  };

  const renderHeader = () => {
    return (
      <div slot="header" class="contents">
        <h1 part="title" class="truncate">
          {props.title}
        </h1>
        <Button
          style="text-transparent"
          class="grid place-items-center"
          part="close-button"
          onClick={props.onClose}
          ariaLabel={props.bindings.i18n.t('close')}
        >
          <atomic-icon
            part="close-icon"
            class="w-5 h-5"
            icon={CloseIcon}
          ></atomic-icon>
        </Button>
      </div>
    );
  };

  const renderFooter = () => {
    return (
      <div part="footer-content" slot="footer">
        <Button
          style="primary"
          part="footer-button"
          class="w-full p-3 flex text-lg justify-center"
          onClick={props.onClose}
        >
          <span part="footer-button-text" class="truncate mr-1">
            {props.bindings.i18n.t('view-results')}
          </span>
          <span part="footer-button-count">
            {props.bindings.i18n.t('between-parentheses', {
              text: props.querySummaryState.total.toLocaleString(
                props.bindings.i18n.language
              ),
            })}
          </span>
        </Button>
      </div>
    );
  };

  return (
    <atomic-modal
      fullscreen
      isOpen={props.isOpen}
      source={props.openButton}
      container={props.host}
      close={props.onClose}
      onAnimationEnded={() => {
        if (!props.isOpen) {
          flushFacetElements();
        }
      }}
      exportparts={exportparts}
    >
      {renderHeader()}
      {...children}
      {renderFooter()}
    </atomic-modal>
  );
};

export function getClonedFacetElements(
  facetElements: HTMLElement[],
  facetManager: FacetManager
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
    clone.classList.remove(popoverClass);
    divSlot.append(clone);
  });

  return divSlot;
}
