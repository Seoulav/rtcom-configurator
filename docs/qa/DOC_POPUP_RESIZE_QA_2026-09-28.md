# PC 문서 팝업 폭 넓히기·마우스 폭 조절 (0.126.0, 2026-09-28)

## 요청

- "pc에서 볼깨 메뉴얼 웹뷰어시 팝업창의 가로폭이 너무 좁아 개선해줘"
- "마우스로 창 크기 가변가능할까?"

## 변경

- `src/styles.css`: `.rt-doc-zoom` 기본 폭 `min(720px, 100vw-16px)` → `min(1040px, 100vw-16px)`, `max-width: 100vw-16px`. PC에서는 창 좌우에 8px 테두리를 두고 그 안에 끌기 막대(`.rt-doc-resize`)를 놓아 문서 스크롤바를 가리지 않게 했습니다. 휴대폰 폭(≤560px)·터치 화면(`pointer: coarse`)에서는 테두리·막대·넓게 버튼을 숨깁니다.
- `src/products.js`
  - `bindDocResize()`: 막대를 누르고 끌면 폭 = (마우스 위치 − 창 가운데) × 2 (최소 480px, 최대 화면 폭 − 16px). 창이 가운데 정렬이라 양쪽이 함께 움직입니다. 놓으면 폭을 `localStorage`의 `rtcom.docPopupWidth`에 저장하고, 막대를 두 번 누르면 지우고 기본 폭으로 돌아갑니다. 저장소가 막힌 브라우저(비공개 창 등)에서도 오류 없이 기본 폭으로 동작합니다(try/catch).
  - 머리글 ↔ 버튼(`data-doc-wide`): 화면 폭까지 펼치기/기본 폭 되돌리기, 켜져 있으면 파란색(`aria-pressed`).
  - `ResizeObserver`(요소 크기가 바뀌면 알려 주는 브라우저 기능)로 창 폭 변화를 보고, 쪽 너비가 4px 이상 달라지면 다시 맞춥니다. 카탈로그 그림은 바로, 매뉴얼(PDF.js)은 변화가 멈춘 뒤 200ms에 한 번 다시 그립니다. 이 변경으로 브라우저 창 크기 변경·휴대폰 회전 때도 쪽 너비가 맞춰집니다(0.124 QA의 남은 제약 해소).
  - 0.124.0에서 XDM-PSU Signal Flow 확대 창(`dialog.rt-flow-zoom`)에도 붙어 있던 문서 팝업용 `close` 처리(해당 창에는 `rtDoc`이 없어 아무 일도 하지 않음)를 지웠습니다.

## 검증

```
node --test tests/*.test.cjs                    # 50/50
node scripts/build-product-index.cjs --check    # 31개 통과
node scripts/package-site.cjs
node scripts/e2e-smoke.cjs                       # 171/171
git diff --check
```

- e2e(1600×900): VDM 매뉴얼 기본 1040px·쪽 1000px → 오른쪽 막대를 150px 끌면 1332px·쪽 1292px, 닫고 다시 열어도 1332px, 넓게 버튼 1584px, 왼쪽 막대 두 번 누르기 1040px.
- e2e(390px 휴대폰): 막대·넓게 버튼 없음, 창 폭 374px.
- 화면 확인: PC 1600px에서 좌우 가장자리 가운데 막대 표시, 쪽 그림이 창 폭에 맞춰 선명하게 다시 그려짐.

## 되돌리는 방법

0.126.0 병합 커밋을 revert하면 기본 폭 720px·폭 고정으로 돌아갑니다. 사용자 브라우저에 남은 `rtcom.docPopupWidth` 값은 쓰이지 않게 될 뿐 문제를 일으키지 않습니다.
