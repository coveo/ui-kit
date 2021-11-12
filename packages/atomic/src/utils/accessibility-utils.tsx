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
      set: (message) => dispatchMessage(message),
    });
  };
}
