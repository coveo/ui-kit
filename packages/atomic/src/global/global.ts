import {setCoveoGlobal} from './environment';
import {loadFocusVisiblePolyfill} from './focus-visible';

export function loadGlobalScripts(globalVariableName: string) {
  setCoveoGlobal(globalVariableName);
  loadFocusVisiblePolyfill();
}
