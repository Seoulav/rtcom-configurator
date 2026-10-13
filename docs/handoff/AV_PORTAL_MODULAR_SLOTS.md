# AV Portal 인계 — 모듈형 장비 슬롯·카드 데이터 (0.208)

- **요청서:** AV Portal / AV System Builder 담당, 2026-10-13. 원문은 `docs/handoff/AV_PORTAL_MODULAR_SLOTS_REQUEST_2026-10-13.md`에 있습니다.
- **반영 파일:** `data/products/xdm.json`, `spx.json`, `vdm.json`, `spx-r6.json`
- **공개 주소:** `https://seoulav.github.io/rtcom-configurator/data/products/<id>.json`. `index.json`은 바뀌지 않았습니다.
- **원칙:** 요청서 §3을 따랐습니다.
  - 기존 키·값·순서는 바꾸지 않고 새 키만 더했습니다. 원본과 기계로 대조해 같음을 확인했습니다.
  - 근거 문서로 확인한 값만 넣었습니다.
  - 확인하지 못한 값은 빼거나 `REVIEW REQUIRED`로 두었습니다.

## 1. 추가한 필드

요청서 §2의 형식을 그대로 따랐습니다. 이름·뜻을 바꾼 필드는 없습니다.

| 위치 | 필드 | 값 |
|---|---|---|
| 메인프레임 `lineup[]` | `slots` | `{input, output, source, verification, note}` |
| 카드 `lineup[]` | `slotType` | `"input"` / `"output"` |
| | `compatibleFrames` | 같은 시리즈 메인프레임 `model` 배열(생략·와일드카드 없음) |
| | `io` | 카드 1장의 물리 단자. 단품 제품 `io[]`와 같은 9개 키 |
| `spx-r6.json` 최상위(`io` 다음) | `slots` | `{shared: 6, source, verification, note}` |

- **`io` 행 표기:** 기존 제품과 같습니다.
  - `group`: `Video`·`Transmission`·`Audio`·`Power`·`Control`
  - `connector`: `HDMI`·`DisplayPort`·`RJ45`·`LC`·`BNC`·`피닉스 5핀`·`피닉스 3핀`·`3.5mm stereo`·`USB`
  - `direction`: `IN`·`OUT`·`BIDIR`
- **`verification` 값:** `VERIFIED`와 `REVIEW REQUIRED`만 썼습니다. `FOUND`는 쓰지 않았습니다.
- **`source` 코드:** 각 파일의 `sources[]`에 있는 코드입니다. 새로 더한 코드는 아래와 같습니다.

| 파일 | 새 코드 | 출처 |
|---|---|---|
| `xdm.json` | `M` | XDM 시리즈 국문 사용자 매뉴얼 KV08(250902), 공개본 `xdm-manual.pdf` |
| `xdm.json` | `U3` | 서울영상테크 확인(2026-09-28): XDM-COS100 피닉스 단자로 XDM-PHX 전원을 받음 |
| `xdm.json` | `U7` | 0.212 서울영상테크 확인(사용자 답변 2026-10-13): XDM-288 입출력 보드 각 72장 |
| `vdm.json` | `U2` | 0.212 서울영상테크 확인(사용자 답변 2026-10-13): SIS4-U = VDM-SIS4, SOS4 오디오 있음, HOS4S-UW USB 미사용, VDM-288X 주문 생산·72·72 |
| `spx.json` | `U3` | 0.212 서울영상테크 확인(사용자 답변 2026-10-13): SPX-HIS8 오디오 3.5mm 스테레오 잭 |
| `xdm.json` | `U5` | 0.210 알티컴 확인(사용자 전달 2026-10-13): XDM-COS100 출력마다 XDM-PHX 전원, XDM-WOS100 오디오 출력 없음, XDM-288 주문 생산 |
| `spx.json` | `M2` | SPX 시리즈 국문 사용자 매뉴얼(250805) 3–4·10–12쪽, 공개본 `spx-manual.pdf` |
| `vdm.json` | `M` | VDM 시리즈 국문 사용자 매뉴얼 KV07(251219), 공개본 `vdm-manual.pdf` |

- **쪽 번호:** 매뉴얼에 인쇄된 쪽 번호입니다. XDM·VDM은 PDF 쪽 번호보다 1 작습니다.

## 2. 메인프레임 `slots`

