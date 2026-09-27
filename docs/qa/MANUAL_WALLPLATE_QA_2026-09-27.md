# 벽부형 3종 매뉴얼 반영 QA (0.45.0, 2026-09-27)

사용자가 매뉴얼 3권을 올려 주었습니다. 앞서 "해석이 안 되는 제품" 1순위로 알린 3종을 이 매뉴얼로 보완했습니다.

| 매뉴얼 | 대상 제품 | 보관 위치(Git 제외, 배포 제외) |
|---|---|---|
| XDM-CT103 사용자 매뉴얼 Ver.1.4 | XDM-CT103 / XDM-CR103 | `.source-materials/RTcom_Manual_XDM-CT103_Ver1.4.pdf` |
| CT-103-U / CR-103-U 사용자 매뉴얼 KV01 | CT103-U-H / CR103-U | `.source-materials/RTcom_Manual_CT-CR-103-U_KV01.pdf` |
| FT-103-U-H / FR-103-U 사용자 매뉴얼 Ver.1.4 | FT103-U-H / FR103-U | `.source-materials/RTcom_Manual_FT-FR-103-U-H_Ver1.4.pdf` |

사용자 메모: "ctr100 pse랑 사용하면 전원연결안해되". 이 내용을 XDM-CT103 전원 행과 단자 지도 DC IN 설명에 반영했습니다(출처 U).

## 1. 사진

PDF에 들어 있는 원본 제품 사진을 꺼냈습니다. 매뉴얼의 번호 화살표는 PDF 위에 따로 그려진 벡터라서 사진에는 들어 있지 않습니다. 투명 배경은 흰색으로 채우고 WebP로 저장했습니다.

| 파일 | 크기 | 내용 |
|---|---|---|
| `xdm-ct103-manual.webp` | 458×483 | XDM-CT103 앞면(왼쪽)과 뒷면(오른쪽)을 한 장으로 붙임(매뉴얼 5쪽) |
| `ft103-u-h-manual-tx.webp` | 669×682 | FT-103-U-H 앞면(매뉴얼 6쪽) |
| `ft103-u-h-manual-rx.webp` | 386×375 | FR-103-U 앞면(매뉴얼 7쪽) |
| `cr103-u-manual.webp` | 483×475 | CR-103-U 앞면(매뉴얼 표지) |

CT103-U-H 송신기는 매뉴얼에 사진이 없습니다(매뉴얼은 VGA형 CT-103-U). 그래서 카탈로그 사진을 그대로 썼습니다.

## 2. 데이터 변경

### XDM-CT103 / XDM-CR103

- 단자 지도: 송신기 앞면·뒷면 6개(Signal·Link LED, AUDIO IN, Mode 딥 스위치, HDMI IN, HDBaseT OUT, DC IN)
- 사양 추가
  - 입력 신호 HDMI 1·3-pin Stereo 1, 출력 신호 HDBaseT 1
  - 전원(어댑터) DC +12V 1A 이상. XDM-CIS100 카드나 XDM-CTR100 PSE와 연결하면 PoE로 받아 연결하지 않습니다.
  - Long Reach 모드 1080p 최대 150m
  - 딥 스위치 1(오디오 병합)·2(Long Reach) 행
- 무게: 0.34kg → **0.45kg**. 매뉴얼은 1lbs(0.45Kg)이고, 카탈로그의 0.34kg은 1.0lb 표기와 환산이 맞지 않았습니다.
- 주요 기능 3줄 추가: 연결 상대, 오디오 병합, Long Reach
- XDM-CR103: 사용자 확인("cr103도 동일")으로 전원(어댑터) DC +12V 1A 이상 행과, XDM-COS100 카드·XDM-CTR100 PSE와 연결하면 전원을 연결하지 않는다는 기능 문구를 추가했습니다(출처 U). 딥 스위치·Long Reach는 CR103 판넬에 있는지 확인되지 않아 넣지 않았고, 오디오 방향은 J 판단(출력) 그대로입니다.

### CT103-U-H / CR103-U

