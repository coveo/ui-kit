import {mkdir, mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {describeActiveCrashSpan, startCrashPhase} from './crash-diagnostics.js';
import {setRunContext} from './crash-report.js';
import {downloadTemplate} from './download.js';
import {ExpectedError, TemplateVersionUnavailableError} from './errors.js';
import {isEmptyOrMissing} from './fs-utils.js';
import {log} from './log.js';
import {buildProjectMetadata} from './metadata.js';
import {promptProjectName, selectTemplate} from './prompt.js';
import {readSampleMetadata, writeProvenance} from './provenance.js';
import {installDependencies, moveToTarget, rewritePackageJson} from './setup.js';
import {getTemplate, getTemplates, type Template} from './templates.js';
import {getPackageManager} from './utils.js';

export interface CliArgs {
  projectName?: string;
  template?: string;
  templateVersion?: string;
  docs: boolean;
}

export interface ScaffoldOptions {
  template: Template;
  projectName: string;
  version?: string;
}

export async function scaffold({template, projectName, version}: ScaffoldOptions): Promise<void> {
  const targetDir = resolve(process.cwd(), projectName);
  setRunContext({template: template.name, templateVersion: version});
  const tempDir = await mkdtemp(join(tmpdir(), 'create-ui-'));

  try {
    const sampleDir = await downloadTemplatePhase(template, version, tempDir);
    await createProjectPhase({template, sampleDir, projectName, targetDir});
  } catch (error) {
    if (error instanceof TemplateVersionUnavailableError) {
      reportUnavailableTemplate(template, error.version);
    }
    throw error;
  } finally {
    await rm(tempDir, {recursive: true, force: true});
  }

  const {packageManager, installed} = installDependenciesPhase(targetDir);
  completePhase({projectName, packageManager, installed});
}

export function unavailableTemplateMessage(templateName: string, version?: string): string {
  return version
    ? `Template "${templateName}" version "${version}" is not available.`
    : `Template "${templateName}" is not available.`;
}

async function claimTargetDir(targetDir: string): Promise<boolean> {
  const firstCreated = await mkdir(targetDir, {recursive: true});
  if (firstCreated !== undefined) {
    return true;
  }
  if (!(await isEmptyOrMissing(targetDir))) {
    throw new ExpectedError(`Target directory "${targetDir}" already exists and is not empty.`);
  }
  return false;
}

async function downloadTemplatePhase(
  template: Template,
  version: string | undefined,
  tempDir: string
): Promise<string> {
  startCrashPhase('template-download');
  const versionSuffix = version ? ` (${version})` : '';
  log.step(`Downloading the "${template.name}" template${versionSuffix}…`);
  return downloadTemplate({packageName: template.packageName, destDir: tempDir, version});
}

async function createProjectPhase({
  template,
  sampleDir,
  projectName,
  targetDir,
}: {
  template: Template;
  sampleDir: string;
  projectName: string;
  targetDir: string;
}): Promise<void> {
  const {templateVersion, dependencies} = await readSampleMetadata(sampleDir);
  const metadata = buildProjectMetadata({template: template.name, templateVersion, dependencies});
  setRunContext({metadata});
  describeActiveCrashSpan(`${template.name}@${templateVersion}`, {
    'coveo.template': template.name,
    'coveo.template_version': templateVersion,
  });

  startCrashPhase('project-creation');
  log.step(`Creating project in ${targetDir}…`);
  const createdTargetDir = await claimTargetDir(targetDir);
  try {
    await rewritePackageJson(sampleDir, projectName);
    await moveToTarget(sampleDir, targetDir);
    await writeProvenance(targetDir, metadata);
  } catch (error) {
    if (createdTargetDir) {
      await rm(targetDir, {recursive: true, force: true});
    }
    throw error;
  }
}

function installDependenciesPhase(targetDir: string): {
  packageManager: string;
  installed: boolean;
} {
  startCrashPhase('dependency-installation');
  const packageManager = getPackageManager();
  log.step(`Installing dependencies with ${packageManager}…`);
  const installed = installDependencies(targetDir);
  return {packageManager, installed};
}

function completePhase({
  projectName,
  packageManager,
  installed,
}: {
  projectName: string;
  packageManager: string;
  installed: boolean;
}): void {
  startCrashPhase('complete');
  log.step('Done!');
  log.info(`\n  cd ${projectName}`);
  if (!installed) {
    log.warn(`Dependency installation failed — run "${packageManager} install" manually.`);
  }
  log.info(`  ${packageManager} run dev\n`);
}

function reportUnavailableTemplate(template: Template, version?: string): never {
  log.note(
    `Check available templates:  npm create @coveo/ui -- --help\n` +
      `Open an issue:              https://github.com/coveo/ui-kit/issues\n` +
      `Coveo community:            https://connect.coveo.com`,
    'Need help?'
  );
  throw new ExpectedError(unavailableTemplateMessage(template.name, version));
}

async function resolveTemplate(templateArg: string | undefined): Promise<Template | null> {
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
  log.note(`Run with --help to see all templates:\n` + `  npm create @coveo/ui -- --help`, 'Tip');
  return null;
}

// Returns null when validation fails, so the caller can exit non-zero.
export async function resolveInputs(args: CliArgs): Promise<ScaffoldOptions | null> {
  const template = await resolveTemplate(args.template);
  if (!template) {
    return null;
  }

  const projectName = args.projectName ?? (await promptProjectName());

  const targetDir = resolve(process.cwd(), projectName);
  if (!(await isEmptyOrMissing(targetDir))) {
    log.error(`Target directory "${projectName}" already exists and is not empty.`);
    log.note(
      `Pick a different name, or remove the directory:\n` + `  rm -rf ${projectName}`,
      'Tip'
    );
    return null;
  }

  const version = args.templateVersion;

  return {template, projectName, version};
}
