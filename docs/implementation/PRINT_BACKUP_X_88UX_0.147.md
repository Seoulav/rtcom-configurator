# 0.147.0 묶음: × 카드 빼기·88UX 도해·제품정보 인쇄·툴바 이름

## 1. 카드 빼기 ×
- `src/app.js` `slotButton`: 카드가 있는 슬롯 버튼 안에 `span.rt-rack-slot-x[data-slot-clear]`. 클릭은 `root`의 capture 리스너가 먼저 받아 `removeSlotCard(id)`(Delete 키와 같은 함수)를 실행하고 슬롯 클릭(팝업 열기)은 막습니다.
- `src/styles.css` 끝: 평소 `display:none`, `@media(hover:hover)`에서 슬롯 호버 때만 표시. 가로 슬롯은 오른쪽 가운데, `.rt-rack-vs/.rt-rack-vt`(세로 슬롯)는 맨 위 가운데. 크기는 슬롯 높이·폭(cqh·cqw)에 맞춤.

## 2. QMS-88UX 화면 구성 도해 (매뉴얼 KV.03 20~21쪽 대조)
| 레이아웃 | 이전 | 매뉴얼 |
|---|---|---|
| 3-SIDE RIGHT/LEFT | 1번 70%, 열 30% | 1번 60%, 열 40% |
| Quad PBP, PIP | 작은 창 x28·y62·20×32 / x78 | 작은 창 x23·y58·26×42 / x74 (아래 끝까지) |
| USER MODE 1 | 1번 65% | 1번 50%, 2·3번 50% 열 |
| USER MODE 2 | 1번 위 40% 높이 | 1번 위 가운데 50% 높이 + 검은 여백, 2·3번 아래 |
| QUAD·3-BOTTOM·Horizontal/Vertical PBP·Single·3CH-MODE2·Default Single | — | 같음 |

## 3. 제품정보 인쇄/PDF
- 원인: 인쇄 기본 규칙(`@media print`)이 `#rtcom-design` 전체를 숨기고 구성기 검토 시트 `#print-report`만 보여 주기 때문에 제품정보에서도 빈 구성 시트가 나왔습니다.
- 수정: `src/products.js` `show()`가 `html.rt-print-products` 클래스를 켜고, `src/styles.css` 끝의 print 규칙이 이 클래스가 있을 때 검토 시트를 숨기고 제품 화면(머리·툴바 제외)을 흰 바탕 한 줄 흐름으로 인쇄합니다.

## 4. 툴바 이름
- `index.html`(및 `scripts/build-from-draft.cjs`): "JSON 백업"→"구성 파일 저장", "불러오기"→"구성 파일 불러오기", title 설명 추가. `src/app.js`·`src/workspace.inc.js`의 안내 문구, README·DEVICE_WORKFLOW 표기도 맞춤. 동작·파일 형식(`rtcom.configuration.v1` JSON)은 그대로입니다.

검증: 단위 62/62, e2e 192/192(신규 3건). Rollback: 병합 커밋을 되돌립니다.
