const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

const COLORS = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  brightCyan: '\x1b[96m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
};

function colorize(text, ...codes) {
  return `${codes.join('')}${text}${RESET}`;
}

function createColorFn(color) {
  const fn = (text) => colorize(text, color);
  fn.bold = (text) => colorize(text, BOLD, color);
  return fn;
}

const colors = {
  red: createColorFn(COLORS.red),
  green: createColorFn(COLORS.green),
  yellow: createColorFn(COLORS.yellow),
  blue: createColorFn(COLORS.blue),
  magenta: createColorFn(COLORS.magenta),
  cyan: createColorFn(COLORS.cyan),
  gray: createColorFn(COLORS.gray),
  cyanBright: createColorFn(COLORS.brightCyan),
  bgRed: createColorFn(COLORS.bgRed),
  bgGreen: createColorFn(COLORS.bgGreen),
  bold: {
    blue: (text) => colorize(text, BOLD, COLORS.blue),
  },
};

export default colors;
