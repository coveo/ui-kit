import { gitSetupUser } from "@coveo/semantic-monorepo-tools";

const setupGit = async () => {
  const GIT_USERNAME = "developer-experience-bot[bot]";
  const GIT_EMAIL =
    "91079284+developer-experience-bot[bot]@users.noreply.github.com";

  await gitSetupUser(GIT_USERNAME, GIT_EMAIL);
};

setupGit();
