import {isArray} from '@coveo/bueno';

export function possiblyWarnOnBadFieldType(
  field: string,
  itemValueRaw: unknown,
  host: HTMLElement,
  logger: Pick<Console, 'error'>
) {
  if (isArray(itemValueRaw)) {
    logger.error(
      `${host.nodeName.toLowerCase()} cannot be used with multi value field "${field}" with values "${itemValueRaw}".`,
      host
    );
  }
}
