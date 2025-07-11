import {isUndefined} from '@coveo/bueno';
import {html, nothing} from 'lit';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils.js';
import {possiblyWarnOnBadFieldType} from './field-warning.js';

export interface ItemTextProps<T> {
  logger: Pick<Console, 'error'>;
  host: HTMLElement;
  defaultValue: string | undefined;
  field: string;
  item: T;
  getProperty: (result: T, property: string) => unknown;
}

export const renderItemTextFallback: FunctionalComponentWithChildren<
  ItemTextProps<unknown>
> =
  ({props}) =>
  (children) => {
    const {getProperty, item, field, host, logger, defaultValue} = props;
    const raw = getProperty(item, field);
    possiblyWarnOnBadFieldType(field, raw, host, logger);

    if (isUndefined(defaultValue)) {
      host.remove();
      return nothing;
    } else {
      return html`${children}`;
    }
  };
