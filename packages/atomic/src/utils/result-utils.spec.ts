import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless';
import {TestUtils} from '@coveo/headless';
import {Bindings} from '../components/search/atomic-search-interface/atomic-search-interface';
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
    const templates = [
      {in: 'abc', out: 'abc'},
      {in: '${title}bar', out: 'foobar'},
      {in: '${raw.source}', out: 'the source'},
      {in: '${uri}/abc', out: 'http://uri.foo.com/abc'},
      {in: '${window.location.hostname}', out: 'testing.stenciljs.com'},
    ];

    templates.forEach((template) =>
      expect(buildStringTemplateFromResult(template.in, result, bindings)).toBe(
        template.out
      )
    );
  });

  it('should snip out objects that cannot be evaluated properly and log a warning', () => {
    jest.spyOn(engine.logger, 'warn');
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
