# 0.131.0 배포 기록 (2026-09-29)

- 사용자 요청: "RTCOM Matrix Configurator에 글자에 Matrix는 빼자", "명칭 변경해줘"
- 병합·배포: `CLAUDE.md` 규칙(검증된 PR은 Claude가 병합·배포, 사용자 결정 2026-09-28)에 따름
- PR: https://github.com/Seoulav/rtcom-configurator/pull/167 (squash 병합, 병합 커밋 `4f6723d`)
- 배포 작업: `Deploy RTCOM to GitHub Pages` run https://github.com/Seoulav/rtcom-configurator/actions/runs/36508580166, 결과 success

## 확인

- 공개 주소 로고 문구: `RTCOM Configurator`, 버전 표기 `CATALOG BASED · 0.131`
- 비공개 파일: `CLAUDE.md` 404
- 병합 전 검증: `node --test` 53/53, `build-product-index --check` 31개, `package-site`, `git diff --check` 통과. `e2e-smoke`는 playwright 미설치로 건너뜀
- 공개 파일 전수 SHA-256 대조는 하지 않음(표기 변경만이라 위 두 항목으로 확인)

## 영향

- 상단 로고·README 제목의 "Matrix" 삭제. 한글 표기, `#matrix-configurator`, 포털 주소, LocalStorage key는 그대로

## 되돌리기

- main에서 `4f6723d`를 revert한 뒤 다시 배포합니다.
