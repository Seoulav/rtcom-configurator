# 0.87.0 배포 기록 (2026-09-28)

- 사용자 승인: "이 이미지를 활용해서 저해상도 이미지 교체를 해 주고 너가 병합하고 올려줘. 바로올려" (2026-09-28)
- PR: https://github.com/Seoulav/rtcom-configurator/pull/80 (squash 병합)
  - 병합 커밋: `cd15c92767e7499dd1ce95d86a43ce249fc2d22d`
  - PR head: `94b34c36`
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 59 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36397467493)
  - 결과: success (08:27:27Z → 08:27:57Z)

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.87`
- 공개 파일 대조: `origin/main`(cd15c92)에서 `node scripts/package-site.cjs`로 만든 `dist/` 파일과 공개 파일의 SHA-256을 비교했습니다. 225/225 일치했습니다(`.nojekyll` 제외). 새 파일 `xdm-ct103-front-rear.webp`도 포함합니다.
- 비공개 파일 11개는 모두 404였습니다.
  - 루트 문서: `CLAUDE.md`, `README.md`, `CHANGELOG.md`, `AGENTS.md`, `DEVICE_WORKFLOW.md`
  - 로컬 작업 파일: `.claude/settings.json`, `input_doc/README.md`, `scripts/input_doc.py`
  - 스크립트·QA 문서: `scripts/e2e-smoke.cjs`, `docs/qa/XDM_RTCOM_PHOTO_QA_2026-09-28.md`
  - 비공개 원본: `.source-materials/…`
- 병합 전 검증 결과
  - `node --test tests/*.test.cjs`: 43/43
  - `build-product-index --check`: 30개 통과
  - `package-site`: 통과
  - `e2e-smoke`: 147/147
  - `git diff --check`: 통과

## 영향

- 제품 사진을 RT컴 고해상도 사진으로 바꿨습니다(XDM-CTR100·XDM-FT101·XDM-FR101·XDM-CT103의 상세 사진, 목록 카드, 구성기 04 전송기 썸네일).
- 단자 지도를 새 사진 기준으로 다시 만들었습니다(CTR100·FT101·CT103). XDM-FR101에는 수신기 뒷면 단자 지도를 새로 추가했습니다.

## 되돌리기

- main에서 `cd15c92`를 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
