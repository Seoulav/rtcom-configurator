# 0.218.0 배포 기록(2026-10-14)

- PR: #332 (`0.218.0: 용어 검토 행 결정(믹스→병합, Touch Screen→터치스크린, 영문 원문 유지)`) → main 병합, squash 커밋 `28adaa7`
- 병합 전 검사: `RTCOM checks / verify` 성공(head `36c0eb2`)
- 병합 방식: GitHub 연결 도구로 `expectedHeadSha`를 고정해 squash 병합
- Pages 배포: `Deploy RTCOM to GitHub Pages`(`pages.yml`) 수동 실행, run 38650420464, 결과 success, main `28adaa7`
- 공개 주소 확인:
  - `https://seoulav.github.io/rtcom-configurator/`에 `CATALOG BASED · 0.218` 표기
  - `data/products/spx.json`에 `터치스크린` 6곳, `data/products/hd-210u.json`에 `믹스` 0곳
  - `CLAUDE.md` 공개 주소 HTTP 404(비공개 유지)
- 되돌리기: `git revert 28adaa7` 후 Pages 배포를 다시 실행하면 0.217 문구로 돌아갑니다.
