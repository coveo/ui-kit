import LOCALE from '@salesforce/i18n/locale';

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
      this.isResolved = false
      this.resolve = (value) => {
        resolve(value);
        this.isResolved = true;
      }
      this.reject = reject;
    });
  }
}

export class I18nUtils{
  static isPluralInLocale = {
    "en-US": (count) => count !== 0 && Math.abs(count) !== 1,
    "fr-CA": (count) => Math.abs(count) >= 2
  }

  static getTextWithDecorator(text, startTag, endTag) {
    return `${startTag}${text}${endTag}`;
  }

  static getTextBold(text) {
    return I18nUtils.getTextWithDecorator(text, '<b>', '</b>');
  }

  static getLabelNameWithCount(labelName, count) {
    if (count === 0) {
      return `${labelName}_zero`;
    } else if (I18nUtils.isPluralInLocale[LOCALE](count)) {
      return `${labelName}_plural`;
    } 
    return labelName;
  }
  
  static format(stringToFormat, ...formattingArguments) {
    if (typeof stringToFormat !== 'string') throw new Error('\'stringToFormat\' must be a String');
    return stringToFormat.replace(/{{(\d+)}}/gm, (match, index) =>
      (formattingArguments[index] === undefined ? '' : `${formattingArguments[index]}`));
  }
}