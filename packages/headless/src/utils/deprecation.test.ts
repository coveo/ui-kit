import {createAction} from '@reduxjs/toolkit';
import {pino} from 'pino';
import {warnDeprecatedOnce, withDeprecationWarning} from './deprecation.js';

describe('deprecation', () => {
  function buildLogger() {
    const logger = pino({level: 'silent'});
    vi.spyOn(logger, 'warn');
    return logger;
  }

  describe('#warnDeprecatedOnce', () => {
    it('logs a warning that names the API and what to do instead', () => {
      const logger = buildLogger();

      warnDeprecatedOnce(logger, '`foo`', 'Use `bar` instead.');

      expect(logger.warn).toHaveBeenCalledWith(
        '[Deprecated] `foo` is deprecated and will be removed in Headless v4. Use `bar` instead.'
      );
    });

    it('logs the warning only once per logger and API', () => {
      const logger = buildLogger();

      warnDeprecatedOnce(logger, '`foo`', 'Use `bar` instead.');
      warnDeprecatedOnce(logger, '`foo`', 'Use `bar` instead.');

      expect(logger.warn).toHaveBeenCalledOnce();
    });

    it('logs once for each API', () => {
      const logger = buildLogger();

      warnDeprecatedOnce(logger, '`foo`', 'Use `bar` instead.');
      warnDeprecatedOnce(logger, '`baz`', 'Use `qux` instead.');

      expect(logger.warn).toHaveBeenCalledTimes(2);
    });

    it('logs once for each logger', () => {
      const firstLogger = buildLogger();
      const secondLogger = buildLogger();

      warnDeprecatedOnce(firstLogger, '`foo`', 'Use `bar` instead.');
      warnDeprecatedOnce(secondLogger, '`foo`', 'Use `bar` instead.');

      expect(firstLogger.warn).toHaveBeenCalledOnce();
      expect(secondLogger.warn).toHaveBeenCalledOnce();
    });

    it('logs once for each key when a key is given', () => {
      const key = {};

      warnDeprecatedOnce(buildLogger(), '`foo`', 'Use `bar` instead.', key);
      const secondLogger = buildLogger();
      warnDeprecatedOnce(secondLogger, '`foo`', 'Use `bar` instead.', key);

      expect(secondLogger.warn).not.toHaveBeenCalled();
    });
  });

  describe('#withDeprecationWarning', () => {
    const actionCreator = createAction<string>('test/action');

    it('returns the action of the wrapped action creator', () => {
      const wrapped = withDeprecationWarning(buildLogger(), actionCreator, '`foo`', 'Do this.');

      expect(wrapped('payload')).toEqual(actionCreator('payload'));
    });

    it('keeps the #type and #match members of the wrapped action creator', () => {
      const wrapped = withDeprecationWarning(buildLogger(), actionCreator, '`foo`', 'Do this.');

      expect(wrapped.type).toBe('test/action');
      expect(wrapped.match(actionCreator('payload'))).toBe(true);
    });

    it('logs a warning when called', () => {
      const logger = buildLogger();
      const wrapped = withDeprecationWarning(logger, actionCreator, '`foo`', 'Do this.');

      wrapped('payload');

      expect(logger.warn).toHaveBeenCalledOnce();
    });

    it('does not log a warning before it is called', () => {
      const logger = buildLogger();

      withDeprecationWarning(logger, actionCreator, '`foo`', 'Do this.');

      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('does not log a warning when #isDeprecatedUsage returns false', () => {
      const logger = buildLogger();
      const wrapped = withDeprecationWarning(
        logger,
        actionCreator,
        '`foo`',
        'Do this.',
        (payload) => payload === 'deprecated'
      );

      wrapped('payload');

      expect(logger.warn).not.toHaveBeenCalled();
    });
  });
});
