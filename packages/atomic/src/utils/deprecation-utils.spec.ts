import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {html, LitElement, type PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {describe, expect, it, vi} from 'vitest';
import {booleanConverter, createBooleanConverter} from '@/src/converters/boolean-converter';
import {
  DeprecatedPropertyWarnings,
  warnDeprecatedOnce,
  warnOnCommaSeparatedFieldList,
} from './deprecation-utils';

const buildLogger = () => ({warn: vi.fn()});

@customElement('test-deprecated-property-element')
class TestDeprecatedPropertyElement extends LitElement {
  @property({
    type: Boolean,
    attribute: 'old-flag',
    reflect: true,
    converter: booleanConverter,
  })
  oldFlag = true;

  logger?: ReturnType<typeof buildLogger>;

  private deprecatedPropertyWarnings = new DeprecatedPropertyWarnings(this, [
    {
      property: 'oldFlag',
      attribute: 'old-flag',
      defaultValue: true,
      instruction: 'Use `new-flag` instead.',
    },
  ]);

  willUpdate(changedProperties: PropertyValues) {
    super.willUpdate(changedProperties);
    this.deprecatedPropertyWarnings.track(changedProperties);
    this.deprecatedPropertyWarnings.warn(this.logger);
  }
}

@customElement('test-deprecated-false-element')
class TestDeprecatedFalseElement extends LitElement {
  @property({
    type: Boolean,
    attribute: 'opt-flag',
    reflect: true,
    converter: createBooleanConverter('disable-opt', {silent: true}),
  })
  optFlag = true;

  @property({
    type: Boolean,
    attribute: 'ignored-flag',
    reflect: true,
    converter: createBooleanConverter('disable-ignored', {ignoreFalse: true, silent: true}),
  })
  ignoredFlag = true;

  logger?: ReturnType<typeof buildLogger>;

  private deprecatedPropertyWarnings = new DeprecatedPropertyWarnings(this, [
    {
      property: 'optFlag',
      attribute: 'opt-flag',
      defaultValue: true,
      instruction: 'Use `disable-opt` instead of setting it to `false`.',
      onlyWhenFalse: true,
    },
    {
      property: 'ignoredFlag',
      attribute: 'ignored-flag',
      defaultValue: true,
      instruction: 'Use `disable-ignored` instead.',
      onlyWhenFalse: true,
    },
  ]);

  willUpdate(changedProperties: PropertyValues) {
    super.willUpdate(changedProperties);
    this.deprecatedPropertyWarnings.track(changedProperties);
    this.deprecatedPropertyWarnings.warn(this.logger);
  }
}

describe('deprecation-utils', () => {
  describe('#warnDeprecatedOnce', () => {
    it('should log a warning that names the API and what to do instead', () => {
      const logger = buildLogger();

      warnDeprecatedOnce(logger, '`foo`', 'Use `bar` instead.');

      expect(logger.warn).toHaveBeenCalledWith(
        '[Deprecated] `foo` is deprecated and will be removed in Atomic v4. Use `bar` instead.'
      );
    });

    it('should log the warning only once per logger and API', () => {
      const logger = buildLogger();

      warnDeprecatedOnce(logger, '`foo`', 'Use `bar` instead.');
      warnDeprecatedOnce(logger, '`foo`', 'Use `bar` instead.');

      expect(logger.warn).toHaveBeenCalledOnce();
    });

    it('should log once for each logger', () => {
      const firstLogger = buildLogger();
      const secondLogger = buildLogger();

      warnDeprecatedOnce(firstLogger, '`foo`', 'Use `bar` instead.');
      warnDeprecatedOnce(secondLogger, '`foo`', 'Use `bar` instead.');

      expect(firstLogger.warn).toHaveBeenCalledOnce();
      expect(secondLogger.warn).toHaveBeenCalledOnce();
    });
  });

  describe('DeprecatedPropertyWarnings', () => {
    const setupElement = async (
      template = html`<test-deprecated-property-element></test-deprecated-property-element>`
    ) => {
      const element = await fixture<TestDeprecatedPropertyElement>(template);
      const logger = buildLogger();
      element.logger = logger;
      element.requestUpdate();
      await element.updateComplete;
      return {element, logger};
    };

    it('should not log a warning when the property keeps its default value', async () => {
      const {logger} = await setupElement();

      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('should log a warning when the attribute is set', async () => {
      const {logger} = await setupElement(
        html`<test-deprecated-property-element old-flag="false"></test-deprecated-property-element>`
      );

      expect(logger.warn).toHaveBeenCalledExactlyOnceWith(
        '[Deprecated] The `old-flag` property of `test-deprecated-property-element` is deprecated and will be removed in Atomic v4. Use `new-flag` instead.'
      );
    });

    it('should log a warning when the attribute is set to its default value', async () => {
      const {logger} = await setupElement(
        html`<test-deprecated-property-element old-flag></test-deprecated-property-element>`
      );

      expect(logger.warn).toHaveBeenCalledOnce();
    });

    it('should log a warning when the property is set after the first update', async () => {
      const {element, logger} = await setupElement();

      element.oldFlag = false;
      await element.updateComplete;

      expect(logger.warn).toHaveBeenCalledOnce();
    });

    it('should log a warning when the property is set before the element is first updated', async () => {
      const element = document.createElement(
        'test-deprecated-property-element'
      ) as TestDeprecatedPropertyElement;
      const logger = buildLogger();
      element.logger = logger;
      element.oldFlag = false;

      document.body.appendChild(element);
      await element.updateComplete;

      expect(logger.warn).toHaveBeenCalledOnce();
      element.remove();
    });

    it('should log the warning once, even when the property changes again', async () => {
      const {element, logger} = await setupElement(
        html`<test-deprecated-property-element old-flag="false"></test-deprecated-property-element>`
      );

      element.oldFlag = true;
      await element.updateComplete;
      element.oldFlag = false;
      await element.updateComplete;

      expect(logger.warn).toHaveBeenCalledOnce();
    });

    it('should wait for a logger before logging the warning', async () => {
      const element = await fixture<TestDeprecatedPropertyElement>(
        html`<test-deprecated-property-element old-flag="false"></test-deprecated-property-element>`
      );
      const logger = buildLogger();

      element.logger = logger;
      element.requestUpdate();
      await element.updateComplete;

      expect(logger.warn).toHaveBeenCalledOnce();
    });
  });

  describe('DeprecatedPropertyWarnings with #onlyWhenFalse', () => {
    const setupElement = async (template: ReturnType<typeof html>) => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const element = await fixture<TestDeprecatedFalseElement>(template);
      const logger = buildLogger();
      element.logger = logger;
      element.requestUpdate();
      await element.updateComplete;
      return {element, logger, consoleWarn};
    };

    it('should not log a warning when the attribute is present without a value', async () => {
      const {logger} = await setupElement(
        html`<test-deprecated-false-element opt-flag ignored-flag></test-deprecated-false-element>`
      );

      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('should log a warning once when the attribute is set to "false"', async () => {
      const {element, logger} = await setupElement(
        html`<test-deprecated-false-element opt-flag="false"></test-deprecated-false-element>`
      );
      element.requestUpdate();
      await element.updateComplete;

      expect(logger.warn).toHaveBeenCalledExactlyOnceWith(
        '[Deprecated] The `opt-flag` property of `test-deprecated-false-element` is deprecated and will be removed in Atomic v4. Use `disable-opt` instead of setting it to `false`.'
      );
    });

    it('should log a warning when the property is set to false', async () => {
      const {element, logger} = await setupElement(
        html`<test-deprecated-false-element></test-deprecated-false-element>`
      );

      element.optFlag = false;
      await element.updateComplete;

      expect(logger.warn).toHaveBeenCalledOnce();
    });

    it('should log a warning when an ignored "false" attribute keeps the property true', async () => {
      const {element, logger} = await setupElement(
        html`<test-deprecated-false-element ignored-flag="false"></test-deprecated-false-element>`
      );

      expect(element.ignoredFlag).toBe(true);
      expect(logger.warn).toHaveBeenCalledExactlyOnceWith(
        expect.stringContaining('The `ignored-flag` property')
      );
    });

    it('should not log a console warning from the silent converters', async () => {
      const {consoleWarn} = await setupElement(
        html`<test-deprecated-false-element
          opt-flag="false"
          ignored-flag="false"
        ></test-deprecated-false-element>`
      );

      expect(consoleWarn).not.toHaveBeenCalled();
    });
  });

  describe('#warnOnCommaSeparatedFieldList', () => {
    const attribute = 'fields-to-include-in-citations';

    const buildHost = (attributeValue?: string) => {
      const host = document.createElement('test-host');
      if (attributeValue !== undefined) {
        host.setAttribute(attribute, attributeValue);
      }
      return host;
    };

    it('should log a warning when the property is a comma-separated string', () => {
      const logger = buildLogger();

      warnOnCommaSeparatedFieldList(buildHost(), logger, attribute, 'fieldA,fieldB');

      expect(logger.warn).toHaveBeenCalledExactlyOnceWith(
        '[Deprecated] A comma-separated `fields-to-include-in-citations` value on `test-host` is deprecated and will be removed in Atomic v4. Pass an array of strings instead, for example `fields-to-include-in-citations=\'["fieldA","fieldB"]\'`.'
      );
    });

    it('should log a warning when the property is a stringified JSON array', () => {
      const logger = buildLogger();

      warnOnCommaSeparatedFieldList(buildHost(), logger, attribute, '["fieldA","fieldB"]');

      expect(logger.warn).toHaveBeenCalledExactlyOnceWith(
        expect.stringContaining(
          '[Deprecated] A string `fields-to-include-in-citations` property value on `test-host`'
        )
      );
    });

    it('should log a warning when the attribute is a comma-separated string', () => {
      const logger = buildLogger();

      warnOnCommaSeparatedFieldList(buildHost('fieldA,fieldB'), logger, attribute, [
        'fieldA',
        'fieldB',
      ]);

      expect(logger.warn).toHaveBeenCalledOnce();
    });

    it('should not log a warning when the attribute is a JSON array', () => {
      const logger = buildLogger();

      warnOnCommaSeparatedFieldList(buildHost('["fieldA","fieldB"]'), logger, attribute, [
        'fieldA',
        'fieldB',
      ]);

      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('should not log a warning when the property is an array', () => {
      const logger = buildLogger();

      warnOnCommaSeparatedFieldList(buildHost(), logger, attribute, ['fieldA']);

      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('should not log a warning when there is no value', () => {
      const logger = buildLogger();

      warnOnCommaSeparatedFieldList(buildHost(), logger, attribute, undefined);

      expect(logger.warn).not.toHaveBeenCalled();
    });
  });
});
