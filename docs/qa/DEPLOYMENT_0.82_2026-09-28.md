# 0.82.0 배포 기록 (2026-09-28)

- 사용자 승인: "배포해줘" (2026-09-28)
- PR: https://github.com/Seoulav/rtcom-configurator/pull/67 (squash 병합)
  - 병합 커밋: `1fea6b69cdc478ae6092d73a4f48f3dfd3b64c0a`
  - PR head: `16653a8d`
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 50 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36375677792)
  - 결과: success (03:56:40Z → 03:57:09Z)
  - 저장소 전체를 올리는 `pages build and deployment`(push 이벤트) 실행은 없었습니다.

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.82` (https://seoulav.github.io/rtcom-configurator/)
- 공개 파일 대조: `origin/main`(1fea6b6)에서 `node scripts/package-site.cjs`로 만든 `dist/` 파일과 공개 파일의 SHA-256을 비교했습니다. 224/224 일치했습니다(`.nojekyll` 제외).
- 비공개 파일 16개는 모두 404였습니다.
  - 루트 문서: `CLAUDE.md`, `README.md`, `CHANGELOG.md`, `AGENTS.md`, `DEVICE_WORKFLOW.md`, `.gitattributes`
  - 로컬 작업 파일: `.claude/settings.json`, `.claude/skills/input-doc/SKILL.md`, `input_doc/README.md`, `scripts/input_doc.py`, `scripts/input-doc-status.cjs`
  - 스크립트·QA 문서: `scripts/package-site.cjs`, `scripts/e2e-smoke.cjs`, `docs/qa/IO_TABLE_WRAP_FIX_QA_2026-09-28.md`, `docs/qa/io-table-wrap-screens/hds-21u-io-before-480.png`
  - `.source-materials/RTcom_Manual_HD-13U_Ver1.2.pdf`
- 병합 전 검증 결과
  - `node --test tests/*.test.cjs`: 42/42
  - `build-product-index --check`: 30개 통과
  - `package-site`: 통과
  - `e2e-smoke`: 144/144 (입출력 단자 표 방향·수량 칸 재발 방지 검사 포함)
  - `git diff --check`: 통과

## 영향

- 입출력 단자 표(제조사 자료)에서 방향·수량 칸이 좁은 화면에서 줄바꿈되던 문제가 30개 제품 전체에서 고쳐졌습니다.
- 그 외 공개 화면은 버전 표기만 바뀌었습니다(0.81 → 0.82).

## 되돌리기

- main에서 `1fea6b6`을 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
