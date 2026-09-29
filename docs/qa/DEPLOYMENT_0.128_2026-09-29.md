# 0.128.0 배포 기록 (2026-09-29)

- 사용자 지적: "버튼이 중복이다"(01 제품군 화면에 "프레임 선택" 버튼이 미리보기와 아래 바에 두 개 보임)
- 병합·배포: `CLAUDE.md` 규칙(검증된 PR은 Claude가 병합·배포, 사용자 결정 2026-09-28)에 따름
- PR: https://github.com/Seoulav/rtcom-configurator/pull/160 (squash 병합, 병합 커밋 `8410c03`)
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 136 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36501444367), 결과 success

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.128`
- 공개 파일 대조: `8410c03`을 별도 폴더(git worktree)에서 빌드한 `dist/` 350개와 공개 주소 파일을 SHA-256으로 비교해 349개 일치(`.nojekyll` 제외)
- 공개 파일 내용: `src/app.js`에 `next.hidden=state.step===0`, `src/styles.css`에 `.rt-button[hidden]{display:none!important}`가 있음
- 비공개 파일: `CLAUDE.md`, `AGENTS.md` 404
- 병합 전 검증: `node --test` 52/52, `build-product-index --check` 31개, `package-site`, `e2e-smoke` 172/172, `git diff --check` 통과

## 영향

- 01 제품군에서 아래 바의 다음 버튼을 숨기고 미리보기의 "프레임 선택 →" 버튼 하나만 남김(아래 바에는 선택 요약만 표시)
- 02 프레임 선택부터는 아래 바 다음 버튼이 그대로 나옴(02는 미리보기·아래 바에 버튼이 함께 있음, 사용자 결정 대기)

## 되돌리기

- main에서 `8410c03`을 revert한 뒤 다시 배포합니다.
