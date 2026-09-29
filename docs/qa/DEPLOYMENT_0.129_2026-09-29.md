# 0.129.0 배포 기록 (2026-09-29)

- 요청: "이거 삭제해줘" (01 제품군 아래 바 "XDM / XDM-72 · 카테고리: 매트릭스" 캡처, 2026-09-29)
- PR: https://github.com/Seoulav/rtcom-configurator/pull/162 (squash 병합)
  - 병합 커밋: `d167400859f787c625d0baf8e4b1b03d3594e99d`
  - PR head: `e9a8e125`
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 138 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36504322438)
  - 결과: success (00:41:33Z → 00:42:02Z), 배포 커밋 `d167400`

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.129`, 공개 `index.html`에 `class="rt-summary"` 없음
- 공개 파일 대조: `d167400`에서 `node scripts/package-site.cjs`로 만든 `dist/` 파일과 공개 파일의 SHA-256을 비교했습니다. 349/349 일치했습니다(`.nojekyll` 제외).
- 비공개 파일 5개는 모두 404였습니다: `CLAUDE.md`, `AGENTS.md`, `CHANGELOG.md`, `docs/qa/DEPLOYMENT_0.128_2026-09-29.md`, `input_doc/README.md`
- 병합 전 검증 결과
  - `node --test tests/*.test.cjs`: 53/53
  - `build-product-index --check`: 31개 통과
  - `package-site`: 통과
  - `e2e-smoke`: 174/174
  - `git diff --check`: 통과

## 되돌리기

- main에서 `d167400`을 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
