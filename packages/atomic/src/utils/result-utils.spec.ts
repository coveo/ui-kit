import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless';
import {TestUtils} from '@coveo/headless';
import {Bindings} from './initialization-utils';
import {buildStringTemplateFromResult} from './result-utils';

describe('buildStringTemplateFromResult', () => {
  const engine = buildSearchEngine({
    configuration: getSampleSearchEngineConfiguration(),
  });
  const bindings = {engine} as Bindings;
  const result = TestUtils.buildMockResult({
    title: 'foo',
    uri: 'http://uri.foo.com',
    raw: {
      ...TestUtils.buildMockResult().raw,
      source: 'the source',
    },
  });

  it('should create string templates', () => {
    expect(buildStringTemplateFromResult('abc', result, bindings)).toBe('abc');
    expect(buildStringTemplateFromResult('${title}bar', result, bindings)).toBe(
      'foobar'
    );
    expect(
      buildStringTemplateFromResult('${raw.source}', result, bindings)
    ).toBe('the source');
    expect(buildStringTemplateFromResult('${uri}/abc', result, bindings)).toBe(
      'http://uri.foo.com/abc'
    );

    expect(
      buildStringTemplateFromResult(
        '${window.location.hostname}',
        result,
        bindings
      )
    ).toBe('testing.stenciljs.com');
  });

  it('should snip out objects that cannot be evaluated properly and log a warning', () => {
    spyOn(engine.logger, 'warn');
    expect(
      buildStringTemplateFromResult(
        '${title}/${raw.notafield}',
        result,
        bindings
      )
    ).toBe('foo/');
    expect(engine.logger.warn).toHaveBeenCalled();
  });
});
