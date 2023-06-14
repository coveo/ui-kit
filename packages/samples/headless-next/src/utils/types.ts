import {ReadonlyURLSearchParams} from 'next/navigation';
import {ReactElement} from 'react';

export type AnySearchParams = URLSearchParams | ReadonlyURLSearchParams;
export type NextParams = Record<string, string | string[]>;
export type NextServerSideSearchParams = Record<string, string | string[]>;

export interface NextPageDefinition {
  (url: {params: NextParams; searchParams: NextServerSideSearchParams}):
    | ReactElement<any, any>
    | Promise<ReactElement<any, any> | null>
    | null;
}
