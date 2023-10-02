import { exec } from "child_process";
import { readFileSync } from "fs";

const getRelayMajorVersion = async () => {
  const { version } = JSON.parse(
    readFileSync("./packages/relay/package.json", {
      encoding: "utf-8",
    })
  );

  const [major] = version.split(".");

  return major;
};

const deploy = async () => {
  const relayMajor = await getRelayMajorVersion(exec);

  exec(
    `deployment-package package create --resolve COMMIT_HASH=${process.env.COMMIT_HASH} --resolve RELAY_MAJOR_VERSION=${relayMajor} --with-deploy`
  );
};

deploy();
