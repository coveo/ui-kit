import {Bindings} from '..';
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

export interface FocusTargetController {
  setTarget(element: HTMLElement | undefined): void;
  focusAfterSearch(): void;
}

export function FocusTarget() {
  return (component: InitializableComponent, setterName: string) => {
    const {componentWillLoad} = component;

    component.componentWillLoad = function () {
      componentWillLoad && componentWillLoad.call(this);
      const {componentDidRender} = this;
      let focusAfterSearch = false;
      let lastSearchId: string | undefined = undefined;
      let element: HTMLElement | undefined = undefined;

      function tryFocusElement(bindings: Bindings) {
        if (!element) {
          return;
        }
        const searchId = bindings.engine.state.search.searchResponseId;
        if (focusAfterSearch && searchId !== lastSearchId) {
          setTimeout(() => element?.focus());
          focusAfterSearch = false;
        }
        lastSearchId = searchId;
      }

      this.componentDidRender = function () {
        componentDidRender && componentDidRender.call(this);
        if (!this.bindings) {
          return;
        }
        tryFocusElement(this.bindings);
      };

      const focusTargetController: FocusTargetController = {
        setTarget: (el) => {
          el && (element = el);
          tryFocusElement(this.bindings);
        },
        focusAfterSearch: () => {
          lastSearchId = this.bindings.engine.state.search.searchResponseId;
          focusAfterSearch = true;
        },
      };
      this[setterName] = focusTargetController;
    };
  };
}
