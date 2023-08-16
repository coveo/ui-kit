import {
  describeNpmTag,
  getCurrentBranchName,
  pnpmPublish,
} from "@coveo/semantic-monorepo-tools";
import { readFileSync } from "fs";
import { versionCompare } from "./helpers/versions.mjs";

const publishNpm = async () => {
  try {
    const tag = process.argv[2];
    const refBranchName = await getCurrentBranchName();
    const { version } = JSON.parse(
      readFileSync("./package.json", { encoding: "utf-8" })
    );
    const currentTagVersion = await describeNpmTag("@coveo/relay", tag);
    console.info(
      `@coveo/relay current ${tag} version is ${currentTagVersion} and the package version is ${version}`
    );

    if (versionCompare(version, currentTagVersion) >= 1) {
      await pnpmPublish(undefined, tag, refBranchName);
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

publishNpm();
