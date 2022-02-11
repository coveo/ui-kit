import {buildCustomEvent} from './event-utils';
import {InitializableComponent} from './initialization-utils';

export const findAriaLiveEventName = 'atomic/accessibility/findAriaLive';

export interface FindAriaLiveEventArgs {
  element?: HTMLAtomicAriaLiveElement;
}

export function AriaLiveRegion(regionName: string) {
  function dispatchMessage(message: string) {
    const event = buildCustomEvent<FindAriaLiveEventArgs>(
      findAriaLiveEventName,
      {}
    );
    document.dispatchEvent(event);
    const {element} = event.detail;
    if (element) {
      element.updateMessage(regionName, message);
    }
  }

  return (component: InitializableComponent, setterName: string) => {
    Object.defineProperty(component, setterName, {
      set: (message: string) => dispatchMessage(message),
    });
  };
}

export interface FocusTargetController {
  setTarget(element: HTMLElement | undefined): void;
  focusAfterSearch(): Promise<void>;
  focusOnNextTarget(): Promise<void>;
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
      let onFocusCallback: Function | null = null;
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
            setTimeout(() => {
              el.focus();
              onFocusCallback?.();
            });
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
            onFocusCallback?.();
          }
        },
        focusAfterSearch: () => {
          lastSearchId = this.bindings.engine.state.search.response.searchUid;
          focusAfterSearch = true;
          return new Promise((resolve) => (onFocusCallback = resolve));
        },
        focusOnNextTarget: () => {
          focusOnNextTarget = true;
          return new Promise((resolve) => (onFocusCallback = resolve));
        },
        disableForCurrentSearch: () =>
          this.bindings.engine.state.search.response.searchUid !==
            lastSearchId && (focusAfterSearch = false),
      };
      this[setterName] = focusTargetController;
    };
  };
}
