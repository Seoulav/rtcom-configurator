# 0.124.0 배포 기록 (2026-09-28)

- 요청: "13u 메뉴얼은 pdf.js으로 카탈로그는 이미지 방식으로 구현해줘" → 테스트 링크 확인 후 "이거 좋아" → 질문 응답 "전체 제품으로 넓혀서 올리기"
- PR: https://github.com/Seoulav/rtcom-configurator/pull/153 (squash 병합)
  - 병합 커밋: `5852affa2868716b528fb4d835a810ae51c2b79e`
  - PR head: `3c43646`
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 129 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36498730503)
  - 결과: success (23:34:43Z → 23:35:07Z), 배포 커밋 `5852aff`

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.124`
- 공개 파일 대조: `5852aff`에서 `node scripts/package-site.cjs`로 만든 `dist/` 파일과 공개 파일의 SHA-256을 비교했습니다. 349/349 일치했습니다(`.nojekyll` 제외). 새 카탈로그 쪽 그림 41장(`*-catalog-p<N>.webp`)이 포함됩니다.
- PDF.js 파일(`src/vendor/pdfjs/pdf.min.mjs`)은 `text/javascript`로 전달되고, `pdf.worker.min.mjs`·매뉴얼 PDF(`vdm-manual.pdf` 등)는 200입니다.
- 비공개 파일 5개는 모두 404였습니다: `CLAUDE.md`, `AGENTS.md`, `CHANGELOG.md`, `docs/qa/DEPLOYMENT_0.123_2026-09-28.md`, `input_doc/README.md`
- 병합 전 검증 결과
  - `node --test tests/*.test.cjs`: 48/48
  - `build-product-index --check`: 31개 통과
  - `package-site`: 통과
  - `e2e-smoke`: 168/168
  - `git diff --check`: 통과
- 이 작업 환경에서는 프록시 때문에 브라우저로 공개 주소를 열 수 없어, 화면 동작은 로컬 배포본 e2e와 SHA 대조로 확인했습니다.

## 되돌리기

- main에서 `5852aff`를 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다(0.123.0 상태: HD-13U 카탈로그만 PDF.js 팝업, 나머지는 새 탭).
