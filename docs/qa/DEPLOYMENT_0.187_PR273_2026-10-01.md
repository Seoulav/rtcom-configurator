# 0.187 문서 병합(PR #273) 배포 기록 (2026-10-01)

- 병합: PR #273 → main `03e4775` (squash, `expectedHeadSha`로 push한 커밋 `037d138`에 고정). 문서만 바뀌어 버전은 0.187 그대로입니다.
- 병합 전 확인: RTCOM checks `verify` 통과(`037d138`, main `52344b3`을 포함한 상태). 첫 병합 시도(`23d2be5`)는 main이 `52344b3`으로 앞서가 필수 검사 규칙이 막았고(오류 문구는 `Required status check "verify" is expected`), main을 합쳐 다시 검사를 통과한 뒤 병합했습니다. 필수 검사 설정(`docs/qa/GITHUB_RULESET_2026-10-01.md`) 이후 실제 병합에서 규칙이 동작한 첫 사례입니다.
- 배포: `Deploy RTCOM to GitHub Pages` run 36797147746(`03e4775`), 성공(약 30초)
- 공개 확인: `https://seoulav.github.io/rtcom-configurator/` 응답 200, 버전 표기 `CATALOG BASED · 0.187`, `CLAUDE.md`·`AGENTS.md`·`docs/handoff/OPEN_ITEMS.md`·`docs/qa/GITHUB_RULESET_2026-10-01.md` 모두 404(`dist/`만 공개)
- `pages build and deployment` 실행 기록: 병합 뒤 보이지 않음
- 변경 범위: `docs/handoff/OPEN_ITEMS.md`(GitHub 설정 항목 삭제), `docs/qa/GITHUB_RULESET_2026-10-01.md`(신규), `docs/implementation/TOUCH_SLOT_X_AND_CI_0.165.md`(완료 표시). 사이트 화면 변경 없음
- 되돌리는 방법: 병합 커밋 되돌리기. 필수 검사 규칙 자체는 Settings → Rules → Rulesets에서 `main 보호`를 Disabled로 바꿉니다.
