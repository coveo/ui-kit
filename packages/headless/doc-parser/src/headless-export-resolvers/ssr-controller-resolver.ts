import {
  ApiVariable,
  ApiEntryPoint,
  ApiItem,
} from '@microsoft/api-extractor-model';
import {findApi} from '../api-finder';

export interface SSRControllerConfiguration {
  initializer: string;
}

export interface SSRController {
  mirrorInitializer: string;
  definer: string;
}

export function resolveSSRController(
  entry: ApiEntryPoint,
  name: string
): SSRController {
  const fn = findSSR(entry, name);

  return {
    mirrorInitializer: extractNameOfSSR(name),
    definer: fn.name,
  };
}

function findSSR(entry: ApiEntryPoint, name: string) {
  const fn = findApi(entry, name);

  if (!isVariable(fn)) {
    throw new Error(
      `initializer "${name}" must be a function. Instead found: ${fn.kind}`
    );
  }
  return fn;
}

function isVariable(item: ApiItem): item is ApiVariable {
  return item.kind === 'Variable';
}

function extractNameOfSSR(initializerName: string): string {
  return 'build' + initializerName.substring('define'.length);
}
