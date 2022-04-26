import LOCALE from '@salesforce/i18n/locale';

import dayPattern from '@salesforce/label/c.quantic_DatePatternDay';
import monthPattern from '@salesforce/label/c.quantic_DatePatternMonth';
import yearPattern from '@salesforce/label/c.quantic_DatePatternYear';

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

export class ResultUtils {
  /**
   * Binds the logging of document
   * @returns An unbind function for the events
   * @param {import("coveo").SearchEngine} engine An instance of an Headless Engine
   * @param {import("coveo").Result} result The result object
   * @param {import("lwc").ShadowRootTheGoodPart} resultElement Parent result element
   * @param {string} selector Optional. Css selector that selects all links to the document. Default: "a" tags with the clickUri as "href" parameter.
   */
  static bindClickEventsOnResult(
    engine,
    result,
    resultElement,
    controllerBuilder,
    selector = undefined
  ) {
    const interactiveResult = controllerBuilder(engine, {
      options: {result: JSON.parse(JSON.stringify(result))},
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

  static getLabelNameWithCount(labelName, count) {
    if (count === 0) {
      return `${labelName}_zero`;
    } else if (!I18nUtils.isSingular(count)) {
      return `${labelName}_plural`;
    }
    return labelName;
  }

  static format(stringToFormat, ...formattingArguments) {
    if (typeof stringToFormat !== 'string')
      throw new Error("'stringToFormat' must be a String");
    return stringToFormat.replace(/{{(\d+)}}/gm, (match, index) =>
      (formattingArguments[index] === undefined
        ? ''
        : `${formattingArguments[index]}`)
    );
  }

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
   * @param {Date} date
   */
  static formatDate(date) {
    const result = new Intl.DateTimeFormat(LOCALE).format(date);
    return result;
  }

  /**
   * @param {string} html 
   * @returns {string}
   */
  static escapeHTML(html) {
    var escape = document.createElement('textarea');
    escape.textContent = html;
    // eslint-disable-next-line @lwc/lwc/no-inner-html
    return escape.innerHTML;
  }
}

export const STANDALONE_SEARCH_BOX_STORAGE_KEY = 'coveo-standalone-search-box';

export const keys = {
  ENTER: 'Enter',
  ARROWUP: 'ArrowUp',
  ARROWDOWN: 'ArrowDown',
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
 */
export function regexEncode(value) {
  return value.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}

export function parseXML(string) {
  return new window.DOMParser().parseFromString(string, 'text/xml');
}

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

  getCleanHHMMSS() {
    return this.getHHMMSS().replace(/^0+/, '');
  }
}

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

  static trimIsoTime(dateString) {
    const timeIdx = dateString.indexOf('T');
    return timeIdx !== -1 ? dateString.substring(0, timeIdx) : dateString;
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

/** @typedef {import("coveo").RelativeDate} RelativeDate */

import pastHour from '@salesforce/label/c.quantic_PastHour';
import pastHour_plural from '@salesforce/label/c.quantic_PastHour_plural';
import pastDay from '@salesforce/label/c.quantic_PastDay';
import pastDay_plural from '@salesforce/label/c.quantic_PastDay_plural';
import pastWeek from '@salesforce/label/c.quantic_PastWeek';
import pastWeek_plural from '@salesforce/label/c.quantic_PastWeek_plural';
import pastMonth from '@salesforce/label/c.quantic_PastMonth';
import pastMonth_plural from '@salesforce/label/c.quantic_PastMonth_plural';
import pastQuarter from '@salesforce/label/c.quantic_PastQuarter';
import pastQuarter_plural from '@salesforce/label/c.quantic_PastQuarter_plural';
import pastYear from '@salesforce/label/c.quantic_PastYear';
import pastYear_plural from '@salesforce/label/c.quantic_PastYear_plural';
import nextHour from '@salesforce/label/c.quantic_NextHour';
import nextHour_plural from '@salesforce/label/c.quantic_NextHour_plural';
import nextDay from '@salesforce/label/c.quantic_NextDay';
import nextDay_plural from '@salesforce/label/c.quantic_NextDay_plural';
import nextWeek from '@salesforce/label/c.quantic_NextWeek';
import nextWeek_plural from '@salesforce/label/c.quantic_NextWeek_plural';
import nextMonth from '@salesforce/label/c.quantic_NextMonth';
import nextMonth_plural from '@salesforce/label/c.quantic_NextMonth_plural';
import nextQuarter from '@salesforce/label/c.quantic_NextQuarter';
import nextQuarter_plural from '@salesforce/label/c.quantic_NextQuarter_plural';
import nextYear from '@salesforce/label/c.quantic_NextYear';
import nextYear_plural from '@salesforce/label/c.quantic_NextYear_plural';

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
   *
   * @param {RelativeDate} begin
   * @param {RelativeDate} end
   * @returns {string}
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

export class Store {

  static facetTypes = {
    FACETS: 'facets' , 
    NUMERICFACETS: 'numericFacets' , 
    DATEFACETS: 'dateFacets' , 
    CATEGORYFACETS: 'categoryFacets' 
  }
  static initialize() {
    return { 
      state : { 
        facets: {},
        numericFacets: {},
        dateFacets: {},
        categoryFacets: {},
      }}
  }
  /**
   * @param {Record<String, unknown>} store
   * @param {string} facetType
   * @param {{ label?: string; facetId: any; format?: Function;}} data
   */
  static registerFacetToStore(store, facetType, data) {
    if(store?.state[facetType][data.facetId]) {
      return;
    }
    store.state[facetType][data.facetId] = data;
  }

  /**
   * @param {Record<String, unknown>} store
   * @param {string} facetType
   */
  static getFromStore(store, facetType) {
    return store.state[facetType];
  }
}