| 시리즈 | 모델 | input / output | 근거 |
|---|---|---|---|
| XDM | XDM-12 | 3 / 3 | 매뉴얼 KV08 7쪽 (가로 배치, 왼쪽 입력·오른쪽 출력) |
| | XDM-20 · XDM-36 | 5 / 5 · 9 / 9 | 8쪽 (세로 배치, 왼쪽 입력·오른쪽 출력) |
| | XDM-72 · XDM-144 · XDM-216 | 18 / 18 · 36 / 36 · 54 / 54 | 9·10·11쪽 (세로 배치, 위 입력·아래 출력). 72·144의 DANTE 슬롯은 별도 옵션 |
| SPX | SPX-M810 · M1620 | 1 / 1 · 2 / 2 | 매뉴얼(250805) 7·8쪽 (가로 배치, 위 입력·아래 출력) |
| | SPX-M3236 | 4 / 3 | 8쪽 |
| | SPX-M2472 · M24120 | 3 / 6 · 3 / 10 | 9쪽 (세로 배치, 왼쪽 입력·오른쪽 출력) |
| VDM | VDM-8X · 16X · 32X · 48X · 64X | 2 · 4 · 8 · 12 · 16 (입출력 같음) | 매뉴얼 KV07 4·11–15쪽 |
| | VDM-80X · 128X · 180X · 256X | 20 · 32 · 45 · 64 (입출력 같음) | 16–19쪽 |
| SPX-R6 | (최상위) | shared 6 | SPX-R6 제품 사양서(S1). 칸마다 SPX-TX 또는 SPX-RX 모듈(사용자 확인 2026-09-29, U2) |

- **넣지 않은 모델**
  - **XDM-288:** 주문 생산 모델입니다(0.210 알티컴 확인). 0.212부터 `slots` 입력 72·출력 72를 넣었습니다(출처 `U7`). 문서 값이 아니라 사용자 확인 "4채널 단위를 의미해 288을 나누어서 보면 되"(카드 1장 = 4채널, 288 ÷ 4)입니다. 구성기에는 넣지 않습니다.
  - **VDM-288X:** 주문 생산 모델입니다. 0.212부터 같은 4채널 규칙으로 `slots` 입력 72·출력 72를 넣었습니다(출처 `U2`, 사용자 확인 2026-10-13). 구성기에는 넣지 않습니다.
  - **호환 프레임:** 0.212부터 XDM 카드 12종의 `compatibleFrames`에 XDM-288을, VDM 카드 10종에 VDM-288X를 더했습니다(같은 4포트 카드 규칙).
- **계산하지 않음:** 채널 수 ÷ 슬롯당 포트로 계산한 값은 하나도 없습니다. 위 값은 모두 매뉴얼 문장("입출력보드는 각각 N장씩 장착 가능", "최대 장착 Input 보드 N장")을 그대로 옮겼습니다.
- **구성기와 일치:** 구성기 `src/core.js` `slotPlans`와 값이 같습니다. 단위 테스트 `tests/modular-slots.test.cjs`가 둘을 대조합니다.
- **슬롯 번호:** 후면에 찍힌 실제 번호 순서는 문서에 없습니다. 그래서 `note`에는 배치 방향만 적었습니다. Builder의 `IN1…`·`OUT1…` 번호와 실물 번호가 같다는 보장은 없습니다.

## 3. 카드 `slotType`·`compatibleFrames`·`io`

| 시리즈 | 카드 | 근거 | 호환 프레임 |
|---|---|---|---|
| XDM | 입력 6종, 출력 5종 | 매뉴얼 KV08 12–17쪽 | XDM 6종(12~216) |
| | XDM-WOS100 | 매뉴얼에 없어 카탈로그 9쪽 | XDM 6종(12~216) |
| SPX | SPX-HIS8 · HOS12 · COS12 | 매뉴얼 10–11쪽 | SPX 5종 |
| | **SPX-HOS10** | 매뉴얼 10쪽 | **SPX-M810 · M1620만** |
| VDM | 10종 | 매뉴얼 KV07 20–44쪽 (SIS4-U는 카탈로그 19쪽) | 매뉴얼에 보드 수가 있는 VDM 9종(8X~256X) |

- **요청서 예시와 다른 점(SPX-HOS10)**
  - 매뉴얼 3쪽에는 "SPX-M3236·M2472·M24120은 SPX-HOS12 또는 COS12"라고 적혀 있습니다. 그래서 HOS10은 M810·M1620에만 넣었습니다.
  - 요청서 §2.2 예시처럼 5종 모두에 넣으면 매뉴얼과 다릅니다.
- **RS-232+(XDM-CIS100·COS100·FIS100·FOS100)**
  - 카드 패널에 별도 RS-232 단자는 없습니다. 매뉴얼·카탈로그의 포트 구성은 영상 포트 4개와 오디오 단자 4개뿐입니다.
  - RS-232 신호는 HDBaseT·광 선으로 전송기까지 함께 갑니다. 그래서 RS-232 행은 만들지 않고, RJ45·LC 행의 `condition`에 적었습니다.
