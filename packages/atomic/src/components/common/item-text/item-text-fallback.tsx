import {isUndefined} from '@coveo/bueno';
import {Fragment, FunctionalComponent, h} from '@stencil/core';
import {possiblyWarnOnBadFieldType} from './field-warning';

export interface ItemTextProps {
  logger: Pick<Console, 'error'>;
  host: HTMLElement;
  defaultValue: string | undefined;
  itemValueRaw: unknown;
  field: string;
}

export const ItemTextFallback: FunctionalComponent<ItemTextProps> = (
  {field, host, logger, defaultValue, itemValueRaw},
  children
) => {
  possiblyWarnOnBadFieldType(field, itemValueRaw, host, logger);

  if (isUndefined(defaultValue)) {
    host.remove();
    return null;
  } else {
    return <Fragment>{children}</Fragment>;
  }
};
