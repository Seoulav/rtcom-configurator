# SPX-R6 추가와 SPX 자료 4종 반영 (0.157.0)

## 1. 요청과 결정

- 요청(2026-09-29): "SPX-R6분석해서 장비 추가하고 카달로그도 활용해줘"(SPX-R6 사양서 첨부), 이어서 SPX 카탈로그("SPX-M24120에 카달로그야 참고해"), SPX 공통 매뉴얼, SPX-TX/RX 매뉴얼("추가해")을 첨부했습니다.
- 사용자 결정(2026-09-29 질문 응답):
  - PDF 공개: SPX-R6 사양서, SPX-TX/RX 매뉴얼 Ver.2.0, SPX 공통 매뉴얼 250805 → 공개. SPX 카탈로그 2023 → 공개하지 않음(근거로만 사용).
  - SPX-R6 이미지: 사양서 사진·연결도에 다른 회사 로고가 있어 **로고 없는 평면 그래픽**으로 새로 그림.
  - SPX-M2472·M24120 깊이: **443.7mm**(매뉴얼·2023 카탈로그). 종합 카탈로그 2026의 433.7mm는 쓰지 않음.
  - SPX 비디오 월 배열: **지금 표기(2x2·3x3·3x4) 유지**.

## 2. 받은 자료와 보관 위치

로컬 `input_doc/`(Git 제외)에 규칙 이름으로 보관하고 `docs/evidence/input-doc-ledger.json`에 기록했습니다.

| 원래 이름 | 보관 위치 | 공개 | 반영 |
|---|---|---|---|
| RTcom_Specificaion_SPX-R6.pdf (1쪽, 2024-03-04) | `input_doc/RTCOM/sheet/RTcom_ProductSheet_SPX-R6.pdf` | `spx-r6-catalog.pdf` | 새 제품 `data/products/spx-r6.json` |
| RTcom_Catalogue_SPX_KOR.pdf (6쪽, 2023-06-23) | `input_doc/RTCOM/catalog/RTcom_Catalog_SPX_2023.pdf` | 안 함 | SPX 깊이 근거(C3) |
| SPX_Series_User_Manual_250805KOR.pdf (54쪽) | `input_doc/RTCOM/manual/RTcom_Manual_SPX_250805.pdf` | `spx-manual.pdf` | SPX 매뉴얼 버튼, 깊이 근거(M1) |
| SPX-TX_RX 매뉴얼 Ver.2.0 (13쪽) | `input_doc/RTCOM/manual/RTcom_Manual_SPX-TX-SPX-RX_Ver2.0.pdf` | `spx-rx-tx-manual.pdf` | SPX-TX/RX 매뉴얼 버튼(값은 0.64에서 이미 반영, 4쪽 사양 일치) |

## 3. SPX-R6 제품 데이터

- 그룹: 전송기(`extender`), 카테고리에 `Rack Mount`. 목록에서 SPX-TX / SPX-RX 바로 앞에 보입니다.
- 사양·기능·단자는 사양서 1쪽(출처 S1)만 옮겼습니다. 크기·무게·전원 전압은 사양서에 없어 적지 않았습니다.
- 그림: `scripts/tools/draw_spx_r6_panels.cjs`가 전면(사양서 실물 사진 배치: LCD·방향 버튼·MENU·CANCEL·모델명·FW·IR IN·IR Ctrl)과 후면(사양서 연결도 배치: 전원 입력 + 모듈 칸 6개, 칸마다 HDMI IN·CAT OUT)을 SPX 프레임 그림과 같은 검은 몸체로 그립니다(2000×199). 칸 번호 1~6은 설명용 표시입니다.
- 02 Port Map: 전면 5개(IR IN → IR Ctrl → FW → LCD → 버튼), 후면 4개(HDMI IN → CAT OUT → 모듈 칸 → 전원, 전원 마지막 규칙).
- 03 Signal Flow: `src/products.js` `rackExtenderDiagram` — 소스 6대 → 모듈 1~6 → CATx(CAT5e)·PoC → SPX-RX 6대 → 디스플레이, IR 리시버·제어 컨트롤러 → IR IN·IR Ctrl, 전원 어댑터 1개 → 본체.
- 관련 제품: SPX Series(PART_OF_SERIES), SPX-TX / SPX-RX(WORKS_WITH, 양쪽).
- 구성기(매트릭스 구성기)에는 넣지 않았습니다. SPX 매트릭스 입력 카드는 HDMI(HIS8)뿐이라 SPX-R6가 매트릭스 카드와 짝이 되지 않습니다.

