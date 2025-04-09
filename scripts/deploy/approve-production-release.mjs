import {Octokit} from 'octokit';

const productionEnvironments = [
  'NPM Production',
  'Docs Production',
  'Quantic Production',

  // TODO KIT-3074: uncomment
  // 'GitHub Production',
];

const octokit = new Octokit({
  auth: process.env.GITHUB_INSTALLATION_TOKEN,
});

await Promise.allSettled(
  productionEnvironments.map((environment_name) =>
    octokit.request(
      `POST /repos/coveo/ui-kit/actions/runs/${process.argv[2]}/deployment_protection_rule`,
      {
        state: 'approved',
        environment_name,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    )
  )
);
