# 0.132.0 배포 기록 (2026-09-29)

- 사용자 요청: "VDM-8X는 다소 크다 이거보다는 작게해주고 나머지 VDM프레임 크기는 다소 작아서 너가 적정한 크기 판단해서 이미지 개선해줘", "이거 다 끝나면 SPX, XDM도 비슷한 컨셉으로 수정해줘"
- 병합·배포: `CLAUDE.md` 규칙(검증된 PR은 Claude가 병합·배포, 사용자 결정 2026-09-28)에 따름
- PR: https://github.com/Seoulav/rtcom-configurator/pull/169 (squash 병합, 병합 커밋 `32cdbee`)
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 143 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36509770835), 결과 success

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.132`
- 공개 파일 대조: `32cdbee`를 별도 폴더(git worktree)에서 빌드한 `dist/` 348개와 공개 주소 파일을 SHA-256으로 비교해 347개 일치(`.nojekyll`은 GitHub Pages가 공개하지 않는 빈 파일)
- 공개 파일 내용: `src/app.js`에 `frameShowHeight`, `src/styles.css`에 `.rt-cg-scaled img` 규칙이 있음
- 비공개 파일: `CLAUDE.md`, `AGENTS.md` 404
- 병합 전 검증: `node --test` 54/54, `build-product-index --check` 31개, `package-site`, `e2e-smoke` 175/175, `git diff --check` 통과

## 영향

- 02 프레임 선택 미리보기 그림 높이가 프레임 랙 높이(U)에 비례함(VDM·SPX·XDM). 가장 작은 VDM-8X·SPX-M810·XDM-12는 작아지고 큰 프레임(VDM-80X~180X, XDM-144·216)은 커짐
- 그림 파일과 데이터는 바뀌지 않음(표시 크기만 변경)

## 되돌리기

- main에서 `32cdbee`를 revert한 뒤 다시 배포합니다.
