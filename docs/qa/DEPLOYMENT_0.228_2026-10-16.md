# 0.228.0 배포 기록(2026-10-16)

- PR: #348 (`0.228.0: SVT 공통 디자인 v2 A단계 적용`) → main 병합, squash 커밋 `696f420`
- 병합 전 검사: `RTCOM checks / verify` 성공(head `74e93df`)
- 검사 이력: 앞선 두 번은 실패했습니다.
  - 첫 번째(`1c59ca0`): e2e "390px 화면 페이지 가로 넘침 6px"(로컬은 0px). 카드 정보 3열 타일의 신호 배지를 9.5px → 12px로 올려 모델명이 7px 더 넘친 것이 원인이었고, 이 타일의 배지만 9.5px로 되돌려 해소했습니다.
  - 두 번째(`88ec423`): 다른 작업이 main에 0.227을 먼저 병합해 버전 점검이 번호 충돌을 잡았습니다. main을 합치고 0.228로 다시 정했습니다.
  - 검토 중 `.rt-report`(보고서 본문 12.5px)와 그 안의 신호 배지(8.5px)도 바뀐 것을 찾아 되돌렸고, 보고서·인쇄 규칙이 수정 전과 동일함을 코드 비교로 확인했습니다.
- 병합 방식: `gh pr merge`는 이 세션에서 GraphQL 제한으로 막혀, GitHub 연결 도구로 `expectedHeadSha`를 고정해 squash 병합
- Pages 배포: `Deploy RTCOM to GitHub Pages`(`pages.yml`) 수동 실행, run 38904278900, 결과 success, main `696f420`
- 공개 주소 확인:
  - `https://seoulav.github.io/rtcom-configurator/`에 `CATALOG BASED · 0.228` 표기
  - `src/styles.css`에 `--rt-accent:#0057D8`, 새 그라데이션 6곳, 앱 아이콘 그라데이션, 예정 단계 탭, 모바일 상단 압축, 카드 타일 배지 예외 반영
  - `CLAUDE.md` 공개 주소 HTTP 404(비공개 유지)
- 되돌리기: `git revert 696f420` 후 Pages 배포를 다시 실행하면 0.227 화면으로 돌아갑니다(CSS 외 변경 없음).
