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
  focusOnNextTarget(): void;
  disableForCurrentSearch(): void;
}

export function FocusTarget() {
  return (component: InitializableComponent, setterName: string) => {
    const {componentWillLoad} = component;

    component.componentWillLoad = function () {
      componentWillLoad && componentWillLoad.call(this);
      const {componentDidRender} = this;
      let focusAfterSearch = false;
      let focusOnNextTarget = false;
      let lastSearchId: string | undefined = undefined;
      let element: HTMLElement | undefined = undefined;

      this.componentDidRender = function () {
        componentDidRender && componentDidRender.call(this);
        if (!this.bindings) {
          return;
        }
        if (
          focusAfterSearch &&
          this.bindings.engine.state.search.response.searchUid !== lastSearchId
        ) {
          focusAfterSearch = false;
          if (element) {
            const el = element;
            setTimeout(() => el.focus());
          }
        }
      };

      const focusTargetController: FocusTargetController = {
        setTarget: (el) => {
          if (!el) {
            return;
          }
          element = el;
          if (focusOnNextTarget) {
            focusOnNextTarget = false;
            element.focus();
          }
        },
        focusAfterSearch: () => {
          lastSearchId = this.bindings.engine.state.search.response.searchUid;
          focusAfterSearch = true;
        },
        focusOnNextTarget: () => {
          focusOnNextTarget = true;
        },
        disableForCurrentSearch: () =>
          this.bindings.engine.state.search.response.searchUid !==
            lastSearchId && (focusAfterSearch = false),
      };
      this[setterName] = focusTargetController;
    };
  };
}
