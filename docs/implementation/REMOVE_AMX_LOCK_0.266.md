# 0.266 AMX 코드 비밀번호 잠금 제거

## 요청

- 사용자 요청(2026-11-16): "그 커맨드 중에서 AMX 관련돼서 비밀번호 잠겨 있는데 그 비밀번호 그냥 없이 그냥 다 풀어서 보여줘"
- 잠금 이력:
  - 0.239: 브라우저 잠금 도입(`docs/implementation/CONTROL_EXAMPLE_BASKET_0.239.md`)
  - 0.254·0.257: 비밀번호 변경(`docs/implementation/AMX_LOCK_PASSWORD_0.254.md`·`AMX_LOCK_PASSWORD_0.257.md`)
- 이 결정으로 위 문서의 잠금 내용은 더 이상 쓰지 않습니다. 문서는 기록으로 남깁니다.

## 바뀐 것

- 아래 AMX NetLinx 코드가 비밀번호 없이 처음부터 보입니다.

  | 제품 | 보이는 코드 |
  | --- | --- |
  | HDS-42MU·HDS-21U·QMS-44UX·QMS-88UX | AMX 예제 |
  | XDM·SPX·VDM | 설정 명령의 SEND_STRING 한 줄, "통신 설정과 AMX 시작 코드" |
  | XDM·SPX·VDM | "내 AMX 구성"의 코드, 복사, 파일 저장(.axs) |

- `src/control-example.js`에서 지운 것:
  - 비밀번호 변환값(`AMX_LOCK`)과 비밀번호 확인 함수(`makeLock`·`verifyPassword`·`lock`)
  - 잠긴 안내 상자와 비밀번호 입력 칸, "다시 잠그기" 버튼
  - 잠금 상태 감시
  - 바깥으로 내보내던 잠금 함수들
- `src/styles.css`에서 잠금 상자 스타일(`.rt-ce-lock*`) 6줄을 지웠습니다.
- 비밀번호 설정 도구 `scripts/tools/set-amx-password.cjs`를 지웠습니다.
- 브라우저에 남아 있을 수 있는 예전 잠금 해제 기록(`sessionStorage`의 `rtcom.amxUnlock.v1`)은 더 이상 읽지 않습니다. 남아 있어도 아무 영향이 없습니다.

## 바뀌지 않은 것

- 커맨드 문자열·HEX·복사 버튼·시뮬레이터·"담기"는 원래대로입니다.
- LAN(TCP)·RS-232 통신 선택, 기본 IP 192.168.1.141은 원래대로입니다.
- AMX 코드 내용 자체(SEND_STRING·IP_CLIENT_OPEN·SET BAUD 등)도 바뀌지 않았습니다.

## 시험

- `tests/control-example.test.cjs`:
  - 잠금 시험 3개(변환값·잠금 상태·`AMX_LOCK` 형식)를 지웠습니다.
  - "0.266: AMX 코드는 비밀번호 없이 바로 보인다" 시험 1개를 넣었습니다. 잠금 코드·스타일·도구·내보내기가 다시 생기지 않는지 확인합니다.
- `scripts/e2e-smoke.cjs`:
  - 시작할 때 시험용 비밀번호를 심던 부분을 지웠습니다.
  - 잠금·해제 확인 3개를 "잠금 없음" 확인 2개로 바꿨습니다. HDS-42MU AMX 예제가 바로 보이는지, XDM 시작 코드·SEND_STRING·내 AMX 구성 코드·복사·파일 저장이 바로 보이는지 확인합니다.

## 되돌리기

이 PR의 squash 커밋을 `git revert`하면 0.265의 잠금이 돌아옵니다(비밀번호는 0.257에 정한 것).
