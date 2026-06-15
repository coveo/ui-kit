import replace from "@rollup/plugin-replace";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import packageJSON from "../package.json" with { type: "json" };

const commonPlugins = (compilerOptions) => [
  typescript({
    tsconfig: "./config/tsconfig.base.json",
    compilerOptions,
  }),
  replace({
    preventAssignment: true,
    values: {
      "process.env.VERSION": packageJSON.version,
    },
  }),
];

const externalizeProductionDependencies = () => {
  return {
    name: "externalize-production-dependencies",
    resolveId(id) {
      return id in packageJSON.dependencies ? { id, external: true } : null;
    },
  };
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

const npm = {
  input: "./src/relay.ts",
  output: [
    {
      file: "./lib/npm/relay.mjs",
      format: "esm",
    },
    {
      file: "./lib/npm/relay.cjs",
      format: "cjs",
    },
  ],
  plugins: [...commonPlugins(), externalizeProductionDependencies()],
};

export default [cdn, npm];
