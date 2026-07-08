import {computed, Signal} from '@angular/core';
import type {BoundProperty} from '@a2ui/angular/v0_9';

/**
 * Creates a computed signal that reads a typed value from A2UI props.
 * Use in catalog components to extract bound property values cleanly.
 *
 * @example
 * readonly heading = prop(this.props, 'heading', '');
 * readonly products = prop(this.props, 'products', [] as ProductRecord[]);
 */
export function prop<T>(
  propsSignal: () => Record<string, BoundProperty>,
  key: string,
  fallback: T
): Signal<T> {
  return computed(() => {
    const p = propsSignal()[key];
    if (!p) return fallback;
    const val = (p.value as Signal<unknown>)();
    return (val as T) ?? fallback;
  });
}
