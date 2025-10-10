import {isUndefined} from '@coveo/bueno';
import {Fragment, FunctionalComponent, VNode, h} from '@stencil/core';
import {possiblyWarnOnBadFieldType} from './field-warning';

interface ItemTextProps<T> {
  logger: Pick<Console, 'error'>;
  host: HTMLElement;
  defaultValue: string | undefined;
  field: string;
  item: T;
  getProperty: (result: T, property: string) => unknown;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const ItemTextFallback = <T,>(
  {field, host, logger, defaultValue, item, getProperty}: ItemTextProps<T>,
  children: VNode[]
): FunctionalComponent<ItemTextProps<T>> | null => {
  const raw = getProperty(item, field);
  possiblyWarnOnBadFieldType(field, raw, host, logger);

  if (isUndefined(defaultValue)) {
    host.remove();
    return null;
  } else {
    return <Fragment>{children}</Fragment>;
  }
};
