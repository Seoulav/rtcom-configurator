# 0.85.0 배포 기록 (2026-09-28)

- 사용자 결정: "추천대로", "이것도 수정" (2026-09-28) — `docs/audit/CATALOG_MANUAL_CONFLICTS_2026-09-28.md`
- PR: https://github.com/Seoulav/rtcom-configurator/pull/76 (squash 병합, 병합 커밋 `6cb9f3a`)
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 55 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36386670092) — success
  - 저장소 전체를 올리는 `pages build and deployment` 실행은 없었습니다.

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.85`
- 공개 파일 대조: `main`(6cb9f3a)에서 만든 `dist/`와 공개 파일 SHA-256 비교 224/224 일치(`.nojekyll` 제외)
- 비공개 파일 16개 모두 404: `CLAUDE.md`, `AGENTS.md`, `CHANGELOG.md`, `DEVICE_WORKFLOW.md`, `input_doc/README.md`, `docs/evidence/input-doc-ledger.json`, `docs/audit/CATALOG_MANUAL_CONFLICTS_2026-09-28.md`, `docs/qa/DEPLOYMENT_0.84_2026-09-28.md`, `.claude/settings.json`, `.claude/skills/input-doc/SKILL.md`, `scripts/input_doc.py`, `scripts/input-doc-status.cjs`, `tests/site.test.cjs`, `.gitignore`, `package.json`, `docs/RTcom_catalogue_2026_46p.pdf`
- 병합 전 검증: `node --test` 43/43, `build-product-index --check` 30개, `package-site` 통과, `git diff --check` 통과, `e2e-smoke`는 playwright 없음으로 건너뜀

## 영향

- 구성기 VDM 카드 정보: HIS4-U·CIS4-U·FIS4-U·COS4-U·FOS4-U·HOS4-U에 "매뉴얼 해상도" 행, SOS4 포트 구성에 스테레오 입·출력 4포트
- 제품정보 QMS-88UX 06 화면 구성 모드: QUAD 레이아웃 14종("8분할(16:9 비율)" 추가)
- 버전 표기 0.84 → 0.85

## 되돌리기

- main에서 `6cb9f3a`를 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
