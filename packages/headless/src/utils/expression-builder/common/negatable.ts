export interface Negatable {
  /**
   * If `true`, the inverse expression will be created.
   */
  negate?: boolean;
}

export function getNegationPrefix(config: Negatable) {
  return config.negate ? 'NOT ' : '';
}
