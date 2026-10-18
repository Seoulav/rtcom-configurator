# 0.255.0 배포 기록 (2026-10-18)

- PR: #403 "0.255.0 시뮬레이터 입력 선택 목록, 세션 시작 점검(작업 충돌 줄이기)"
- 병합: squash, main `7800c79` (`expectedHeadSha` 82908a0 고정, GitHub `RTCOM checks / verify` success, 병합 직전 main은 `7c2f445` 그대로이고 열린 PR은 이 PR 하나뿐)
- 경위: 사용자가 "1~2번 진행해줘"(2026-10-18)로 요청한 다음 단계 제안 두 가지입니다. ① 작업 충돌 줄이기(세션 시작 점검 스크립트와 `CLAUDE.md` 규칙), ② 구성기 연동 입력 선택 목록. 앞선 PR(#400, 0.254.0)이 병합되기를 기다린 뒤 새 main 위에서 시작했고, 작업 중이던 변경은 임시 보관(stash) 뒤 새 기반으로 옮겼습니다.
- 내용: ① `scripts/session-preflight.cjs`를 SessionStart 훅에 더해 main이 앞선 정도·다른 세션이 먼저 병합한 작업·같은 파일을 바꾼 충돌 후보·다음 병합 번호를 알려 줌(공개 사이트에는 올라가지 않는 로컬 도구), ② XDM 07 시뮬레이터(HOS100·WOS100)에서 구성기 저장 구성의 입력 카드 채널 목록(`입력 5 · IN 2 · XDM-HI100 · PC`)에서 입력을 고르고, 이름 칸이 비어 있으면 신호명을 채우며, "직접 입력…"으로 구성에 없는 번호도 쓸 수 있게 함. 저장된 구성이 없으면 숫자 칸 그대로.
- 0.254.0 배포 기록(`docs/qa/DEPLOYMENT_0.254_2026-10-18.md`)도 이 PR에 담아 병합했습니다.
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 39134178079, success (`pages build and deployment` 실행은 보이지 않음)

## 공개 주소 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 표기 | `CATALOG BASED · 0.255` |
| 공개 `src/layout-sim.js`·`src/styles.css`·`index.html`·`src/control-example.js` | main 파일과 SHA-256 앞 12자리 일치(`7e4343ffa214`·`b208b5e8170f`·`dab7d7b52ac9`·`a9f142c5c6e8`) |
| 공개 `CLAUDE.md` | 404 |
| 공개 `docs/qa/` | 404 |
| 공개 `scripts/session-preflight.cjs` | 404(`dist/`에 들어가지 않음) |

## 로컬 검증 메모

- 단위 테스트 198개 통과(입력 목록 2건·세션 점검 4건 추가), `build-product-index --check` 33개 통과, `e2e-smoke` 287/287 통과(입력 선택 목록 시험 1건 추가), 표기 통일 바뀔 곳 0건, `dark_tokens --check` 최신, `check-version` 0.254 → 0.255, `git diff --check` 통과.
- 세션 점검 스크립트는 임시 git 저장소(원격 + 작업본 + 다른 세션 작업본)로 "main이 앞서고 같은 파일을 바꿈 → 알림 / main 병합 뒤 알림 없음 / `origin/main` 없음 → 조용히 종료"를 시험했고, 실제 저장소에서도 `--list`로 실행해 확인했습니다.
- 공개 사이트를 브라우저로 직접 열어 보는 시험은 이 환경의 프록시 인증서 때문에 하지 못해, 공개 파일 해시를 main과 비교해 확인했습니다.

## 남은 확인 사항

- 새 AMX 비밀번호(0.254)가 실제 화면에서 열리는지는 사용자가 확인합니다.
- 입력 선택 목록은 구성기가 이 브라우저에 저장한 XDM 구성을 읽습니다. 구성을 한 번도 저장하지 않았거나 다른 브라우저에서 보면 숫자 칸으로 보입니다.
- 세션 점검 훅은 로컬 Claude Code에서 세션이 시작될 때 실행됩니다. 훅이 없는 환경에서는 `node scripts/session-preflight.cjs --list`를 직접 실행합니다.
- 알티컴 확인 대기 11건(2026-10-18 통합 메일로 발송, 회신 대기): `docs/handoff/RTCOM_QUESTIONS_2026-10-16.md`의 "전체 회신 대기 현황".
