# 0.133.0 배포 기록 (2026-09-29)

- 사용자 요청: "분배기 장착 번호가 너무 작다 다른 색상으로 표기해서 눈의띄게 해줘"
- 병합·배포: `CLAUDE.md` 규칙(검증된 PR은 Claude가 병합·배포, 사용자 결정 2026-09-28)에 따름
- PR: https://github.com/Seoulav/rtcom-configurator/pull/171 (squash 병합, 병합 커밋 `7857527`)
- 배포 작업: `Deploy RTCOM to GitHub Pages` https://github.com/Seoulav/rtcom-configurator/actions/runs/36511987041, 결과 success

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.133`
- 공개 `hd-d102u-rack-front-art.webp`의 SHA-256 앞 16자리(`aed363d16e0dc561`)가 main 파일과 일치
- 비공개 파일: `CLAUDE.md` 404
- 병합 전 검증: `node --test` 54/54, `build-product-index --check` 31개, `package-site`, `git diff --check` 통과. `e2e-smoke`는 playwright 브라우저가 없어 건너뜀
- 공개 파일 전수 대조는 하지 않음(그림 1개 교체)

## 영향

- HD-D102U Rack마운트 정면 그림의 칸 번호 1~12가 파란 원 배지 + 흰 숫자로 커짐. 배치·좌표 불변

## 되돌리기

- main에서 `7857527`을 revert한 뒤 다시 배포합니다.