## 4. 자료끼리 다른 곳

| 항목 | 종합 카탈로그 2026 | SPX 카탈로그 2023 | SPX 매뉴얼 250805 | 결정 |
|---|---|---|---|---|
| M2472·M24120 깊이 | 433.7mm | 443.7mm | 443.7mm(7~9쪽) | 443.7mm로 정정 |
| M3236 깊이 | 355mm | 353mm | 355mm(8쪽) | 355mm 유지 |
| 비디오 월 배열 | 2x2·3x3·3x4 | 1x12·2x6·3x4·4x3·6x2·12x1 | 3쪽 HOS12 사용 시 1x12~12x1, 4쪽 2x2·3x3·3x4 | 지금 표기 유지 |
| 보드 이름 | HIS8·HOS10·HOS12·COS12 | HI8·HO10·HO12·CO12 | HIS8 등 | 새 이름 유지(2023판은 옛 표기) |
| CATx 보드 거리 기준 | CAT 6 | CAT 5e, 6 | CAT5e/6 | 변경 없음 |

SPX-R6 사양서와 다른 자료 사이:
- 연결도의 SPX-RX 아래 "IR Blaster"가 그려져 있으나 SPX-TX/RX 매뉴얼 Ver.2.0의 SPX-RX에는 IR 단자가 없습니다. Signal Flow에는 그리지 않았습니다(`docs/handoff/OPEN_ITEMS.md`).
- 연결도 전면 문구는 "Signal Processing eXpert Rack Moduler", 사진 전면 문구는 "6 HDMI Extender Module Chassis"입니다. 사양서 제목과 같은 뒤쪽을 썼습니다.

## 5. 검증

`node --test tests/*.test.cjs`(0.157 검사 추가), `node scripts/build-product-index.cjs --check`(제품 32개), `node scripts/package-site.cjs`, `node scripts/e2e-smoke.cjs`(SPX-R6 상세·문서 버튼 검사 추가), `git diff --check`. 화면: `docs/qa/spx-r6/`.

## 6. 되돌리는 방법

- SPX-R6 제품만 빼려면 `data/products/spx-r6.json`, `spx-r6-*.webp`, `spx-rx-tx.json`의 `spx-r6` 관련 제품 줄, `src/products.js`의 `rackExtenderDiagram`을 지우고 `node scripts/build-product-index.cjs`를 실행합니다.
- 버튼만 끄려면 `documents[].file`을 지웁니다. 공개 폴더 PDF를 지워도 Git 기록에는 남습니다.
- 깊이 값은 `data/products/spx.json` `lineup`의 두 줄을 433.7로 되돌립니다.

## 7. 0.158.0 보완(사용자 확인 2026-09-29)

- 사용자 답변: "SPX-RX의 IR 기능과 수신가능한대 잘 안써".
- SPX-R6 04 제품 사양에 "수신 모듈 장착: 가능"과 "SPX-RX IR 기능: 지원(IR Blaster)"을 추가했습니다. 두 행 모두 조건 칸에 "현장에서는 잘 쓰지 않음"을 적었고, 출처는 U2(사용자 확인)입니다. 개요에도 같은 내용을 한 문단 더했습니다.
- 03 Signal Flow 그림은 자주 쓰는 구성(송신 모듈 → SPX-RX)만 그대로 두었습니다. 그림 아래 안내 문장에 수신 모듈과 IR Blaster도 지원하지만 잘 쓰지 않아 그림에서 뺐다고 적었습니다.
- SPX-TX / SPX-RX 상세는 바꾸지 않았습니다. SPX-TX/RX 매뉴얼 Ver.2.0에 IR 단자 정보가 없어 단자 지도나 사양에 넣을 근거가 없기 때문입니다.
- `docs/handoff/OPEN_ITEMS.md`에서 IR Blaster·모듈 종류 확인 항목 2건을 지웠습니다.
- 제조사 원본 다이어그램(사용자 요청 "앰버텍만 지워서 활용하면 될거 같은데"): 사양서 1쪽 연결도(1400×1577)에서 로고 7곳(본체 x275~362·y285~336, SPX-RX 6대 가운데 x±26·y1077~1102)을 배경색 (35,31,32)으로 덮어 `output/design/assets/products/spx-r6-diagram.webp`로 저장했습니다. 다른 부분은 바꾸지 않았습니다.

