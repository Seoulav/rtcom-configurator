# 0.95.0 배포 기록 (2026-09-28)

- 요청: "카다로그도 일괄 공유할 수 있게해줘", 결정 "전체 카탈로그 공개해도 돼, 진행해"(2026-09-28)
- PR: https://github.com/Seoulav/rtcom-configurator/pull/93 (squash 병합)
  - 병합 커밋: `33de71d26051cc89840a289ac008fdf268f7d740`
  - PR head: `7c306006`
  - 다른 세션이 0.93.0(#92)·0.94.0을 먼저 병합해, 이 작업은 두 번 main을 병합한 뒤 0.95.0으로 올렸습니다.
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 71 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36409801082)
  - 결과: success (10:27:18Z → 10:27:48Z)

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.95`
- 공개 카탈로그: `output/design/assets/docs/rtcom-catalog-2026.pdf`가 200 `application/pdf` 3,226,094 byte로 응답합니다.
- 공개 `data/products/hd-13u.json` Catalog 문서: `rtcom-catalog-2026.pdf`, page 34
- 공개 파일 대조: `33de71d`에서 `node scripts/package-site.cjs`로 만든 `dist/` 파일과 공개 파일의 SHA-256을 비교했습니다. 243/243 일치했습니다(`.nojekyll` 제외). 0.90보다 1개 늘었는데, 공용 카탈로그 파일입니다.
- 비공개 파일 7개는 모두 404였습니다: `CLAUDE.md`, `docs/RTcom_catalogue_2026_46p.pdf`(원본 경로), `CHANGELOG.md`, `docs/qa/CATALOG_SHARE_QA_2026-09-28.md`, `.claude/settings.json`, `input_doc/README.md`, `scripts/e2e-smoke.cjs`
- 병합 전 검증 결과
  - `node --test tests/*.test.cjs`: 44/44
  - `build-product-index --check`: 30개 통과
  - `package-site`: 통과
  - `e2e-smoke`: 149/149
  - `git diff --check`: 통과

## 영향

- 29개 제품 상세에 "카탈로그 PDF N쪽" 버튼이 생겼습니다. 버튼을 누르면 새 탭이 제품 쪽에서 열리고, ⤓는 전체 파일을 내려받습니다.
- 제품 목록에 "전체 카탈로그 PDF" 버튼이 생겼습니다.

## 되돌리기

- main에서 `33de71d`를 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
