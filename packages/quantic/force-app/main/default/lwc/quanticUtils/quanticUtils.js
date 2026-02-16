import LOCALE from '@salesforce/i18n/locale';
import dayPattern from '@salesforce/label/c.quantic_DatePatternDay';
import monthPattern from '@salesforce/label/c.quantic_DatePatternMonth';
import yearPattern from '@salesforce/label/c.quantic_DatePatternYear';
import nextDay from '@salesforce/label/c.quantic_NextDay';
import nextDay_plural from '@salesforce/label/c.quantic_NextDay_plural';
import nextHour from '@salesforce/label/c.quantic_NextHour';
import nextHour_plural from '@salesforce/label/c.quantic_NextHour_plural';
import nextMonth from '@salesforce/label/c.quantic_NextMonth';
import nextMonth_plural from '@salesforce/label/c.quantic_NextMonth_plural';
import nextQuarter from '@salesforce/label/c.quantic_NextQuarter';
import nextQuarter_plural from '@salesforce/label/c.quantic_NextQuarter_plural';
import nextWeek from '@salesforce/label/c.quantic_NextWeek';
import nextWeek_plural from '@salesforce/label/c.quantic_NextWeek_plural';
import nextYear from '@salesforce/label/c.quantic_NextYear';
import nextYear_plural from '@salesforce/label/c.quantic_NextYear_plural';
import pastDay from '@salesforce/label/c.quantic_PastDay';
import pastDay_plural from '@salesforce/label/c.quantic_PastDay_plural';

/** @typedef {import("coveo").RelativeDate} RelativeDate */
import pastHour from '@salesforce/label/c.quantic_PastHour';
import pastHour_plural from '@salesforce/label/c.quantic_PastHour_plural';
import pastMonth from '@salesforce/label/c.quantic_PastMonth';
import pastMonth_plural from '@salesforce/label/c.quantic_PastMonth_plural';
import pastQuarter from '@salesforce/label/c.quantic_PastQuarter';
import pastQuarter_plural from '@salesforce/label/c.quantic_PastQuarter_plural';
import pastWeek from '@salesforce/label/c.quantic_PastWeek';
import pastWeek_plural from '@salesforce/label/c.quantic_PastWeek_plural';
import pastYear from '@salesforce/label/c.quantic_PastYear';
import pastYear_plural from '@salesforce/label/c.quantic_PastYear_plural';

/** @typedef {import("coveo").Result} Result */
/** @typedef {import("coveo").SortCriterion} SortCriterion */

