# SPX-TX/RX 제품 추가·XDM-FT101/FR101 매뉴얼 반영·05 주요 기능 어투 통일 QA (0.64.0, 2026-09-27)

## 1. 요청

- "전송기에 SPX-TX/RX 모델이 안 보인다."
- "XDM-FT101/XDM-FR101 이것도 05 주요기능에 ~한다라고 표현되어 있어. 너가 전수조사해서 05 주요기능 부분 수정해."
- SPX-TX/RX 사용자 매뉴얼 Ver.2.0, XDM-FT101/FR101 사용자 매뉴얼 Ver.1.3 제공("참고해"). 원본은 `.source-materials/`(git·배포 제외)에 보관했습니다.

## 2. SPX-TX/RX(`spx-rx-tx`, 29번째 제품)

- 원인: 카탈로그 16쪽에 SPX-RX/TX가 공통 사양 한 표로만 실려 있어, `docs/audit/PRODUCT_ISSUES_ARCHIVE_2026-09-27.md` R5에서 "별도 제품 JSON 없음"으로 두었습니다. 이번에 매뉴얼을 받아 별도 제품으로 만들었습니다(R5 판단 변경).
- 사진: Main은 카탈로그 16쪽 제품 사진, TX·RX 단자 지도는 매뉴얼 6·7쪽에 들어 있는 원본 사진(번호표 없는 사진)을 위(전면)·아래(단자면)로 합성했습니다(`spx-rx-tx-tx.webp` 671×655, `spx-rx-tx-rx.webp` 712×653).
- 단자 지도 번호: TX 1 HDMI IN → 2 CAT OUT → 3 AUDIO IN → 4 DIP S/W → 5 S/P → 6 LED → 7 DC IN, RX 1 CAT IN → 2 HDMI OUT → 3 AUDIO OUT → 4 S/P → 5 LED → 6 DC IN(입력 → 출력 → 오디오 → … → 전원 순서).
- 딥 스위치(매뉴얼 6~7쪽): SPX-TX에만 있고, "스위치를 내리면 ON, 올리면 OFF"이므로 `onUp: false`(그림의 "ON ↓"). 출고 상태는 모두 OFF. 1번 오디오(OFF HDMI Source / ON Analog), 2번 전송 거리(OFF Normal / ON Long reach, 1080p 최대 100m), 3·4번 EDID 조합(OFF·OFF Through-pass 기본값 / ON·OFF 1080p 60Hz / OFF·ON 4K 30Hz / ON·ON 4K 60Hz). 3·4번은 두 스위치를 함께 그리는 `dipSwitch.combos`로 보여줍니다.
- 위치 표기: 매뉴얼 6쪽은 "전면 패널" 목록에, 10쪽은 "측면에 위치한 딥 스위치"라고 적었습니다. 사진상 옆면이므로 "측면"으로 적었습니다.
- PoC 표기: 카탈로그는 "POC(Power Over CAT)", 매뉴얼은 "PoC(Power over Cable)"입니다. 제품 상세는 매뉴얼 표기를 따랐습니다.
- 03 Signal Flow: 이 제품은 HDBaseT를 쓰지 않으므로 케이블 이름을 "CATx"로, 거리 표기를 "4K 60Hz 최대 50m · 1080p 최대 60m · Long Reach 최대 100m"로 그립니다(HDBaseT 전송기는 그대로).
- 목록: 제품 28 → 29종, 전송기 분류 12 → 13종(단위 테스트·e2e 기대값 갱신).

## 3. XDM-FT101/FR101

- 매뉴얼 6쪽 EDID Select Rotary S/W 표: 0 Through pass·1 1920x1080@60·2 3840x2160@30·3 3840x2160@60(Source 오디오), 8·9·10(A)·11(B)는 같은 EDID에 Analog 오디오 병합. 기본값 0. 06 EDID 설정 카드와 대표 그림(0·3·8번)을 추가했습니다. 링 표시는 매뉴얼 전면 사진(`xdm-ft101-fr101-front.webp`)의 MODE 로터리 위치입니다.
- 사양·입출력 보완: 전원 DC +12V 1A, 광 출력(2km 전송 후 -10 dBm 이상), S/P(Mini USB, 펌웨어), DC IN(+12V·GND) 단자. 매뉴얼 표의 연결 단자에는 "DC Power Jack"이라고 적혀 있지만 사진의 DC IN은 3핀 터미널(+12V·GND)이라, 단자 이름은 사진 표기를 따랐습니다.

