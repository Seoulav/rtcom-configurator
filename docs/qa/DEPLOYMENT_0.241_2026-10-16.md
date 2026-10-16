# 0.240.0·0.241.0 배포 기록 (2026-10-16)

## 요약

| 버전 | 변경 | PR | main 병합 | Pages 배포 |
|---|---|---|---|---|
| 0.240.0 | XDM-WOS100 오버레이 포트 배치 확정("카드 1장 = 디스플레이 1대", 알티컴 질문 15번, 사용자 확인) | [#374](https://github.com/Seoulav/rtcom-configurator/pull/374) | `752241c` | run 38980067205 success |
| 0.241.0 | AMX LAN(TCP) 코드에 알티컴 회신 반영(질문 17~19번: 포트 23, RS-232와 동일 전송, 동시 접속 1개·자동 끊김 없음, 7개 제품) | [#375](https://github.com/Seoulav/rtcom-configurator/pull/375) | `73140cd` | run 38980943940 success |

## 검증

- 병합 전(두 버전 모두): 단위 테스트 165 통과, 제품 색인 33종 OK, `unify_notation` 0건, e2e 268 통과, `check-version`(main 0.239 → 0.240, 0.240 → 0.241), `git diff --check` 통과.
- GitHub `RTCOM checks / verify`: 두 PR 모두 최신 커밋에서 success.

## 공개 주소 확인

- 0.240 배포 뒤: 화면 버전 `CATALOG BASED · 0.240`, 공개 `layout-sim.js`에 확정 문구("서울영상테크 확인 2026-10-16")가 들어 있고 옛 "확인을 기다리고 있습니다" 문구가 없음.
- 0.241 배포 뒤: 화면 버전 `CATALOG BASED · 0.241`, `CLAUDE.md` 404, 공개 `xdm.json`에 `lan.port: 23`, `hds-42mu.json`에 `lan.confirmed: true`, `src/control-example.js`에 `AMX_LOCK` 변환값이 있고 비밀번호 원문은 없음.

## 미해결 위험

- 질문 17번은 제품별 포트를 물었으나 답이 "23" 하나여서 7개 제품에 같은 값을 적용했습니다(제품별로 다르면 해당 제품 JSON의 `controlExample.lan.port`만 수정).
- 끝 문자(CR/CRLF)·응답 형식은 "RS-232와 동일"로 처리했고 별도 확인하지 않았습니다.
- 남은 알티컴 질문은 16번과 20~28번입니다(`docs/handoff/RTCOM_QUESTIONS_2026-10-16.md`).

## 되돌리기

- 0.241: `git revert 73140cd`, 0.240: `git revert 752241c`로 각 PR을 되돌리고 `pages.yml`을 다시 실행합니다(저장 키·schema 변경 없음).