- **오디오 단자**
  - **XDM 입력 카드:** `피닉스 5핀` 4개, `BIDIR`입니다. 매뉴얼 표기는 "4 Audio In/Out ports(병합 및 추출)"이고, 한 단자로 병합과 추출을 겸합니다.
  - **XDM 출력 카드:** `피닉스 3핀` 4개, `OUT`입니다.
  - **VDM 4K 카드:** `3.5mm stereo` `IN` 4개와 `OUT` 4개입니다. 매뉴얼 표기는 "4 Stereo In/Out ports"이고 "Audio Insertion via In ports / Extraction via Out ports"입니다. 카드 사진에서도 포트마다 잭이 2개(▲·▼) 보여 입력·출력을 따로 셌습니다.
- **XDM-COS100 단자 하나에 두 행**
  - 피닉스 5핀은 "Audio 추출 및 POE" 겸용입니다. 그래서 오디오 `OUT` 행과 `Power` `IN` 행을 따로 두었습니다.
  - 같은 단자라는 점은 Power 행의 `connector`("피닉스 5핀(오디오 단자와 공용)")와 `condition`에 적었습니다. Builder가 단자 하나로 합쳐 그리려면 이 표기를 기준으로 하면 됩니다.

## 4. 확인하지 못한 항목 (`REVIEW REQUIRED` 또는 미기재)

남은 항목은 없습니다(0.212).

0.212에서 0.208 당시 이 표에 있던 항목을 모두 확인했습니다(서울영상테크 확인, 사용자 답변 2026-10-13). 공개 JSON 카드 단자에 `REVIEW REQUIRED`는 더 이상 없습니다.

- **SPX-HIS8 오디오 커넥터:** 3.5mm 스테레오 잭으로 확정했습니다(`spx.json` 출처 `U3`, VERIFIED).
- **VDM SIS4-U:** 매뉴얼 KV07의 VDM-SIS4와 같은 카드입니다. 오디오 2행(IN 4·OUT 4, 3.5mm)을 매뉴얼 28쪽 값으로 확정했습니다(출처 `M`, VERIFIED).
- **VDM SOS4 오디오:** 매뉴얼대로 `BIDIR` 4포트가 있습니다(VERIFIED).
- **VDM HOS4S-UW USB:** 현장에서 쓰지 않는 단자라 `io`에서 행을 뺐습니다.
- **XDM-288 · VDM-288X:** §2와 같습니다.

0.210에서 확인되어 이 표에서 뺀 항목(알티컴 확인, 사용자 전달 2026-10-13, 출처 `U5`):

- **XDM-COS100 PoE 전원 입력:** `Power` 행을 `quantity: "4"`, VERIFIED로 고쳤습니다. 출력마다 XDM-PHX 1개에서 전원을 받습니다. 구성기 BOM도 XDM-PHX를 COS100에 연결한 CTR100 RX 대수만큼 셉니다(0.72~0.209는 카드 장수).
- **XDM-WOS100 오디오:** 오디오 출력이 없습니다. 오디오 행은 지금처럼 두지 않고, 영상 행 `condition`에 "오디오 출력 없음"을 적었습니다.

- **`packageStatus` 유지:** 위 항목은 카드 `lineup` 안에만 있습니다. 그래서 시리즈의 `packageStatus`("VERIFIED")는 바꾸지 않았습니다(기존 값 유지). 검토 필요 여부는 행마다 `verification`으로 판단해 주십시오.

## 5. 검증

- **`scripts/build-product-index.cjs`가 새 필드를 검사합니다.**
  - `slots`: 키·정수·출처·검증 값
  - 카드의 세 필드는 함께 있어야 합니다.
  - `slotType`은 `kind`와 맞아야 합니다.
  - `compatibleFrames`는 같은 시리즈에서 그 방향 슬롯이 있는 프레임만 됩니다.
  - `io`: 9개 키, `direction`, 수량은 숫자이거나 빈 문자열입니다. 수량을 모르는 행은 VERIFIED로 둘 수 없습니다.
- **`tests/modular-slots.test.cjs`가 다음을 확인합니다.**
  - 구성기 `slotPlans`와 같은지 대조합니다.
  - 구성기 카드 26종의 채널 수와 첫 `io` 행 수량이 같은지 봅니다.
  - SPX-HOS10의 호환 프레임을 확인합니다.
  - 확인하지 못한 행이 `REVIEW REQUIRED`로 표시됐는지 확인합니다.
  - 잘못된 데이터를 넣으면 검증 스크립트가 잡는지 확인합니다.

## 6. 형식 관련 메모 (AV Portal 담당에게)

- **SPX-R6 모듈 단자:** 요청서 §2.3대로 메모로만 남겼습니다(`slots.note`). `spx-rx-tx.json`의 `io` 가운데 `TX ·`·`RX ·`로 시작하는 행이 모듈 하나의 단자입니다. 모듈 모델 목록을 따로 기계용 키로 받아야 하면 형식을 먼저 합의해 주십시오. 예를 들어 `slots.modules`를 더하는 방식이 가능합니다.
- **카드 하나가 여러 시리즈에 맞는 경우:** 문서로 확인된 예가 없어 `compatibleFrames`는 모두 같은 시리즈 안의 프레임입니다.
