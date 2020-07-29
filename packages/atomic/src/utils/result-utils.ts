import {once} from './utils';
import {Engine, ResultAnalyticsActions, Result} from '@coveo/headless';

/**
 * Binds the logging of document
 * @returns An unbind function for the events
 * @param engine An instance of an Headless Engine
 * @param result The result object
 * @param resultElement Parent result element
 * @param selector Optional. Css selector that selects all links to the document. Default: "a" tags with the clickUri as "href" parameter.
 */
export function bindLogDocumentOpenOnResult(
  engine: Engine,
  result: Result,
  resultElement: Element,
  selector?: string
) {
  const logDocumentOpenOnce = once(() => {
    engine.dispatch(ResultAnalyticsActions.logDocumentOpen(result));
  });
  // 1 second is a reasonable amount of time to catch most longpress actions
  const longpressDelay = 1000;
  let longPressTimer: number;

  const startPressTimer = () => {
    longPressTimer = window.setTimeout(logDocumentOpenOnce, longpressDelay);
  };
  const clearPressTimer = () => {
    longPressTimer && clearTimeout(longPressTimer);
  };

  const eventsMap: Record<string, EventListenerOrEventListenerObject> = {
    contextmenu: logDocumentOpenOnce,
    click: logDocumentOpenOnce,
    mouseup: logDocumentOpenOnce,
    mousedown: logDocumentOpenOnce,
    touchstart: startPressTimer,
    touchend: clearPressTimer,
  };
  const elements = resultElement.querySelectorAll(
    selector || `a[href='${result.clickUri}']`
  );

  elements.forEach((element) => {
    Object.keys(eventsMap).forEach((key) =>
      element.addEventListener(key, eventsMap[key])
    );
  });

  return () => {
    elements.forEach((element) => {
      Object.keys(eventsMap).forEach((key) =>
        element.removeEventListener(key, eventsMap[key])
      );
    });
  };
}
