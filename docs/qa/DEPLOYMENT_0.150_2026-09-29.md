# 0.150.0 배포 기록 (2026-09-29)

- 사용자 요청: "44,88모두 분할 부분구성 예시를 그래픽작업해달라는거야"(시안 확인 "메뉴얼을 기반으로 했다면 좋아")
- 병합·배포: `CLAUDE.md` 규칙(사용자 결정 2026-09-28)에 따름
- PR: https://github.com/Seoulav/rtcom-configurator/pull/201 (squash 병합, 병합 커밋 `efe36e3`). 병합 직전 다른 세션이 0.148·0.149를 먼저 올려 두 번 합치고 번호를 0.150.0으로 옮김
- 배포 작업: `Deploy RTCOM to GitHub Pages` 수동 실행

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.150`
- 공개 `src/products.js`에 새 분할 예시 그림 코드(`rt-pg-layout-wall`) 포함
- main 빌드 산출물 338개 중 337개가 공개 파일과 SHA-256 일치(다른 1개는 `.nojekyll`). 첫 조회에서 `qms-88ux-manual.pdf`(6MB)는 시간 초과로 빠졌으나 다시 받아 해시 일치 확인
- `CLAUDE.md`는 공개 주소에서 404
