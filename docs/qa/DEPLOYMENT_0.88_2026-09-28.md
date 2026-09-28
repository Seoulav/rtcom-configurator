# 0.88.0 배포 기록 (2026-09-28)

- 사용자 결정: "1번" — input_doc 매뉴얼 전부 공개(2026-09-28)
- PR: https://github.com/Seoulav/rtcom-configurator/pull/82 (squash 병합, 병합 커밋 `73148b1`)
  - 작업 중 다른 세션의 0.87.0(PR #80, XDM 전송기 사진)이 먼저 병합되어, main을 합친 뒤 이 작업을 0.88.0으로 조정했습니다. squash 커밋 제목은 처음 커밋 제목("0.87.0: …")이 그대로 남았지만 내용은 0.88.0입니다.
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 60 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36397919978) — success

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.88`
- 공개 파일 대조: `main`(73148b1)에서 만든 `dist/`와 공개 파일 SHA-256 비교 242/242 일치(`.nojekyll` 제외). 이 가운데 매뉴얼 PDF 17개
- 비공개 파일 14개 모두 404: `CLAUDE.md`, `AGENTS.md`, `CHANGELOG.md`, `input_doc/README.md`, `docs/evidence/input-doc-ledger.json`, `docs/audit/CATALOG_MANUAL_CONFLICTS_2026-09-28.md`, `.claude/settings.json`, `scripts/input_doc.py`, `tests/site.test.cjs`, `package.json`, `docs/RTcom_catalogue_2026_46p.pdf`, `output/design/assets/docs/README.md`, 공개하지 않은 매뉴얼(`input_doc/…/HEXA-01`), 등록하지 않은 이름(`output/design/assets/docs/spx-manual.pdf`)
- 병합 전 검증: `node --test` 43/43, `build-product-index --check` 30개(PDF 형식·15MB·이름 규칙), `package-site` 통과, `git diff --check` 통과, `e2e-smoke`는 playwright 없음으로 건너뜀

## 영향

- 16개 제품 상세 도구 모음에 "매뉴얼 PDF" 버튼(이름: 새 탭 보기, ⤓: 내려받기). XDM-CT103/CR103은 "CT103 매뉴얼 PDF"·"CR103 매뉴얼 PDF"
- 버전 표기 0.87 → 0.88

## 되돌리기

- main에서 `73148b1`을 revert한 뒤 다시 배포하면 버튼과 공개 PDF가 사이트에서 빠집니다. 단, 공개 저장소 Git 기록의 PDF는 남습니다.
