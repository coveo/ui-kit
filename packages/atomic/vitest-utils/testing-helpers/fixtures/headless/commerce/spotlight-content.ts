import {ResultType, type SpotlightContent} from '@coveo/headless/commerce';

export const buildFakeSpotlightContent = (
  spotlightContent?: Partial<SpotlightContent>
): SpotlightContent =>
  ({
    id: 'spotlight-id',
    clickUri: 'https://example.com/spotlight',
    desktopImage: 'https://example.com/desktop.jpg',
    mobileImage: 'https://example.com/mobile.jpg',
    name: 'Spotlight name',
    nameFontColor: '#ff0000',
    description: 'Spotlight description',
    descriptionFontColor: '#00ff00',
    altText: 'Spotlight alt text',
    position: 1,
    resultType: ResultType.SPOTLIGHT,
    ...spotlightContent,
  }) satisfies SpotlightContent;
