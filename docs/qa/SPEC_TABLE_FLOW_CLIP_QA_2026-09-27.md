# 04 제품 사양 표 축소·03 Signal Flow AUDIO OUT 잘림 QA (0.60.0, 2026-09-27)

## 1. 요청

- "04 사양도 상하 간격을 15% 정도 줄여도 되겠다."
- "03 SIGNAL FLOW AUDIO OUT 부분 조금 잘린다."(HDS-21U 화면 첨부, 오른쪽 "추출"이 "추"만 보임)

## 2. 04 제품 사양 표

- `specTable()`이 만드는 표 틀에 `rt-pg-spec-table`을 붙이고, 이 표만 칸 위아래 여백을 9px에서 6px로 줄였습니다. 조건 줄(`rt-pg-note-line`) 위 여백은 3px에서 2px입니다.
- 측정(1280px):

| 제품 | 전 | 후 | 줄어든 비율 |
|---|---|---|---|
| HD-13U(8행) | 332px | 278px | 16% |
| QMS-88UX(10행) | 479px | 413px | 14% |
| XDM(11행) | 553px | 480px | 13% |

- 한 줄 행은 37px에서 31px(16%)입니다. 여러 줄 행은 여백만 줄어 비율이 조금 작습니다. EDID 코드표 등 다른 표는 바꾸지 않았습니다.

## 3. 03 Signal Flow AUDIO OUT 잘림

- 원인: 그림 너비를 출력 패널과 캡션 기준으로만 계산했습니다. AUDIO OUT 칩(104px)과 오른쪽 "추출" 표시(30px)는 패널 왼쪽 끝에서 시작하므로, 출력이 1개라 패널이 좁은 HDS-21U에서는 "추출"이 틀 밖으로 나갔습니다.
- 수정: `audioOutRight`(AUDIO OUT 칩 오른쪽 + "추출" 표시)를 너비 계산에 넣었습니다.
- 28종 전체 신호 흐름에서 텍스트·사각형이 틀 밖으로 나가는지 검사했습니다. 수정 후 남은 것은 HD-13U 윗줄 대역폭 글자의 위쪽 여백 0.56px뿐이고, 글자 자체는 잘리지 않습니다.

## 4. 검증

- `node --test tests/*.test.cjs`: 39/39 통과
- `node scripts/build-product-index.cjs --check`: 28개 통과
- `node scripts/package-site.cjs`: 통과
- `node scripts/e2e-smoke.cjs`: 110/110 통과(신호 흐름 잘림 확인 5건 추가)
- 화면: `docs/qa/spec-flow-screens/`(HD-13U 04 제품 사양, HDS-21U 03 Signal Flow)

## 5. 되돌리기

해당 커밋을 `git revert`합니다.
