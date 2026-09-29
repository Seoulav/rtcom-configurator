# 0.130.0 배포 기록 (2026-09-29)

- 사용자 요청: "HD-D102U Rack마운트 이미지도 XDM-PSU 그래픽컨셉을 계승해줘", "윗면 옆면은 전부 삭제해줘 정면만 남겨줘"
- 병합·배포: `CLAUDE.md` 규칙(검증된 PR은 Claude가 병합·배포, 사용자 결정 2026-09-28)에 따름
- PR: https://github.com/Seoulav/rtcom-configurator/pull/164 (squash 병합, 병합 커밋 `7b7096d`)
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 140 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36507888969), 결과 success

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.130`
- 공개 파일 대조: `7b7096d`를 별도 폴더(git worktree)에서 빌드한 `dist/` 348개와 공개 주소 파일을 SHA-256으로 비교해 347개 일치(`.nojekyll`은 GitHub Pages가 공개하지 않는 빈 파일)
- 정면 그림: `hd-d102u-rack-front-art.webp` 200. 삭제한 `hd-d102u-rack-top-art.webp`·`hd-d102u-rack-side-art.webp`는 404
- 공개 `data/products/hd-d102u-rack.json`: 그림 `["hd-d102u-rack-front-art.webp"]`, 단자 지도 1장
- 비공개 파일: `CLAUDE.md`, `AGENTS.md` 404
- 병합 전 검증: `node --test` 53/53, `build-product-index --check` 31개, `package-site`, `e2e-smoke` 174/174, `git diff --check` 통과

## 영향

- HD-D102U Rack마운트 정면 그림이 XDM-PSU 그림과 같은 밝은 회색 금속 몸체·흰 모듈 카드 컨셉으로 바뀜(배치·번호 좌표 동일)
- 윗면·옆면 그림과 02 Port Map의 윗면·옆면 카드가 사라지고 정면 1장만 남음

## 되돌리기

- main에서 `7b7096d`를 revert한 뒤 다시 배포합니다.
