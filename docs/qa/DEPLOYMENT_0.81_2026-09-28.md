# 0.81.0 배포 기록 (2026-09-28)

- 사용자 승인: "배포해도 괜찮아" (2026-09-28)
- PR: https://github.com/Seoulav/rtcom-configurator/pull/66 (squash 병합)
  - 병합 커밋: `5609d79b094177664f0af697a7da2fc75e35d050`
  - PR head: `12b54deb`
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 49 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36368377960)
  - 결과: success (02:04:13Z → 02:04:35Z)
  - 저장소 전체를 올리는 `pages build and deployment` 실행은 보이지 않았습니다.

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.81` (https://seoulav.github.io/rtcom-configurator/)
- 공개 파일 대조: `origin/main`(5609d79)에서 `node scripts/package-site.cjs`로 만든 `dist/` 파일과 공개 파일의 SHA-256을 비교했습니다. 224/224 일치했습니다(`.nojekyll` 제외).
- 비공개 파일 14개는 모두 404였습니다.
  - 루트 문서: `CLAUDE.md`, `README.md`, `CHANGELOG.md`, `AGENTS.md`, `DEVICE_WORKFLOW.md`, `.gitattributes`
  - 이번에 추가한 로컬 작업 파일: `.claude/settings.json`, `.claude/skills/input-doc/SKILL.md`, `input_doc/README.md`, `scripts/input_doc.py`, `scripts/input-doc-status.cjs`
  - 기존 비공개 경로: `scripts/package-site.cjs`, `docs/qa/…`, `.source-materials/…`
- 병합 전 검증 결과
  - `node --test tests/*.test.cjs`: 42/42
  - `build-product-index --check`: 30개 통과
  - `package-site`: 통과
  - `e2e-smoke`: 143/143
  - `git diff --check`: 통과

## 영향

- 공개 화면은 버전 표기만 바뀌었습니다(0.80 → 0.81). 추가한 파일은 모두 로컬 작업용이라 `dist/`에 들어가지 않습니다.

## 되돌리기

- main에서 `5609d79`를 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
