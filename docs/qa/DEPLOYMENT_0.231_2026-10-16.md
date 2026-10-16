# 0.231.0 배포 기록(2026-10-16)

- PR: #357 (`0.231.0: QMS-44UX·QMS-88UX AMX 통합 제어 커맨드 예시 카드`) → main 병합, squash 커밋 `28a55d1`
- 병합 전 검사: `RTCOM checks / verify` 성공(head `9bfeb6d`), 로컬 검증은 단위 테스트 131건·제품 검증 33개·브라우저 검사 253건 통과
- 버전 조정: 작업 중 0.230으로 적었으나 다른 세션이 0.230.0(카드 정보 타일 개선, #355)을 먼저 병합해, main을 합치고 0.231로 다시 정했습니다. 그 뒤 main에 문서 전용 커밋(#356)이 더 생겨 한 번 더 합치고 검사를 다시 거쳤습니다.
- 병합 방식: GitHub 연결 도구로 `expectedHeadSha`를 고정해 squash 병합
- Pages 배포: `Deploy RTCOM to GitHub Pages`(`pages.yml`) 수동 실행, run 38908619438, 결과 success, main `28a55d1`
- 공개 주소 확인:
  - `https://seoulav.github.io/rtcom-configurator/`에 `CATALOG BASED · 0.231` 표기
  - `data/products/qms-88ux.json`·`qms-44ux.json`·`hds-42mu.json`·`hds-21u.json`에 `controlExample` 포함, `src/control-example.js`에 `mountMatrix` 포함
  - `CLAUDE.md` 공개 주소 HTTP 404(비공개 유지)
- 화면: `docs/qa/control-example-0.231/`
- 확인 대기: QMS-44UX 연결 해제·프리셋 명령 유무, QMS-88UX 입력 Q1·Q2 표기(`IQ1`)와 콤마 앞 공백 허용 여부(`docs/handoff/OPEN_ITEMS.md`)
- 되돌리기: `git revert 28a55d1` 후 Pages 배포를 다시 실행하면 0.230 화면으로 돌아갑니다(`docs/implementation/CONTROL_EXAMPLE_QMS_0.231.md` §5).
