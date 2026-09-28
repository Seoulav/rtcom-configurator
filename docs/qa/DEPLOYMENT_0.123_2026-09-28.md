# 0.123.0 배포 기록 (2026-09-28)

- 요청: "실도면은하지말고 그래픽이미지만해사 병합배포해줘" · "다끝나면 병합 후 배포" (HD-D102U Rack마운트 상세, 2026-09-28)
- PR: https://github.com/Seoulav/rtcom-configurator/pull/151 (squash 병합)
  - 병합 커밋: `fc5de7a911951545107830f178ac02870baa7c82`
  - PR head: `f4f1f6ef`
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 127 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36498001635)
  - 결과: success (23:26:20Z → 23:26:47Z), 배포 커밋 `fc5de7a`

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.123`
- 공개 파일 대조: `fc5de7a`에서 `node scripts/package-site.cjs`로 만든 `dist/` 파일과 공개 파일의 SHA-256을 비교했습니다. 308/308 일치했습니다(`.nojekyll` 제외).
- 지운 도면 그림 2장(`hd-d102u-rack-drawing-art.webp`, `hd-d102u-rack-dims-art.webp`)은 공개 주소에서 404, 남은 그래픽 이미지(`hd-d102u-rack-front-art.webp` 등)는 200입니다.
- 비공개 파일 5개는 모두 404였습니다: `CLAUDE.md`, `AGENTS.md`, `CHANGELOG.md`, `docs/qa/DEPLOYMENT_0.122_2026-09-28.md`, `input_doc/README.md`
- 병합 전 검증 결과
  - `node --test tests/*.test.cjs`: 47/47
  - `build-product-index --check`: 31개 통과
  - `package-site`: 통과
  - `e2e-smoke`: 165/165
  - `git diff --check`: 통과

## 되돌리기

- main에서 `fc5de7a`를 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다(0.122.0 도면 카드 상태로 돌아감).
