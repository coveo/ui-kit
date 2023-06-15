const baseConfig = require("../../../.prettierrc.js");

/** @type {import('prettier').Config} */
module.exports = {
  ...baseConfig,
  importOrder: [
    "^server-only$",
    "^(?!\\.|\\/|@\\/).",
    "^@/",
    "^/",
    "^\\.\\.\\/",
    "^\\.\\/",
  ],
};
