import fs from 'node:fs';
import path from 'node:path';

export function createFakeSalesforce(directory, config = {}) {
  const executable = path.join(directory, 'sf');
  const callsFile = path.join(directory, 'sf-calls.jsonl');
  const stateFile = path.join(directory, 'sf-state.json');
  const script = `#!/usr/bin/env node
const fs = require('node:fs');
const callsFile = ${JSON.stringify(callsFile)};
const stateFile = ${JSON.stringify(stateFile)};
const config = ${JSON.stringify(config)};
const args = process.argv.slice(2);
fs.appendFileSync(callsFile, JSON.stringify(args) + '\\n');
let result = {};
if (args[0] === 'org' && args[1] === 'create' && args[2] === 'scratch') {
  result = config.create ?? {
    username: 'created@example.invalid',
    orgId: '00D000000000001AAA',
    accessToken: 'not-returned-by-adapter'
  };
} else if (args[0] === 'data' && args[1] === 'query') {
  const query = args[args.indexOf('--query') + 1] ?? '';
  const match = query.match(/OrgName = '([^']+)'/);
  const orgName = match?.[1];
  const state = fs.existsSync(stateFile)
    ? JSON.parse(fs.readFileSync(stateFile, 'utf8'))
    : {queries: {}};
  const sequence = config.querySequences?.[orgName];
  if (sequence) {
    const index = state.queries[orgName] ?? 0;
    result = {records: sequence[Math.min(index, sequence.length - 1)] ?? []};
    state.queries[orgName] = index + 1;
    fs.writeFileSync(stateFile, JSON.stringify(state));
  } else {
    result = {records: config.queries?.[orgName] ?? []};
  }
}
process.stdout.write(JSON.stringify({status: 0, result}));
`;
  fs.writeFileSync(executable, script, {mode: 0o700});
  return {callsFile, executable, stateFile};
}

export function readFakeSalesforceCalls(callsFile) {
  if (!fs.existsSync(callsFile)) {
    return [];
  }
  return fs
    .readFileSync(callsFile, 'utf8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}
