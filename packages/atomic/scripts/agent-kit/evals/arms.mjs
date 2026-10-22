import {cpSync, mkdirSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
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
export function renderDocsIndex(kitDir, docsPath) {
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
 * The contexts under evaluation. Each prepares a fresh workspace before the agent runs in it.
 */
export const ARMS = {
  none: {
    description: 'no context: the model and the prompt',
    prepare() {},
  },
  skill: {
    description: 'the generated skill as a project skill (.claude/skills/coveo-atomic)',
    prepare(workspace, kitDir) {
      cpSync(kitDir, path.join(workspace, '.claude/skills/coveo-atomic'), {recursive: true});
    },
  },
  index: {
    description: 'an AGENTS.md docs index pointing at the reference pages (docs/coveo-atomic)',
    prepare(workspace, kitDir) {
      const docsPath = 'docs/coveo-atomic';
      cpSync(path.join(kitDir, 'references'), path.join(workspace, docsPath), {recursive: true});
      mkdirSync(workspace, {recursive: true});
      writeFileSync(path.join(workspace, 'AGENTS.md'), renderDocsIndex(kitDir, docsPath));
    },
  },
};
