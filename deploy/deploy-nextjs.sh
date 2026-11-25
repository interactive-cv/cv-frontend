#!/usr/bin/env bash
# deploy-nextjs.sh — деплой фронта (nextjs) на проде.
#
# Вызывается из GitHub Actions репозитория cv-frontend (отключённым от ssh
# процессом) или вручную на VPS.
#
#   1. build — образ собирается, пока работает прежний контейнер;
#   2. up    — контейнер пересоздаётся из готового образа (--no-build).
#
# Работающий контейнер не останавливается до готовности нового образа:
# ошибка сборки оставляет прежнюю версию на месте.
# Ввод у docker-команд отключён (< /dev/null), чтобы не зависеть от stdin вызвавшего.
# Compose-файл всего стека живёт в репозитории cv-backend.
set -euo pipefail

APP_DIR="${LIBERA_CV_APP_DIR:-/home/deploy/libera_cv/cv-backend}"
# Блокировка общая с деплоем бэкенда (см. deploy/deploy.sh в cv-backend):
# два деплоя не пересекаются на сервере, ждём ограниченно.
LOCK="${LIBERA_CV_LOCK:-/tmp/libera_cv_deploy.lock}"
LOCK_WAIT="${DEPLOY_LOCK_WAIT:-1800}"

cd "$APP_DIR"
compose() { docker compose -f docker-compose.prod.yml "$@"; }

exec 9>"$LOCK"
echo "== блокировка деплоя (ждём до $((LOCK_WAIT / 60)) мин)"
flock -w "$LOCK_WAIT" 9 || {
  echo "❌ другой деплой не освободил блокировку за $((LOCK_WAIT / 60)) мин — запустите позже"
  exit 2
}

echo "== build nextjs (прод работает на прежнем контейнере)"
compose build nextjs

echo "== up nextjs (пересоздание из готового образа)"
compose up -d --no-build --wait nextjs < /dev/null

echo "== health check"
[ "$(docker inspect -f '{{.State.Status}}' libera_cv_nextjs)" = "running" ] \
  || { echo "❌ контейнер nextjs не запущен"; exit 1; }

echo "✅ frontend deploy OK"
