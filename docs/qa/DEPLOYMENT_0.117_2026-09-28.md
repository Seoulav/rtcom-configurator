# 0.117.0 배포 기록 (2026-09-28)

- 요청: "프레임 선택 시 … 연동되는 전송기들이 있는데 이거를 프레임 선택시 말고 카드 선택시로 옮겨줄래? 프레임을 선택하고 나서 거기에 특정 컨버터를 선택할 수 있게끔" (선택 "02는 그대로, 03에만 추가", 2026-09-28)
- PR: https://github.com/Seoulav/rtcom-configurator/pull/139 (squash 병합)
  - 병합 커밋: `4cc113a2b345b4a6de10c790f70f3a74b20766f8`
  - PR head: `9bffef2b`
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 115 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36487244811)
  - 실행 요청 API가 두 번 모두 HTTP 500을 돌려줬지만 실행은 대기열에 들어가 성공했습니다(21:36:37Z → 21:37:07Z), 배포 커밋 `4cc113a`.

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.117`
- 공개 파일 대조: `4cc113a`에서 `node scripts/package-site.cjs`로 만든 `dist/` 파일과 공개 파일의 SHA-256을 비교했습니다. 303/303 일치했습니다(`.nojekyll` 제외).
- 비공개 파일 5개는 모두 404였습니다: `CLAUDE.md`, `AGENTS.md`, `CHANGELOG.md`, `docs/qa/card-modal-extender-screens/1280-xdm-cis100.png`, `input_doc/README.md`
- 병합 전 검증 결과
  - `node --test tests/*.test.cjs`: 46/46
  - `build-product-index --check`: 30개 통과
  - `package-site`: 통과
  - `e2e-smoke`: 163/163
  - `git diff --check`: 통과

## 되돌리기

- main에서 `4cc113a`를 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
