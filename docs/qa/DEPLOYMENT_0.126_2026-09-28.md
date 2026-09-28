# 0.126.0 배포 기록 (2026-09-28)

- 요청: "pc에서 볼깨 메뉴얼 웹뷰어시 팝업창의 가로폭이 너무 좁아 개선해줘", "마우스로 창 크기 가변가능할까?"
- PR: https://github.com/Seoulav/rtcom-configurator/pull/157 (squash 병합)
  - 병합 커밋: `65d19688b1a0643e26d478d7812df6fcad4a2b47`
  - PR head: `72687a2`
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 133 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36500290972)
  - 결과: success (23:52:59Z → 23:53:26Z), 배포 커밋 `65d1968`

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.126`
- 공개 파일 대조: `65d1968`에서 `node scripts/package-site.cjs`로 만든 `dist/` 파일과 공개 파일의 SHA-256을 비교했습니다. 349/349 일치했습니다(`.nojekyll` 제외).
- 비공개 파일 5개는 모두 404였습니다: `CLAUDE.md`, `AGENTS.md`, `CHANGELOG.md`, `docs/qa/DOC_POPUP_RESIZE_QA_2026-09-28.md`, `input_doc/README.md`
- 병합 전 검증 결과
  - `node --test tests/*.test.cjs`: 50/50
  - `build-product-index --check`: 31개 통과
  - `package-site`: 통과
  - `e2e-smoke`: 171/171
  - `git diff --check`: 통과

## 되돌리기

- main에서 `65d1968`을 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다(0.125.0 상태: 팝업 기본 폭 720px, 폭 고정).
