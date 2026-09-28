# 0.122.0 배포 기록 (2026-09-28)

- 요청: "해당 페이지에 제품정보에 내가 준 파일을 그래픽화해서 같이 넣어줘" (HD-D102U Rack마운트 상세, 2026-09-28)
- PR: https://github.com/Seoulav/rtcom-configurator/pull/149 (squash 병합)
  - 병합 커밋: `c667696410874c695694b161879bac5bff6f68fd`
  - PR head: `bd8aa3a8`
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 125 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36497123701)
  - 결과: success (23:16:32Z → 23:17:06Z), 배포 커밋 `c667696`

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.122`
- 공개 파일 대조: `c667696`에서 `node scripts/package-site.cjs`로 만든 `dist/` 파일과 공개 파일의 SHA-256을 비교했습니다. 310/310 일치했습니다(`.nojekyll` 제외). 새 파일은 `output/design/assets/products/hd-d102u-rack-drawing-art.webp`입니다.
- 비공개 파일 5개는 모두 404였습니다: `CLAUDE.md`, `AGENTS.md`, `CHANGELOG.md`, `docs/qa/DEPLOYMENT_0.121_2026-09-28.md`, `input_doc/README.md`
- 사용자 제공 도면 PDF는 공개하지 않았습니다.
- 병합 전 검증 결과
  - `node --test tests/*.test.cjs`: 47/47
  - `build-product-index --check`: 31개 통과
  - `package-site`: 통과
  - `e2e-smoke`: 165/165
  - `git diff --check`: 통과

## 되돌리기

- main에서 `c667696`을 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
