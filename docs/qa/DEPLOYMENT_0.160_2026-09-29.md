# 0.160.0 배포 기록 (2026-09-29)

- 병합: PR #222 → main `69e83a8` (squash)
- 배포: `Deploy RTCOM to GitHub Pages` run 36554030696, 성공
- 공개 확인 (https://seoulav.github.io/rtcom-configurator/)
  - 버전 표기 `CATALOG BASED · 0.160`, `CLAUDE.md` 404
  - `scripts/check-version.cjs` 404(점검 도구는 공개 사이트에 포함되지 않음)
- 이 배포 기록 PR은 문서만 바꾸므로 버전을 올리지 않았습니다(`node scripts/check-version.cjs --against origin/main` 통과).
