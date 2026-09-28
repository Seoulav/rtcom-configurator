# 0.102.0 배포 기록 (2026-09-28)

- 요청: "OBHD-2C 이미지 너가 블랙을 뺄수 있을까?" (2026-09-28)
- PR: https://github.com/Seoulav/rtcom-configurator/pull/108 (squash 병합)
  - 병합 커밋: `c8e5be84ec4273707a0cd364390b7c5994c5d9fa`
  - PR head: `b23e710b`
  - 같은 브랜치의 다른 세션 커밋 `06a45f3`(XDM-CTR100·PSE 단자 지도를 매뉴얼 1쪽 사진으로 다시 합성)이 함께 병합됐습니다.
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 87 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36420804916)
  - 결과: success (12:16:42Z → 12:17:06Z)

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.102`
- 공개 파일 대조: `c8e5be8`에서 `node scripts/package-site.cjs`로 만든 `dist/` 파일과 공개 파일의 SHA-256을 비교했습니다. 272/272 일치했습니다(`.nojekyll` 제외).
- 비공개 파일 4개는 모두 404였습니다: `CLAUDE.md`, `CHANGELOG.md`, `docs/qa/OBHD2C_WHITE_BG_QA_2026-09-28.md`, `.claude/settings.json`
- 병합 전 검증 결과
  - `node --test tests/*.test.cjs`: 45/45
  - `build-product-index --check`: 30개 통과
  - `package-site`: 통과
  - `e2e-smoke`: 151/151
  - `git diff --check`: 통과

## 되돌리기

- main에서 `c8e5be8`을 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
