import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {afterEach, describe, it} from 'node:test';
import {
  buildScratchOrgIdentity,
  buildScratchOrgAlias,
  buildScratchOrgName,
  createScratchOrgHandoff,
  LwsStatus,
  SALESFORCE_ORG_NAME_MAX_LENGTH,
  ScratchOrgHandoffContext,
  writeScratchOrgHandoff,
} from './scratch-org-handoff';

const ORG_ID = '00D000000000001AAA';
const temporaryDirectories: string[] = [];

function temporaryDirectory() {
  const directory = fs.mkdtempSync(
    path.join(fs.realpathSync(os.tmpdir()), 'quantic-handoff-writer-')
  );
  temporaryDirectories.push(directory);
  return directory;
}

function context(trustedRoot: string): ScratchOrgHandoffContext {
  return {
    commitSha: 'a'.repeat(40),
    lwsStatus: 'enabled',
    repository: 'coveo/ui-kit',
    repositoryId: '987654321',
    runAttempt: 2,
    runId: '123456789',
    trustedRoot,
  };
}

function handoff(handoffContext: ScratchOrgHandoffContext) {
  return createScratchOrgHandoff(
    handoffContext,
    buildScratchOrgIdentity(handoffContext).alias,
    'scratch-enabled@example.invalid',
    ORG_ID,
    'ready',
    'https://enabled.example.invalid/examples'
  );
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, {recursive: true, force: true});
  }
});

describe('trusted CI scratch-org identity', () => {
  it('constructs the exact org name, artifact name, and bounded paths', () => {
    const trustedRoot = temporaryDirectory();
    const handoffContext = context(trustedRoot);

    assert.equal(
      buildScratchOrgName('987654321', '123456789', 2, 'enabled'),
      'q-rgc0uy9-w21i3v9-a2-e'
    );
    assert.equal(
      buildScratchOrgAlias('987654321', '123456789', 2, 'enabled'),
      'q_rgc0uy9_w21i3v9_a2_e'
    );
    assert.deepEqual(buildScratchOrgIdentity(handoffContext), {
      alias: 'q_rgc0uy9_w21i3v9_a2_e',
      artifactDirectory: path.join(
        trustedRoot,
        'quantic-scratch-org-handoffs',
        'quantic-scratch-org-repo-987654321-run-123456789-attempt-2-lws-enabled'
      ),
      artifactName:
        'quantic-scratch-org-repo-987654321-run-123456789-attempt-2-lws-enabled',
      artifactRoot: path.join(trustedRoot, 'quantic-scratch-org-handoffs'),
      handoffFile: path.join(
        trustedRoot,
        'quantic-scratch-org-handoffs',
        'quantic-scratch-org-repo-987654321-run-123456789-attempt-2-lws-enabled',
        'scratch-org.json'
      ),
      orgName: 'q-rgc0uy9-w21i3v9-a2-e',
    });
  });

  it('keeps repository identities globally distinct within Salesforce constraints', () => {
    const first = buildScratchOrgName('11111111', '123456789', 2, 'enabled');
    const second = buildScratchOrgName('22222222', '123456789', 2, 'enabled');
    const maximum = buildScratchOrgName(
      '18446744073709551615',
      '18446744073709551615',
      Number.MAX_SAFE_INTEGER,
      'disabled'
    );

    assert.equal(first, 'q-r6m5dz-w21i3v9-a2-e');
    assert.equal(second, 'q-rd8ary-w21i3v9-a2-e');
    assert.notEqual(first, second);
    assert.ok(maximum.length <= SALESFORCE_ORG_NAME_MAX_LENGTH);
    assert.match(
      maximum,
      /^q-r[1-9a-z][0-9a-z]*-w[1-9a-z][0-9a-z]*-a[1-9a-z][0-9a-z]*-[ed]$/
    );
    assert.throws(() =>
      buildScratchOrgName('18446744073709551616', '123456789', 2, 'enabled')
    );
  });

  it('rejects malformed and traversal-shaped trusted contexts', () => {
    const trustedRoot = temporaryDirectory();
    const valid = context(trustedRoot);
    const cases: Array<Partial<ScratchOrgHandoffContext>> = [
      {runId: '../123'},
      {runId: '0'},
      {repositoryId: '0'},
      {repositoryId: '18446744073709551616'},
      {runAttempt: 0},
      {runAttempt: Number.NaN},
      {lwsStatus: 'other' as LwsStatus},
      {repository: 'missing-slash'},
      {commitSha: 'not-a-sha'},
      {trustedRoot: 'relative/path'},
      {
        trustedRoot: `${trustedRoot}${path.sep}..${path.sep}${path.basename(
          trustedRoot
        )}`,
      },
    ];

    for (const invalid of cases) {
      assert.throws(() => buildScratchOrgIdentity({...valid, ...invalid}));
    }
  });
});