## 3-0. 추가 요청(2026-09-27)

- "SPX는 HDBaseT 전송이 아니야, 착각하지 마": 03 Signal Flow(SPX-TX/RX)는 이미 "CATx"였고, 남아 있던 곳 3군데를 고쳤습니다. 구성기 04 전송기의 SPX 빈 구성 안내와 머리말("HDBaseT·광 카드" → "CATx 카드", `src/app.js`), SPX 시리즈 상세 02 신호 구성의 CAT 범례("HDBaseT·CATx" → "CATx", `src/products.js` SIG_NAME). XDM·VDM의 HDBaseT 카드 문구는 그대로입니다.
- "XDM-FT101/FR101도 로터리 스위치 이미지화해서 넣어줘": 06 EDID 설정의 로터리 그림을 전체 8칸(Source 0~3 / Analog 8~11)으로 두 줄에 나눠 보여줍니다(`edidSwitch.examples: "all"`, 표 행의 `group`·`caption`). XDM-FT101/FR101에는 딥 스위치가 없고 스위치는 MODE 로터리 하나입니다.

## 3-1. OBUX-1C 딥 스위치(사용자 요청 "OBUX-1C 딥스위치 예상 이미지 만들어서 추가해", 매뉴얼 Ver.2.2 제공)

- 근거: 매뉴얼 6~7쪽 "Dip S/W: EDID 설정과 오디오 선택을 위한 딥 스위치", 10쪽 "오디오 병합". 원본은 `.source-materials/RTcom_Manual_OBUX-1C_Ver2.2.pdf`.
- Tx 전면 Mode 딥 스위치 4핀(검은 몸체): 1번 오디오(OFF HDMI Source 기본값 / ON Analog), 2·3·4번 EDID 조합 5가지(Through-pass 기본값, 1080p60, 2160p30, 2160p60, Through-pass EDID Fix)와 EDID Fix 설정 순서.
- ON 방향: 매뉴얼에 없습니다. 매뉴얼 사진에서 출고 상태(모두 OFF)의 레버가 위에 있어 아래쪽을 ON으로 그렸고, 카드 안내에 "제품 하단 스티커로 확인"을 적었습니다. → 사용자 제공 매뉴얼 사진(2026-09-27, 전면 Mode 스위치 확대)에서 몸체 아래쪽 "ON"·↓ 표시와 위로 올라간 레버(모두 OFF)를 확인해, 아래쪽 ON 그림을 그대로 두고 안내를 "스위치 몸체 아래쪽에 ON 표시가 있어 레버를 아래로 내리면 ON이다"로 바꿨습니다(추정 문구 삭제).
- 보완: 지원 사양(HDMI 2.0b, HDR Static·Dynamic, Dolby Atmos), HDCP v1.x·v2.2, S/P(Mini USB) 단자, 05 주요 기능 2줄.

## 4. 05 주요 기능 어투 통일

- 29종 전체를 검사해 "~한다/~다." 문장 약 90줄(20개 제품)을 "~ 지원"·명사형으로 바꿨습니다. 뜻은 바꾸지 않았고, 카탈로그 원문 영어 줄(HD-D102U 등)과 "압력 저항 강도: …" 같은 사양 줄은 그대로 두었습니다. 바꾼 뒤 다시 검사해 "~다"로 끝나는 줄이 없음을 확인했습니다.

## 5. 검증

- `node --test tests/*.test.cjs`: 39/39 통과(전송기 13종 기대값)
- `node scripts/build-product-index.cjs --check`: 29개 통과
- `node scripts/package-site.cjs`: 통과
- `node scripts/e2e-smoke.cjs`: 124/124 통과(SPX-TX/RX 딥 스위치·CATx 신호 흐름, SPX HDBaseT 표기 없음(상세 2곳·구성기 04), FT101 로터리 전체 8칸, OBUX-1C 딥 스위치 확인 추가, 제품 29종·전송기 13종, 구성기 사진 슬롯 검사의 사진 로드 대기 보완)
- 화면: `docs/qa/spx-txrx-screens/`

## 6. 되돌리기

해당 커밋들을 `git revert`합니다. SPX-TX/RX만 빼려면 `data/products/spx-rx-tx.json`과 사진 3장을 지우고 `node scripts/build-product-index.cjs`로 목록을 다시 만들고 테스트 기대값을 28·12로 되돌립니다.
