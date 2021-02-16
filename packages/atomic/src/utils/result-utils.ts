import {buildInteractiveResult, Engine, Result} from '@coveo/headless';

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
  const interactiveResult = buildInteractiveResult(engine, {
    options: {result},
  });

  const eventsMap: Record<string, EventListenerOrEventListenerObject> = {
    contextmenu: () => interactiveResult.select(),
    click: () => interactiveResult.select(),
    mouseup: () => interactiveResult.select(),
    mousedown: () => interactiveResult.select(),
    touchstart: () => interactiveResult.beginDelayedSelect(),
    touchend: () => interactiveResult.cancelPendingSelect(),
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
