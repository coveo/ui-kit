import {SearchParameters} from '@coveo/headless/ssr';
import {ReadonlyURLSearchParams} from 'next/navigation';

export type NextJSServerSideSearchParams = Record<
  string,
  string | string[] | undefined
>;

const searchStateKey = 'search-state';

export class CoveoNextJsSearchParametersSerializer {
  public static fromServerSideUrlSearchParams(
    serverSideUrlSearchParams: NextJSServerSideSearchParams
  ): CoveoNextJsSearchParametersSerializer {
    if (!(searchStateKey in serverSideUrlSearchParams)) {
      return new CoveoNextJsSearchParametersSerializer({});
    }
    const stringifiedSearchParameters =
      serverSideUrlSearchParams[searchStateKey];
    if (
      !stringifiedSearchParameters ||
      Array.isArray(stringifiedSearchParameters)
    ) {
      return new CoveoNextJsSearchParametersSerializer({});
    }
    return new CoveoNextJsSearchParametersSerializer(
      JSON.parse(stringifiedSearchParameters)
    );
  }

  public static fromClientSideUrlSearchParams(
    clientSideUrlSearchParams: URLSearchParams | ReadonlyURLSearchParams
  ) {
    if (clientSideUrlSearchParams.getAll(searchStateKey).length !== 1) {
      return new CoveoNextJsSearchParametersSerializer({});
    }
    return new CoveoNextJsSearchParametersSerializer(
      JSON.parse(clientSideUrlSearchParams.get(searchStateKey)!)
    );
  }

  public static fromCoveoSearchParameters(
    coveoSearchParameters: SearchParameters
  ) {
    return new CoveoNextJsSearchParametersSerializer(coveoSearchParameters);
  }

  private constructor(
    public readonly coveoSearchParameters: SearchParameters
  ) {}

  public applyToUrlSearchParams(urlSearchParams: URLSearchParams) {
    if (!Object.keys(this.coveoSearchParameters).length) {
      urlSearchParams.delete(searchStateKey);
      return;
    }
    urlSearchParams.set(
      searchStateKey,
      JSON.stringify(this.coveoSearchParameters)
    );
  }
}