- **HDMI 입력 2개**: 카탈로그 사진의 HDMI 단자 2개와 INPUT 버튼 배치가, 같은 -U-H 벽부형인 FT-103-U-H 매뉴얼 6쪽의 HDMI1·HDMI2·INPUT 배치와 같습니다. 그래서 두 번째 단자를 HDMI 입력 2로 판단했습니다(출처 J, 근거 M2).
- **CT103-U-H 해상도**: 1080p → **최대 4K 4096x2160@24/25/30Hz**. 짝 수신기 CR-103-U 매뉴얼과 FT-103-U-H 매뉴얼이 모두 4K 24/25/30Hz이고, 카탈로그 거리 표에도 Ultra HD 4K가 있습니다(출처 J).
- CR103-U 출력 신호에 3.5mm 오디오를 추가하고, 입출력 표에 오디오 출력 행을 넣었습니다(매뉴얼 4쪽). 앞면 사진에는 이 단자가 보이지 않아, 단자 지도 안내 줄에 적었습니다.
- 단자 지도: 송신기 6개(HDMI IN 1·2, INPUT 버튼, POWER·ST LED, AUDIO IN, RS-232), 수신기 3개(HDMI OUT, POWER·ST LED, RS-232)

### FT103-U-H / FR103-U

- 입력 HDMI 2 Ports, 출력 HDMI 1 + 3.5mm 1(매뉴얼 4·5쪽)
- 해상도: 1080p → **최대 Ultra 4K 4096x2160p 24/25/30Hz**. 싱글모드 2km·멀티모드 500m 모두 4K 30Hz입니다(매뉴얼 11쪽).
- 광 커넥터 **2LC**를 사양·입출력 표에 적었습니다.
- EDID 설정 카드(06): MODE 로터리 코드표 0~F, 외부 EDID 저장 절차, 외부 오디오 병합 절차(매뉴얼 6·10·11쪽)
- 단자 지도: 송신기 8개(HDMI IN 1·2, INPUT, SET, MODE, POWER·ST, AUDIO IN, RS-232), 수신기 4개(HDMI OUT, POWER, AUDIO OUT, RS-232). DC IN과 FIBER 단자는 옆면이라 안내 줄로 적었습니다.
- FR-103-U 매뉴얼 7쪽 앞면 설명은 AUDIO를 "입력 포트"라고 적었지만, 9·10쪽은 수신기 3.5mm를 출력(추출)으로 설명합니다. 그래서 출력으로 판단했습니다.
- 소개문(english, korean, lead, overview)의 "WUXGA/1080p까지" 문구를 4K 30Hz로 고쳤습니다.

## 3. 코드 변경

- `portMap.items[].side`에 `left`·`right`(세로 괄호, `y1`·`y2`, 선택 `x`)를 추가했습니다. 단자가 세로로 쌓인 벽부형 판넬용입니다.
- `portMap.displayWidth`: 이 폭에 맞춰 그리므로, 세로로 긴 사진을 작게 보여도 번호표 글씨 크기가 유지됩니다.
- `portMap.note`: 사진에 보이지 않는 옆면·뒷면 단자를 한 줄로 안내합니다. 위치를 추측해 괄호를 그리지 않습니다.
- `edidSwitch.image`에 Main·Other·Perspective도 허용했습니다(단자 지도와 같은 규칙).
- validator가 위 항목을 모두 검사합니다. e2e에 FT103-U-H 벽부형 단자 지도 검사를 추가했습니다(두 장, 번호표 12개, 옆면 안내).

## 4. 검증

- `node --test tests/*.test.cjs`: 37/37
- `node scripts/build-product-index.cjs --check`: 27개 통과
- `node scripts/package-site.cjs`: 통과
- `node scripts/e2e-smoke.cjs`: 84/84
- `git diff --check`: 통과
- 1280px 캡처로 번호표가 단자를 가리키는지 확인했습니다. 390px에서는 세 제품 모두 페이지 가로 넘침이 없습니다. 사진 영역은 기존 단자 지도처럼 가로 스크롤입니다.

## 5. 남은 항목

- XDM-CR103 판넬(딥 스위치 유무), CT103-U-H(-H 전용 매뉴얼): 매뉴얼이 없습니다.
- OBUX-1C·OBHD-2C 조작부, XDM-CTR100 LED·HDMI IN/OUT 역할, 3순위 수치(VDM-80X 무게 등): 변동 없음

## 6. 되돌리는 방법

이 커밋을 revert하면 3종이 0.44 상태(입출력 표 카드, 1080p 판단)로 돌아갑니다. 새 사진 4장은 참조가 없어져도 화면에 영향이 없습니다.
