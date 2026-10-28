#!/usr/bin/env bash
# Builds the PlayerHaat website (players and recruiters; there is no admin here) from the Flutter app into ./dist.
# Usage: ./build.sh [dev|prod]   (default prod; prod reads app/env/prod.json, see prod.example.json)
set -euo pipefail
flavor="${1:-prod}"
here="$(cd "$(dirname "$0")" && pwd)"
app="$here/../app"
env_file="$app/env/$flavor.json"
[ -f "$env_file" ] || { echo "Missing $env_file" >&2; exit 1; }

cd "$app"
flutter pub get
flutter build web --release --no-tree-shake-icons --pwa-strategy=none --dart-define-from-file="env/$flavor.json"
rm -rf "$here/dist"
cp -R "$app/build/web" "$here/dist"
echo "Built $here/dist"
