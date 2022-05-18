import {Result} from '@coveo/headless';
import {VNode} from '@stencil/core';

export type UpdateInstantResultsCallback = (prev: Result[]) => Result[];

export type InstantResultItem = {
  onChange(q: string): void;
  renderItem(result: Result): VNode | HTMLElement;
};

export type RegisterInstantResultsEvent = CustomEvent<
  (
    searchBoxId: string,
    updateResults: (cb: UpdateInstantResultsCallback) => void
  ) => InstantResultItem
>;
