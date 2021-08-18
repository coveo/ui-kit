import {FunctionalComponent, h} from '@stencil/core';

import CloseIcon from 'coveo-styleguide/resources/icons/svg/close.svg';
import {I18nState} from '../../../utils/initialization-utils';

export interface BaseFacetState {
  isExpanded: boolean;
  strings: I18nState;
}

export class BaseFacetController {
  constructor(public state: BaseFacetState) {}

  public openModal() {
    this.state.isExpanded = true;
    document.body.classList.add('overflow-hidden');
  }

  public closeModal() {
    this.state.isExpanded = false;
    document.body.classList.remove('overflow-hidden');
  }
}

type BaseFacetProps = {
  controller: BaseFacetController;
  clearAll?: VoidFunction;
  label: string;
  hasActiveValues: boolean;
};

export const BaseFacet: FunctionalComponent<BaseFacetProps> = (
  props: BaseFacetProps,
  children
) => {
  const closeButton = props.controller.state.isExpanded ? (
    <button
      part="close-button"
      onClick={() => props.controller.closeModal()}
      class="ml-2 lg:hidden"
    >
      <atomic-icon
        class="h-5 w-5 text-on-background"
        icon={CloseIcon}
      ></atomic-icon>
    </button>
  ) : null;

  const clearButton =
    props.clearAll && props.hasActiveValues ? (
      <button
        part="clear-button"
        onClick={() => props.clearAll!()}
        class="block text-primary mr-2 lg:mr-0"
      >
        {props.controller.state.strings.clear()}
      </button>
    ) : null;

  const modalButton = (
    <button
      title={props.label}
      part="modal-button"
      class={`rounded-lg text-left border-solid bg-background px-4 h-9 outline-none no-outline lg:hidden cursor-pointer truncate w-full ${
        props.hasActiveValues
          ? 'border-2 border-primary text-primary'
          : 'border border-neutral text-on-background'
      }`}
      onClick={() => props.controller.openModal()}
    >
      {props.label}
    </button>
  );

  const facetWrapperDesktop =
    'lg:h-auto lg:w-auto lg:static lg:block lg:border lg:border-neutral lg:rounded-lg lg:overflow-visible';
  const facetWrapperMobile =
    'box-border p-5 h-screen w-screen overflow-auto overflow-x-hidden fixed object-left-top bg-background top-0 left-0 z-10';

  return (
    <div class="facet mb-4" part="facet">
      {modalButton}
      <div
        class={`${facetWrapperMobile} ${facetWrapperDesktop} ${
          props.controller.state.isExpanded ? 'block' : 'hidden'
        }`}
      >
        <div class="flex flex-row items-center mb-2">
          <span
            title={props.label}
            part="label"
            class="font-bold text-on-background truncate w-full"
          >
            {props.label}
          </span>
          <span class="flex flex-row ml-auto">
            {clearButton}
            {closeButton}
          </span>
        </div>
        {children}
      </div>
    </div>
  );
};
