#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# Spins up a throwaway local PostgreSQL, applies every migration in
# supabase/migrations, then runs the SQL security tests in supabase/tests.
#
# Requires PostgreSQL 15+ binaries (initdb, pg_ctl, psql) on your machine.
# It does NOT touch your real Supabase project.
#
#   npm run test:db
# -----------------------------------------------------------------------------
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PG_BIN="${PG_BIN:-$(dirname "$(command -v initdb 2>/dev/null || ls -d /usr/lib/postgresql/*/bin/initdb 2>/dev/null | tail -1)")}"
TMP="$(mktemp -d)"
PORT="${PGTEST_PORT:-54329}"
SOCK="$TMP/sock"
mkdir -p "$SOCK"

cleanup() { "$PG_BIN/pg_ctl" -D "$TMP/data" stop -m immediate >/dev/null 2>&1 || true; rm -rf "$TMP"; }
trap cleanup EXIT

RUN_AS=()
if [ "$(id -u)" = "0" ]; then
  # Postgres refuses to run as root; use the 'postgres' system user if present.
  chown -R postgres "$TMP"
  RUN_AS=(su postgres -s /bin/bash -c)
fi
run() { if [ ${#RUN_AS[@]} -gt 0 ]; then "${RUN_AS[@]}" "$*"; else bash -c "$*"; fi; }

run "'$PG_BIN/initdb' -D '$TMP/data' -U postgres --auth=trust >/dev/null"
run "'$PG_BIN/pg_ctl' -D '$TMP/data' -o \"-p $PORT -k $SOCK -c listen_addresses=''\" -l '$TMP/pg.log' -w start >/dev/null"

PSQL=("$PG_BIN/psql" -h "$SOCK" -p "$PORT" -U postgres -d postgres -v ON_ERROR_STOP=1 -q)

echo "→ Installing Supabase stubs"
"${PSQL[@]}" -f "$ROOT/supabase/tests/_supabase_stubs.sql"

for f in "$ROOT"/supabase/migrations/*.sql; do
  echo "→ Migration $(basename "$f")"
  "${PSQL[@]}" -f "$f"
done

for f in "$ROOT"/supabase/tests/*.test.sql; do
  echo "→ Tests $(basename "$f")"
  "${PSQL[@]}" -f "$f" 2>&1 | sed 's/^psql:.*NOTICE:  /  /'
done
