# 0.90.0 배포 기록 (2026-09-28)

- 근거 규칙: CLAUDE.md "검증이 통과하고 PR 설명에 결과를 적은 PR은 Claude가 병합하고, 이어서 공개 Pages 배포와 공개 주소 확인까지 합니다"(사용자 결정 2026-09-28)
- 요청: "QMS-88Ux도 듀얼 출력되지 않아??"(2026-09-28)
- PR: https://github.com/Seoulav/rtcom-configurator/pull/85 (squash 병합)
  - 병합 커밋: `18e3c36faf599e412e048bffb1216e61485ac07e`
  - PR head: `aa0981f8`
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 64 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36406676193)
  - 결과: success (09:56:47Z → 09:57:15Z)

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.90`
- 공개 `data/products/qms-88ux.json` DUAL summary: "출력 9·10번 멀티뷰 설정에서 한 화면 2분할(PBP)·PIP 구성."
- 공개 파일 대조: `18e3c36`에서 `node scripts/package-site.cjs`로 만든 `dist/` 파일과 공개 파일의 SHA-256을 비교했습니다. 242/242 일치했습니다(`.nojekyll` 제외).
- 비공개 파일 6개는 모두 404였습니다: `CLAUDE.md`, `CHANGELOG.md`, `docs/qa/QMS88UX_DUAL_QA_2026-09-28.md`, `scripts/e2e-smoke.cjs`, `.claude/settings.json`, `input_doc/README.md`
- 병합 전 검증 결과
  - `node --test tests/*.test.cjs`: 43/43
  - `build-product-index --check`: 30개 통과
  - `package-site`: 통과
  - `e2e-smoke`: 148/148
  - `git diff --check`: 통과

## 영향

- QMS-88UX 06 화면 구성 모드의 DUAL 카드에 설명과 레이아웃 칩 3종(Horizontal PBP·Vertical PBP·Quad PBP, PIP)이 생겼습니다.

## 되돌리기

- main에서 `18e3c36`을 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
