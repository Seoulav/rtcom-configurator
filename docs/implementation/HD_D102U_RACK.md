# HD-D102U Rack마운트 추가 (0.121.0)

## 요청

- 사용자 요청(2026-09-28): "HD-D102U 연관제품으로 2분배기 프레임 추가 기존에 이미지 형태로 넣어줘 모델명은 HD-D102U Rack마운트"
- 근거 자료: 사용자 제공 PDF 1쪽 "HD-D102U RACK · 최대 12개 장착가능"(정면·윗면·옆면 도면, 치수 483 · 282 · 177 · 147). **PDF는 공개하지 않습니다**(CLAUDE.md 카탈로그·매뉴얼 PDF 규칙). `documents`에 `file` 없이 "사용자 제공, 배포 제외"로만 기록했습니다.

## 변경

| 항목 | 내용 |
| --- | --- |
| 새 제품 | `data/products/hd-d102u-rack.json`(31번째 제품, 분배기·선택기 그룹, 분류 `Rack Mount` 추가) |
| 그림 | `scripts/tools/draw_hd_d102u_rack.cjs` → `output/design/assets/products/hd-d102u-rack-{front,dims,top,side}-art.webp`. VDM·XDM·SPX 프레임 그림과 같은 검은 몸체 평면 그림, 도면 mm 좌표 그대로. 도면에 없는 실크 글자는 넣지 않았습니다. |
| 02 Port Map | 사진 3장(정면·치수 / 윗면 / 옆면)에 번호표. 기준 문구 "사용자 제공 도면 기준 그림" |
| 04 제품 사양 | 장착 수량 최대 12대 · 크기 483×282×177mm(19인치 랙) · 고정 구멍 줄 간격 147mm |
| 관련 제품 | Rack마운트 ↔ HD-D102U 양방향 `WORKS_WITH` |
| 목록 정렬 | `scripts/build-product-index.cjs`: `Rack Mount` 제품은 함께 쓰는 제품의 HDMI 출력 개수로 정렬해 HD-D102U 바로 뒤에 보입니다. |
| 화면 코드 | `src/products.js`: `portMap`이 배열일 때도 첫 장의 `basis`를 02 제목 옆에 표시(전에는 배열이면 항상 "실제 제품 사진 기준") |

## 확인하지 않은 것

- 도면에 없는 값(무게, 재질, 색상, 랙 높이 U 표기)은 적지 않았습니다. 177mm는 4U(177.8mm)에 해당하지만 도면에 U 표기가 없어 사양에 쓰지 않았습니다.
- 옆면의 앞판·바닥판 방향은 윗면 도면(앞쪽 플랜지·칸별 통풍 슬릿)과 옆면 도면의 폭(82mm)으로 판단했습니다.

## 검증

- 단위 테스트 47/47(0.121 테스트 추가: 양방향 관련 제품, 그림 파일 존재, 도면 PDF 비공개, 목록 순서)
- e2e 164/164(제품 수 30 → 31)
- 화면: `docs/qa/hd-d102u-rack-screens/`(데스크톱 1400px, 휴대폰 390px, 분배기·선택기 목록). 콘솔 오류 없음, 가로 넘침 없음

## 되돌리기

`data/products/hd-d102u-rack.json`, 그림 4장, 그림 스크립트를 지우고, `hd-d102u.json`의 `related`를 `[]`로 되돌린 뒤 `node scripts/build-product-index.cjs`를 실행합니다. 테스트의 제품 수(31 → 30, distribution 8 → 7)도 되돌립니다.
