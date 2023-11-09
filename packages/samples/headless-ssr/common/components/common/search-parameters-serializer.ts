import {
  buildSearchParameterSerializer,
  type SearchParameters,
} from '@coveo/headless/ssr';
import {ReadonlyURLSearchParams} from 'next/navigation';

export type NextJSServerSideSearchParams = Record<
  string,
  string | string[] | undefined
>;

// TODO: rework
// const searchStateKey = 'search-state';

export class CoveoNextJsSearchParametersSerializer {
  public static fromServerSideUrlSearchParams(
    serverSideUrlSearchParams: NextJSServerSideSearchParams
  ): CoveoNextJsSearchParametersSerializer {
    // for (const param in serverSideUrlSearchParams) {
    //   // TODO: filter out non coveo search param
    // }
    return new CoveoNextJsSearchParametersSerializer({
      ...serverSideUrlSearchParams,
    });
  }

  public static fromClientSideUrlSearchParams(
    clientSideUrlSearchParams: URLSearchParams | ReadonlyURLSearchParams
  ) {
    // if (clientSideUrlSearchParams.getAll(searchStateKey).length < 1) {
    // TODO: do something
    //   return new CoveoNextJsSearchParametersSerializer({});
    // }
    const res: Record<string, string> = {}; // TODO: remove any
    clientSideUrlSearchParams.forEach((value, key) => {
      res[key] = value;
    });

    return new CoveoNextJsSearchParametersSerializer(res);
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
    Object.entries(this.coveoSearchParameters).forEach(([key, value]) =>
      this.applyToUrlSearchParam(urlSearchParams, key, value)
    );
  }

  public get fragment(): string {
    return buildSearchParameterSerializer().serialize(
      this.coveoSearchParameters
    );
  }

  private applyToUrlSearchParam(
    urlSearchParams: URLSearchParams,
    key: string, // TODO: better type
    value: string // TODO: better type
  ) {
    if (!Object.keys(this.coveoSearchParameters).length) {
      urlSearchParams.delete(key);
      return;
    }

    if (value) {
      // TODO: serialize facet value
      urlSearchParams.set(key, value);
    }
  }
}
