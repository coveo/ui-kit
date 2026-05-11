import { exec as syncExec } from "child_process";
import { readFileSync } from "fs";
import { promisify } from "util";
import { versionCompare } from "./helpers/versions.mjs";

const exec = promisify(syncExec);

const updateNpmTag = async () => {
  const { name, version } = JSON.parse(
    readFileSync("./package.json", { encoding: "utf-8" }),
  );
  const tag = process.argv[2];
  const latestVersion = await getLatestVersion(name);

  if (versionCompare(version, latestVersion) < 1) {
    console.info(
      `skipping tag update for ${name} because version "${version}" is smaller or equal than the latest version "${latestVersion}"`,
    );
    return;
  }

  console.info(`updating ${name}@${version} to ${tag}`);
  await exec(`npm dist-tag add ${name}@${version} ${tag}`);
};

const getLatestVersion = async (packageName) => {
  const { stdout } = await exec(`npm view ${packageName} version`);
  return stdout.trim();
};

updateNpmTag();
