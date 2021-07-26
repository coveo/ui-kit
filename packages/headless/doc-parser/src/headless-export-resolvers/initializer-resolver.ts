import {
  ApiEntryPoint,
  ApiFunction,
  ApiItem,
  ApiItemKind,
} from '@microsoft/api-extractor-model';
import {findApi} from '../api-finder';
import {resolveFunction} from '../function-resolver';

export function resolveInitializer(entry: ApiEntryPoint, name: string) {
  const fn = findInitializer(entry, name);
  return resolveFunction(entry, fn, [0]);
}

export function resolveEngineInitializer(entry: ApiEntryPoint, name: string) {
  const fn = findInitializer(entry, name);
  return resolveFunction(entry, fn, []);
}

function findInitializer(entry: ApiEntryPoint, name: string) {
  const fn = findApi(entry, name);

  if (!isFunction(fn)) {
    throw new Error(
      `initializer "${name}" must be a function. Instead found: ${fn.kind}`
    );
  }

  return fn;
}

function isFunction(item: ApiItem): item is ApiFunction {
  return item.kind === ApiItemKind.Function;
}
