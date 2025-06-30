import {FunctionalComponentNoProps} from '@/src/utils/functional-component-utils';
import {html} from 'lit';
import MagnifyingGlassIcon from '../../../images/magnifying-glass.svg';

export const renderMagnifyingGlass: FunctionalComponentNoProps = () => {
  return html`
    <atomic-icon
      part="icon"
      icon=${MagnifyingGlassIcon}
      class="my-6 flex w-1/2 max-w-lg flex-col items-center"
    ></atomic-icon>
  `;
};
