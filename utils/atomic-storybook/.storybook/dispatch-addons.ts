import {addons} from '@storybook/addons';
import CoreEvents from '@storybook/core-events';
import {A11Y_EXTENSION_EVENTS} from './register';

export const dispatchAddons = (clone: HTMLElement) => {
  addons.getChannel().emit(A11Y_EXTENSION_EVENTS.SEARCH_EXECUTED);
  addons.getChannel().on(CoreEvents.DOCS_RENDERED, () => {
    clone.innerHTML = '';
  });
};
