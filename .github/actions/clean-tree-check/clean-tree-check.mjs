import { promisify } from "util";
import { exec as cbExec } from "child_process";

const exec = promisify(cbExec);

const checkCleanTree = async () => {
  const { stdout } = await exec("git status --porcelain");

  if (stdout != "") {
    console.log(
      `\x1b[31m Working tree unclean, please commit or stash these files:`,
    );
    console.log(stdout);
    process.exit(1);
  }
};

checkCleanTree();
