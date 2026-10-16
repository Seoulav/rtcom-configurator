# 0.222.0 배포 기록(2026-10-16)

- PR: #339 (`0.222.0: 제품 상세 문서 버튼을 종류별 색 아이콘 카드형으로 개편`) → main 병합, squash 커밋 `3800aa9`
- 병합 전 검사: `RTCOM checks / verify` 성공(head `717eeea`)
- 병합 방식: `gh pr merge`는 이 세션에서 GraphQL 제한으로 막혀, GitHub 연결 도구로 `expectedHeadSha`를 고정해 squash 병합
- Pages 배포: `Deploy RTCOM to GitHub Pages`(`pages.yml`) 수동 실행, run 38877235508, 결과 success, main `3800aa9`
- 공개 주소 확인:
  - `https://seoulav.github.io/rtcom-configurator/`에 `CATALOG BASED · 0.222` 표기
  - `src/styles.css`·`src/products.js`에 `rt-pg-doc-card` 반영
  - `CLAUDE.md` 공개 주소 HTTP 404(비공개 유지)
- 되돌리기: `git revert 3800aa9` 후 Pages 배포를 다시 실행하면 이전 알약 모양 문서 버튼으로 돌아갑니다(데이터 변경 없음).
