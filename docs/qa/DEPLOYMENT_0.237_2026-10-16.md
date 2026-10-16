# 0.237.0 배포 기록 (2026-10-16)

## 요약

- 변경: XDM 07 화면 연출 시뮬레이터 WOS100 보기에 "선택한 창 배치" 버튼(월 전체·월 가운데·디스플레이 1칸) 추가.
- PR: [Seoulav/rtcom-configurator#369](https://github.com/Seoulav/rtcom-configurator/pull/369) → main 병합 `c9abf7e`(squash).
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 38975011080, 결과 success(head `c9abf7e`).
- 사용자 선택 "1번과 2번만 하자" 중 2번(알티컴 회신 반영)은 제조사 질의서 §5 15·16번 답이 없어 보류했고 `docs/handoff/OPEN_ITEMS.md`에 그대로 남겼습니다.

## 검증

- 병합 전: 단위 테스트 149 통과, e2e 263 통과(실패 0), `build-product-index --check`·`package-site`·`unify_notation`(0건)·`git diff --check`·`check-version`(main 0.236 → 0.237) 통과.
- GitHub `RTCOM checks / verify`: 최신 커밋 `760fb88`에서 success.

## 공개 주소 확인

- 화면 버전 표기 `CATALOG BASED · 0.237`.
- `CLAUDE.md`·`docs/qa/` 404.
- `src/layout-sim.js` 해시가 빌드 산출물과 일치하고 `alignWindow`가 들어 있음.

## 되돌리기

- `git revert c9abf7e`로 PR #369를 되돌린 뒤 `pages.yml`을 다시 실행합니다(저장 키·데이터 변경 없음).
