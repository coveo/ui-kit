import { Octokit } from "@octokit/rest";
import fs from "fs";
import path from "path";

const github = new Octokit({ auth: process.env.GITHUB_TOKEN });

const owner = "coveo";
const repo = "doc_jekyll-public-site";
const event_type = "published_relay_to_npm";

async function notify() {
  const relay_version = getRelayPackageVersion();
  const client_payload = { relay_version };

  return github.repos.createDispatchEvent({
    owner,
    repo,
    event_type,
    client_payload,
  });
}

function getRelayPackageVersion() {
  const packagePath = path.join("packages", "relay", "package.json");
  const packageFile = fs.readFileSync(packagePath, "utf8");
  const packageJson = JSON.parse(packageFile);
  return packageJson.version;
}

async function main() {
  try {
    await notify();
    console.log("notification sent to docs repo");
  } catch (e) {
    const { status, message, request } = e;
    console.error("notification failed to send to docs repo", status, message);
    console.log(request);
    process.exit(1);
  }
}

main();
