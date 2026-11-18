import type {PropertyValues, ReactiveElement} from 'lit';

interface DeprecationLogger {
  warn(message: string): void;
}

/**
 * A deprecated reactive property to watch for.
 */
export interface DeprecatedProperty {
  /**
   * The name of the property on the component class.
   */
  property: string;
  /**
   * The name of the attribute that the property is bound to.
   */
  attribute: string;
  /**
   * The default value of the property.
   */
  defaultValue: unknown;
  /**
   * What to do instead, as a full sentence.
   */
  instruction: string;
}

const warnedApisByLogger = new WeakMap<DeprecationLogger, Set<string>>();

/**
 * Logs a deprecation warning through the engine logger the first time a deprecated API is used with that engine, so
 * that components rendered once per result don't log it once per result.
 *
 * @param logger - The logger of the engine the component is bound to.
 * @param api - The name of the deprecated API, including the component tag.
 * @param instruction - What to do instead, as a full sentence.
 */
export function warnDeprecatedOnce(logger: DeprecationLogger, api: string, instruction: string) {
  let warnedApis = warnedApisByLogger.get(logger);
  if (!warnedApis) {
    warnedApis = new Set();
    warnedApisByLogger.set(logger, warnedApis);
  }

  if (warnedApis.has(api)) {
    return;
  }

  warnedApis.add(api);
  logger.warn(`[Deprecated] ${api} is deprecated and will be removed in Atomic v4. ${instruction}`);
}

/**
 * Tracks whether deprecated properties of a component were set by the user, and logs a deprecation warning for each
 * of them once an engine logger is available.
 *
 * Before the first update, a property counts as set when its attribute is present or its value differs from its
 * default. After the first update, it counts as set whenever it changes. The attribute is checked only before the
 * first update because properties declared with `reflect: true` write their default value back to the attribute.
 */
export class DeprecatedPropertyWarnings {
  private readonly setProperties = new Set<DeprecatedProperty>();

  constructor(
    private readonly host: ReactiveElement,
    private readonly properties: DeprecatedProperty[]
  ) {}

  /**
   * Records the deprecated properties that the user set. Call from `willUpdate`.
   */
  public track(changedProperties: PropertyValues) {
    for (const deprecatedProperty of this.properties) {
      const {property, attribute, defaultValue} = deprecatedProperty;
      const isSet = this.host.hasUpdated
        ? changedProperties.has(property)
        : this.host.hasAttribute(attribute) ||
          (this.host as unknown as Record<string, unknown>)[property] !== defaultValue;

      if (isSet) {
        this.setProperties.add(deprecatedProperty);
      }
    }
  }

  /**
   * Logs a deprecation warning for each deprecated property the user set, once per engine.
   */
  public warn(logger: DeprecationLogger | undefined) {
    if (!logger) {
      return;
    }

    const tagName = this.host.tagName.toLowerCase();
    for (const {attribute, instruction} of this.setProperties) {
      warnDeprecatedOnce(logger, `The \`${attribute}\` property of \`${tagName}\``, instruction);
    }
  }
}

/**
 * Logs a deprecation warning, once per engine, when a field list property receives a string instead of an array: a
 * comma-separated value, through its attribute or as a property value, or a stringified JSON array set as a property
 * value, which the component splits on commas.
 */
export function warnOnCommaSeparatedFieldList(
  host: HTMLElement,
  logger: DeprecationLogger | undefined,
  attribute: string,
  value: unknown
) {
  if (!logger) {
    return;
  }

  const isStringProperty = typeof value === 'string';
  const rawValue = (isStringProperty ? value : host.getAttribute(attribute))?.trim();
  if (!rawValue) {
    return;
  }

  if (rawValue.startsWith('[')) {
    if (isStringProperty) {
      warnDeprecatedOnce(
        logger,
        `A string \`${attribute}\` property value on \`${host.tagName.toLowerCase()}\``,
        'Set the property to an array of strings instead, for example `["fieldA", "fieldB"]`.'
      );
    }
    return;
  }

  warnDeprecatedOnce(
    logger,
    `A comma-separated \`${attribute}\` value on \`${host.tagName.toLowerCase()}\``,
    `Pass an array of strings instead, for example \`${attribute}='["fieldA","fieldB"]'\`.`
  );
}
