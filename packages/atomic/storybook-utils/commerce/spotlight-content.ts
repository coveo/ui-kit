import {ResultType, type SpotlightContent} from '@coveo/headless/commerce';

type SampleSpotlightContent = Omit<SpotlightContent, 'position' | 'responseId'>;

const bannerImage = (label: string, background: string, width: number, height: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${background}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="${Math.round(height / 8)}" fill="#ffffff">${label}</text></svg>`
  )}`;

export const sampleSpotlightContents: SampleSpotlightContent[] = [
  {
    id: 'spotlight-summer-sale',
    clickUri: 'https://example.com/summer-sale',
    desktopImage: bannerImage('Summer sale', '#1372ec', 600, 600),
    mobileImage: bannerImage('Summer sale', '#1372ec', 600, 300),
    name: 'Summer sale',
    nameFontColor: '#1372ec',
    description: 'Up to 40% off on selected swimwear.',
    altText: 'Summer sale banner',
    resultType: ResultType.SPOTLIGHT,
  },
  {
    id: 'spotlight-new-arrivals',
    clickUri: 'https://example.com/new-arrivals',
    desktopImage: bannerImage('New arrivals', '#0b8457', 600, 600),
    name: 'New arrivals',
    nameFontColor: '#0b8457',
    description: 'Discover the latest gear for the season.',
    descriptionFontColor: '#4b5563',
    altText: 'New arrivals banner',
    resultType: ResultType.SPOTLIGHT,
  },
];

/**
 * Request transformer for the commerce search and listing mock endpoints that inserts sample
 * Spotlight Content in `results` when the request opts in with `enableResults`.
 *
 * Requests that do not opt in are left untouched, so it is safe to register at module scope.
 */
export const spotlightContentTransformer =
  (positions: number[] = [1, 6]) =>
  <T extends {results: unknown[]}>(body: unknown, response: T): T => {
    if (!(body as {enableResults?: boolean} | null)?.enableResults) {
      return response;
    }
    const results = [...response.results];
    positions.forEach((position, index) => {
      const spotlightContent = sampleSpotlightContents[index % sampleSpotlightContents.length];
      results.splice(Math.min(position, results.length), 0, spotlightContent);
    });
    return {...response, results};
  };
