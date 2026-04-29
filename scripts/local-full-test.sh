#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/Back-End"
FRONTEND_DIR="$ROOT_DIR/Front-End"
TMP_DIR="$(mktemp -d)"

MAVEN_REPO_LOCAL="${MAVEN_REPO_LOCAL:-/tmp/m2}"
GCLOUD_CONFIG="${GCLOUD_CONFIG:-/tmp/gcloud-config}"
REDIS_CONTAINER="${REDIS_CONTAINER:-rice-url-redis}"
BIGTABLE_HOST="${BIGTABLE_HOST:-127.0.0.1}"
BIGTABLE_PORT="${BIGTABLE_PORT:-8086}"
BACKEND_PORT="${BACKEND_PORT:-8080}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"

EMULATOR_PID=""
BACKEND_PID=""
FRONTEND_PID=""

log() {
  printf '[local-full-test] %s\n' "$*"
}

cleanup() {
  local status=$?
  if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" >/dev/null 2>&1; then
    kill -- "-$FRONTEND_PID" >/dev/null 2>&1 || kill "$FRONTEND_PID" >/dev/null 2>&1 || true
  fi
  if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" >/dev/null 2>&1; then
    kill -- "-$BACKEND_PID" >/dev/null 2>&1 || kill "$BACKEND_PID" >/dev/null 2>&1 || true
  fi
  if [[ -n "$EMULATOR_PID" ]] && kill -0 "$EMULATOR_PID" >/dev/null 2>&1; then
    kill -- "-$EMULATOR_PID" >/dev/null 2>&1 || kill "$EMULATOR_PID" >/dev/null 2>&1 || true
  fi
  if [[ "$status" -eq 0 ]]; then
    rm -rf "$TMP_DIR"
  else
    local log_dir="$ROOT_DIR/.local-test-logs/$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$log_dir"
    cp "$TMP_DIR"/*.log "$log_dir"/ >/dev/null 2>&1 || true
    log "Test failed; logs preserved in $log_dir"
    rm -rf "$TMP_DIR"
  fi
  exit "$status"
}
trap cleanup EXIT

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log "Missing required command: $1"
    exit 1
  fi
}

wait_for_tcp() {
  local host="$1"
  local port="$2"
  local name="$3"
  local attempts="${4:-60}"

  for _ in $(seq 1 "$attempts"); do
    if (echo >"/dev/tcp/$host/$port") >/dev/null 2>&1; then
      log "$name is reachable at $host:$port"
      return 0
    fi
    sleep 1
  done

  log "$name did not become reachable at $host:$port"
  return 1
}

assert_port_free() {
  local host="$1"
  local port="$2"
  local name="$3"

  if (echo >"/dev/tcp/$host/$port") >/dev/null 2>&1; then
    log "$name port $host:$port is already in use. Stop the existing process before running this script."
    exit 1
  fi
}

assert_status() {
  local expected="$1"
  local actual="$2"
  local label="$3"

  if [[ "$actual" != "$expected" ]]; then
    log "$label failed: expected HTTP $expected, got $actual"
    exit 1
  fi
  log "$label passed with HTTP $actual"
}

http_status() {
  local output_file="$1"
  shift
  curl -sS -o "$output_file" -w '%{http_code}' "$@"
}

require_command curl
require_command gcloud
require_command java
require_command mvn
require_command node
require_command npm
require_command docker

log "Checking Redis container: $REDIS_CONTAINER"
if ! docker ps --filter "name=$REDIS_CONTAINER" --format '{{.Names}}' | grep -Fxq "$REDIS_CONTAINER"; then
  log "Redis container is not running. Start it with: docker start $REDIS_CONTAINER"
  exit 1
fi
if [[ "$(docker exec "$REDIS_CONTAINER" redis-cli ping)" != "PONG" ]]; then
  log "Redis PING failed"
  exit 1
fi
log "Redis PING passed"

assert_port_free "$BIGTABLE_HOST" "$BIGTABLE_PORT" "Bigtable emulator"
assert_port_free 127.0.0.1 "$BACKEND_PORT" "Backend"
assert_port_free 127.0.0.1 "$FRONTEND_PORT" "Frontend"

log "Building backend jar"
(cd "$BACKEND_DIR" && mvn -Dmaven.repo.local="$MAVEN_REPO_LOCAL" -DskipTests package >/dev/null)

log "Starting Bigtable emulator"
setsid env CLOUDSDK_CONFIG="$GCLOUD_CONFIG" gcloud beta emulators bigtable start \
  --host-port="$BIGTABLE_HOST:$BIGTABLE_PORT" >"$TMP_DIR/bigtable.log" 2>&1 &
EMULATOR_PID=$!
wait_for_tcp "$BIGTABLE_HOST" "$BIGTABLE_PORT" "Bigtable emulator"

log "Starting backend with emulator profile"
setsid bash -c 'cd "$1" && SPRING_PROFILES_ACTIVE=emulator RATE_LIMIT_LOGIN_PER_MINUTE="${RATE_LIMIT_LOGIN_PER_MINUTE:-2}" java -jar target/atlink-backend-0.0.1-SNAPSHOT.jar' bash "$BACKEND_DIR" \
  >"$TMP_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
wait_for_tcp 127.0.0.1 "$BACKEND_PORT" "Backend"

user="trace$(date +%s)"
alias="rice$(date +%s)"

body="$TMP_DIR/register.json"
status="$(http_status "$body" -X POST "http://127.0.0.1:$BACKEND_PORT/api/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"username\":\"$user\",\"email\":\"$user@example.com\",\"password\":\"password123\"}")"
assert_status 201 "$status" "Register"
token="$(node -e "console.log(JSON.parse(require('fs').readFileSync(process.argv[1], 'utf8')).token)" "$body")"

body="$TMP_DIR/login.json"
status="$(http_status "$body" -X POST "http://127.0.0.1:$BACKEND_PORT/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"username\":\"$user\",\"password\":\"password123\"}")"
assert_status 200 "$status" "Login"

rate_ip="198.51.100.$(( ($(date +%s) % 200) + 1 ))"
body="$TMP_DIR/rate-login-1.json"
status="$(http_status "$body" -X POST "http://127.0.0.1:$BACKEND_PORT/api/auth/login" \
  -H 'Content-Type: application/json' \
  -H "X-Forwarded-For: $rate_ip" \
  -d "{\"username\":\"missing-$user\",\"password\":\"password123\"}")"
assert_status 400 "$status" "Login rate limit first request"

body="$TMP_DIR/rate-login-2.json"
status="$(http_status "$body" -X POST "http://127.0.0.1:$BACKEND_PORT/api/auth/login" \
  -H 'Content-Type: application/json' \
  -H "X-Forwarded-For: $rate_ip" \
  -d "{\"username\":\"missing-$user\",\"password\":\"password123\"}")"
assert_status 400 "$status" "Login rate limit second request"

body="$TMP_DIR/rate-login-3.json"
status="$(http_status "$body" -X POST "http://127.0.0.1:$BACKEND_PORT/api/auth/login" \
  -H 'Content-Type: application/json' \
  -H "X-Forwarded-For: $rate_ip" \
  -d "{\"username\":\"missing-$user\",\"password\":\"password123\"}")"
assert_status 429 "$status" "Login rate limit third request"

body="$TMP_DIR/create-unauthorized.json"
status="$(http_status "$body" -X POST "http://127.0.0.1:$BACKEND_PORT/api/links" \
  -H 'Content-Type: application/json' \
  -d "{\"longUrl\":\"https://www.rice.edu\",\"customAlias\":\"unauth$alias\"}")"
assert_status 403 "$status" "Unauthenticated create link"

body="$TMP_DIR/create.json"
status="$(http_status "$body" -X POST "http://127.0.0.1:$BACKEND_PORT/api/links" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $token" \
  -d "{\"longUrl\":\"https://www.rice.edu\",\"customAlias\":\"$alias\",\"expiresAt\":\"2026-12-31T23:59:59Z\"}")"
assert_status 201 "$status" "Create link"

body="$TMP_DIR/list.json"
status="$(http_status "$body" -H "Authorization: Bearer $token" "http://127.0.0.1:$BACKEND_PORT/api/links?limit=20")"
assert_status 200 "$status" "List links"

body="$TMP_DIR/get.json"
status="$(http_status "$body" "http://127.0.0.1:$BACKEND_PORT/api/links/$alias")"
assert_status 200 "$status" "Get link"

body="$TMP_DIR/redirect-1.txt"
status="$(http_status "$body" "http://127.0.0.1:$BACKEND_PORT/r/$alias")"
assert_status 302 "$status" "Redirect first hit"

body="$TMP_DIR/redirect-2.txt"
status="$(http_status "$body" "http://127.0.0.1:$BACKEND_PORT/r/$alias")"
assert_status 302 "$status" "Redirect second hit"

sleep 1
if grep -Fq "Redis cache hit for alias=$alias" "$TMP_DIR/backend.log"; then
  log "Redis cache hit verified for alias=$alias"
else
  log "Redis cache hit was not observed. Backend log follows:"
  tail -80 "$TMP_DIR/backend.log"
  exit 1
fi

log "Building frontend"
(cd "$FRONTEND_DIR" && npm run build >/dev/null)

log "Starting frontend dev server"
setsid bash -c 'cd "$1" && npm run dev -- --host 127.0.0.1 --port "$2"' bash "$FRONTEND_DIR" "$FRONTEND_PORT" \
  >"$TMP_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
wait_for_tcp 127.0.0.1 "$FRONTEND_PORT" "Frontend"

proxy_alias="proxy$(date +%s)"
body="$TMP_DIR/proxy-create.json"
status="$(http_status "$body" -X POST "http://127.0.0.1:$FRONTEND_PORT/api/links" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $token" \
  -d "{\"longUrl\":\"https://www.rice.edu\",\"customAlias\":\"$proxy_alias\"}")"
assert_status 201 "$status" "Frontend proxy create link"

body="$TMP_DIR/frontend.html"
status="$(http_status "$body" "http://127.0.0.1:$FRONTEND_PORT/")"
assert_status 200 "$status" "Frontend index"

log "All local integration checks passed"
