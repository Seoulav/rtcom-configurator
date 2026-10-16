# 0.229.0 배포 기록(2026-10-16)

- PR: #351 (`0.229.0: HDS-42MU·HDS-21U AMX 통합 제어 커맨드 예시 카드`) → main 병합, squash 커밋 `76babe2`
- 병합 전 검사: `RTCOM checks / verify` 성공(head `d12e232`), 로컬 검증은 단위 테스트 126건·제품 검증 33개·브라우저 검사 251건 통과
- 버전 조정: 작업 중 0.228로 적었으나 다른 세션이 0.228.0(SVT 공통 디자인 v2, #348)을 먼저 병합해, main을 합치고 0.229로 다시 정했습니다. 새 디자인 규칙(최소 글자 12px)에 맞춰 `rt-ce-*` 글자 크기도 조정했습니다.
- 병합 방식: GitHub 연결 도구로 `expectedHeadSha`를 고정해 squash 병합
- Pages 배포: `Deploy RTCOM to GitHub Pages`(`pages.yml`) 수동 실행, run 38905585107, 결과 success, main `76babe2`
- 공개 주소 확인:
  - `https://seoulav.github.io/rtcom-configurator/`에 `CATALOG BASED · 0.229` 표기
  - `src/control-example.js`, `data/products/hds-42mu.json`, `data/products/hds-21u.json`이 빌드 결과(`dist/`)와 해시 일치
  - `CLAUDE.md` 공개 주소 HTTP 404(비공개 유지)
- 화면: `docs/qa/control-example-0.229/`
- 확인 대기: 뮤트 해제 방법·데이터 비트·패리티·볼륨 허용 범위·HDS-42MU 뮤트 코드(`docs/handoff/OPEN_ITEMS.md`)
- 되돌리기: `git revert 76babe2` 후 Pages 배포를 다시 실행하면 0.228 화면으로 돌아갑니다(`docs/implementation/CONTROL_EXAMPLE_0.229.md` §5).