export * from './recentQueriesUtils';
export * from './markdownUtils';
export * from './facetDependenciesUtils';
export * from './citationAnchoringUtils';

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
   * Gets the short date pattern for the current locale.
   * @returns {string} The short date pattern.
   * @example `M/d/yyyy` for `en-US`, `d/M/yyyy` for `fr-FR`, etc.
   */
  static getShortDatePattern() {
    const date = new Date(2000, 2, 4); // month is zero-based
    const dateAsString = I18nUtils.formatDate(date);

    const day = I18nUtils.format(dayPattern);
    const month = I18nUtils.format(monthPattern);
    const year = I18nUtils.format(yearPattern);

    return dateAsString
      .replace('2000', year.repeat(4))
      .replace('00', year.repeat(2)) // for 2-digits year
      .replace('03', month.repeat(2))
      .replace('3', month) // for single-digit month
      .replace('04', day.repeat(2))
      .replace('4', day);
  }

  /**
   * Formats the date in the current locale.
   * @param {Date} date
   * @returns {string} The formatted date.
   */
  static formatDate(date) {
    const formattedDate = new Intl.DateTimeFormat(LOCALE).format(date);
    return formattedDate;
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
 * Utility class for time-based calculations and formatting.
 * Provides methods to convert between different time units and format durations.
 */
export class TimeSpan {
  constructor(time, isMilliseconds = true) {
    if (isMilliseconds) {
      this.milliseconds = time;
    } else {
      this.milliseconds = time * 1000;
    }
  }

  getMilliseconds() {
    return this.milliseconds;
  }

  getSeconds() {
    return this.getMilliseconds() / 1000;
  }

  getMinutes() {
    return this.getSeconds() / 60;
  }

  getHours() {
    return this.getMinutes() / 60;
  }

  getDays() {
    return this.getHours() / 24;
  }

  getWeeks() {
    return this.getDays() / 7;
  }

  getHHMMSS() {
    const hours = Math.floor(this.getHours());
    const minutes = Math.floor(this.getMinutes()) % 60;
    const seconds = Math.floor(this.getSeconds()) % 60;
    let hoursString, minutesString, secondsString;
    if (hours === 0) {
      hoursString = '';
    } else {
      hoursString = hours < 10 ? '0' + hours.toString() : hours.toString();
    }
    minutesString =
      minutes < 10 ? '0' + minutes.toString() : minutes.toString();
    secondsString =
      seconds < 10 ? '0' + seconds.toString() : seconds.toString();
    const hhmmss =
      (hoursString !== '' ? hoursString + ':' : '') +
      minutesString +
      ':' +
      secondsString;
    return hhmmss;
  }

  getYoutubeFormatTimestamp() {
    const hours = Math.floor(this.getHours());
    const minutes = Math.floor(this.getMinutes()) % 60;
    const seconds = Math.floor(this.getSeconds()) % 60;

    const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;

    if (hours > 0) {
      const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
      return hours + ':' + formattedMinutes + ':' + formattedSeconds;
    }
    const formattedMinutes =
      minutes === 0 ? '0' : minutes < 10 ? '0' + minutes : minutes;
    return formattedMinutes + ':' + formattedSeconds;
  }

  getCleanHHMMSS() {
    return this.getHHMMSS().replace(/^0+/, '');
  }
}

/**
 * Utility class for date operations and formatting.
 * Handles conversion between different date formats and provides parsing utilities.
 */
export class DateUtils {
  /**
   * Converts a date string from the Coveo Search API format to the ISO-8601 format.
   * Replace `/` characters in date string with `-`.
   * Replace `@` characters in date string with `T`.
   * @param {string} dateString
   * @returns {string}
   */
  static fromSearchApiDate(dateString) {
    return dateString.replaceAll('/', '-').replaceAll('@', 'T');
  }

  /**
   * Converts a date object to the Search API format (`yyyy/MM/dd@hh:mm:ss`), using local time.
   * @param {Date} date The date object to convert.
   * @returns {string} The formatted date string.
   */
  static toLocalSearchApiDate(date) {
    const year = date.getFullYear().toString().padStart(4, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}/${month}/${day}@${hours}:${minutes}:${seconds}`;
  }

  /**
   * Converts a date to the ISO formatted local date.
   * @param {Date} date The date to convert.
   * @returns {string} The formatted date string.
   */
  static toLocalIsoDate(date) {
    const year = date.getFullYear().toString().padStart(4, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}T00:00:00`;
  }

  /**
   * Parses an ISO-formatted date string to a date object, using the specified local time.
   * @param {string} dateString The ISO formatted date string.
   * @param {number} hours The local hours to set on the date.
   * @param {number} minutes The local minutes to set on the date.
   * @param {number} seconds The local seconds to set on the date.
   * @throws {Error} If specified time is invalid.
   * @returns {Date} The parsed date.
   */
  static fromLocalIsoDate(dateString, hours, minutes, seconds) {
    const isTimeValid =
      hours >= 0 &&
      hours <= 23 &&
      minutes >= 0 &&
      minutes <= 59 &&
      seconds >= 0 &&
      seconds <= 59;
    if (!isTimeValid) {
      throw new Error(
        'The specified time is invalid. It must be between 00:00:00 and 23:59:59.'
      );
    }

    const withoutTime = DateUtils.trimIsoTime(dateString);
    const time =
      hours.toString().padStart(2, '0') +
      ':' +
      minutes.toString().padStart(2, '0') +
      ':' +
      seconds.toString().padStart(2, '0');

    return new Date(`${withoutTime}T${time}`);
  }

  /**
   * Trims the time portion from an ISO 8601 date string.
   * @param {string} dateString
   * @returns {string}
   */
  static trimIsoTime(dateString) {
    const timeIdx = dateString.indexOf('T');
    return timeIdx !== -1 ? dateString.substring(0, timeIdx) : dateString;
  }

  /**
   * @param {number} timestamp
   * @returns {boolean}
   */
  static isValidTimestamp(timestamp) {
    let isValid = true;
    try {
      // eslint-disable-next-line no-new
      new Date(timestamp);
    } catch (error) {
      isValid = false;
    }
    return isValid;
  }

  /**
   * Parses a given timestamp into detailed date components.
   * @param {number} timestamp - The timestamp in milliseconds since January 1, 1970 (epoch time).
   * @returns {Object} An object containing the following date details:
   *   - {number} year - The four-digit year (for example, 2024).
   *   - {string} month - The full name of the month (for example, "August").
   *   - {string} dayOfWeek - The abbreviated name of the day of the week (for example, "Mon").
   *   - {number} day - The day of the month (for example, 26).
   *   - {number} hours - The hour of the day in 24-hour format (0-23).
   *   - {number} minutes - The minutes of the hour (0-59).
   */
  static parseTimestampToDateDetails(timestamp) {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const date = new Date(timestamp);
    const dayOfWeek = daysOfWeek[date.getDay()];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return {
      year,
      month,
      dayOfWeek,
      day,
      hours,
      minutes,
    };
  }
}

/**
 * Converts a date string from the Coveo Search API format to the ISO-8601 format.
 * Replace `/` characters in date string with `-`.
 * Replace `@` characters in date string with `T`.
 * @param {string} dateString
 * @returns {string}
 */
export function fromSearchApiDate(dateString) {
  return DateUtils.fromSearchApiDate(dateString);
}

/**
 * Formats relative date ranges into human-readable strings.
 * Supports past and future date ranges with proper pluralization.
 */
export class RelativeDateFormatter {
  constructor() {
    this.singularIndex = 0;
    this.pluralIndex = 1;

    this.labels = {
      'past-hour': [pastHour, pastHour_plural],
      'past-day': [pastDay, pastDay_plural],
      'past-week': [pastWeek, pastWeek_plural],
      'past-month': [pastMonth, pastMonth_plural],
      'past-quarter': [pastQuarter, pastQuarter_plural],
      'past-year': [pastYear, pastYear_plural],
      'next-hour': [nextHour, nextHour_plural],
      'next-day': [nextDay, nextDay_plural],
      'next-week': [nextWeek, nextWeek_plural],
      'next-month': [nextMonth, nextMonth_plural],
      'next-quarter': [nextQuarter, nextQuarter_plural],
      'next-year': [nextYear, nextYear_plural],
    };
  }

  /**
   * Formats a relative date range into a human-readable string.
   * @param {RelativeDate} begin The beginning of the relative date range.
   * @param {RelativeDate} end The end of the relative date range.
   * @returns {string} The formatted human-readable date range.
   * @throws {Error} If the provided relative date range is invalid.
   * @example
   * begin = { period: 'past', unit: 'day', amount: 2 };
   * end = { period: 'now', unit: 'day', amount: 1 };
   * Output: "2 days ago - 1 day ago"
   */
  formatRange(begin, end) {
    const isPastRange = begin.period === 'past' && end.period === 'now';
    const isNextRange = begin.period === 'now' && end.period === 'next';

    if (!isPastRange && !isNextRange) {
      throw new Error(
        'The provided relative date range is invalid. Either "begin" or "end" must have the "period" set to "now".'
      );
    }

    const relativeDate = isPastRange ? begin : end;
    const label =
      this.labels[`${relativeDate.period}-${relativeDate.unit}`][
        I18nUtils.isSingular(relativeDate.amount)
          ? this.singularIndex
          : this.pluralIndex
      ];

    return I18nUtils.format(label, relativeDate.amount);
  }
}

/**
 * Utility class for managing a simple in-memory store.
 * Supports registering and retrieving facet and sort option data.
 */
export class Store {
  static facetTypes = {
    FACETS: 'facets',
    NUMERICFACETS: 'numericFacets',
    DATEFACETS: 'dateFacets',
    CATEGORYFACETS: 'categoryFacets',
  };
  static initialize() {
    return {
      state: {
        facets: {},
        numericFacets: {},
        dateFacets: {},
        categoryFacets: {},
        sort: {},
      },
    };
  }
  /**
   * Registers a facet to the store if it does not already exist.
   * @param {Record<String, unknown>} store
   * @param {string} facetType
   * @param {{ label?: string; facetId: any; format?: Function;}} data
   */
  static registerFacetToStore(store, facetType, data) {
    if (store?.state[facetType][data.facetId]) {
      return;
    }
    store.state[facetType][data.facetId] = data;
  }

  /**
   * Registers sort option data to the store.
   * @param {Record<String, any>} store
   * @param {Array<{label: string; value: string; criterion: SortCriterion;}>} data
   */
  static registerSortOptionDataToStore(store, data) {
    store.state.sort = data;
  }

  /**
   * Gets facet data from the store.
   * @param {Record<String, unknown>} store
   * @param {string} facetType
   * @return {Object} The facet data.
   */
  static getFromStore(store, facetType) {
    return store.state[facetType];
  }

  /**
   * Gets sort options from the store.
   * @param {Record<String, Object>} store
   * @return {Array} The sort options.
   */
  static getSortOptionsFromStore(store) {
    return store.state.sort;
  }
}

/**
 * AriaLiveUtils
 * @typedef {Object} AriaLiveUtils
 * @property {Function} dispatchMessage
 * @property {Function} registerRegion
 */

/**
 * AriaLiveRegion Create an AriaLiveRegion to be able to send events to dispatch messages for assistive technologies.
 * @param {string} regionName
 * @param {Object} elem
 * @param {boolean} assertive
 * @returns {AriaLiveUtils} Object with methods to dispatch messages and register the region.
 */
export function AriaLiveRegion(regionName, elem, assertive = false) {
  function dispatchMessage(message) {
    const ariaLiveMessageEvent = new CustomEvent('quantic__arialivemessage', {
      bubbles: true,
      composed: true,
      detail: {
        regionName,
        assertive,
        message,
      },
    });
    elem.dispatchEvent(ariaLiveMessageEvent);
  }

  function registerRegion() {
    const registerRegionEvent = new CustomEvent('quantic__registerregion', {
      bubbles: true,
      composed: true,
      detail: {
        regionName,
        assertive,
      },
    });
    elem.dispatchEvent(registerRegionEvent);
  }

  registerRegion();

  return {
    dispatchMessage,
    registerRegion,
  };
}

/**
 * Checks whether an element is focusable.
 * @param {HTMLElement | Element}  element
 * @returns {boolean}
 */
export function isFocusable(element) {
  // Source: https://stackoverflow.com/a/30753870
  if (element.getAttribute('tabindex') === '-1') {
    return false;
  }
  if (
    element.hasAttribute('tabindex') ||
    element.getAttribute('contentEditable') === 'true'
  ) {
    return true;
  }
  switch (element.tagName) {
    case 'A':
    case 'AREA':
      return element.hasAttribute('href');
    case 'INPUT':
    case 'SELECT':
    case 'TEXTAREA':
    case 'BUTTON':
      return !element.hasAttribute('disabled');
    case 'IFRAME':
      return true;
    default:
      return false;
  }
}

/**
 * Returns the last focusable element of for an HTML element.
 * This function would NOT work with shadow root.
 * @param {HTMLElement & {assignedElements?: () => Array<HTMLElement>} | null} element
 * @returns {HTMLElement | null}
 */
export function getLastFocusableElement(element) {
  if (!element || element.nodeType === Node.TEXT_NODE) return null;

  if (isCustomElement(element)) {
    if (element.dataset?.focusable?.toString() === 'true') {
      return element;
    }
    return null;
  }

  if (element.tagName === 'SLOT' && element.assignedElements().length) {
    return getLastFocusableElementFromSlot(element);
  }

  /** @type {Array} */
  const childNodes = Array.from(element.childNodes);
  const focusableElements = childNodes
    .map((item) => getLastFocusableElement(item))
    .filter((item) => !!item);

  if (focusableElements.length) {
    return focusableElements[focusableElements.length - 1];
  } else if (isFocusable(element)) {
    return element;
  }
  return null;
}

/**
 * Returns the First focusable element of for an HTML element.
 * This function would NOT work with shadow root.
 * @param {HTMLElement & {assignedElements?: () => Array<HTMLElement>} | null} element
 * @returns {HTMLElement | null}
 */
export function getFirstFocusableElement(element) {
  if (!element || element.nodeType === Node.TEXT_NODE) return null;

  if (isCustomElement(element)) {
    if (element.dataset?.focusable?.toString() === 'true') {
      return element;
    }
    return null;
  }

  if (element.tagName === 'SLOT' && element.assignedElements().length) {
    return getFirstFocusableElementFromSlot(element);
  }

  /** @type {Array} */
  const childNodes = Array.from(element.childNodes);
  const focusableElements = childNodes
    .map((item) => getFirstFocusableElement(item))
    .filter((item) => !!item);

  if (focusableElements.length) {
    return focusableElements[0];
  } else if (isFocusable(element)) {
    return element;
  }
  return null;
}

/**
 * Checks whether an element is a custom element.
 * @param {HTMLElement | null} element
 * @returns {boolean}
 */
export function isCustomElement(element) {
  if (element && element.tagName.includes('-')) {
    return true;
  }
  return false;
}

/**
 * Returns the last focusable element in an HTML slot.
 * @param {HTMLElement & {assignedElements?: () => Array<HTMLElement> | null}} slotElement
 * @returns {HTMLElement | null}
 */
function getLastFocusableElementFromSlot(slotElement) {
  if (!slotElement && slotElement.assignedElements) {
    return null;
  }
  const assignedElements = Array.from(slotElement.assignedElements());
  const focusableElements = assignedElements
    .map((item) => getLastFocusableElement(item))
    .filter((item) => !!item);

  if (focusableElements.length) {
    return focusableElements[focusableElements.length - 1];
  }
  return null;
}

/**
 * Returns the first focusable element in an HTML slot.
 * @param {HTMLElement & {assignedElements?: () => Array<HTMLElement> | null}} slotElement
 * @return {HTMLElement | null}
 */
function getFirstFocusableElementFromSlot(slotElement) {
  if (!slotElement && slotElement.assignedElements) {
    return null;
  }
  const assignedElements = Array.from(slotElement.assignedElements());
  const focusableElements = assignedElements
    .map((item) => getFirstFocusableElement(item))
    .filter((item) => !!item);

  if (focusableElements.length) {
    return focusableElements[0];
  }
  return null;
}

/**
 * Checks whether an element is indeed the targetElement or one of its parents.
 * @param {HTMLElement} element
 * @param {string} targetElement
 * @returns {boolean}
 */
export function isParentOf(element, targetElement) {
  if (!element || element.nodeType === Node.TEXT_NODE) {
    return false;
  }

  if (isCustomElement(element)) {
    if (element.tagName === targetElement) {
      return true;
    }
    return false;
  }
  /** @type {Array} */
  const childNodes = Array.from(element.childNodes);
  if (childNodes.length === 0) return false;
  return childNodes.reduce(
    (acc, val) => acc || isParentOf(val, targetElement),
    false
  );
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
