import {
  buildInteractiveResult,
  SearchEngine,
  Result,
  ResultTemplatesHelpers,
} from '@coveo/headless';
import {RecsBindings} from '../components/recommendations/atomic-recs-interface/atomic-recs-interface';
import {Bindings} from '../components/search/atomic-search-interface/atomic-search-interface';

/**
 * Binds the logging of document
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
  const elements = resultElement.querySelectorAll(selector || 'a');

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

export function buildStringTemplateFromResult(
  template: string,
  result: Result,
  bindings: Bindings | RecsBindings
) {
  return template.replace(/\${(.*?)}/g, (value: string) => {
    const key = value.substring(2, value.length - 1);
    let newValue = readFromObject(result, key);
    if (!newValue && typeof window !== 'undefined') {
      newValue = readFromObject(window, key);
    }

    if (!newValue) {
      bindings.engine.logger.warn(
        `${key} used in the href template is undefined for this result: ${result.uniqueId} and could not be found in the window object.`
      );
      return '';
    }

    return newValue;
  });
}

export function getStringValueFromResultOrNull(result: Result, field: string) {
  const value = ResultTemplatesHelpers.getResultProperty(result, field);

  if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }

  return value;
}

function readFromObject<T extends object>(
  object: T,
  key: string
): string | undefined {
  const keys = key.split('.');
  let current: unknown = object;

  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = (current as Record<string, unknown>)[k];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}