## 8. 0.164.0 보완(사용자 확인 2026-09-29 "SPX-R6에 TX, RX선택해서 사용할 수가 있어")

- 04 제품 사양의 "수신 모듈 장착: 가능" 행을 "모듈 TX·RX 선택: TX(송신)·RX(수신) 선택 사용"으로 바꿨습니다. 조건 칸에는 "RX(수신) 사용은 현장에서는 드묾"을 적었습니다(앞선 답변 "잘 안써"). 출처는 U2입니다.
- 05 주요 기능에 "모듈 TX(송신)·RX(수신) 선택 사용 지원"을 추가하고, 개요·02 Port Map 후면 설명(모듈 칸, HDMI IN·CAT OUT은 TX 모듈 기준)·03 Signal Flow 안내 문장을 같은 내용으로 고쳤습니다.
- 선택 방법(모듈 교체인지, 설정인지)은 자료에 없어서 적지 않았습니다. 그림은 자주 쓰는 TX 구성 그대로입니다.

## 9. 0.171.0 보완(사용자 확인 2026-09-29 "입력카드가 출력카드 원하는대로 꽂는 거라서 HDMI IN/OUT 되게 해야해")

- 모듈 칸에는 TX(입력) 모듈과 RX(출력) 모듈을 원하는 대로 꽂습니다. 그래서 후면 그림(`scripts/tools/draw_spx_r6_panels.cjs`)의 단자 글자를 `HDMI IN` → `HDMI IN/OUT`, `CAT OUT` → `CAT IN/OUT`으로 바꿨습니다. RX 모듈을 꽂으면 CAT 단자가 입력이 되므로, 사용자가 말한 HDMI뿐 아니라 CAT 단자에도 같은 방식을 적용했습니다.
- 02 Port Map 후면 1·2번 이름과 설명(TX 모듈은 입력·출력, RX 모듈은 반대)을 바꾸고, 제조사 자료 입출력 단자 표의 HDMI·RJ-45 방향을 입출력(BIDIR)으로 바꿨습니다. 번호 좌표는 그대로입니다.
- 03 Signal Flow 그림은 자주 쓰는 TX 구성(HDMI IN → CAT OUT) 그대로이고, 안내 문장이 TX·RX 선택을 설명합니다.

## 10. 0.200.0 보완(사용자 요청 2026-10-04 "다음 단계 진행해줘")

0.171 보고에서 제안한 다음 단계 3번(03 Signal Flow에 RX 구성 예시 추가)을 진행했습니다.

- `src/products.js`의 `rackExtenderDiagram(item,mode)`가 `'tx'`·`'rx'` 두 구성을 그리고, `rackExtenderFlow(item)`가 두 그림을 "TX 구성(송신) / RX 구성(수신)" 버튼(`data-pm-side`·`data-pm-face`, 02 Port Map 정면·후면 버튼과 같은 처리)으로 묶습니다. 처음에는 TX 구성이 보입니다.
- TX 구성: 지금까지와 같습니다(사양서 연결도: 소스 → 모듈 HDMI IN → CAT OUT → SPX-RX → 디스플레이, IR IN·IR Ctrl, 전원 어댑터 1개).
- RX 구성: 소스 → SPX-TX → CATx(CAT5e)·PoC → 모듈 CAT IN → HDMI OUT → 디스플레이, 전원 어댑터 1개. 근거는 사용자 확인 2026-09-29("입력카드가 출력카드 원하는대로 꽂는 거라서")입니다. 사양서에는 RX 구성 연결도가 없어 IR 연결은 그리지 않았습니다.
- 그림 아래 안내 문장은 두 구성 공통으로 하나만 둡니다.
- 검증: 단위 테스트 `0.200: SPX-R6 03 Signal Flow는 TX 구성·RX 구성 버튼…`, e2e(버튼 전환·SPX-TX 6대·CAT IN → HDMI OUT·가로 넘침 없음). 화면: `docs/qa/spx-r6-rx-flow-0.200/`(PC·휴대폰, TX·RX).
- 되돌리기: `connectionDiagram`에서 `rackExtenderFlow(item)`를 `rackExtenderDiagram(item)`으로 바꾸면 TX 그림 하나만 보입니다.
