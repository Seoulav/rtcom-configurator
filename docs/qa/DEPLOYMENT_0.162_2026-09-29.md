# 0.162.0 배포 기록 (2026-09-29)

- 병합: PR #221 → main `2fdc922` (squash, `expectedHeadSha`로 push한 커밋 `b2b1b60`에 고정)
  - 작업 중 main이 0.157.0~0.161.0을 먼저 병합해 main을 세 번 병합하고 번호를 0.157 → 0.160 → 0.161 → 0.162로 다시 정했습니다.
  - squash 커밋 본문은 첫 커밋 메시지를 그대로 써서 "0.156 화면"·`CARD_PALETTE_DRAG_0.157.md`라고 적혀 있습니다. 실제 파일은 `docs/implementation/CARD_PALETTE_DRAG_0.162.md`이며, 되돌리면 이 기능을 넣기 전(0.161) 화면이 됩니다.
- 배포: `Deploy RTCOM to GitHub Pages` run 36554909807, 성공
- 공개 확인 (https://seoulav.github.io/rtcom-configurator/)
  - 버전 표기 `CATALOG BASED · 0.162`, `CLAUDE.md` 404
  - 공개 `src/app.js`가 main과 같음(`PALETTE_DRAG=true` 포함), 공개 `src/styles.css`에 `rt-palette-drag-input` 규칙 포함
- 검증(main 최종 병합 후): `node --test tests/*.test.cjs` 67/67, 제품 32개 검증 통과, `package-site` 성공, e2e 204/204, `check-version.cjs --against origin/main` 통과, `git diff --check` 이상 없음
