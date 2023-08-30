import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";
import { readFileSync } from "fs";

const getStringifyVersion = () => {
  const { version } = JSON.parse(
    readFileSync("./package.json", { encoding: "utf-8" })
  );
  return JSON.stringify(version);
};

export default {
  input: "./src/relay.ts",
  output: [
    {
      file: "./lib/relay.js",
      format: "esm",
    },
    {
      file: "./lib/relay.mjs",
      format: "esm",
    },
    {
      file: "./lib/relay.cjs",
      format: "cjs",
    },
  ],
  plugins: [
    typescript({ tsconfig: "./config/tsconfig.base.json" }),
    replace({
      preventAssignment: true,
      values: {
        "process.env.VERSION": getStringifyVersion(),
      },
    }),
  ],
};
