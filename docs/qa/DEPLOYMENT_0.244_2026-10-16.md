# 0.244.0 배포 기록 (2026-10-16)

## 요약

- 변경: HDS-42MU·HDS-21U를 직렬 제어 전용으로 정정(사용자 확인 "HDS-42MU, 21U는 시리얼 제어만 가능해"). 두 제품의 AMX 코드에서 LAN(TCP) 코드와 포트 23을 빼고, 항상 RS-232 코드(`SET BAUD 9600`)로 나오게 했습니다. 통신 방식 선택 대신 "RS-232 제어만 지원, LAN 제어 없음" 안내를 보이고 카드 제목도 맞췄습니다. LAN 값은 XDM·VDM·SPX·QMS-44UX·QMS-88UX 5개 제품에만 있습니다.
- PR: [Seoulav/rtcom-configurator#378](https://github.com/Seoulav/rtcom-configurator/pull/378) → main 병합 `622500e`(squash).
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 38983315675, 결과 success(head `622500e`).

## 번호 경위

- 처음 0.242.0으로 작업했으나 다른 세션의 0.242(신호 색 통일, #371)와 0.243(QMS-88UX 입력 그룹, #377)이 먼저 병합되어, main을 두 번 병합(강제 push 없음)하고 이 묶음을 0.244.0으로 다시 정했습니다.
- 병합 커밋의 제목은 PR을 처음 만들 때 이름인 "0.242.0: …"으로 남았지만, 실제 내용과 화면 버전은 0.244.0입니다(`CHANGELOG.md`·`index.html`·`README.md`).

## 검증

- 병합 전: 단위 테스트 169 통과, 제품 색인 33종 OK, `unify_notation` 0건, e2e 269 통과(HDS 직렬 코드·LAN 선택 칸 없음 확인 포함), `check-version`(main 0.243 → 0.244), `git diff --check` 통과.
- GitHub `RTCOM checks / verify`: 병합한 최신 커밋 `7b51bc3`에서 success.

## 공개 주소 확인

- 화면 버전 표기: `CATALOG BASED · 0.244`, `CLAUDE.md` 404.
- 공개 `hds-42mu.json`·`hds-21u.json`에 `serialOnly: true`가 있고 `lan` 값은 남아 있지 않음.
- 공개 `xdm.json`의 `lan.port`는 23 그대로, 공개 `src/control-example.js`에 비밀번호 원문이 없음.

## 미해결 위험

- 공개 JSON(AV Portal이 읽음)에서 두 HDS 제품의 `controlExample.lan`이 사라지고 `serialOnly`가 생겼습니다. `lan`은 0.241에 처음 들어간 키라 소비자가 없을 가능성이 높지만, AV Portal 쪽에서 읽고 있다면 `serialOnly`로 대체해야 합니다.
- 질문 17번 회신("23 포트")은 제품별로 다른지 따로 적은 답이 없어 LAN 제품 5개에 같은 값을 적용했습니다.

## 되돌리기

- `git revert 622500e`로 PR #378 전체를 되돌립니다(저장 키·schema 변경 없음). 되돌린 뒤 `pages.yml`을 다시 실행합니다.
