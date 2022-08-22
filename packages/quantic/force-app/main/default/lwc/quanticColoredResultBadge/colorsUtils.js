/**
 * Indicates whether the RGB values are invalid.
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {boolean}
 */
function invalidRGBValues(r, g, b) {
  if (isNaN(r) || r < 0 || r > 255) return true;
  if (isNaN(g) || g < 0 || g > 255) return true;
  if (isNaN(b) || b < 0 || b > 255) return true;
  return false;
}

/**
 * Converts a Hex color value to RGB.
 * @param {string} color the Hex color value.
 * @returns {{r: number, g: number, b: number}}
 */
function HEXToRGB(color) {
  let redHex, greenHex, blueHex;
  if (color[0] === '#') {
    color = color.slice(1);
  }

  if (color.length === 3) {
    redHex = color[0] + color[0];
    greenHex = color[1] + color[1];
    blueHex = color[2] + color[2];
  } else if (color.length === 6) {
    redHex = color.substring(0, 2);
    greenHex = color.substring(2, 4);
    blueHex = color.substring(4, 6);
  }

  const r = parseInt(redHex, 16);
  const g = parseInt(greenHex, 16);
  const b = parseInt(blueHex, 16);
  return {
    r,
    g,
    b,
  };
}

/**
 * Converts an RGB color value to HSL.
 * Adapted from https://css-tricks.com/converting-color-spaces-in-javascript/#aa-rgb-to-hsl.
 * @returns {{h: number, s: number, l: number}}
 */
function RGBToHSL(r, g, b) {
  let h, s, l;
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  l = (max + min) / 2;

  if (delta === 0) {
    h = 0;
  } else {
    // eslint-disable-next-line default-case
    switch (max) {
      case r:
        h = ((g - b) / delta) % 6;
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      case b:
        h = (r - g) / delta + 4;
        break;
    }
  }

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return { h, s, l };
}

export { invalidRGBValues, RGBToHSL, HEXToRGB };
