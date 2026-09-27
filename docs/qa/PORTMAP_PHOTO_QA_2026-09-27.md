# 사진 기준 단자 지도 확대 QA (0.42.0, 2026-09-27)

사용자 요청: "13u 단자 설명처럼 똑같이 안된것들 찾아서 수정해줘"

## 1. 기준

HD-13U 상세의 "03 단자 지도 — 실제 제품 사진 기준"을 기준으로 삼았습니다.

- 실제 제품 사진 위에 괄호와 번호표를 그립니다.
- 번호마다 단자 이름과 한 줄 설명을 붙입니다.
- 전원·오디오까지 사진에 보이는 단자를 모두 다룹니다.

## 2. 전수 비교 결과(27종)

| 상태 | 제품 | 처리 |
|---|---|---|
| 이미 사진 기준 | HD-13U, HD-104U, HD-108U, HD-210U, HDS-21U, HDS-42MU, QMS-44UX, QMS-88UX, MR-4S, XDM-FT101/FR101 | 유지. HD-104U·HD-108U는 후면 사진에 HDMI·전원 단자만 있어 빠진 단자가 없음을 확인했습니다. |
| 입출력 표 카드만 있음 → 사진 기준으로 변경 | HD-D102U, XDM-CTR100, CT101-U/CR101-U, CT104-U/CR104-U, FT101-U/FR101-U, OBUX-1C, OBHD-2C | 이번에 추가했습니다(3장). |
| 입출력 표 카드 유지 | CT103-U-H/CR103-U, FT103-U-H/FR103-U(벽부형) | 사진 해상도(383px)가 낮아 단자 이름을 읽을 수 없습니다. CT103-U-H는 같은 모양 HDMI 단자 2개의 용도도 카탈로그에 없습니다. 고해상도 사진이나 매뉴얼이 있으면 추가합니다. |
| 입출력 표 카드 유지 | XDM-CT103/CR103 | 사진이 가로 70px이고 단자가 세로로 놓여, 괄호 방식으로 표시할 수 없습니다. |
| 해당 없음 | XDM, VDM, SPX(구성기 슬롯), 케이블 4종 | 단자 지도 대상이 아닙니다. |

## 3. 추가한 단자 지도

| 제품 | 사진 | 번호표 |
|---|---|---|
| HD-D102U | 사선 사진 1장 | HDMI IN, HDMI OUT 1·2, DC 5V(뒷면), STD/TV 스위치(앞면) |
| XDM-CTR100 | 후면 사진 1장(위 앞면, 아래 뒷면) | HDBaseT, HDMI IN, HDMI OUT, AUDIO·RS-232(5핀), DC IN, TX/RX DIP 스위치 |
| CT101-U/CR101-U | 송신기·수신기 각 1장 | DC IN, HDMI, AUDIO, RS-232C, CATx, FIRMWARE, 전원 스위치 |
| CT104-U/CR104-U | 송신기·수신기 각 1장 | DC 12V, HDMI, RS-232C, CATx |
| FT101-U/FR101-U | 송신기·수신기 각 1장 | DC IN, HDMI, AUDIO, RS-232C, OPTICAL, FIRMWARE, 전원 스위치 |
| OBUX-1C | 송신기·수신기 각 1장 | +12V, Audio(3핀), HDMI, Fiber(SC) |
| OBHD-2C | 뒷면 사진 1장(위 송신기, 아래 수신기) | 송신기·수신기별 DC 5V, HDMI, OPTICAL 1·2 |

단자 설명은 제품 사양 표·주요 기능 문구와 사진 속 인쇄 표기를 대조해 적었습니다. 기능 설명이 카탈로그에 없는 조작부(OBUX-1C Mode 딥 스위치, OBHD-2C MODE 로터리·EDID S/W, S/P 단자)는 추측을 피하려고 넣지 않았습니다.

## 4. 좌표 측정

- 원본 사진 위에 10px 눈금(50px마다 숫자)을 그린 확대 캡처로 단자 가장자리를 쟀습니다(스크래치 도구, 저장소에 넣지 않음).
- 앞면과 뒷면이 위아래로 함께 찍힌 사진은 새 선택 항목 `y`로 괄호를 각 면 가장자리에 붙였습니다.
- 1280px·390px 캡처로 번호가 해당 단자를 가리키는지, 휴대폰에서 가로 넘침이 없는지 확인했습니다.

## 5. 코드 변경

- `src/products.js`: `portMapDiagram()`이 `portMap` 배열을 받아 장마다 제목(`title`)·사진·번호표·설명 카드를 그립니다. 객체 형식(기존 10종)은 그대로 동작합니다. 괄호 높이 `y`를 지원합니다.
- `scripts/build-product-index.cjs`: 배열 형식, `title`(여러 장이면 필수), `y`(사진 높이 안), 사진 역할(Rear·Front·Perspective·Main·Other)을 검사합니다.
- `src/styles.css`: 여러 장일 때 앞 장 설명 카드와 다음 장 제목 사이 간격.
- `scripts/e2e-smoke.cjs`: CT104-U/CR104-U 상세에 송신기·수신기 단자 지도 두 장이 나오는지 검사합니다.

## 6. 함께 정리한 데이터

- HD-13U 입출력 표에 3.5mm AUDIO IN(병합)·OUT(추출) 행을 추가했습니다(매뉴얼 7쪽, 후면 사진).
- FR101-U 입출력 표에 AUDIO OUT 행을 추가했습니다(카탈로그 사진의 AUDIO OUT 표기).
- 0.41에서 다시 들어간 확인 사항 작업 기록(I5 "로터리 자주 쓰는 코드 강조", 4종)을 0.39 정리 기준(`docs/audit/PRODUCT_ISSUES_ARCHIVE_2026-09-27.md`)대로 뺐습니다. 코드표의 1·7번 강조는 그대로입니다.

## 7. 검증

- `node --test tests/*.test.cjs`: 37/37
- `node scripts/build-product-index.cjs --check`: 27개 통과
- `node scripts/package-site.cjs`: 통과
- `node scripts/e2e-smoke.cjs`(전역 playwright): 83/83
- `git diff --check`: 통과

## 8. 되돌리는 방법

이 커밋을 revert하면 7종이 입출력 표 카드로 돌아갑니다. 코드는 객체 형식 `portMap`을 계속 지원하므로 데이터만 되돌려도 화면이 깨지지 않습니다.
