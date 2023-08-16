import { promisify } from "util";
import { exec as syncExec } from "child_process";

const npmLogin = async () => {
  const exec = promisify(syncExec);
  const npmToken = process.env.NPM_TOKEN;

  tokenCheck(npmToken, "npm token is missing.");

  const npmrc = `//registry.npmjs.org/:_authToken=${npmToken}`;
  await exec(`echo ${npmrc} > ~/.npmrc`);
};

const tokenCheck = (value, message) => {
  if (value) {
    return;
  }
  throw new Error(message);
};

npmLogin();
