# Turborepo remote-cache preflight reproduction

<!-- cspell:words HMAC SigV preflight Turborepo -->

This fixture reproduces three related remote-cache preflight problems:

1. `slug` is added after `OPTIONS`, so the preflight request lacks team context.
2. A preflight for an upcoming `HEAD` request advertises `GET`.
3. `slug` is appended to an explicit URL returned in `Location`, invalidating signed URLs such as AWS SigV4 URLs.

The reproduction uses the latest published `turbo@canary` by default. It resolves that tag once, prints the exact version, and uses the resolved version for every command in the run.

## Run

Prerequisites: Node.js with npm, internet access to download `turbo`, and port `8787` available on the loopback interface.

```sh
cd reproductions/turbo-preflight
npm test
```

To retest an exact release:

```sh
TURBO_VERSION=2.10.12 npm test
```

To validate a binary built from a Turborepo checkout:

```sh
TURBO_BINARY=/path/to/turborepo/target/debug/turbo npm test
```

Every Turbo invocation includes `--skip-infer`, so the selected executable cannot delegate to another Turbo installation.

The test starts a recording local cache mock, then triggers a remote `PUT`, `GET`, and `HEAD`. Three black-box assertions check the team context, advertised methods, and returned locations. On an affected version, the test exits with status `1` and shows the observed and expected HTTP behavior.

A fixed version passes all three tests:

```text
tests 3
pass 3
fail 0
```

## Verified affected canary

On September 3, 2026, the reproduction resolved and tested `turbo@2.10.13-canary.1`. It reported:

- `slug` missing from the `OPTIONS` before `PUT`, `GET`, and `HEAD`;
- `GET` advertised by the `OPTIONS` before `HEAD`;
- `slug=ui-kit` appended to each explicit signed `Location`.

## Expected protocol

For each artifact operation, Turbo should:

1. add `slug=ui-kit` to the Remote Cache API URL before sending `OPTIONS`;
2. set `Access-Control-Request-Method` to the actual upcoming method;
3. use an explicit `Location` response without adding `slug`, `teamId`, or any other parameter.

The mock deliberately accepts invalid requests so one test run can assert all three problems. A real AWS SigV4 endpoint would reject the modified signed URL with `SignatureDoesNotMatch`.

## Safety

All cache traffic stays on `127.0.0.1`. The test uses the fake token `test-token`, disables telemetry, and does not contact a real cache or write to S3. Unless `TURBO_BINARY` is provided, its only external request is to the npm registry to resolve and download the selected Turbo version.
