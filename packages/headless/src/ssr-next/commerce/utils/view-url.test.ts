import {describe, expect, it} from 'vitest';
import {buildMockNavigatorContext} from '../../../test/mock-navigator-context.js';
import type {CommonBuildConfig} from '../types/build.js';
import {withDefaultViewUrl} from './view-url.js';

describe('#withDefaultViewUrl', () => {
  const context = {language: 'en', country: 'US', currency: 'USD' as const};

  it('should use the navigator context location as the view URL when none is set', () => {
    const buildConfig: CommonBuildConfig = {
      navigatorContext: buildMockNavigatorContext({location: 'https://example.com/search?q=shoes'}),
      context,
    };

    const resolved = withDefaultViewUrl(buildConfig);

    expect(resolved.context.view).toEqual({url: 'https://example.com/search?q=shoes'});
    expect(resolved.context).toEqual(expect.objectContaining(context));
  });

  it('should keep an explicit view URL', () => {
    const buildConfig: CommonBuildConfig = {
      navigatorContext: buildMockNavigatorContext({location: 'http://localhost:3000/search'}),
      context: {...context, view: {url: 'https://sports.barca.group/search'}},
    };

    const resolved = withDefaultViewUrl(buildConfig);

    expect(resolved).toBe(buildConfig);
    expect(resolved.context.view?.url).toBe('https://sports.barca.group/search');
  });

  it('should not mutate the build config it receives', () => {
    const buildConfig: CommonBuildConfig = {
      navigatorContext: buildMockNavigatorContext({location: 'https://example.com/search'}),
      context,
    };

    withDefaultViewUrl(buildConfig);

    expect(buildConfig.context).not.toHaveProperty('view');
  });

  it('should throw when neither the view URL nor the navigator context location is set', () => {
    const buildConfig: CommonBuildConfig = {
      navigatorContext: buildMockNavigatorContext({location: null}),
      context,
    };

    expect(() => withDefaultViewUrl(buildConfig)).toThrow(
      'The URL of the page is required: set it in `context.view.url`, or in `navigatorContext.location`'
    );
  });
});
