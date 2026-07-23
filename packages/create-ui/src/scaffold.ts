import {mkdir, mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {setRunContext} from './crash-report.js';
import {downloadTemplate, TemplateVersionUnavailableError} from './download.js';
import {ExpectedError} from './errors.js';
import {isEmptyOrMissing} from './fs-utils.js';
import {log} from './log.js';
import {buildProjectMetadata} from './metadata.js';
import {promptProjectName, selectTemplate} from './prompt.js';
import {readSampleMetadata, writeProvenance} from './provenance.js';
import {
  installDependencies,
  moveToTarget,
  rewritePackageJson,
} from './setup.js';
import {getTemplate, getTemplates, type Template} from './templates.js';
import {getPackageManager} from './utils.js';

/** The parsed CLI arguments the scaffold module needs to resolve its inputs. */
export interface CliArgs {
  projectName?: string;
  template?: string;
  templateVersion?: string;
  docs: boolean;
}

/** Fully-resolved inputs — everything `scaffold` needs, with nothing left to prompt for. */
export interface ScaffoldOptions {
  template: Template;
  projectName: string;
  version?: string;
}

export function unavailableTemplateMessage(
  templateName: string,
  version?: string
): string {
  return version
    ? `Template "${templateName}" version "${version}" is not available.`
    : `Template "${templateName}" is not available.`;
}

/**
 * Atomically claims the target directory. Returns true if this call created it
 * (so it is safe to remove on failure), or false if it already existed and is
 * empty (pre-existing — must not be deleted). Throws if it exists and is not
 * empty. A single `mkdir` avoids the check-then-create TOCTOU race.
 */
async function claimTargetDir(targetDir: string): Promise<boolean> {
  const firstCreated = await mkdir(targetDir, {recursive: true});
  if (firstCreated !== undefined) {
    return true;
  }
  if (!(await isEmptyOrMissing(targetDir))) {
    throw new ExpectedError(
      `Target directory "${targetDir}" already exists and is not empty.`
    );
  }
  return false;
}

/** Downloads, resolves, finalizes, and installs the chosen template. */
export async function scaffold({
  template,
  projectName,
  version,
}: ScaffoldOptions): Promise<void> {
  const targetDir = resolve(process.cwd(), projectName);
  setRunContext({
    template: template.name,
    templateVersion: version,
    targetDir,
    projectName,
  });
  const tempDir = await mkdtemp(join(tmpdir(), 'create-ui-'));
  let createdTargetDir = false;

  try {
    const versionSuffix = version ? ` (${version})` : '';
    log.step(`Downloading the "${template.name}" template${versionSuffix}…`);
    const sampleDir = await downloadTemplate({
      packageName: template.packageName,
      destDir: tempDir,
      version,
    });

    const {templateVersion, dependencies} = await readSampleMetadata(sampleDir);
    const metadata = buildProjectMetadata({
      template: template.name,
      templateVersion,
      dependencies,
    });

    log.step(`Creating project in ${targetDir}…`);
    createdTargetDir = await claimTargetDir(targetDir);
    await rewritePackageJson(sampleDir, projectName);
    await moveToTarget(sampleDir, targetDir);
    await writeProvenance(targetDir, metadata);
  } catch (error) {
    if (createdTargetDir) {
      await rm(targetDir, {recursive: true, force: true});
    }
    if (error instanceof TemplateVersionUnavailableError) {
      log.note(
        `Check available templates:  npm create @coveo/ui -- --help\n` +
          `Open an issue:              https://github.com/coveo/ui-kit/issues\n` +
          `Coveo community:            https://connect.coveo.com`,
        'Need help?'
      );
      throw new ExpectedError(
        unavailableTemplateMessage(template.name, error.version)
      );
    }
    throw error;
  } finally {
    await rm(tempDir, {recursive: true, force: true});
  }

  const pm = getPackageManager();
  log.step(`Installing dependencies with ${pm}…`);
  const installed = installDependencies(targetDir);

  log.step('Done!');
  log.info(`\n  cd ${projectName}`);
  if (!installed) {
    log.warn(`Dependency installation failed — run "${pm} install" manually.`);
  }
  log.info(`  ${pm} run dev\n`);
}

/**
 * Resolves the template from an explicit `--template` value (validated) or,
 * when omitted, the interactive selector. Returns null when an explicit value
 * is unknown.
 */
async function resolveTemplate(
  templateArg: string | undefined
): Promise<Template | null> {
  if (templateArg === undefined) {
    return selectTemplate();
  }
  const found = getTemplate(templateArg);
  if (found) {
    return found;
  }
  log.error(`Unknown template "${templateArg}".`);
  log.info(
    `\nAvailable templates:\n${getTemplates()
      .map((t) => `  ${t.name}`)
      .join('\n')}`
  );
  log.note(
    `Run with --help to see all templates:\n` +
      `  npm create @coveo/ui -- --help`,
    'Tip'
  );
  return null;
}

/**
 * The single interactive phase: turns parsed args into a fully-resolved options
 * object, validating flags and prompting for anything missing.
 * Returns null when validation fails so the caller can exit non-zero.
 */
export async function resolveInputs(
  args: CliArgs
): Promise<ScaffoldOptions | null> {
  const template = await resolveTemplate(args.template);
  if (!template) {
    return null;
  }

  const projectName = args.projectName ?? (await promptProjectName());

  const targetDir = resolve(process.cwd(), projectName);
  if (!(await isEmptyOrMissing(targetDir))) {
    log.error(
      `Target directory "${projectName}" already exists and is not empty.`
    );
    log.note(
      `Pick a different name, or remove the directory:\n` +
        `  rm -rf ${projectName}`,
      'Tip'
    );
    return null;
  }

  const version = args.templateVersion;

  return {template, projectName, version};
}
