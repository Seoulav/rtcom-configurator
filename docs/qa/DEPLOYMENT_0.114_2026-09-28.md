# 0.114.0 배포 기록 (2026-09-28)

- 요청: "프레임 선택후 다음 이동 버튼을 여기에 넣어줘" (02 프레임 선택 미리보기 빈 공간 표시 캡처, 2026-09-28)
- PR: https://github.com/Seoulav/rtcom-configurator/pull/133 (squash 병합)
  - 병합 커밋: `7ca0b474ab9dd01b1c77dc3a9f501e4213982031`
  - PR head: `858624de`
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 108 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36481685973)
  - 결과: success (20:47:33Z → 20:48:05Z), 배포 커밋 `7ca0b47`

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.114`
- 공개 파일 대조: `7ca0b47`에서 `node scripts/package-site.cjs`로 만든 `dist/` 파일과 공개 파일의 SHA-256을 비교했습니다. 303/303 일치했습니다(`.nojekyll` 제외).
- 비공개 파일 5개는 모두 404였습니다: `CLAUDE.md`, `AGENTS.md`, `CHANGELOG.md`, `docs/qa/frame-preview-next-screens/02-xdm72-1280.png`, `input_doc/README.md`
- 병합 전 검증 결과
  - `node --test tests/*.test.cjs`: 46/46
  - `build-product-index --check`: 30개 통과
  - `package-site`: 통과
  - `e2e-smoke`: 158/158
  - `git diff --check`: 통과

## 되돌리기

- main에서 `7ca0b47`을 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
