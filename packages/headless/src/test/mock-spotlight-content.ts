import type {
  BaseSpotlightContent,
  SpotlightContent,
} from '../api/commerce/common/result.js';
import {ResultType} from '../api/commerce/common/result.js';

export function buildMockBaseSpotlightContent(
  config: Partial<BaseSpotlightContent> = {}
): BaseSpotlightContent {
  return {
    clickUri: 'https://example.com/spotlight',
    desktopImage: 'https://example.com/desktop.jpg',
    mobileImage: 'https://example.com/mobile.jpg',
    name: 'Spotlight Content',
    description: 'A spotlight description',
    resultType: ResultType.SPOTLIGHT,
    ...config,
  };
}

export function buildMockSpotlightContent(
  config: Partial<SpotlightContent> = {}
): SpotlightContent {
  const {position, ...baseSpotlightContentConfig} = config;
  return {
    ...buildMockBaseSpotlightContent(baseSpotlightContentConfig),
    position: position ?? 1,
  };
}
