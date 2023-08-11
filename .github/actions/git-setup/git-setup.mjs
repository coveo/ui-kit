import {
  gitSetupSshRemote,
  gitSetupUser,
} from "@coveo/semantic-monorepo-tools";

const REPO_OWNER = "coveo";
const REPO_NAME = "relay";

const setupGit = async () => {
  const GIT_USERNAME = "developer-experience-bot[bot]";
  const GIT_EMAIL =
    "91079284+developer-experience-bot[bot]@users.noreply.github.com";
  const GIT_SSH_REMOTE = "DEPLOY_KEY";
  const DEPLOY_KEY = process.env.DEPLOY_KEY;

  if (DEPLOY_KEY === undefined) {
    throw new error("deploy key is undefined");
  }

  await gitSetupSshRemote(REPO_OWNER, REPO_NAME, DEPLOY_KEY, GIT_SSH_REMOTE);
  await gitSetupUser(GIT_USERNAME, GIT_EMAIL);
};

setupGit();
