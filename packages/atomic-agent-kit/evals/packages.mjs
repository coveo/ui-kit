import {execFileSync} from 'node:child_process';
import {cpSync, existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';

/**
 * Inserts the README's "Agent skill" section from the sources into the published README, where
 * the release that ships the kit will have it.
 */
function withAgentSkillSection(published, sources) {
  if (published.includes('### Agent skill')) {
    return published;
  }
  const [section] = /^### Agent skill\n[\s\S]*?(?=^## )/m.exec(sources) ?? [];
  if (!section) {
    throw new Error('The Atomic README in the sources has no "Agent skill" section');
  }
  const at = published.search(/^## Utilities/m);
  return at < 0
    ? `${published.trimEnd()}\n\n${section}`
    : `${published.slice(0, at)}${section}${published.slice(at)}`;
}

/**
 * The published `@coveo/atomic`, as a project installs it: once as released (`today`) and once
 * with the generated kit and its README section added, the way the POC ships them (`kit`).
 * Prepared once per output folder and reused.
 *
 * @param {string} outDir
 * @param {{kitDir: string, atomicRoot: string, version: string}} options
 */
export function preparePackages(outDir, {kitDir, atomicRoot, version}) {
  const base = path.join(outDir, 'packages');
  const today = path.join(base, 'today');
  const kit = path.join(base, 'kit');
  if (!existsSync(path.join(kit, 'package.json'))) {
    mkdirSync(path.join(base, 'extract'), {recursive: true});
    const npm = (args) => execFileSync('npm', args, {cwd: base, encoding: 'utf8'});
    const resolved =
      version === 'latest' ? npm(['view', '@coveo/atomic', 'version']).trim() : version;
    const [{filename}] = JSON.parse(
      npm(['pack', `@coveo/atomic@${resolved}`, '--pack-destination', base, '--json'])
    );
    execFileSync('tar', ['-xzf', path.join(base, filename), '-C', path.join(base, 'extract')]);
    cpSync(path.join(base, 'extract/package'), today, {recursive: true});
    cpSync(today, kit, {recursive: true});
    cpSync(kitDir, path.join(kit, 'dist/skills/coveo-atomic'), {recursive: true});
    writeFileSync(
      path.join(kit, 'README.md'),
      withAgentSkillSection(
        readFileSync(path.join(today, 'README.md'), 'utf8'),
        readFileSync(path.join(atomicRoot, 'README.md'), 'utf8')
      )
    );
  }
  return {
    today,
    kit,
    version: JSON.parse(readFileSync(path.join(today, 'package.json'), 'utf8')).version,
  };
}
