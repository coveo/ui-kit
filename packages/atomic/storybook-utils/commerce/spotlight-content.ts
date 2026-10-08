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
    desktopImage: '',
    name: 'New arrivals',
    nameFontColor: '#0b8457',
    description: 'Discover the latest gear for the season.',
    descriptionFontColor: '#4b5563',
    resultType: ResultType.SPOTLIGHT,
  },
];

interface PaginatedRequest {
  enableResults?: boolean;
  page?: number;
  perPage?: number;
}

interface PaginatedResponse {
  results: unknown[];
  pagination: {
    page: number;
    perPage: number;
    totalEntries: number;
    totalPages: number;
  };
}

/**
 * Request transformer for the commerce search and listing mock endpoints that inserts sample
 * Spotlight Content in `results` when the request opts in with `enableResults`.
 *
 * It follows the Commerce API contract: `perPage` and `totalEntries` count products and Spotlight
 * Content together, so a Spotlight Content pushes the next product onto the following page.
 * The mock products are treated as a catalog of `pagination.totalEntries` products, cycling
 * through the products of the base response.
 *
 * Requests that do not opt in are left untouched, so it is safe to register at module scope.
 *
 * @param positions - The 0-based indexes of the Spotlight Content across all pages.
 */
export const spotlightContentTransformer =
  (positions: number[] = [1, 6]) =>
  <T extends PaginatedResponse>(body: unknown, response: T): T => {
    const request = (body ?? {}) as PaginatedRequest;
    if (!request.enableResults || response.results.length === 0) {
      return response;
    }

    const totalProducts = response.pagination.totalEntries;
    const spotlightPositions = [...new Set(positions)]
      .sort((a, b) => a - b)
      .filter((position, index) => position <= totalProducts + index);
    const totalSpotlightContent = spotlightPositions.length;
    const totalEntries = totalProducts + totalSpotlightContent;
    const page = request.page ?? response.pagination.page;
    const perPage = request.perPage ?? response.pagination.perPage;
    const pageStart = page * perPage;
    const pageEnd = Math.min(pageStart + perPage, totalEntries);

    const results: unknown[] = [];
    for (let index = pageStart; index < pageEnd; index++) {
      const spotlightIndex = spotlightPositions.indexOf(index);
      if (spotlightIndex !== -1) {
        results.push(sampleSpotlightContents[spotlightIndex % sampleSpotlightContents.length]);
        continue;
      }
      const precedingSpotlights = spotlightPositions.filter((position) => position < index).length;
      const productIndex = index - precedingSpotlights;
      results.push(response.results[productIndex % response.results.length]);
    }

    return {
      ...response,
      results,
      pagination: {
        ...response.pagination,
        page,
        perPage,
        totalEntries,
        totalPages: Math.ceil(totalEntries / Math.max(perPage, 1)),
        totalProducts,
        totalSpotlightContent,
      },
    };
  };

/**
 * Story `play` helper that sets `enable-spotlight-content` on the `atomic-commerce-interface` before it initializes.
 */
export const enableSpotlightContent = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}): Promise<void> => {
  await customElements.whenDefined('atomic-commerce-interface');
  canvasElement
    .querySelector('atomic-commerce-interface')!
    .setAttribute('enable-spotlight-content', '');
};
