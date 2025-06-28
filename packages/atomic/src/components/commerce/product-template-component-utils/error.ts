export class FieldValueIsNaNError extends Error {
  constructor(field: string, value?: {}) {
    super(`Could not parse "${value}" from field "${field}" as a number.`);
    this.name = 'FieldValueIsNaNError';
  }
}
