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

function validHEXColor(color) {
  const regex = /^#([0-9a-f]{3}){1,2}$/i;
  return regex.test(color);
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

export {invalidRGBValues, HEXToRGB, validHEXColor};
