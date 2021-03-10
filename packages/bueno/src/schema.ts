export interface SchemaValue<T> {
  validate(value: T): string | null;
  default: T | undefined;
  required: boolean;
}

export type SchemaDefinition<T extends object> = {
  [key in keyof T]: SchemaValue<T[key]>;
};

function buildSchemaValidationError(errors: string[], context: string) {
  const message = `
  The following properties are invalid:

    ${errors.join('\n\t')}
  
  ${context}
  `;

  return new SchemaValidationError(message);
}
export class SchemaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SchemaValidationError';
  }
}

function keysOf<T>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

function addDefinedEntries<T>(target: T, source: T): void {
  keysOf(source).forEach(
    (key) => source[key] !== undefined && (target[key] = source[key])
  );
}

export class Schema<Values extends object> {
  constructor(private definition: SchemaDefinition<Values>) {}

  public validate(values: Partial<Values> = {}, message = '') {
    const mergedValues: Partial<Values> = {};
    addDefinedEntries(mergedValues, this.default);
    addDefinedEntries(mergedValues, values);

    const errors: string[] = [];

    for (const property in this.definition) {
      const error = this.definition[property].validate(mergedValues[property]!);
      error && errors.push(`${property}: ${error}`);
    }

    if (errors.length) {
      throw buildSchemaValidationError(errors, message);
    }

    return mergedValues;
  }

  private get default() {
    const defaultValues: Partial<Values> = {};
    for (const property in this.definition) {
      const defaultValue = this.definition[property].default;
      if (defaultValue !== undefined) {
        defaultValues[property] = defaultValue;
      }
    }

    return defaultValues;
  }
}

type InferValuesFromSchema<T> = T extends Schema<infer P> ? P : never;

export type SchemaValues<
  Schema,
  RequiredValues extends keyof InferValuesFromSchema<Schema> = never
> = Partial<InferValuesFromSchema<Schema>> &
  Pick<InferValuesFromSchema<Schema>, RequiredValues>;
