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
