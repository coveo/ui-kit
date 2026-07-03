# just is a handy way to save and run project-specific commands.
# https://just.systems/man/en/

[doc('List all available commands')]
default:
    @just --list

[doc('Check if all required tools are installed')]
[group('setup')]
doctor:
    @command -v node >/dev/null || echo "Node.js is not installed"

[doc('Initialize tooling')]
[group('setup')]
init:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "Checking tools..."
    just doctor
    echo "Install dependencies..."
    corepack enable
    pnpm install
