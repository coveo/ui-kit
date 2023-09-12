import {SearchParameters} from '@coveo/headless';
import {ReadonlyURLSearchParams} from 'next/navigation';

export type NextJSServerSideSearchParams = Record<
  string,
  string | string[] | undefined
>;

export function stringifyNextJSSearchParams(
  searchParams: NextJSServerSideSearchParams
) {
  const urlSearchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      value.forEach((childValue) => urlSearchParams.append(key, childValue));
    } else {
      urlSearchParams.append(key, value ?? '');
    }
  }
  return urlSearchParams.toString();
}
