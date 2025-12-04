export function camelToKebab(value: string) {
  return value.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

export function kebabToCamel(value: string) {
  return value.replace(/-./g, (segment) => segment.charAt(1).toUpperCase());
}

export function snakeToCamel(value: string) {
  return value
    .toLowerCase()
    .replace(/([_][a-z])/g, (group) => group.toUpperCase().replace('_', ''));
}

export function titleToKebab(value: string) {
  return value.replace(/\s/g, '-').toLowerCase();
}
