# 0.235.0 배포 기록 (2026-10-16)

## 요약

- 변경: XDM 07 화면 연출 시뮬레이터에 WOS100 카드별 레이어 사용량 칩, HOS100 표 × 창 끄기 버튼, "WOS100·HOS100 포함" 체크박스 정리(전체 커맨드 보기에서만 표시).
- PR: [Seoulav/rtcom-configurator#363](https://github.com/Seoulav/rtcom-configurator/pull/363) → main 병합 `07a1c07`(squash).
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 38913897451, 결과 success(head `07a1c07`).

## 번호 경위

- 처음 0.234.0으로 작업했으나, 병합 직전 확인에서 다른 세션의 0.234.0(QMS 설정 명령 패널, PR #362)이 먼저 main에 들어간 것을 발견했습니다.
- main을 작업 브랜치에 병합(강제 push 없음)하고 CHANGELOG·CLAUDE.md 충돌을 풀어 이 묶음을 0.235.0으로 다시 정했습니다. 다른 세션의 0.234.0 항목은 그대로 두었습니다.

## 검증

- 병합 전: 단위 테스트 139 통과, e2e 259 통과(실패 0), `build-product-index --check`·`package-site`·`unify_notation`(0건)·`git diff --check`·`check-version`(main 0.234 → 0.235) 통과.
- GitHub `RTCOM checks / verify`: 최신 커밋 `b305cf1`에서 success.

## 공개 주소 확인

- 화면 버전 표기: `CATALOG BASED · 0.235`.
- `CLAUDE.md`·`docs/qa/` 404(저장소 문서 비공개 유지).
- `src/layout-sim.js` 해시가 빌드 산출물과 일치하고 `cardUsage`가 들어 있음.

## 되돌리기

- `git revert 07a1c07`로 PR #363 전체를 되돌립니다(데이터·저장 키 변경 없음). 되돌린 뒤 `pages.yml`을 다시 실행합니다.
