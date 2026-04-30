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

/** @typedef {{period: string, unit: string, amount: number}} RelativeDate */

/**
 * @param {string} stringToFormat
 * @param {...(string|number)} formattingArguments
 * @returns {string}
 */
function formatString(stringToFormat, ...formattingArguments) {
  if (typeof stringToFormat !== 'string') {
    throw new Error("'stringToFormat' must be a String");
  }

  return stringToFormat.replace(/{{(\d+)}}/gm, (match, index) =>
    formattingArguments[index] === undefined
      ? ''
      : `${formattingArguments[index]}`
  );
}

/**
 * @param {number} count
 * @returns {boolean}
 */
function isSingular(count) {
  return new Intl.PluralRules(LOCALE).select(count) === 'one';
}

/**
 * Formats the date in the current locale.
 * @param {Date} date
 * @returns {string} The formatted date.
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat(LOCALE).format(date);
}

/**
 * Gets the short date pattern for the current locale.
 * @returns {string} The short date pattern.
 * @example `M/d/yyyy` for `en-US`, `d/M/yyyy` for `fr-FR`, etc.
 */
export function getShortDatePattern() {
  const date = new Date(2000, 2, 4); // month is zero-based
  const dateAsString = formatDate(date);

  const day = formatString(dayPattern);
  const month = formatString(monthPattern);
  const year = formatString(yearPattern);

  return dateAsString
    .replace('2000', year.repeat(4))
    .replace('00', year.repeat(2))
    .replace('03', month.repeat(2))
    .replace('3', month)
    .replace('04', day.repeat(2))
    .replace('4', day);
}

/**
 * Utility class for time-based calculations and formatting.
 * Provides methods to convert between different time units and format durations.
 */
export class TimeSpan {
  /**
   * @param {number} time
   * @param {boolean} [isMilliseconds=true]
   */
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

    /** @type {Record<string, string[]>} */
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
        isSingular(relativeDate.amount) ? this.singularIndex : this.pluralIndex
      ];

    return formatString(label, relativeDate.amount);
  }
}
