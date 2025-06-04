import {isUndefined} from '@coveo/bueno';
import {html, TemplateResult, nothing} from 'lit';
import {possiblyWarnOnBadFieldType} from './field-warning.js';

export interface ItemTextProps<T> {
  logger: Pick<Console, 'error'>;
  host: HTMLElement;
  defaultValue: string | undefined;
  field: string;
  item: T;
  getProperty: (result: T, property: string) => unknown;
}

export const ItemTextFallback = <T>(
  {field, host, logger, defaultValue, item, getProperty}: ItemTextProps<T>,
  children: TemplateResult | TemplateResult[]
): TemplateResult | typeof nothing | null => {
  const raw = getProperty(item, field);
  possiblyWarnOnBadFieldType(field, raw, host, logger);

  if (isUndefined(defaultValue)) {
    host.remove();
    return null;
  } else {
    return html`${children}`;
  }
};
