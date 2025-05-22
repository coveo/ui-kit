import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
  Raw,
  Result,
} from '@coveo/headless';
import {vi, describe, it, expect} from 'vitest';
import {Bindings} from '../components/search/atomic-search-interface/atomic-search-interface';
import {buildStringTemplateFromResult} from './result-utils';

describe('buildStringTemplateFromResult', () => {
  const mockRaw = {source: 'the source'} as Raw;
  const mockResult = {
    title: 'foo',
    uri: 'http://uri.foo.com',
    raw: mockRaw,
  } as Result;
  const engine = buildSearchEngine({
    configuration: getSampleSearchEngineConfiguration(),
  });
  const bindings = {engine} as Bindings;

  it('should create string templates', () => {
    const templates = [
      {in: 'abc', out: 'abc'},
      {in: '${title}bar', out: 'foobar'},
      {in: '${raw.source}', out: 'the source'},
      {in: '${uri}/abc', out: 'http://uri.foo.com/abc'},
      {in: '${window.location.hostname}', out: 'localhost'},
    ];

    templates.forEach((template) =>
      expect(
        buildStringTemplateFromResult(template.in, mockResult, bindings)
      ).toBe(template.out)
    );
  });

  it('should snip out objects that cannot be evaluated properly and log a warning', () => {
    const warnSpy = vi
      .spyOn(engine.logger, 'warn')
      .mockImplementation(() => {});
    expect(
      buildStringTemplateFromResult(
        '${title}/${raw.notafield}',
        mockResult,
        bindings
      )
    ).toBe('foo/');
    expect(warnSpy).toHaveBeenCalled();
  });
});
