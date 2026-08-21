import assert from 'node:assert/strict';
import {mkdtempSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {describe, it} from 'node:test';
import {gzipSync} from 'node:zlib';
import {createReadPackage, validateThermidorSchemaSpec} from '../.pnpmfile.mjs';

const packageName = '@coveo/thermidor-schema';

function createPackage(name = packageName) {
  const directory = mkdtempSync(join(tmpdir(), 'thermidor-schema-'));
  writeFileSync(join(directory, 'package.json'), JSON.stringify({name}));
  return directory;
}

function createTarball(name = packageName) {
  const directory = mkdtempSync(join(tmpdir(), 'thermidor-schema-pack-'));
  const tarball = join(directory, 'coveo-thermidor-schema-0.1.0.tgz');
  const manifest = Buffer.from(JSON.stringify({name, version: '0.1.0'}));
  const archive = Buffer.alloc(512 + Math.ceil(manifest.length / 512) * 512 + 1024);
  archive.write('package/package.json', 0, 'utf8');
  archive.write(manifest.length.toString(8).padStart(11, '0'), 124, 'ascii');
  manifest.copy(archive, 512);
  writeFileSync(tarball, gzipSync(archive));
  return tarball;
}

describe('THERMIDOR_SCHEMA_SPEC', () => {
  it('leaves manifests unchanged when the override is unset', () => {
    const manifest = {
      name: 'consumer',
      dependencies: {[packageName]: '^0.1.0'},
    };

    assert.strictEqual(createReadPackage(undefined)(manifest), manifest);
    assert.equal(manifest.dependencies[packageName], '^0.1.0');
  });

  it('rewrites existing dependency fields to a validated link target', () => {
    const directory = createPackage();
    const spec = `link:${directory}`;
    const messages = [];
    const manifest = {
      name: 'consumer',
      dependencies: {[packageName]: '^0.1.0'},
      devDependencies: {[packageName]: '^0.1.0'},
      optionalDependencies: {[packageName]: '^0.1.0'},
      peerDependencies: {[packageName]: '^0.1.0'},
    };

    createReadPackage(spec)(manifest, {log: (message) => messages.push(message)});

    assert.equal(manifest.dependencies[packageName], spec);
    assert.equal(manifest.devDependencies[packageName], spec);
    assert.equal(manifest.optionalDependencies[packageName], spec);
    assert.equal(manifest.peerDependencies[packageName], '^0.1.0');
    assert.equal(messages.length, 1);
  });

  it('accepts an absolute file tarball target', () => {
    const tarball = createTarball();

    assert.equal(validateThermidorSchemaSpec(`file:${tarball}`), `file:${tarball}`);
  });

  it('rejects a tarball with the wrong package identity', () => {
    assert.throws(
      () => validateThermidorSchemaSpec(`file:${createTarball('wrong-package')}`),
      /must be @coveo\/thermidor-schema, found wrong-package/
    );
  });

  it('does not add the dependency to unrelated packages', () => {
    const manifest = {name: 'unrelated', dependencies: {zod: '^4.0.0'}};

    createReadPackage(`link:${createPackage()}`)(manifest, {
      log: assert.fail,
    });

    assert.deepEqual(manifest.dependencies, {zod: '^4.0.0'});
  });

  it('rejects unsupported and relative specs', () => {
    assert.throws(
      () => validateThermidorSchemaSpec('https://example.test/schema.tgz'),
      /must be an explicit link:/
    );
    assert.throws(
      () => validateThermidorSchemaSpec('link:../thermidor-schema'),
      /must use an absolute path/
    );
  });

  it('rejects missing targets', () => {
    assert.throws(
      () =>
        validateThermidorSchemaSpec(`link:${join(tmpdir(), 'missing-thermidor-schema-package')}`),
      /target does not exist/
    );
  });

  it('rejects link targets that are not directories', () => {
    const directory = mkdtempSync(join(tmpdir(), 'thermidor-schema-file-'));
    const file = join(directory, 'package.json');
    writeFileSync(file, '{}');

    assert.throws(
      () => validateThermidorSchemaSpec(`link:${file}`),
      /link target must be a package directory/
    );
  });

  it('rejects directories with the wrong package identity', () => {
    assert.throws(
      () => validateThermidorSchemaSpec(`link:${createPackage('wrong-package')}`),
      /must be @coveo\/thermidor-schema, found wrong-package/
    );
  });

  it('rejects non-tarball file targets', () => {
    const directory = mkdtempSync(join(tmpdir(), 'thermidor-schema-file-'));
    const file = join(directory, 'schema.zip');
    writeFileSync(file, 'test fixture');

    assert.throws(
      () => validateThermidorSchemaSpec(`file:${file}`),
      /file target must be a package directory or \.tgz tarball/
    );
  });
});
