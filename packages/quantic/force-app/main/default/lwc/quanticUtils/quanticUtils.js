import LOCALE from '@salesforce/i18n/locale';

/** @typedef {import("coveo").Result} Result */

export * from './recentQueriesUtils';
export * from './markdownUtils';
export * from './facetDependenciesUtils';
export * from './citationAnchoringUtils';
export * from './timeAndDateUtils';
export * from './accessibilityUtils';
export * from './facetStoreUtils';

/**
 * Utility class for debouncing function calls.
 */
export class Debouncer {
  _timeout;

  get timeout() {
    return this._timeout;
  }

  clearTimeout() {
    clearTimeout(this._timeout);
  }

  /**
   * Debounces a function execution.
   * @param {Function} func The function for which to delay execution.
   * @param {Number} wait The time to delay in milliseconds.
   */
  debounce(func, wait) {
    return (...args) => {
      const later = () => {
        clearTimeout(this._timeout);
        func(...args);
      };
      clearTimeout(this._timeout);
      // eslint-disable-next-line @lwc/lwc/no-async-operation
      this._timeout = setTimeout(later, wait);
    };
  }
}

/**
 * A *Deferred* is a promise that is resolve or reject by an external actor.
 *
 * ```javascript
 * let deferred = new Deferred();
 *
 * setTimeout(() => { deferred.resolve('foo') }, 5000);
 *
 * // Result after 5 sec : 'foo'
 * deferred.promise.then(data => console.log(data));```
 */
export class Deferred {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.isResolved = false;
      this.resolve = (value) => {
        resolve(value);
        this.isResolved = true;
      };
      this.reject = reject;
    });
  }
}

/**
 * Utility class for working with search results and binding analytics events.
 */
export class ResultUtils {
  /**
   * Binds analytics logging events to result elements.
   * @param {import("coveo").SearchEngine} engine An instance of an Headless Engine
   * @param {import("coveo").Result} result The result object
   * @param {import("lwc").ShadowRootTheGoodPart} resultElement Parent result element
   * @param {Function} controllerBuilder Function to build the interactive result controller.
   * @param {string} selector Optional. Css selector that selects all links to the document. Default: "a" tags with the clickUri as "href" parameter.
   * @returns An unbind function for the events
   */
  static bindClickEventsOnResult(
    engine,
    result,
    resultElement,
    controllerBuilder,
    selector = undefined
  ) {
    const interactiveResult = controllerBuilder(engine, {
      options: {result: result},
    });

    const eventsMap = {
      contextmenu: () => interactiveResult.select(),
      click: () => interactiveResult.select(),
      mouseup: () => interactiveResult.select(),
      mousedown: () => interactiveResult.select(),
      touchstart: () => interactiveResult.beginDelayedSelect(),
      touchend: () => interactiveResult.cancelPendingSelect(),
    };
    // @ts-ignore
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
}

/**
 * Utility class for link operations and analytics binding.
 */
export class LinkUtils {
  /**
   * Binds the logging of a link
   * @param {HTMLAnchorElement} link the link element
   * @param {{select:function, beginDelayedSelect: function, cancelPendingSelect: function  }} actions
   * @returns An unbind function for the events
   */
  static bindAnalyticsToLink(link, actions) {
    const eventsMap = {
      contextmenu: () => actions.select(),
      click: () => actions.select(),
      mouseup: () => actions.select(),
      mousedown: () => actions.select(),
      touchstart: () => actions.beginDelayedSelect(),
      touchend: () => actions.cancelPendingSelect(),
    };
    Object.keys(eventsMap).forEach((key) =>
      link.addEventListener(key, eventsMap[key])
    );

    return () => {
      Object.keys(eventsMap).forEach((key) =>
        link.removeEventListener(key, eventsMap[key])
      );
    };
  }
}

/**
 * Utility class for internationalization and localization.
 */
export class I18nUtils {
  static getTextWithDecorator(text, startTag, endTag) {
    return `${startTag}${text}${endTag}`;
  }

  static getTextBold(text) {
    return I18nUtils.getTextWithDecorator(text, '<b>', '</b>');
  }

  static isSingular(count) {
    return new Intl.PluralRules(LOCALE).select(count) === 'one';
  }

  /**
   * Gets the label name with count.
   * @param {string} labelName
   * @param {string|number} count
   * @returns {string} The label name with count.
   * @example `labelName_zero`, `labelName_plural` or `labelName`
   */
  static getLabelNameWithCount(labelName, count) {
    if (count === 0) {
      return `${labelName}_zero`;
    } else if (!I18nUtils.isSingular(count)) {
      return `${labelName}_plural`;
    }
    return labelName;
  }

