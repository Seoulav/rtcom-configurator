# 0.89.0 배포 기록 (2026-09-28)

- 사용자 승인: "이 이미지를 활용해서 저해상도 이미지 교체를 해 주고 너가 병합하고 올려줘. 바로올려"(2026-09-28)를 이어서 적용했습니다. 이어진 지시는 "ctr100과 pse는 단자는 동일해 / zip파일안에 다 있어"입니다.
- PR: https://github.com/Seoulav/rtcom-configurator/pull/81 (squash 병합)
  - 병합 커밋: `dd0758181d7f8efa2ac39246bd0b44ede6603cbb`
  - 병합 전 main의 #82(0.88.0 매뉴얼 PDF 버튼)와 #83(0.88.0 배포 기록)을 브랜치에 먼저 병합했습니다. 그래서 이 작업의 버전은 0.89.0입니다.
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 62 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36398373205)
  - 결과: success (08:36:35Z → 08:37:02Z)

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.89`
- 공개 파일 대조: `dd07581`에서 `node scripts/package-site.cjs`로 만든 `dist/` 파일과 공개 파일의 SHA-256을 비교했습니다. 242/242 일치했습니다(`.nojekyll` 제외).
- 비공개 파일 12개는 모두 404였습니다.
  - 루트 문서: `CLAUDE.md`, `README.md`, `CHANGELOG.md`, `AGENTS.md`, `DEVICE_WORKFLOW.md`
  - 로컬 작업 파일: `.claude/settings.json`, `input_doc/README.md`, `scripts/input_doc.py`, `docs/evidence/input-doc-ledger.json`
  - 스크립트·QA 문서: `scripts/e2e-smoke.cjs`, `docs/qa/XDM_RTCOM_PHOTO_QA_2026-09-28.md`
  - 비공개 원본: `.source-materials/`
- 병합 전 검증 결과
  - `node --test tests/*.test.cjs`: 43/43
  - `build-product-index --check`: 30개 통과
  - `package-site`: 통과
  - `e2e-smoke`: 147/147
  - `git diff --check`: 통과

## 영향

- XDM-CTR100과 XDM-CTR100 PSE의 단자 지도가 같은 고해상도 합성 사진(1000×621)을 씁니다. 앞면은 PSE 제품 안내서 사진, 뒷면은 RT컴 CTR100(B) 사진입니다. 두 제품의 번호 7개는 같은 좌표입니다.

## 되돌리기

- main에서 `dd07581`을 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
