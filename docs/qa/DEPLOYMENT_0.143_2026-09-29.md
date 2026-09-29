# 0.143.0 배포 기록 (2026-09-29)

- 사용자 요청: 제품정보 카드 정보를 누르면 상세 정보를 보이게 하고, CIS·COS 카드의 CTR100 연동 표기는 빼고 HDBaseT 카드로만 표기(XDM·SPX·VDM 동일)
- 병합·배포: `CLAUDE.md` 규칙(사용자 결정 2026-09-28)에 따름
- PR: https://github.com/Seoulav/rtcom-configurator/pull/190 (squash 병합, 병합 커밋 `8bb4cc5`)
- 배포 작업: `Deploy RTCOM to GitHub Pages` 수동 실행

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.143`
- main 빌드 산출물 338개 파일 중 337개가 공개 파일과 SHA-256 일치(다른 1개는 `.nojekyll`)
- `CLAUDE.md`는 공개 주소에서 404