  /**
   * Formats a string with the given arguments.
   * @param {String} stringToFormat
   * @param  {...any} formattingArguments
   * @returns {string} The formatted string.
   * @throws {Error} If string format is not a string.
   * @example
   * I18nUtils.format('Hello {{0}}, you have {{1}} new messages', 'John', 5);
   * returns 'Hello John, you have 5 new messages'
   */
  static format(stringToFormat, ...formattingArguments) {
    if (typeof stringToFormat !== 'string')
      throw new Error("'stringToFormat' must be a String");
    return stringToFormat.replace(/{{(\d+)}}/gm, (match, index) =>
      formattingArguments[index] === undefined
        ? ''
        : `${formattingArguments[index]}`
    );
  }

  /**
   * @param {string} html
   * @returns {string}
   */
  static escapeHTML(html) {
    const escape = document.createElement('textarea');
    escape.textContent = html;
    // eslint-disable-next-line @lwc/lwc/no-inner-html
    return escape.innerHTML;
  }
}

/**
 * Storage key for standalone search box configuration.
 * @constant {string}
 */
export const STANDALONE_SEARCH_BOX_STORAGE_KEY = 'coveo-standalone-search-box';

/**
 * Key codes for common keyboard interactions.
 * @readonly
 * @enum {string}
 */
export const keys = {
  ESC: 'Escape',
  TAB: 'Tab',
  ENTER: 'Enter',
  ARROWUP: 'ArrowUp',
  ARROWDOWN: 'ArrowDown',
  ARROWRIGHT: 'ArrowRight',
  ARROWLEFT: 'ArrowLeft',
};

export function getItemFromLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}

export function setItemInLocalStorage(key, item) {
  if (item) {
    localStorage.setItem(key, JSON.stringify(item));
  }
}

/**
 * Replace char found in pattern with \\$&
 * @param {string} value
 * @return {string}
 */
export function regexEncode(value) {
  return value.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}
/**
 * Parses an XML string into a DOM Document.
 * @param {string} string
 * @returns {Document}
 */
export function parseXML(string) {
  return new window.DOMParser().parseFromString(string, 'text/xml');
}

/**
 * Recursively clones objects to break Locker proxy chains.
 * @param {any} value
 * @returns {any}
 */
export function unwrapLockerProxiedObject(value) {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => unwrapLockerProxiedObject(item));
  }

  const unwrappedValue = {};
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      unwrappedValue[key] = unwrapLockerProxiedObject(value[key]);
    }
  }

  return unwrappedValue;
}

/**
 * Copies text to clipboard using the Clipboard API.
 * https://developer.mozilla.org/en-US/docs/Web/API/Clipboard
 * @param {string} text
 * @return {Promise<void>}
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    copyToClipboardFallback(text);
  }
}

/**
 * Copies text to clipboard using the DOM.
 * @param {string} text
 */
export function copyToClipboardFallback(text) {
  const el = document.createElement('textarea');
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

/**
 * Read the value of a given key from an object.
 * @param {object} object
 * @param {string} key
 * @return {object | undefined} The value of the key.
 */
export function readFromObject(object, key) {
  const firstPeriodIndex = key.indexOf('.');
  if (object && firstPeriodIndex !== -1) {
    let newKey = key.substring(firstPeriodIndex + 1);
    key = key.substring(0, firstPeriodIndex);
    return readFromObject(object[key], newKey);
  }
  return object ? object[key] : undefined;
}

/**
 * Generates a text from a result based on a given template.
 * @param {string} template
 * @param {Result} result
 * @returns {string}
 */
export function buildTemplateTextFromResult(template, result) {
  if (!template) {
    return '';
  }
  return template.replace(/\$\{(.*?)\}/g, (value) => {
    const key = value.substring(2, value.length - 1);
    const newValue = readFromObject(result, key);
    return newValue || '';
  });
}

/**
 * Returns the padding values of an element.
 * @param {Element} element
 * @returns {{top: number, right:number, bottom:number, left:number}}
 */
export function getElementPadding(element) {
  const styles = window.getComputedStyle(element);

  return {
    top: parseFloat(styles.paddingTop),
    right: parseFloat(styles.paddingRight),
    bottom: parseFloat(styles.paddingBottom),
    left: parseFloat(styles.paddingLeft),
  };
}

/**
 * Returns the absolute height of an element.
 * Uses getBoundingClientRect() to ensure synchronous layout calculation.
 * @param {Element} element
 * @returns {number} The absolute height of the element including padding.
 */
export function getAbsoluteHeight(element) {
  if (!element) {
    return 0;
  }

  // Using getBoundingClientRect ensures accurate height measurements across all browsers, especially Safari.
  const elementBoundingRect = element.getBoundingClientRect();
  return Math.ceil(elementBoundingRect.height);
}

/**
 * Returns the absolute width of an element.
 * Uses getBoundingClientRect() to ensure synchronous layout calculation.
 * @param {Element} element
 * @returns {number} The absolute width of the element including padding.
 */
export function getAbsoluteWidth(element) {
  if (!element) {
    return 0;
  }

  // Using getBoundingClientRect ensures accurate width measurements across all browsers, especially Safari.
  const elementBoundingRect = element.getBoundingClientRect();
  return Math.ceil(elementBoundingRect.width);
}
