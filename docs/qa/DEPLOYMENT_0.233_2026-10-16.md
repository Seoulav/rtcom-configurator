# 0.233.0 배포 기록(2026-10-16)

- PR: #354 (`0.233.0: 화면 연출 시뮬레이터 현장 메모 공개·레이어 번호(1 = 맨 위)·Delete 키 창 지우기`) → main 병합, squash 커밋 `ea5d37a`
- 병합 전 검사: `RTCOM checks / verify` 성공(head `4aa2fcc`), 로컬 검증은 단위 테스트 131건·제품 검증 33개·브라우저 검사 255건·`unify_notation` 바뀔 곳 0건·`check-version` 0.232 → 0.233 통과
- 버전 조정: 작업 중 0.229로 적었으나 다른 세션이 0.229.0(HDS AMX 커맨드 예시, #351)·0.230.0(카드 정보 타일, #355)·0.231.0(QMS AMX 커맨드 예시, #357)·0.232.0(다크 모드 색 변수, #359)을 차례로 먼저 병합해, main을 네 번 합치고 0.231 → 0.232 → 0.233으로 다시 정했습니다. 두 번째 재번호 때 충돌 표시가 남은 병합 커밋(`fd8c8f8`)이 작업 브랜치에 올라갔으나 바로 다음 커밋(`7f00407`)에서 지웠고, 병합된 squash 커밋에는 남아 있지 않습니다(`git grep '<<<<<<<' ea5d37a -- CHANGELOG.md CLAUDE.md` 없음). 필수 검사 규칙이 최신 main 기준을 요구해 `behind` 상태에서는 병합이 거부되었고(405), main을 다시 합친 뒤 통과했습니다.
- 병합 방식: GitHub 연결 도구로 `expectedHeadSha`를 고정해 squash 병합
- Pages 배포: `Deploy RTCOM to GitHub Pages`(`pages.yml`) 수동 실행, run 38910325950, 결과 success, main `ea5d37a`
- 공개 주소 확인:
  - `https://seoulav.github.io/rtcom-configurator/`에 `CATALOG BASED · 0.233` 표기
  - `src/layout-sim.js` 공개본 SHA-256 앞 16자리 `d3ccdd0d540e79fa` = main 파일과 같음(`rt-ls-win-layer`·`FIELD_NOTES`·`deleteSelected` 포함)
  - `CLAUDE.md` 공개 주소 HTTP 404(비공개 유지), `docs/qa/` 공개 주소 404(dist만 배포)
- 화면: `docs/qa/layout-sim-layers-0.233/`(WOS100 기본·HOS100 계단식 레이어 배지, 표, 휴대폰 390px)
- 확인 대기: `IV … M03`·`IE … M18/M19` 표준 펌웨어 여부(질의서 §5 2번), WOS100 포트 배치(§5 15번), HOS100 `L13`(§5 16번) — `docs/handoff/OPEN_ITEMS.md`
- 되돌리기: `git revert ea5d37a` 후 Pages 배포를 다시 실행하면 0.232 화면으로 돌아갑니다(`docs/implementation/LAYOUT_SIM_HOS100_0.225.md` §8·§8-1, `docs/implementation/LAYOUT_SIM_0.224.md` §7).
