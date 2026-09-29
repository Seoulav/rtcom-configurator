# 03 카드 슬롯: 카드 끌어 놓기 샘플 (0.162.0)

## 요청과 결정

- 직원 제안: 03 카드 슬롯 아래 카드 목록에서 카드를 끌어 후면 슬롯에 놓아 구성하는 방식.
- 사용자 승인 2026-09-29: "위 범위로 진행하는데 혹시 다시 원복도 쉽게 가능할까?", "위 범위로 진행해줘 샘플을 구현하고 검증한 뒤 병합·배포".
- 기존 슬롯 팝업 방식을 없애지 않고, 마우스 환경에서 쓸 수 있는 추가 방식으로 붙였습니다.

## 동작

| 항목 | 동작 |
|---|---|
| 카드 정보 버튼 → 빈 슬롯 | 끌어 놓으면 장착 |
| 카드 정보 버튼 → 카드·블랭크가 있는 슬롯 | 새 카드로 교체(같은 카드면 아무 변화 없음) |
| 방향 제한 | 입력 카드는 입력 슬롯(`in-`), 출력 카드는 출력 슬롯(`out-`)에만 놓임 |
| 끄는 동안 표시 | 놓을 수 있는 슬롯 점선, 놓을 슬롯 파란 실선, 반대 방향 슬롯 흐리게 |
| 누르기 | 지금처럼 카드 상세 정보 대화상자 |
| 연동 전송기 | 카드 팝업에서 카드를 하나 누를 때와 같은 기본값(`RtCore.defaultLink`), 수량은 카드 채널 수 |
| 휴대폰·태블릿 | `(hover: hover) and (pointer: fine)`이 아니면 `draggable`을 붙이지 않고 안내 문구도 기존과 같음 |
| 실행 취소·자동 저장 | 다른 장착과 같이 `changed()`를 거쳐 실행 취소·자동 저장 대상 |

## 구현 위치

- `src/app.js`: `PALETTE_DRAG` 상수, `paletteDrag()`, `cardInfoBar()`의 `draggable`·`data-palette-card`·`data-palette-dir`, `placeFromPalette()`, 슬롯 끌어 옮기기(0.55) 앞에 붙인 `dragstart`·`dragover`·`drop` 처리(`dragPalette`). 슬롯끼리 옮기기(`dragFrom`)와 상태를 나눴습니다.
- `src/styles.css`: `.rt-card-palette`, `.rt-card-info-chip-dragging`, `#rtcom-design.rt-palette-drag-input|output` 규칙.
- 저장 형식(`rtcom.configuration.v1`, schema 3, `placements`·`links`)은 바꾸지 않았습니다.

## 검증

- `node scripts/e2e-smoke.cjs`에 세 가지 검사를 더했습니다.
  1. 입력 카드를 입력 슬롯에 놓으면 장착, 출력 슬롯에는 놓이지 않음, 출력 카드는 출력 슬롯에 장착, 카드가 있는 슬롯에 놓으면 교체(XDM-CIS100은 XDM-CTR100 TX 기본 연결), 카드 선택 팝업은 열리지 않음.
  2. 끌 수 있는 버튼도 누르면 상세 정보가 열림.
  3. 터치 환경(isMobile·hasTouch)에서는 `draggable` 버튼이 없고 안내 문구가 기존과 같음.
- 화면: `docs/qa/card-palette-drag-0.162/dragging-desktop.png`(XDM-12, XDM-CIS100을 IN 2로 끄는 중).

## 되돌리는 방법

1. 빠르게 끄기: `src/app.js`의 `const PALETTE_DRAG=true;`를 `false`로 바꿉니다. 버튼·안내 문구·끌어 놓기 처리가 이 기능을 넣기 전과 같아집니다(이때 e2e의 0.162 검사 3개 중 앞 2개는 실패하므로 함께 지우거나 조건을 바꿉니다).
2. 완전히 되돌리기: GitHub에서 0.162.0 PR(#221)을 Revert합니다.
3. 두 방법 모두 저장한 구성 파일과 브라우저 자동 저장에는 영향이 없습니다.

## 남은 위험

- HTML5 끌어 놓기는 Firefox에서 `<button>` 요소를 끌 때 브라우저 버전에 따라 동작이 다를 수 있습니다. 0.55 슬롯끼리 옮기기와 같은 조건이며, 자동 검사는 Chromium만 확인했습니다.
- 한 번에 한 장씩 장착하므로 슬롯이 많은 프레임은 카드 팝업의 수량 채우기가 더 빠릅니다.
