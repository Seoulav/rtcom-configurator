# 0.236.0 배포 기록 (2026-10-16)

## 요약

- 변경: XDM·SPX·VDM 제품정보 시리즈 페이지에 AMX 통합 제어 커맨드 예시 카드를 명령 빌더로 확장(XDM Command Guide 18종, SPX 매뉴얼 커맨드 1·2 30종, VDM 26종, VDM 번호 2·3자리 선택).
- PR: [Seoulav/rtcom-configurator#365](https://github.com/Seoulav/rtcom-configurator/pull/365) → main 병합 `56c35a8`(squash).
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 38915324453, 결과 success(head `56c35a8`).

## 번호 경위

- 작업 중 다른 세션의 0.235.0(PR #363)이 먼저 병합되어, 이 묶음을 0.236.0으로 다시 정했습니다.
- 병합 직전에 main에 0.235.0 배포 기록(문서 전용, #364)이 더 들어와 작업 브랜치에 병합(강제 push 없음)하고 CHANGELOG 충돌은 양쪽 항목을 모두 남겼습니다.

## 검증

- 병합 전: 단위 테스트 148 통과, 제품 색인 33종 OK, `unify_notation` 0건, e2e 262 통과(실패 0, 모듈러 3개 포함), `check-version`(main 0.235 → 0.236), `git diff --check` 통과.
- GitHub `RTCOM checks / verify`: 최신 커밋 `0d521b7`에서 success.

## 공개 주소 확인

- 화면 버전 표기: `CATALOG BASED · 0.236`.
- `CLAUDE.md` 404(저장소 문서 비공개 유지).
- 공개 `xdm.json`·`spx.json`·`vdm.json`에 `controlExample`이 들어 있고, 공개 `src/control-example.js` 해시가 저장소와 일치.

## 미해결 위험

- 매뉴얼에 없는 단자·값은 만들어 넣지 않고 화면에 밝혔습니다. VDM OT 표와 매뉴얼 예시가 다른 곳은 표를 따르고 화면에 적어 두었습니다.
- 제품별 확인 대기 항목은 `docs/handoff/OPEN_ITEMS.md`에 있습니다.

## 되돌리기

- `git revert 56c35a8`로 PR #365 전체를 되돌립니다(저장 키·schema 변경 없음). 되돌린 뒤 `pages.yml`을 다시 실행합니다.
