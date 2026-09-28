# 0.98.0 배포 기록 (2026-09-28)

- 요청: "XDM-PSU 03 SINGAL 구성에 딥스위치를 이미지화 했던 것처럼 해당 제품을 그렇게 애니메이션 이미지화해서 실제 연결처럼 표현해줘" (2026-09-28, 제조사 연결도 참고 캡처 포함)
- PR: https://github.com/Seoulav/rtcom-configurator/pull/100 (squash 병합)
  - 병합 커밋: `218fcb1ebf51672fc48945c7f4d4a4aaba8d1dee`
  - PR head: `caedb1df`
  - 다른 세션이 0.96.0(#96)·0.97.0(#98)을 먼저 병합해, main을 병합한 뒤 0.98.0으로 올렸습니다.
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 79 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36413421671)
  - 결과: success (11:04:12Z → 11:05:12Z)

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.98`
- 공개 `src/products.js`·`src/styles.css`에 `rt-psu-flow`·`rt-psu-dash`가 들어 있습니다.
- 공개 파일 대조: `218fcb1`에서 `node scripts/package-site.cjs`로 만든 `dist/` 파일과 공개 파일의 SHA-256을 비교했습니다. 272/272 일치했습니다(`.nojekyll` 제외).
- 비공개 파일 5개는 모두 404였습니다: `CLAUDE.md`, `CHANGELOG.md`, `docs/qa/PSU_SIGNAL_FLOW_QA_2026-09-28.md`, `scripts/e2e-smoke.cjs`, `.claude/settings.json`
- 병합 전 검증 결과
  - `node --test tests/*.test.cjs`: 45/45
  - `build-product-index --check`: 30개 통과
  - `package-site`: 통과
  - `e2e-smoke`: 150/150
  - `git diff --check`: 통과

## 되돌리기

- main에서 `218fcb1`을 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
