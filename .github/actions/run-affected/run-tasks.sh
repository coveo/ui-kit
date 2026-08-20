#!/usr/bin/env bash

set -euo pipefail

run_command=(pnpm exec turbo run)

while IFS= read -r task; do
  run_command+=("$task")
done <<< "${TASKS}"
run_command+=(--no-update-notifier)

if [[ -n "$ARGUMENTS" ]]; then
  run_command+=(--)
  while IFS= read -r argument; do
    [[ -z "$argument" ]] || run_command+=("$argument")
  done <<< "$ARGUMENTS"
fi

echo "${run_command[*]}"
"${run_command[@]}"
