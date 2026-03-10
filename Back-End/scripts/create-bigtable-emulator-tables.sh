#!/bin/bash

set -euo pipefail

PROJECT_ID="${PROJECT_ID:-emulator-project}"
INSTANCE_ID="${INSTANCE_ID:-emulator-instance}"
EMULATOR_HOST="${BIGTABLE_EMULATOR_HOST:-localhost:8086}"
LINK_TABLE="${LINK_TABLE:-comp-539-team-1-urlmap}"
CREATOR_INDEX_TABLE="${CREATOR_INDEX_TABLE:-comp-539-team-1-links-by-creator}"

if ! command -v cbt >/dev/null 2>&1; then
  echo "cbt not found. Install it with: gcloud components install cbt"
  exit 1
fi

TEMP_CBTRC="$(mktemp)"
cleanup() {
  rm -f "$TEMP_CBTRC"
}
trap cleanup EXIT

cat > "$TEMP_CBTRC" <<EOF
project = ${PROJECT_ID}
instance = ${INSTANCE_ID}
creds = 
dataendpoint = ${EMULATOR_HOST}
adminendpoint = ${EMULATOR_HOST}
EOF

export CBT_CONFIG="$TEMP_CBTRC"

create_table_if_missing() {
  local table_name="$1"
  shift

  if cbt ls | tr ' ' '\n' | grep -Fxq "$table_name"; then
    echo "Table already exists: $table_name"
  else
    echo "Creating table: $table_name"
    cbt createtable "$table_name"
  fi

  for family in "$@"; do
    if cbt ls "$table_name" | grep -Fq "$family"; then
      echo "Column family already exists: $table_name:$family"
    else
      echo "Creating column family: $table_name:$family"
      cbt createfamily "$table_name" "$family"
    fi
  done
}

create_table_if_missing "$LINK_TABLE" "urlmapping" "creator-info" "analytics" "ttl"
create_table_if_missing "$CREATOR_INDEX_TABLE" "creator-info"

echo "Bigtable emulator tables are ready."
echo "Project: $PROJECT_ID"
echo "Instance: $INSTANCE_ID"
echo "Emulator: $EMULATOR_HOST"
