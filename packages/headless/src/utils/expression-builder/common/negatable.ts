export interface Negatable {
  negate?: boolean;
}

export function getNegationPrefix(config: Negatable) {
  return config.negate ? 'NOT ' : '';
}
