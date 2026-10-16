# 0.238.0 배포 기록 (2026-10-16)

- 병합: PR #366 → main `fc8cdd3`(squash, `expectedHeadSha` 28882e7 고정, `RTCOM checks / verify` 통과 확인 후)
- 배포: `Deploy RTCOM to GitHub Pages` run 38976120761, 성공
- 공개 주소 확인(`https://seoulav.github.io/rtcom-configurator/`):
  - 화면 버전 표기 `CATALOG BASED · 0.238`
  - `CLAUDE.md` 404(비공개 유지)
  - 공개 `src/styles.css`에 "0.238 다크 값" 블록 반영 확인
- 변경 내용: 다크 모드 B단계 ②, 기기 설정이 다크일 때 다크 값 연결(`docs/implementation/DARK_MODE_0.238.md`). 작업 중 main이 0.234~0.237로 바뀌어 네 번 병합하고 번호를 다시 정했습니다.
