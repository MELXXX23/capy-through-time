#!/bin/bash
# Стежить за публікацією сайту. Нову збірку запускає лише коли остання завершилась невдало й нічого не стоїть у черзі.
# Використання: bash tools/watch-pages.sh <хвилин> <слово з нового коду, за яким видно оновлення>
REPO=MELXXX23/capy-through-time
MAX=${1:-9}
END=$(( $(date +%s) + MAX*60 ))
LOG="$TEMP/pages-watch.log"
MARK=${2:-makeCapyRows}
site_ok() { curl -s "https://melxxx23.github.io/capy-through-time/?v=$RANDOM" | grep -q "$MARK"; }
while [ $(date +%s) -lt $END ]; do
  if site_ok; then echo "$(date -u +%H:%M) SITE UPDATED" | tee -a "$LOG"; exit 0; fi
  line=$(gh run list --repo $REPO -L 1 --json status,conclusion,createdAt --jq '.[0]|.status+"|"+.conclusion+"|"+.createdAt' 2>/dev/null)
  st=${line%%|*}; rest=${line#*|}; concl=${rest%%|*}; created=${rest#*|}
  echo "$(date -u +%H:%M) latest run: $st/$concl ($created)" | tee -a "$LOG"
  if [ "$st" = "completed" ] && [ "$concl" != "success" ]; then
    # з моменту останнього збою мають минути хоча б 3 хвилини, щоб не засипати GitHub запитами
    age=$(( $(date +%s) - $(date -d "$created" +%s) ))
    if [ $age -gt 180 ]; then
      r=$(gh api -X POST repos/$REPO/pages/builds --jq .status 2>&1)
      echo "$(date -u +%H:%M) retrigger -> $r" | tee -a "$LOG"
    fi
  elif [ "$st" = "completed" ] && [ "$concl" = "success" ]; then
    echo "$(date -u +%H:%M) run success, waiting for CDN" | tee -a "$LOG"
  fi
  sleep 90
done
echo "$(date -u +%H:%M) window ended, not updated yet" | tee -a "$LOG"
exit 1
