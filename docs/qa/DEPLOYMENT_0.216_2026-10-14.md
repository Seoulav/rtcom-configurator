# 0.216.0 배포 기록(2026-10-14)

- PR: #329 (`0.216.0: SPX-R6 크기·무게·외부 전원 어댑터 규격 추가`) → main 병합, squash 커밋 `3624107`
- 병합 전 검사: `RTCOM checks / verify` 성공(head `8b7118c`)
- 병합 방식: `gh pr merge`는 이 세션에서 GraphQL 제한으로 막혀, GitHub 연결 도구로 `expectedHeadSha`를 고정해 squash 병합
- Pages 배포: `Deploy RTCOM to GitHub Pages`(`pages.yml`) 수동 실행, run 38518432276, 결과 success, main `3624107`
- 공개 주소 확인:
  - `https://seoulav.github.io/rtcom-configurator/`에 `CATALOG BASED · 0.216` 표기
  - `data/products/spx-r6.json`에 `440×43.6×170`, `2.9`, `12V 5A 60W` 반영
  - `CLAUDE.md` 공개 주소 HTTP 404(비공개 유지)
- 되돌리기: `git revert 3624107` 후 Pages 배포를 다시 실행하면 SPX-R6 사양 세 행이 빠집니다.
