# OBHD-2C EDID 로터리 설정 카드 QA (0.65.0 준비, 2026-09-27)

## 1. 요청

- 사용자 제공 매뉴얼 `RTCom_Manual_OBHD-2C_KV01.pdf`와 함께 "EDID 로터리 그려줘".
- 로터리 번호가 매뉴얼에 없다고 안내하자 "제조사 확인 후 하자"고 답했다가, 이어서 "그려줘"라고 요청했습니다. 매뉴얼 표 순서대로 먼저 그리고, **배포 전에 제조사 번호표로 확인**하기로 합니다.

## 2. 근거

- 매뉴얼 KV01 7쪽 "3.4 EDID": Auto EDID management system, EDID Library 14종(800x600 ~ 1920x1200@60Hz, HD1080i@60Hz, HD1080p(2CH), HD1080p(Multi)), "초기값의 EDID는 1920x1080@60Hz".
- 매뉴얼 KV01 8쪽 "Emulation": 송신기와 디스플레이를 HDMI로 연결하고 EDID S/W 버튼을 누르면 EDID가 송신기 EEPROM에 저장됨.
- 카탈로그 41쪽 TX 전면 사진: 파란 MODE 로터리(16단), EDID S/W 버튼, VIDEO·AUDIO·PWR·EDID LED, S/P 단자.
- 매뉴얼 원본은 `.source-materials/RTcom_Manual_OBHD-2C_KV01.pdf`(git 제외, 배포 제외)에 보관합니다.

## 3. 바꾼 것

| 위치 | 내용 |
|---|---|
| 이미지 | `obhd-2c-tx-front.webp`(970×220): 카탈로그 Main 사진에서 TX 전면(x 650~1135, y 95~205)을 잘라 2배로 키움. `images` Front 역할, `imageStatuses` Front → FOUND |
| 06 EDID 설정 | MODE 로터리 링(전면 사진), 설명, 기본값 "C = HD1080p(2CH) · 1920x1080@60Hz(초기값)", 로터리 그림 0~D 전체 14칸(`examples: "all"`), EDID 저장(Emulation) 순서, 코드표 14행(좌우 분할) |
| 출처 | `sources` M1(매뉴얼 KV01 3~8쪽) 추가 |

- **추정 사항**: 로터리 번호(0~D)는 매뉴얼 EDID Library 표를 왼쪽→오른쪽, 위→아래로 읽은 순서입니다. 기본값을 C(HD1080p 2CH)로 둔 것도 "초기값 1920x1080@60Hz"에서 추정했습니다. 카드 설명에 "로터리 번호는 매뉴얼 EDID Library 표 순서대로 적었으며 제조사 확인 전이다."를 적었습니다. 제조사 번호표를 받으면 `edidSwitch.table`의 code만 고치고 이 문장을 지웁니다.
- 제조사에 확인할 것: ① 0~F 번호별 EDID, ② 출고 기본 번호, ③ EDID S/W로 저장한 EDID를 쓰는 번호(E·F 등)가 따로 있는지.

## 4. 검증

- 단위 테스트 39/39, validator 29종 통과, package-site 통과, e2e 125/125 통과, `git diff --check` 통과.
- e2e 추가: OBHD-2C 06 EDID 설정에 로터리 0~D 14칸, C번 기본값, 코드표 14행.
- 화면: `docs/qa/obhd-edid-screens/obhd-edid-1280.png`, `obhd-edid-390.png`(가로 넘침 없음, 카드 번호 01·04·05·02·03·06).

## 5. 되돌리기

해당 커밋을 `git revert`합니다(06 EDID 설정 카드, 전면 사진, 출처 M1이 함께 빠짐).

## 6. 후속: 매뉴얼 Ver.2.1로 정정 (0.70.0 준비, 2026-09-28)

