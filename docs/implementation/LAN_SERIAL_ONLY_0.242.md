# HDS-42MU·HDS-21U 직렬 전용 정정 (0.242)

사용자 확인 2026-10-16: 알티컴 질문 20번(LAN 기본 IP 등)의 대상을 정리하면서 "HDS-42MU, 21U는 시리얼 제어만 가능해".

## 1. 무엇이 틀렸나

0.241에서 알티컴 회신(17~19번: 포트 23·RS-232와 동일 전송·동시 접속 1개)을 질문 대상 7개 제품에 모두 적용했는데, 그중 HDS-42MU·HDS-21U에는 LAN 제어가 없습니다. 두 제품의 AMX 코드에 LAN(TCP) 코드와 포트 23이 나오던 것이 잘못이었습니다.

## 2. 바뀐 것

| 위치 | 변경 |
|---|---|
| `data/products/hds-42mu.json`·`hds-21u.json` | `controlExample.lan`을 지우고 `serialOnly: true` 추가 |
| AMX 코드(`src/control-example.js`) | `serialOnly` 제품은 통신 방식을 LAN으로 골라도 항상 RS-232 코드(`SET BAUD 9600`)가 나옴. 통신 방식 선택·IP·포트 입력 칸 대신 "RS-232(직렬) 제어만 지원합니다. LAN 제어는 없습니다. 통신 속도 9600bps" 안내만 표시 |
| 제품 상세 카드 제목(`src/products.js`) | HDS는 "RS-232 9600bps · LAN 제어 없음", 나머지는 기존 문구 |
| 문서 | 질문 목록·질의서 §5 17~20번의 대상에서 HDS 제외, OPEN_ITEMS·0.241 구현 문서 정정 표시 |

- LAN 값이 있는 제품은 5개(XDM·VDM·SPX·QMS-44UX·QMS-88UX)입니다. 이메일 1번 질문(LAN 기본 IP 등)의 대상도 이 5개입니다.
- 26번(HDS-42MU·21U 뮤트·통신 설정·볼륨 범위)은 직렬 제어 질문이라 그대로 남습니다.
- 브라우저에 이미 LAN을 고른 값이 저장되어 있어도 HDS는 직렬로 나옵니다(저장 키·형식 변경 없음).

## 3. 검증

- 단위 테스트: HDS 두 제품에 `serialOnly`가 있고 `lan`이 없는지, LAN을 골라도 `SET BAUD 9600` 코드가 나오고 `IP_CLIENT_OPEN`이 없는지, LAN 제품 5종의 값은 그대로인지.
- e2e: HDS-42MU에서 잠금 해제 뒤 직렬 코드(`SET BAUD 9600`)만 보이고 LAN 선택 칸이 없는지.

## 4. 되돌리기

두 제품 JSON의 `serialOnly`를 지우고 `lan`을 다시 넣은 뒤 `src/control-example.js`의 `serialOnly` 처리 3곳, `src/products.js`의 제목 조건을 되돌리면 0.241 상태입니다.
