#!/usr/bin/env bash
# Existing-server deployment only. Run after pushing Mac commits and pulling on the server.
set -euo pipefail
umask 077
project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_dir"
if [[ ! -f .env ]]; then
  printf 'Missing %s/.env; keep the server environment in place.\n' "$project_dir" >&2
  exit 1
fi
compose=(docker compose --env-file "$project_dir/.env" -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.assistant.yml --profile full)
command -v docker >/dev/null
command -v curl >/dev/null
docker info >/dev/null
"${compose[@]}" config --quiet

release_stamp="$(date -u +%Y%m%d%H%M%S)"
backup_root="${MIMO_BACKUP_ROOT:-$HOME/parnegarin-backups}"
backup_dir="$backup_root/mimo-$release_stamp"
mkdir -p "$backup_dir"
chmod 700 "$backup_dir"
printf 'Saving deployment backup: %s\n' "$backup_dir"
git rev-parse HEAD > "$backup_dir/source-commit.txt"
git diff --binary > "$backup_dir/local-changes.patch"
cp .env "$backup_dir/server.env"
cp infra/docker/docker-compose.yml "$backup_dir/docker-compose.yml"
for service in api web; do
  old_image="$(docker inspect --format '{{.Image}}' "barbercore_$service")"
  docker image tag "$old_image" "parnegarin-rollback-$service:$release_stamp"
done
cat > "$backup_dir/rollback.yml" <<YAML
services:
  api:
    image: parnegarin-rollback-api:$release_stamp
  web:
    image: parnegarin-rollback-web:$release_stamp
YAML
"${compose[@]}" exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$backup_dir/database.dump"
if [[ ! -s "$backup_dir/database.dump" ]]; then
  printf 'Database backup is empty; deployment stopped.\n' >&2
  exit 1
fi
printf 'Backup saved. Building images; current containers stay running during the build.\n'
"${compose[@]}" build api web

restore_images() {
  printf '\nDeployment checks failed. Previous images are available. To restore them:\n' >&2
  printf 'cd %q\n' "$project_dir" >&2
  printf 'docker compose --env-file .env -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.assistant.yml -f %q --profile full up -d --no-deps --no-build api web\n' "$backup_dir/rollback.yml" >&2
}
trap restore_images ERR
"${compose[@]}" up -d --no-deps --no-build api web

healthy=false
for attempt in $(seq 1 40); do
  api_health="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' barbercore_api)"
  web_health="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' barbercore_web)"
  if [[ "$api_health" == healthy && "$web_health" == healthy ]]; then
    healthy=true
    break
  fi
  printf 'Waiting for services (%s/40): api=%s web=%s\n' "$attempt" "$api_health" "$web_health"
  sleep 2
done
[[ "$healthy" == true ]]

# POST is read-only but verifies Redis and the full internal assistant route, not only status.
"${compose[@]}" exec -T api node - <<'JS'
(async () => {
  const base = 'http://127.0.0.1:' + (process.env.API_PORT || 4000) + '/api/v1/assistant';
  const response = await fetch(base + '/chat', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assistantId: 'parnegarin', message: 'چطور نوبت بگیرم؟', context: { route: '/salons' } }),
    signal: AbortSignal.timeout(15000),
  });
  const result = await response.json();
  if (!response.ok || !result.data?.message?.content || !result.data.message.content.includes('رزرو')) {
    throw new Error('Internal assistant smoke test failed');
  }
  console.log('Internal assistant chat and Redis: OK');
})().catch(() => { console.error('Internal assistant smoke test failed'); process.exit(1); });
JS
"${compose[@]}" ps
trap - ERR
printf '\nMimo deployed successfully. No migration or seed was run.\n'
printf 'Backup and previous-image rollback: %s\n' "$backup_dir"
printf 'Now check the external site and /api/v1/assistant/status through Nginx.\n'
