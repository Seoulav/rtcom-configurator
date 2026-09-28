# 0.84.0 배포 기록 (2026-09-28)

- 사용자 결정: "병합도 앞으로 자동으로 해줘", "배포 적용도 바로 같이 해줘" (2026-09-28). 이 결정으로 `CLAUDE.md` 규칙을 바꾼 뒤 Claude가 병합·배포를 이어서 실행한 첫 배포입니다.
- 포함 PR(squash 병합)
  - https://github.com/Seoulav/rtcom-configurator/pull/68 — input_doc 첫 정리, VDM HOS4-U 카드 사양 등록, CIS4-U·COS4-U·QOS4S-U 보완
  - https://github.com/Seoulav/rtcom-configurator/pull/71 — input_doc 반영 장부·STATUS.md
  - https://github.com/Seoulav/rtcom-configurator/pull/72 — PR 병합 규칙
  - https://github.com/Seoulav/rtcom-configurator/pull/73 — 0.84.0 버전 표기·배포 규칙(병합 커밋 `0ac6597`)
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 52 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36384380606)
  - 결과: success (06:00:35Z 시작, 06:01:02Z 끝)
  - 저장소 전체를 올리는 `pages build and deployment` 실행은 없었습니다.

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.84` (https://seoulav.github.io/rtcom-configurator/)
- 공개 파일 대조: `main`(0ac6597)에서 `node scripts/package-site.cjs`로 만든 `dist/` 파일과 공개 파일의 SHA-256을 비교했습니다. 224/224 일치했습니다(`.nojekyll` 제외).
- 공개 `src/card-specs.js`에 HOS4-U 사양(4K HDMI Output Board)이 들어 있습니다.
- 비공개 파일 16개는 모두 404였습니다.
  - 루트 문서: `CLAUDE.md`, `AGENTS.md`, `CHANGELOG.md`, `DEVICE_WORKFLOW.md`, `.gitignore`, `package.json`
  - 로컬 작업 파일: `.claude/settings.json`, `.claude/skills/input-doc/SKILL.md`, `input_doc/README.md`, `scripts/input_doc.py`, `scripts/input-doc-status.cjs`
  - 새로 추가된 비공개 파일: `docs/evidence/input-doc-ledger.json`, `docs/qa/INPUT_DOC_INTAKE_2026-09-28.md`
  - 기타: `tests/site.test.cjs`, `docs/implementation/CARD_DETAIL_INFO.md`, `docs/RTcom_catalogue_2026_46p.pdf`
- 병합 전 검증 결과
  - `node --test tests/*.test.cjs`: 43/43
  - `build-product-index --check`: 30개 통과
  - `package-site`: 통과
  - `e2e-smoke`: playwright가 없어 건너뜀
  - `git diff --check`: 통과

## 영향

- 구성기 03 카드 슬롯의 VDM 카드 정보: HOS4-U 사양이 새로 보이고, CIS4-U·COS4-U·QOS4S-U에 매뉴얼 값이 더해졌습니다. 출처 줄에 카탈로그 쪽과 매뉴얼 쪽이 함께 나옵니다.
- 버전 표기가 바뀌었습니다(0.83 → 0.84). 그 밖의 공개 화면은 바뀌지 않았습니다.

## 되돌리기

- main에서 해당 커밋을 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
