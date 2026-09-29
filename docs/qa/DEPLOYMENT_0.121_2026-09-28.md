# 0.121.0 배포 기록 (2026-09-28)

- 요청: "HD-D102U 연관제품으로 2분배기 프레임 추가 기존에 이미지 형태로 넣어줘 모델명은 HD-D102U Rack마운트" (사용자 제공 도면 PDF 1쪽, 2026-09-28)
- PR: https://github.com/Seoulav/rtcom-configurator/pull/147 (squash 병합)
  - 병합 커밋: `183733fdaf7809322b606064469a0eaa215d12a0`
  - PR head: `0be2be48`
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 123 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36496442545)
  - 결과: success (23:09:04Z → 23:09:34Z), 배포 커밋 `183733f`

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.121`
- 공개 파일 대조: `183733f`에서 `node scripts/package-site.cjs`로 만든 `dist/` 파일과 공개 파일의 SHA-256을 비교했습니다. 309/309 일치했습니다(`.nojekyll` 제외, 공개 주소에서 404인 것은 이전과 같음). 새 그림 4장과 `data/products/hd-d102u-rack.json`이 포함됩니다.
- 비공개 파일 5개는 모두 404였습니다: `CLAUDE.md`, `AGENTS.md`, `CHANGELOG.md`, `docs/qa/DEPLOYMENT_0.120_2026-09-28.md`, `input_doc/README.md`
- 사용자 제공 도면 PDF는 공개 폴더에 올리지 않았습니다(`documents`에 `file` 없음).
- 병합 전 검증 결과
  - `node --test tests/*.test.cjs`: 47/47
  - `build-product-index --check`: 31개 통과
  - `package-site`: 통과
  - `e2e-smoke`: 164/164
  - `git diff --check`: 통과

## 되돌리기

- main에서 `183733f`를 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
