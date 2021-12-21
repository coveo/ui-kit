import {UpdateLiveRegionEventArgs} from '../components/atomic-search-interface/atomic-aria-live';
import {buildCustomEvent} from './event-utils';
import {InitializableComponent} from './initialization-utils';

export function AriaLiveRegion(regionName: string) {
  function dispatchMessage(message: string) {
    document.dispatchEvent(
      buildCustomEvent<UpdateLiveRegionEventArgs>(
        'atomic/accessibility/updateLiveRegion',
        {
          region: regionName,
          message,
        }
      )
    );
  }

  return (component: InitializableComponent, setterName: string) => {
    Object.defineProperty(component, setterName, {
      set: (message: string) => dispatchMessage(message),
    });
  };
}

export interface PersistentFocus {
  setElement(element: HTMLElement | undefined): void;
  focusAfterSearch(): void;
}

export function MaintainFocus() {
  return (component: InitializableComponent, setterName: string) => {
    const {componentDidRender, connectedCallback} = component;

    component.connectedCallback = function () {
      let element: HTMLElement | undefined = undefined;
      let lastSearchId: string | undefined = undefined;
      let maintainFocus = false;

      const focusMaintainer: PersistentFocus = {
        setElement: (el) => (element = el),
        focusAfterSearch: () => {
          lastSearchId = this.bindings.engine.state.search.searchResponseId;
          maintainFocus = true;
        },
      };
      this[setterName] = focusMaintainer;
      connectedCallback && connectedCallback.call(this);

      this.componentDidRender = () => {
        if (!this.bindings) {
          return;
        }
        const searchId = this.bindings.engine.state.search.searchResponseId;
        if (maintainFocus && searchId !== lastSearchId) {
          element?.focus();
          maintainFocus = false;
        }
        lastSearchId = searchId;
        componentDidRender && componentDidRender.call(this);
      };
    };
  };
}
