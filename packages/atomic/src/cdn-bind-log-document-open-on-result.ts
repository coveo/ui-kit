import type {InteractiveResult, Result, SearchEngine} from '@coveo/headless';

/**
 * Binds the logging of document
 *
 * The CDN's version of `bindLogDocumentOpenOnResult` in `./utils/result-utils.ts`. It loads Headless when it is called
 * instead of importing it, so that the CDN's `index.esm.js` can run before Headless has downloaded. Keep its events in
 * step with the npm helper's.
 *
 * @returns An unbind function for the events
 * @param engine A headless search engine instance.
 * @param result The result object
 * @param resultElement Parent result element
 * @param selector Optional. Css selector that selects all links to the document. Default: "a" tags with the clickUri as "href" parameter.
 */
export function bindLogDocumentOpenOnResult(
  engine: SearchEngine,
  result: Result,
  resultElement: Element | ShadowRoot,
  selector?: string
) {
  const interactiveResult = import('@coveo/headless').then(({buildInteractiveResult}) =>
    buildInteractiveResult(engine, {options: {result}})
  );
  interactiveResult.catch((error) => {
    engine.logger.error(error, 'Document opens will not be logged for this result.');
  });
  const whenLoaded = (action: (controller: InteractiveResult) => void) => () => {
    interactiveResult.then(action, () => {});
  };

  const eventsMap: Record<string, EventListenerOrEventListenerObject> = {
    contextmenu: whenLoaded((controller) => controller.select()),
    click: whenLoaded((controller) => controller.select()),
    mouseup: whenLoaded((controller) => controller.select()),
    mousedown: whenLoaded((controller) => controller.select()),
    touchstart: whenLoaded((controller) => controller.beginDelayedSelect()),
    touchend: whenLoaded((controller) => controller.cancelPendingSelect()),
  };
  const elements = resultElement.querySelectorAll(selector || 'a');

  elements.forEach((element) => {
    Object.keys(eventsMap).forEach((key) => element.addEventListener(key, eventsMap[key]));
  });

  return () => {
    elements.forEach((element) => {
      Object.keys(eventsMap).forEach((key) => element.removeEventListener(key, eventsMap[key]));
    });
  };
}
