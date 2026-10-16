# 0.230.0 배포 기록(2026-10-16)

- PR: #355 (`0.230.0: 03 카드 정보 타일 모델명 잘림 개선`) → main 병합, squash 커밋 `eeeda6a`
- 병합 전 검사: `RTCOM checks / verify` 성공(head `54a90dd`), 병합 직전 main은 0.229 그대로라 번호 충돌 없음
- 병합 방식: `gh pr merge`는 이 세션에서 GraphQL 제한으로 막혀, GitHub 연결 도구로 `expectedHeadSha`를 고정해 squash 병합
- Pages 배포: `Deploy RTCOM to GitHub Pages`(`pages.yml`) 수동 실행, run 38907438218, 결과 success, main `eeeda6a`
- 공개 주소 확인:
  - `https://seoulav.github.io/rtcom-configurator/`에 `CATALOG BASED · 0.230` 표기
  - `src/styles.css`에 신호 배지·모델명 두 줄 규칙, 560px 이하 2열, 3열 → 6열 전환 1279px 반영, 0.228의 타일 배지 9.5px 예외 삭제 확인
  - `CLAUDE.md` 공개 주소 HTTP 404(비공개 유지)
- 되돌리기: `git revert eeeda6a` 후 Pages 배포를 다시 실행하면 0.229 화면으로 돌아갑니다(0.228의 9.5px 예외도 함께 돌아옵니다).
