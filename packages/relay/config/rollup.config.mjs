import typescript from "@rollup/plugin-typescript";

export default {
  input: "./src/relay.ts",
  output: [
    {
      file: "./lib/esm/relay.js",
      format: "esm",
    },
    {
      file: "./lib/esm/relay.mjs",
      format: "esm",
    },
  ],
  plugins: [typescript({ tsconfig: "./config/tsconfig.esm.json" })],
};
