import {
  themeFromSourceColor,
  hexFromArgb,
  argbFromHex,
  Theme, // eslint-disable-next-line node/no-extraneous-import
} from '@material/material-color-utilities';

export type Color = number;

// https://github.com/material-foundation/material-color-utilities/issues/98#issuecomment-1535869882
export const getSurfaceProperties = (
  theme: Theme,
  dark: boolean
): {[key: string]: Color} =>
  dark
    ? {
        'surface-dim': theme.palettes.neutral.tone(6),
        'surface-bright': theme.palettes.neutral.tone(24),
        'surface-container-lowest': theme.palettes.neutral.tone(4),
        'surface-container-low': theme.palettes.neutral.tone(10),
        'surface-container': theme.palettes.neutral.tone(12),
        'surface-container-high': theme.palettes.neutral.tone(17),
        'surface-container-highest': theme.palettes.neutral.tone(22),
      }
    : {
        'surface-dim': theme.palettes.neutral.tone(87),
        'surface-bright': theme.palettes.neutral.tone(98),
        'surface-container-lowest': theme.palettes.neutral.tone(100),
        'surface-container-low': theme.palettes.neutral.tone(96),
        'surface-container': theme.palettes.neutral.tone(94),
        'surface-container-high': theme.palettes.neutral.tone(92),
        'surface-container-highest': theme.palettes.neutral.tone(90),
      };

export function getSchemeProperties(properties: object) {
  return Object.entries(properties).map(
    ([key, value]) =>
      `--md-sys-color-${key
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase()}: ${hexFromArgb(value)}`
  );
}

/**
 * Get the CSS properties from a single color using Material 3.
 * @param hex
 * @returns The CSS string with dark and light properties
 */
export function getThemeCSSProperties(hex: string) {
  const theme = themeFromSourceColor(argbFromHex(hex));
  const dark = getSchemeProperties({
    ...theme.schemes.dark.toJSON(),
    ...getSurfaceProperties(theme, true),
  });
  const light = getSchemeProperties({
    ...theme.schemes.light.toJSON(),
    ...getSurfaceProperties(theme, false),
  });

  return /* css */ `
@media (prefers-color-scheme: dark) {
  :root {
    ${dark.join(';\n    ')}
  }
}
:root[data-theme="dark"] {
  ${dark.join(';\n  ')}
}

@media (prefers-color-scheme: light) {
  :root {
    ${light.join(';\n    ')}
  }
}
:root[data-theme="light"] {
  ${light.join(';\n  ')}
}
`;
}
