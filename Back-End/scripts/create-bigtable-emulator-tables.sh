#!/bin/bash

set -euo pipefail

PROJECT_ID="${PROJECT_ID:-emulator-project}"
INSTANCE_ID="${INSTANCE_ID:-emulator-instance}"
EMULATOR_HOST="${BIGTABLE_EMULATOR_HOST:-localhost:8086}"
LINK_TABLE="${LINK_TABLE:-comp-539-team-1-urlmap}"
CREATOR_INDEX_TABLE="${CREATOR_INDEX_TABLE:-comp-539-team-1-creator-index}"
USER_TABLE="${USER_TABLE:-comp-539-team-1-users}"

if ! command -v cbt >/dev/null 2>&1; then
  echo "cbt not found. Install it with: gcloud components install cbt"
  exit 1
fi

TEMP_HOME="$(mktemp -d)"
cleanup() {
  rm -rf "$TEMP_HOME"
}
trap cleanup EXIT

cat > "$TEMP_HOME/.cbtrc" <<EOF
project = ${PROJECT_ID}
instance = ${INSTANCE_ID}
creds = 
data-endpoint = ${EMULATOR_HOST}
admin-endpoint = ${EMULATOR_HOST}
EOF

run_cbt() {
  HOME="$TEMP_HOME" cbt "$@"
}

create_table_if_missing() {
  local table_name="$1"
  shift

  if run_cbt ls | tr ' ' '\n' | grep -Fxq "$table_name"; then
    echo "Table already exists: $table_name"
  else
    echo "Creating table: $table_name"
    run_cbt createtable "$table_name"
  fi

  for family in "$@"; do
    if run_cbt ls "$table_name" | grep -Fq "$family"; then
      echo "Column family already exists: $table_name:$family"
    else
      echo "Creating column family: $table_name:$family"
      run_cbt createfamily "$table_name" "$family"
    fi
  done
}

create_table_if_missing "$LINK_TABLE" "urlmapping" "creator-info" "analytics" "ttl"
create_table_if_missing "$CREATOR_INDEX_TABLE" "creator-info"
create_table_if_missing "$USER_TABLE" "user" "email" "pass"

echo "Bigtable emulator tables are ready."
echo "Project: $PROJECT_ID"
echo "Instance: $INSTANCE_ID"
echo "Emulator: $EMULATOR_HOST"
