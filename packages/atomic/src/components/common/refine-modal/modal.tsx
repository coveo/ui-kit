import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import CloseIcon from '../../../images/close.svg';
import {BaseFacetElement} from '../facets/facet-common';
import {popoverClass} from '../facets/popover/popover-type';
import {isRefineModalFacet} from '../interface/store';
import {Button} from '../stencil-button';

interface RefineModalProps {
  host: HTMLElement;
  i18n: i18n;
  onClose(): void;
  title: string;
  numberOfItems: number;
  isOpen: boolean;
  openButton?: HTMLElement;
  boundary?: 'page' | 'element';
  scope?: HTMLElement;
}

export const RefineModal: FunctionalComponent<RefineModalProps> = (
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
          ariaLabel={props.i18n.t('close')}
        >
          <atomic-icon
            part="close-icon"
            class="h-5 w-5"
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
          class="flex w-full justify-center p-3 text-lg"
          onClick={props.onClose}
        >
          <span part="footer-button-text" class="mr-1 truncate">
            {props.i18n.t('view-results')}
          </span>
          <span part="footer-button-count">
            {props.i18n.t('between-parentheses', {
              text: props.numberOfItems.toLocaleString(props.i18n.language),
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
      boundary={props.boundary}
      scope={props.scope}
    >
      {renderHeader()}
      {...children}
      {renderFooter()}
    </atomic-modal>
  );
};

export function getClonedFacetElements(
  facetElements: HTMLElement[],
  collapseFacetsAfter: number,
  root: HTMLElement
): HTMLDivElement {
  const divSlot = document.createElement('div');
  divSlot.setAttribute('slot', 'facets');
  divSlot.style.display = 'flex';
  divSlot.style.flexDirection = 'column';
  divSlot.style.gap = 'var(--atomic-refine-modal-facet-margin, 20px)';

  const allFacetTags = Array.from(
    new Set(facetElements.map((el) => el.tagName.toLowerCase()))
  );

  const allFacetsInOrderInDOM = allFacetTags.length
    ? root.querySelectorAll(allFacetTags.join(','))
    : [];

  allFacetsInOrderInDOM.forEach((facetElement, index) => {
    const clone = facetElement.cloneNode(true) as BaseFacetElement;
    clone.isCollapsed = index + 1 > collapseFacetsAfter;
    clone.classList.remove(popoverClass);
    clone.setAttribute(isRefineModalFacet, '');
    divSlot.append(clone);
  });

  return divSlot;
}
