import {memoize} from '@/src/utils/memoize';

class IconFetchError extends Error {
  static fromStatusCode(url: string, statusCode: number, statusText: string) {
    return new IconFetchError(url, `status code ${statusCode} (${statusText})`);
  }

  static fromError(url: string, error: unknown) {
    return new IconFetchError(url, 'an error', error);
  }

  private constructor(
    public readonly url: string,
    errorMessage: string,
    public readonly errorObject?: unknown
  ) {
    super(`Could not fetch icon from ${url}, got ${errorMessage}.`);
  }
}

const fetchIconUnmemoized = async (url: string) =>
  fetch(url)
    .catch((e) => {
      throw IconFetchError.fromError(url, e);
    })
    .then((response) => {
      if (response.status !== 200 && response.status !== 304) {
        throw IconFetchError.fromStatusCode(
          url,
          response.status,
          response.statusText
        );
      }
      return response.text();
    });

const memoizedFetchIcon = memoize(fetchIconUnmemoized, (url: string) => url, {
  maxEntries: 20,
});

export const fetchIcon = memoizedFetchIcon.fn;

export function clearIconCache() {
  memoizedFetchIcon.clearCache();
}
