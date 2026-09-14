#!/usr/bin/env bash
# Watchdog: keep kangyang-mall llm_server alive on PORT (default 8091)
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${PORT:-8091}"
HOST="${HOST:-0.0.0.0}"
LOG="${LOG:-/tmp/kangyang-unified.log}"
PIDFILE="${PIDFILE:-/tmp/kangyang-8091.pid}"
INTERVAL="${INTERVAL:-15}"
PY="${PYTHON:-/opt/homebrew/bin/python3}"
[ -x "$PY" ] || PY="$(command -v python3)"

is_up() {
  curl -sf --connect-timeout 2 "http://127.0.0.1:${PORT}/api/llm/status" >/dev/null 2>&1
}

start_server() {
  cd "$ROOT" || exit 1
  nohup env HOST="$HOST" PORT="$PORT" "$PY" -u scripts/llm_server.py >>"$LOG" 2>&1 </dev/null &
  local pid=$!
  echo "$pid" >"$PIDFILE"
  echo "[$(date '+%F %T')] started pid=$pid port=$PORT" | tee -a "$LOG"
}

echo "[$(date '+%F %T')] watchdog start interval=${INTERVAL}s port=$PORT" | tee -a "$LOG"

if ! is_up; then
  echo "[$(date '+%F %T')] DOWN on boot -> starting" | tee -a "$LOG"
  # clear stale listener if any
  if command -v lsof >/dev/null 2>&1; then
    kill $(lsof -t -iTCP:"$PORT" -sTCP:LISTEN) 2>/dev/null || true
    sleep 0.4
  fi
  start_server
  sleep 1.2
fi

while true; do
  sleep "$INTERVAL"
  if is_up; then
    echo "[$(date '+%F %T')] OK http://127.0.0.1:${PORT}/agent.html"
  else
    echo "[$(date '+%F %T')] DOWN -> restart" | tee -a "$LOG"
    kill $(lsof -t -iTCP:"$PORT" -sTCP:LISTEN) 2>/dev/null || true
    sleep 0.5
    start_server
    sleep 1.2
    if is_up; then
      echo "[$(date '+%F %T')] RECOVERED" | tee -a "$LOG"
    else
      echo "[$(date '+%F %T')] RESTART_FAILED" | tee -a "$LOG"
    fi
  fi
done
