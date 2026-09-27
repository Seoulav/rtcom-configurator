# 분배기 4종 단자 지도 정면 번호 QA (0.66.0, 2026-09-27)

## 1. 요청

- "3분배기 로터리 번호 표기 누락"(휴대폰 화면: HD-13U 02 Port Map "정면" 사진에 번호가 없음).

## 2. 원인

- HD-13U·HD-104U·HD-108U·HD-210U의 `portMap`은 후면(Rear) 사진 한 장에만 번호를 붙였습니다. 0.55 규칙(2U 미만은 정면 사진과 포트 연결면을 함께)에 따라 정면 사진은 번호 없이 따로 보였고, 06 EDID 설정·07 카드에서 설명하는 정면 로터리·버튼·딥 스위치에는 번호가 없었습니다.
- HDS-21U·HDS-42MU는 0.56부터 앞면·뒷면 합성 사진 한 장에 번호를 이어 붙이고 있어 분배기와 표현이 달랐습니다.

## 3. 바꾼 것

| 제품 | 합성 사진(Other) | 번호 |
|---|---|---|
| HD-13U | `hd-13u-front-rear.webp` 718×445 | 1 HDMI IN · 2 HDMI OUT 1–3 · 3 AUDIO IN · 4 AUDIO OUT · **5 MODE 로터리 · 6 SET** · 7 DC 5V |
| HD-104U | `hd-104u-front-rear.webp` 693×413 | 1 HDMI IN · 2 HDMI OUT 1–4 · **3 EDID 로터리** · 4 DC 5V |
| HD-108U | `hd-108u-front-rear.webp` 1016×394 | 1 HDMI IN · 2 HDMI OUT 1–8 · **3 EDID 로터리** · 4 DC 12V |
| HD-210U | `hd-210u-front-rear.webp` 1012×390 | 1 HDMI IN 1·2 · 2 HDMI OUT 1–10 · 3 AUDIO IN · **4 EDID 로터리 · 5 MODE 딥 스위치** · 6 DC 12V |

- 합성 방법: 기존 Front 사진을 위(y=0), 흰 여백 80px, 기존 Rear 사진을 아래에 붙였습니다(HDS와 같음). 후면 번호 괄호는 뒷면 사진 윗변(y=앞면 높이+80), 정면 번호 괄호는 앞면 윗변(y=0)에 둡니다.
- 번호 순서는 0.47 규칙(HDMI 입력 → 출력 → 오디오 → 설정 스위치 → 전원 마지막)을 따릅니다. 기존 Front·Rear 사진과 06 EDID 설정 카드(Front 사진 기준 좌표)는 그대로입니다.
- 정면 좌표(원본 px): HD-13U MODE 179~219·SET 326~350, HD-104U EDID 495~535, HD-108U EDID 783~817, HD-210U EDID 772~803·MODE 889~918. HD-104U·HD-108U 정면에는 SET 버튼이 보이지 않아 넣지 않았고, HD-210U 정면 "set" 버튼은 매뉴얼 설명이 확인되지 않아 넣지 않았습니다.
- e2e: 분배기 4종 합성 사진 번호 수·정면 항목·전원 마지막 검사 추가. 0.55 "2U 미만 정면 사진 함께" 검사 대상은 XDM-FT101/FR101로 옮겼습니다.

## 4. 검증

- 단위 테스트 39/39, validator 29종 통과, package-site 통과, e2e 131/131 통과(HD-13U 단자 번호 순서 기대값에 5 MODE·6 SET 반영), `git diff --check` 통과.
- 화면: `docs/qa/distributor-portmap-screens/`(1280px 4종, 390px HD-13U, 가로 넘침 없음).

## 5. 후속 후보

- XDM-FT101/FR101·MR-4S·QMS-44UX·QMS-88UX도 정면 사진이 번호 없이 따로 보입니다. FT101은 정면 MODE 로터리가 있어 같은 방식으로 바꿀 수 있습니다(사용자 확인 후).

## 6. 되돌리기

해당 커밋을 `git revert`합니다(합성 사진 4장, `portMap`, `images` Other가 함께 빠짐).
