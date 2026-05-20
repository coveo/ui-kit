import {RequestContributor} from './endpoint-facade-types.js';

export const buildRequest = <TRequest extends object>(
  contributors: Array<RequestContributor<TRequest>>
): TRequest => {
  return contributors.reduce<TRequest>((request, contribute) => {
    const fragment = contribute();
    return {
      ...request,
      ...fragment,
    };
  }, {} as TRequest);
};
