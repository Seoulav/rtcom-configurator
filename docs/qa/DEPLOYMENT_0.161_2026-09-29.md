# 0.161.0 배포 기록 (2026-09-29)

- 병합: PR #224 → main `e64fc01` (squash, `--match-head-commit`으로 push한 커밋에 고정)
- 배포: `Deploy RTCOM to GitHub Pages` run 36554423934, 성공
- 공개 확인 (https://seoulav.github.io/rtcom-configurator/)
  - 버전 표기 `CATALOG BASED · 0.161`, `CLAUDE.md` 404
- 검증: Windows에서 `node --test tests/*.test.cjs` 67/67 통과(AI 검색 테스트 6개 수정), e2e 201/201 통과, `check-version.cjs --against origin/main` 통과
