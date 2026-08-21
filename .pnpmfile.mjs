import {existsSync, readFileSync, statSync} from 'node:fs';
import {extname, isAbsolute, join, normalize} from 'node:path';
import {gunzipSync} from 'node:zlib';

const THERMIDOR_SCHEMA_PACKAGE = '@coveo/thermidor-schema';
const DEPENDENCY_FIELDS = ['dependencies', 'devDependencies', 'optionalDependencies'];

function readPackageName(packageDirectory) {
  const manifestPath = join(packageDirectory, 'package.json');

  if (!existsSync(manifestPath)) {
    throw new Error(
      `${THERMIDOR_SCHEMA_PACKAGE} local target has no package.json: ${packageDirectory}`
    );
  }

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    throw new Error(
      `Cannot read ${THERMIDOR_SCHEMA_PACKAGE} local target manifest at ${manifestPath}: ${error.message}`
    );
  }

  return manifest.name;
}

function readTarballPackageName(tarballPath) {
  let archive;
  try {
    archive = gunzipSync(readFileSync(tarballPath));
  } catch (error) {
    throw new Error(
      `Cannot read ${THERMIDOR_SCHEMA_PACKAGE} tarball at ${tarballPath}: ${error.message}`
    );
  }

  for (let offset = 0; offset + 512 <= archive.length;) {
    const header = archive.subarray(offset, offset + 512);
    const entryName = header.subarray(0, 100).toString('utf8').replace(/\0.*$/, '');
    const sizeText = header.subarray(124, 136).toString('ascii').replace(/\0.*$/, '').trim();
    const entrySize = Number.parseInt(sizeText || '0', 8);

    if (!Number.isFinite(entrySize)) {
      throw new Error(
        `Cannot read ${THERMIDOR_SCHEMA_PACKAGE} tarball entry size in ${tarballPath}`
      );
    }

    const contentsStart = offset + 512;
    if (entryName === 'package/package.json') {
      try {
        return JSON.parse(
          archive.subarray(contentsStart, contentsStart + entrySize).toString('utf8')
        ).name;
      } catch (error) {
        throw new Error(
          `Cannot read ${THERMIDOR_SCHEMA_PACKAGE} manifest from ${tarballPath}: ${error.message}`
        );
      }
    }

    offset = contentsStart + Math.ceil(entrySize / 512) * 512;
  }

  throw new Error(
    `${THERMIDOR_SCHEMA_PACKAGE} tarball has no package/package.json: ${tarballPath}`
  );
}

export function validateThermidorSchemaSpec(spec) {
  const separator = spec?.indexOf(':') ?? -1;
  const protocol = separator === -1 ? '' : spec.slice(0, separator);
  const target = separator === -1 ? '' : spec.slice(separator + 1);

  if (!['link', 'file'].includes(protocol) || !target) {
    throw new Error(
      'THERMIDOR_SCHEMA_SPEC must be an explicit link:<absolute-directory> or file:<absolute-directory-or-tarball> spec'
    );
  }

  if (!isAbsolute(target)) {
    throw new Error(`THERMIDOR_SCHEMA_SPEC must use an absolute path, received: ${spec}`);
  }

  const normalizedTarget = normalize(target);
  if (!existsSync(normalizedTarget)) {
    throw new Error(`THERMIDOR_SCHEMA_SPEC target does not exist: ${normalizedTarget}`);
  }

  const targetStats = statSync(normalizedTarget);
  if (protocol === 'link' && !targetStats.isDirectory()) {
    throw new Error(
      `THERMIDOR_SCHEMA_SPEC link target must be a package directory: ${normalizedTarget}`
    );
  }

  let packageName;
  if (targetStats.isDirectory()) {
    packageName = readPackageName(normalizedTarget);
  } else if (protocol === 'file' && targetStats.isFile() && extname(normalizedTarget) === '.tgz') {
    packageName = readTarballPackageName(normalizedTarget);
  } else {
    throw new Error(
      `THERMIDOR_SCHEMA_SPEC file target must be a package directory or .tgz tarball: ${normalizedTarget}`
    );
  }

  if (packageName !== THERMIDOR_SCHEMA_PACKAGE) {
    throw new Error(
      `THERMIDOR_SCHEMA_SPEC target must be ${THERMIDOR_SCHEMA_PACKAGE}, found ${packageName ?? '<unnamed>'}`
    );
  }

  return `${protocol}:${normalizedTarget}`;
}

export function createReadPackage(schemaSpec = process.env.THERMIDOR_SCHEMA_SPEC) {
  const validatedSpec = schemaSpec ? validateThermidorSchemaSpec(schemaSpec) : undefined;

  return function readPackage(pkg, context) {
    if (!validatedSpec) {
      return pkg;
    }

    let overridden = false;
    for (const field of DEPENDENCY_FIELDS) {
      if (pkg[field]?.[THERMIDOR_SCHEMA_PACKAGE]) {
        pkg[field][THERMIDOR_SCHEMA_PACKAGE] = validatedSpec;
        overridden = true;
      }
    }

    if (overridden) {
      context.log(
        `Using ${validatedSpec} for ${THERMIDOR_SCHEMA_PACKAGE} in ${pkg.name ?? '<unnamed package>'}`
      );
    }

    return pkg;
  };
}

export const hooks = {
  readPackage: createReadPackage(),
};
