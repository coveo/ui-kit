import type {ComplexAttributeConverter} from 'lit';

export const arrayConverter: ComplexAttributeConverter<string[]> = {
  fromAttribute: (value: string | null): string[] => {
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      console.warn(
        `Failed to parse the array attribute value: ${value}. Ensure the value is a valid JSON array.`
      );
      return [];
    }
  },
  toAttribute: (value: string[]) => JSON.stringify(value),
};
