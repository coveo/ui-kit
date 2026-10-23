import {spawnSync} from 'node:child_process';
import {cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';

const truncate = (text, length) =>
  text.length <= length ? text : `${text.slice(0, length - 1).trimEnd()}…`;

/**
 * An AGENTS.md that points at the reference pages without the skill's prose: the docs-index
 * pattern, where the agent is told what to read before writing markup.
 *
 * @param {string} kitDir The generated kit
 * @param {string} docsPath Where the pages live in the workspace
 */
function renderDocsIndex(kitDir, docsPath) {
  const referencesDir = path.join(kitDir, 'references');
  const areas = readdirSync(referencesDir)
    .filter((name) => name.endsWith('.md'))
    .map((name) => ({
      area: path.basename(name, '.md'),
      text: readFileSync(path.join(referencesDir, name), 'utf8'),
    }));
  const sections = areas.map(({area, text}) => {
    const [, title] = /^# (.+) components$/m.exec(text);
    const rows = [...text.matchAll(/^\| \[`<([a-z0-9-]+)>`\]\([^)]+\) \| (.*) \|$/gm)].map(
      ([, tag, description]) =>
        `- \`${docsPath}/components/${tag}.md\`: ${truncate(description.replaceAll('\\|', '|'), 80)}`
    );
    return [`### ${title} (\`${docsPath}/${area}.md\`: page skeleton)`, '', ...rows].join('\n');
  });
  return [
    '# Coveo Atomic',
    '',
    `This project uses the Coveo Atomic web components (\`atomic-*\` elements). The documentation of the version in use is in \`${docsPath}/\`. Before writing markup, read the page of the area you are building (its page skeleton) and the page of every component you use; they list the attributes, slots and rules each one accepts.`,
    '',
    '## Documentation index',
    '',
    ...sections.flatMap((section) => [section, '']),
  ].join('\n');
}

/**
 * The block a project's AGENTS.md would carry: where the reference of the installed version is.
 */
const POINTER = [
  '<!-- BEGIN coveo-atomic -->',
  'This project uses Coveo Atomic (`@coveo/atomic`). The reference for the installed version ships in `node_modules/@coveo/atomic/dist/skills/coveo-atomic/`. Before writing or changing Atomic markup, read `SKILL.md` there, then the pages it links for the components you use.',
  '<!-- END coveo-atomic -->',
].join('\n');

const SKILLS_CLI = 'skills@1.7.4';

/**
 * A project that depends on `@coveo/atomic`, with the given package installed in node_modules.
 */
function prepareProject(workspace, packageDir) {
  const {version} = JSON.parse(readFileSync(path.join(packageDir, 'package.json'), 'utf8'));
  const manifest = {
    name: 'search-page',
    private: true,
    dependencies: {'@coveo/atomic': `^${version}`},
  };
  writeFileSync(path.join(workspace, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  cpSync(packageDir, path.join(workspace, 'node_modules/@coveo/atomic'), {recursive: true});
}

/**
 * Installs the kit the way the README tells users to, with telemetry off.
 */
function installWithSkillsCli(workspace) {
  const result = spawnSync(
    'npx',
    [
      '-y',
      SKILLS_CLI,
      'add',
      './node_modules/@coveo/atomic/dist/skills/coveo-atomic',
      '-a',
      'claude-code',
      '-y',
    ],
    {
      cwd: workspace,
      encoding: 'utf8',
      env: {...process.env, DISABLE_TELEMETRY: '1', DO_NOT_TRACK: '1'},
    }
  );
  if (
    result.status !== 0 ||
    !existsSync(path.join(workspace, '.claude/skills/coveo-atomic/SKILL.md'))
  ) {
    throw new Error(
      `${SKILLS_CLI} failed in ${workspace}: ${`${result.stdout}${result.stderr}`.slice(-500)}`
    );
  }
}

/**
 * The contexts under evaluation. Each prepares a fresh workspace before the agent runs in it.
 * `prompt` picks the preamble: `named` names Atomic and its CDN URLs, `neutral` only says to use
 * the library the project depends on. `web` lets the agent search and fetch web pages.
 */
export const ARMS = {
  none: {
    description: 'no context: the model and the prompt',
    prompt: 'named',
    web: false,
    prepare() {},
  },
  skill: {
    description: 'the kit copied to .claude/skills/coveo-atomic',
    prompt: 'named',
    web: false,
    prepare(workspace, {kitDir}) {
      cpSync(kitDir, path.join(workspace, '.claude/skills/coveo-atomic'), {recursive: true});
    },
  },
  index: {
    description: 'an AGENTS.md docs index pointing at the reference pages (docs/coveo-atomic)',
    prompt: 'named',
    web: false,
    prepare(workspace, {kitDir}) {
      const docsPath = 'docs/coveo-atomic';
      cpSync(path.join(kitDir, 'references'), path.join(workspace, docsPath), {recursive: true});
      mkdirSync(workspace, {recursive: true});
      writeFileSync(path.join(workspace, 'AGENTS.md'), renderDocsIndex(kitDir, docsPath));
    },
  },
  web: {
    description: 'no context, with web search and fetch',
    prompt: 'named',
    web: true,
    prepare() {},
  },
  'project-today': {
    description: '@coveo/atomic as published, installed in a project',
    prompt: 'neutral',
    web: false,
    prepare(workspace, {packages}) {
      prepareProject(workspace, packages.today);
    },
  },
  project: {
    description: 'the same project, with the kit inside the installed package',
    prompt: 'neutral',
    web: false,
    prepare(workspace, {packages}) {
      prepareProject(workspace, packages.kit);
    },
  },
  pointer: {
    description: 'the same, plus an AGENTS.md pointer to the kit',
    prompt: 'neutral',
    web: false,
    prepare(workspace, {packages}) {
      prepareProject(workspace, packages.kit);
      writeFileSync(path.join(workspace, 'AGENTS.md'), `${POINTER}\n`);
    },
  },
  'skill-cli': {
    description: 'the same, with the kit installed by `npx skills add` from node_modules',
    prompt: 'neutral',
    web: false,
    prepare(workspace, {packages}) {
      prepareProject(workspace, packages.kit);
      installWithSkillsCli(workspace);
    },
  },
};
