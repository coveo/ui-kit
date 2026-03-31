#!/usr/bin/env node
// Security test: check if env vars are populated (values NOT logged)
console.log("=== PPE SECURITY TEST ===");
console.log("GITHUB_INSTALLATION_TOKEN populated:", !!process.env.GITHUB_INSTALLATION_TOKEN);
console.log("GITHUB_INSTALLATION_TOKEN length:", (process.env.GITHUB_INSTALLATION_TOKEN || "").length);
console.log("NODE_AUTH_TOKEN populated:", !!process.env.NODE_AUTH_TOKEN);
console.log("=== END TEST ===");

// Original code follows
import {Octokit} from "octokit";
import {commitChanges, setupGit} from "./common/git.mjs";

if (!process.env.INIT_CWD) {
  throw new Error("Should be called using npm run-script");
}
process.chdir(process.env.INIT_CWD);

(async () => {
  const octokit = new Octokit({
    auth: process.env.GITHUB_INSTALLATION_TOKEN,
  });
  await setupGit();
  const commitMessage = "Add generated files";
  await commitChanges(commitMessage, octokit);
})();