describe('writeScratchOrgHandoff', () => {
  it('atomically writes only the canonical mode-0600 contract', async () => {
    const trustedRoot = temporaryDirectory();
    const handoffContext = context(trustedRoot);
    const identity = buildScratchOrgIdentity(handoffContext);
    const expected = handoff(handoffContext);

    await writeScratchOrgHandoff(handoffContext, expected);

    assert.deepEqual(
      JSON.parse(fs.readFileSync(identity.handoffFile, 'utf8')),
      expected
    );
    assert.equal(fs.statSync(identity.handoffFile).mode & 0o777, 0o600);
    assert.deepEqual(fs.readdirSync(identity.artifactDirectory), [
      'scratch-org.json',
    ]);
  });

  it('rejects symlinked trusted roots, artifact roots, directories, and destinations', async () => {
    const realRoot = temporaryDirectory();
    const symlinkParent = temporaryDirectory();
    const symlinkRoot = path.join(symlinkParent, 'root-link');
    fs.symlinkSync(realRoot, symlinkRoot);
    await assert.rejects(
      writeScratchOrgHandoff(
        context(symlinkRoot),
        handoff(context(symlinkRoot))
      ),
      /trusted artifact root/
    );

    const artifactRootContext = context(temporaryDirectory());
    const artifactRootIdentity = buildScratchOrgIdentity(artifactRootContext);
    fs.symlinkSync(temporaryDirectory(), artifactRootIdentity.artifactRoot);
    await assert.rejects(
      writeScratchOrgHandoff(artifactRootContext, handoff(artifactRootContext)),
      /directory is invalid/
    );

    const directoryContext = context(temporaryDirectory());
    const directoryIdentity = buildScratchOrgIdentity(directoryContext);
    fs.mkdirSync(directoryIdentity.artifactRoot);
    fs.symlinkSync(temporaryDirectory(), directoryIdentity.artifactDirectory);
    await assert.rejects(
      writeScratchOrgHandoff(directoryContext, handoff(directoryContext)),
      /directory is invalid/
    );

    const destinationContext = context(temporaryDirectory());
    const destinationIdentity = buildScratchOrgIdentity(destinationContext);
    fs.mkdirSync(destinationIdentity.artifactDirectory, {recursive: true});
    const destinationTarget = path.join(temporaryDirectory(), 'target.json');
    fs.writeFileSync(destinationTarget, '{}');
    fs.symlinkSync(destinationTarget, destinationIdentity.handoffFile);
    await assert.rejects(
      writeScratchOrgHandoff(destinationContext, handoff(destinationContext)),
      /destination is invalid/
    );
  });

  it('removes temporary files when the atomic rename fails', async () => {
    const trustedRoot = temporaryDirectory();
    const handoffContext = context(trustedRoot);
    const identity = buildScratchOrgIdentity(handoffContext);

    await assert.rejects(
      writeScratchOrgHandoff(handoffContext, handoff(handoffContext), {
        rename: async () => {
          throw new Error('rename failed');
        },
      }),
      /rename failed/
    );
    assert.deepEqual(fs.readdirSync(identity.artifactDirectory), []);
  });
});
