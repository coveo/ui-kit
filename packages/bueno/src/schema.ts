export interface SchemaValue<T> {
  validate(value: T): string | null;
  default: T | undefined;
}

export type SchemaDefinition<T extends object> = {
  [key in keyof T]: SchemaValue<T[key]>;
};

export class SchemaValidationError extends Error {
  constructor(errors: string[]) {
    super(
      `The following properties are invalid:${errors.map(
        (error) => `\n${error}`
      )}`
    );
    this.name = 'SchemaValidationError';
  }
}

export class Schema<Values extends object> {
  constructor(private definition: SchemaDefinition<Values>) {}

  public validate(values: Partial<Values> = {}) {
    const mergedValues = {
      ...this.default,
      ...values,
    };

    const errors: string[] = [];

    for (const property in this.definition) {
      const error = this.definition[property].validate(mergedValues[property]!);
      error && errors.push(`${property}: ${error}`);
    }

    if (errors.length) {
      throw new SchemaValidationError(errors);
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
