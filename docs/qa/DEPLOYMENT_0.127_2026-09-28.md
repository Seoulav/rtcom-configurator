# 0.127.0 배포 기록 (2026-09-28)

- 사용자 요청: "이것도 버튼 위로 배치하고 오른쪽 화살표도 보이레"(빨간 표시가 있는 화면 캡처 첨부)
- 병합·배포: `CLAUDE.md` 규칙(검증된 PR은 Claude가 병합·배포, 사용자 결정 2026-09-28)에 따름
- PR: https://github.com/Seoulav/rtcom-configurator/pull/159 (squash 병합, 병합 커밋 `ac45dda`)
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 135 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36500775515), 결과 success

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.127`
- 공개 파일 대조: `ac45dda`를 별도 폴더(git worktree)에서 빌드한 `dist/` 350개와 공개 주소 파일을 SHA-256으로 비교해 349개 일치(`.nojekyll`은 GitHub Pages가 공개하지 않는 빈 파일)
- 비공개 파일: `CLAUDE.md`, `AGENTS.md` 404
- 병합 전 검증: `node --test` 51/51, `build-product-index --check` 31개, `package-site`, `e2e-smoke` 172/172, `git diff --check` 통과

## 영향

- 01 제품군 미리보기 태그 줄 아래에 "프레임 선택 →" 버튼이 생김
- 파란 "다음" 버튼의 → 화살표가 파란 배경에 묻히던 문제를 흰색으로 수정
- 이 배포에서는 아래 바의 같은 버튼이 남아 01에 버튼이 두 개 보였고, 0.128.0에서 정리했습니다(`DEPLOYMENT_0.128_2026-09-29.md`).

## 되돌리기

- main에서 `ac45dda`를 revert한 뒤 다시 배포합니다.
