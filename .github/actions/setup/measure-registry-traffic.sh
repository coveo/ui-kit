#!/usr/bin/env bash

set -euo pipefail

MODE="${1:?mode required}"
STATE_DIR="${RUNNER_TEMP:-/tmp}/pnpm-traffic"
mkdir -p "$STATE_DIR"

HOSTS_FILE="$STATE_DIR/hosts.txt"
IPS_FILE="$STATE_DIR/ips.txt"
START_FILE="$STATE_DIR/start_time.txt"
REPORT_FILE="$STATE_DIR/report.json"
CHAIN_SUFFIX="$(printf '%s' "${GITHUB_RUN_ID:-local}-${GITHUB_JOB:-job}" | cksum | awk '{print $1}')"
CHAIN_OUT="PTO_${CHAIN_SUFFIX}"
CHAIN_IN="PTI_${CHAIN_SUFFIX}"

discover_hosts() {
    {
        npm config get registry 2>/dev/null || true
        npm config list --json 2>/dev/null | node -e '
            let input = "";
            process.stdin.on("data", (chunk) => (input += chunk));
            process.stdin.on("end", () => {
                try {
                    const config = JSON.parse(input);
                    for (const [key, value] of Object.entries(config)) {
                        if (key.endsWith(":registry") && typeof value === "string") {
                            console.log(value);
                        }
                    }
                } catch {}
            });
        '
        echo "https://registry.npmjs.org/"
    } | sed -E 's#^https?://##; s#/.*$##' | sed '/^$/d;/^null$/d;/^undefined$/d' | sort -u >"$HOSTS_FILE"
}

resolve_ips() {
    : >"$IPS_FILE"
    while read -r host; do
        dig +short "$host" A 2>/dev/null | sed '/^$/d' >>"$IPS_FILE" || true
        dig +short "$host" AAAA 2>/dev/null | sed '/^$/d' >>"$IPS_FILE" || true
    done <"$HOSTS_FILE"
    sort -u -o "$IPS_FILE" "$IPS_FILE"
}

setup_iptables() {
    sudo -n iptables -N "$CHAIN_OUT" 2>/dev/null || sudo -n iptables -F "$CHAIN_OUT" >/dev/null 2>&1
    sudo -n iptables -N "$CHAIN_IN" 2>/dev/null || sudo -n iptables -F "$CHAIN_IN" >/dev/null 2>&1

    while read -r ip; do
        if [[ "$ip" == *:* ]]; then
            continue
        fi
        sudo -n iptables -A "$CHAIN_OUT" -p tcp -d "$ip" --dport 443 -j RETURN
        sudo -n iptables -A "$CHAIN_IN" -p tcp -s "$ip" --sport 443 -j RETURN
    done <"$IPS_FILE"

    sudo -n iptables -I OUTPUT 1 -j "$CHAIN_OUT"
    sudo -n iptables -I INPUT 1 -j "$CHAIN_IN"
}

teardown_iptables() {
    sudo -n iptables -D OUTPUT -j "$CHAIN_OUT" 2>/dev/null || true
    sudo -n iptables -D INPUT -j "$CHAIN_IN" 2>/dev/null || true
    sudo -n iptables -F "$CHAIN_OUT" 2>/dev/null || true
    sudo -n iptables -F "$CHAIN_IN" 2>/dev/null || true
    sudo -n iptables -X "$CHAIN_OUT" 2>/dev/null || true
    sudo -n iptables -X "$CHAIN_IN" 2>/dev/null || true
}

read_chain_bytes() {
    local chain="$1"
    sudo -n iptables -L "$chain" -v -x -n | awk '
        $1 ~ /^[0-9]+$/ && $2 ~ /^[0-9]+$/ {
            bytes += $2
        }
        END {
            print bytes + 0
        }
    '
}

write_report() {
    local start_time end_time download_bytes upload_bytes

    start_time="$(cat "$START_FILE" 2>/dev/null || true)"
    end_time="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    upload_bytes="$(read_chain_bytes "$CHAIN_OUT")"
    download_bytes="$(read_chain_bytes "$CHAIN_IN")"

    node - "$HOSTS_FILE" "$IPS_FILE" "$REPORT_FILE" "$start_time" "$end_time" "$download_bytes" "$upload_bytes" <<'EOF'
const fs = require('fs');

const [hostsFile, ipsFile, reportFile, startTime, endTime, downloadBytes, uploadBytes] = process.argv.slice(2);

const readLines = (path) =>
    fs.existsSync(path) ? fs.readFileSync(path, 'utf8').split('\n').map((line) => line.trim()).filter(Boolean) : [];

const report = {
    timestamp_start: startTime || null,
    timestamp_end: endTime || null,
    repository: process.env.GITHUB_REPOSITORY || null,
    workflow: process.env.GITHUB_WORKFLOW || null,
    job: process.env.GITHUB_JOB || null,
    run_id: process.env.GITHUB_RUN_ID || null,
    run_attempt: process.env.GITHUB_RUN_ATTEMPT || null,
    ref: process.env.GITHUB_REF || null,
    registry_hosts: readLines(hostsFile),
    registry_ips: readLines(ipsFile),
    download_bytes: Number(downloadBytes || 0),
    upload_bytes: Number(uploadBytes || 0),
};

fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
EOF
}

case "$MODE" in
    start)
        discover_hosts
        resolve_ips
        date -u +%Y-%m-%dT%H:%M:%SZ >"$START_FILE"
        setup_iptables
        ;;
    stop)
        write_report
        teardown_iptables
        echo "$REPORT_FILE"
        ;;
    *)
        echo "Unknown mode: $MODE" >&2
        exit 1
        ;;
esac