- 사용자가 OBHD-2C 사용자 매뉴얼 Ver.2.1을 제공하며 "obhd-2c 수정해줘"라고 요청했습니다(`.source-materials/RTcom_Manual_OBHD-2C_Ver2.1.pdf`, git 제외·배포 제외, 출처 코드 `M2`).
- **로터리 번호표(매뉴얼 6쪽)**: 0 EXTERNAL · 1 800x600 · 2 1024x768 · 3 1280x768 · 4 1280x1024 · 5 1360x768 · 6 1366x768 · 7 1400x1050 · 8 1600x900 · 9 1600x1200 · A 1680x1050 · B 1920x1200 · C 1080i@60Hz(2CH) · D 1080p(2CH) · E 1080p(Multi CH) · F RESERVED. 0.65.0의 추정값(KV01 표 순서로 0=800x600 … D=1080p Multi)은 한 칸씩 어긋나 있었습니다. 0.65.0의 "제조사 확인 전" 문구를 지웠습니다.
- **EDID 저장(매뉴얼 6~7쪽)**: "Rotary S/W를 0번에 위치시키고 소켓을 누르면 EDID가 저장됩니다" → 저장 순서에 "0번(EXTERNAL)에 맞추고 EDID S/W 버튼"을 넣었습니다. 기본값 표기는 매뉴얼 "Default EDID는 1920x1080@60Hz"에 맞는 D번(1080p 2CH)으로 두었습니다(출고 시 로터리 위치는 매뉴얼에 없음).
- **사진**: 매뉴얼 6·7쪽의 번호 표시 없는 원본 사진(Tx 앞 829×229·뒤 798×211, Rx 앞 794×206·뒤 794×199)을 뽑아 Tx·Rx 앞면·뒷면 합성 사진 두 장(`obhd-2c-tx-front-rear.webp` 829×500, `obhd-2c-rx-front-rear.webp` 794×465)과 06 EDID 설정용 Tx 전면 사진(`obhd-2c-tx-front.webp` 교체)을 만들었습니다. 원본 사진 자체에 "EDID S/W"·"AUDIO" 인쇄 글자 일부가 빠진 자국이 있습니다.
- **단자 지도**: 송신기 1 HDMI IN · 2 OPTICAL 1·2 · 3 EDID S/W · 4 MODE · 5 S/P · 6 DC 5V, 수신기 1 HDMI OUT · 2 OPTICAL 1·2 · 3 S/P · 4 DC 5V(`portMap.file`로 합성 사진 선택, 0.68.0 방식).
- **05 주요 기능**: 매뉴얼 1-4 "EDID 마인더 기능 지원"을 다른 제품과 같은 문구로 추가했습니다.
- **그대로 둔 것(사용자 확인 필요)**: 매뉴얼 4~5쪽 사양의 크기 128×89×25mm·무게 0.36kg은 카탈로그(124.4×88.4×25mm·0.34kg)와 다르고, 매뉴얼 안에서도 HDMI v1.3(사양 표)과 HDMI 1.4(주요 특징)가 다릅니다. 사이트 04 제품 사양은 카탈로그 값을 유지했습니다. 매뉴얼 10쪽 "전면에 위치한 딥 스위치"는 로터리 스위치의 오기로 보입니다.
- 검증: 단위 테스트 39/39, validator 29종, package-site, e2e 134/134(OBHD-2C 로터리 16칸·D 기본값·"제조사 확인 전" 없음, 단자 지도 Tx 6·Rx 4), `git diff --check` 통과. 화면: `docs/qa/obhd-edid-screens/obhd2-*.png`.

## 7. 후속: 크기·무게·HDMI 규격을 매뉴얼 기준으로 (0.71.0 준비, 2026-09-28)

- 사용자 결정: "OBHD-2C 매뉴얼대로 HDMI 1.3 버전".
- 04 제품 사양: 크기 124.4×88.4×25mm(카탈로그) → **128×89×25mm**(5.0in×3.5in×0.98in), 무게 0.34kg(0.75lbs) → **0.36kg**(0.79lbs), 영상 "규격 HDMI 1.3" 행 추가(매뉴얼 Ver.2.1 4~5쪽 Tx·Rx 사양 표, 출처 M2). 매뉴얼 9쪽 주요 특징의 "HDMI 1.4"는 쓰지 않습니다.
- 검증: 단위 테스트 39/39, validator 29종, package-site, e2e 139/139, `git diff --check` 통과. 화면: `docs/qa/obhd-edid-screens/obhd2-spec-1280.png`(규격 HDMI 1.3 · 크기 128×89×25mm · 무게 0.36kg).
- 되돌리기: 해당 커밋을 `git revert`합니다.
