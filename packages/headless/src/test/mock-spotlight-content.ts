import {
  ResultType,
  type SpotlightContent,
} from '../api/commerce/common/result.js';

export function buildMockSpotlightContent(
  config: Partial<SpotlightContent> = {}
): SpotlightContent {
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
