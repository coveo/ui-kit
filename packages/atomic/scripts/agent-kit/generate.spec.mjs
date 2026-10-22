import {beforeAll, describe, expect, it} from 'vitest';
import {AREAS, convertUsageDoc, generateKit, readInputs} from './generate.mjs';
import {attributesOf, listElements} from './manifest.mjs';
import {createCatalog, extractSnippets, validateHtml} from './snippets.mjs';
import {analyzeAtomic} from './testing/analyze.mjs';

describe('the agent kit', () => {
  let manifest;
  let elements;
  let inputs;
  let files;

  beforeAll(async () => {
    manifest = await analyzeAtomic();
    elements = listElements(manifest);
    inputs = {...readInputs(), manifest};
    files = generateKit(inputs);
  });

  it('should have one page per component, one per area, and the skill', () => {
    const paths = [...files.keys()];
    const componentPages = paths.filter((path) => path.startsWith('references/components/'));
    expect(componentPages.length).toBe(elements.length);
    for (const area of Object.keys(AREAS)) {
      expect(paths).toContain(`references/${area}.md`);
    }
    expect(paths).toContain('SKILL.md');
  });

  it('should describe the skill in valid frontmatter, briefly', () => {
    const skill = files.get('SKILL.md');
    const [, frontmatter] = /^---\n([\s\S]*?)\n---\n/.exec(skill);
    expect(frontmatter).toMatch(/^name: coveo-atomic$/m);
    const [, description] = /^description: (.+)$/m.exec(frontmatter);
    expect(description.length).toBeLessThanOrEqual(1024);
    expect(frontmatter).toContain(`version: '${inputs.version}'`);
    expect(skill).not.toContain('{{');
    expect(skill.length).toBeLessThan(12_000);
  });

  it('should list every component on its area page', () => {
    for (const element of elements) {
      expect(files.get(`references/${element.area}.md`)).toContain(
        `[\`<${element.tagName}>\`](components/${element.tagName}.md)`
      );
    }
  });

  it('should carry the usage snippets of every public component verbatim', () => {
    const publicTags = new Set(elements.map((element) => element.tagName));
    const documented = [...inputs.usageDocs].filter(([tag]) => publicTags.has(tag));
    expect(documented.length).toBeGreaterThan(100);
    for (const [tag, doc] of documented) {
      const page = files.get(`references/components/${tag}.md`);
      for (const snippet of extractSnippets(doc)) {
        expect(page).toContain(snippet.code);
      }
    }
  });

  it('should document every attribute of every component', () => {
    for (const element of elements) {
      const page = files.get(`references/components/${element.tagName}.md`);
      for (const attribute of attributesOf(element)) {
        expect(page, `${element.tagName} documents ${attribute.name}`).toContain(
          `| \`${attribute.name}\` |`
        );
      }
    }
  });

  it('should only show markup that Atomic accepts, in every page', () => {
    const catalog = createCatalog(manifest);
    const problems = [];
    for (const [path, text] of files) {
      for (const snippet of extractSnippets(text).filter((s) => s.lang === 'html')) {
        for (const {line, message} of validateHtml(snippet.code, catalog)) {
          problems.push(`${path}:${snippet.line + line} ${message}`);
        }
      }
    }
    expect(problems).toEqual([]);
  });
});

describe('convertUsageDoc', () => {
  it('should drop the imports, inline the shared notes and nest the headings', () => {
    const markdown = [
      "import Note from '@/storybook-utils/documentation/note.mdx';",
      '',
      'Intro.',
      '',
      '## Options',
      '',
      '<Note />',
      '',
      '### Details',
    ].join('\n');
    expect(convertUsageDoc(markdown, {Note: 'The note.\n'})).toBe(
      ['Intro.', '', '### Options', '', 'The note.', '', '#### Details'].join('\n')
    );
  });

  it('should leave headings that already start at the third level', () => {
    expect(convertUsageDoc('### Options\n\nText.\n\n#### Details', {})).toBe(
      '### Options\n\nText.\n\n#### Details'
    );
  });
});
