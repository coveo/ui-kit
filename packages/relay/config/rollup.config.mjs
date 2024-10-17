import replace from "@rollup/plugin-replace";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import { readFileSync } from "fs";

const getVersion = () => {
  const { version } = JSON.parse(
    readFileSync("./package.json", { encoding: "utf-8" })
  );
  return version;
};

const commonPlugins = (compilerOptions) => [
  typescript({
    tsconfig: "./config/tsconfig.base.json",
    compilerOptions,
  }),
  replace({
    preventAssignment: true,
    values: {
      "process.env.VERSION": getVersion(),
    },
  }),
];

const browser = {
  input: "./src/relay.ts",
  output: [
    {
      file: "./lib/relay.js",
      format: "esm",
    },
  ],
  plugins: [nodeResolve({ browser: true }), ...commonPlugins()],
};

const cdn = {
  input: "./src/relay.ts",
  output: [
    {
      sourcemap: true,
      file: "./lib/cdn/relay.min.js",
      format: "esm",
      plugins: [terser()],
    },
  ],
  plugins: [
    nodeResolve({ browser: true }),
    ...commonPlugins({
      declaration: false,
      outDir: "./lib/cdn",
      declarationDir: undefined,
      declarationMap: undefined,
    }),
  ],
};

const nodejs = {
  input: "./src/relay.ts",
  output: [
    {
      file: "./lib/relay.mjs",
      format: "esm",
    },
    {
      file: "./lib/relay.cjs",
      format: "cjs",
    },
  ],
  plugins: [nodeResolve({ exportConditions: ["node"] }), ...commonPlugins()],
};

export default [browser, cdn, nodejs];
