# 0.109.0 배포 기록 (2026-09-28)

- 요청: "QMS-88UX 03 SIGNAL FLOW 부분에 명칭 수정 — 9·10번 각 4분할 · 합쳐서 최대 8입력 ==> 9·10번 각 4분할 또는 8분할" (2026-09-28)
- PR: https://github.com/Seoulav/rtcom-configurator/pull/120 (squash 병합)
  - 병합 커밋: `f4b7b47afc49119551114291c9fcdbcaaf59c01f`
  - PR head: `69e6b0b`
  - 참고: 작업 중 main에 다른 세션의 0.107.0(PR #118)·0.108.0(PR #121)이 먼저 병합돼, 두 차례 main을 받아와 `CHANGELOG.md` 버전 충돌을 풀고 이 작업을 0.109.0으로 재배정했습니다.
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 98 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36432444395)
  - 결과: success (13:58:13Z → 완료)

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.109`
- 변경 파일 대조: `f4b7b47`에서 `node scripts/package-site.cjs`로 만든 `dist/src/products.js`와 공개 `src/products.js`의 SHA-256이 일치했습니다(`a48c0239bf3e4acbd8f78cb4c8a03eff799f301897c6a439ae4bf9ef73a39332`). 공개 파일 안에서 새 캡션 문구 "각 4분할 또는 8분할"도 그대로 확인됩니다.
- 비공개 파일 표본 3개는 모두 404였습니다: `CHANGELOG.md`, `docs/qa/DEPLOYMENT_0.107_2026-09-28.md`, `.claude/settings.json`
- 병합 전 검증 결과
  - `node --test tests/*.test.cjs`: 45/45
  - `build-product-index --check`: 30개 통과
  - `package-site`: 통과
  - `e2e-smoke`: 153/153
  - `git diff --check`: 통과

## 되돌리기

- main에서 `f4b7b47`을 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
