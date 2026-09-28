# XDM-PSU 머리 아이콘·02 Port Map 앞면/뒷면 그림 QA (0.105.0, 2026-09-28)

## 요청

- "XDM-PSU 이부분에 ㅁ-ㅁ 모양을 뭔가 POWER SUPPLY형상이 없어서 이거 수정가능해?" (제품 상세 제목 옆 아이콘 캡처)
- "02 PORTMAP을 앞면 뒤면을 아래 시그널 플로우 그대로 사용 및 계승해서 앞면 뒷면 만들어줘"

## 변경

| 부분 | 이전 | 이후 |
|---|---|---|
| 제목 옆 아이콘 | 전송기 그룹 공통 아이콘(두 상자와 선, ㅁ-ㅁ) | XDM-PSU 전용 전원 아이콘(랙 본체 위 번개). `src/products.js` `PRODUCT_ICON`, 다른 제품은 그대로 |
| 02 Port Map 앞면 | 제조사 선 도면(979×185) | 평면 그림 `xdm-psu-front-art.webp`(1400×300): 2U 본체·랙 귀, Digital Extender 로고, XDM 표시, 채널 LED 1~16, 모델명·설명 |
| 02 Port Map 뒷면 | 제조사 선 도면(993×208) | 평면 그림 `xdm-psu-rear-art.webp`(1400×300): POH 8칸(CIS Card·Extender RJ45), PHX 8칸(2핀 +/−), AC 입력(인렛·퓨즈·I/O 스위치) |
| 번호 좌표 | 1: 33~440, 2: 448~865, 3: 893~977 | 1: 43~597, 2: 603~1157, 3: 1210~1330 |
| 제목 옆 문구 | "실제 제품 사진 기준" | "제조사 도면 기준 그림"(`portMap.basis`) |
| 제품 목록 카드 | 선 도면 | 새 앞면 그림 |

- 색과 부품 모양은 03 Signal Flow(`psuDiagram`)와 같습니다: 회색 금속 몸체 `#eceff4`, RJ45, 초록 피닉스, AC 인렛.
- 배치는 제조사 도면(XDM-POE ASSY FRONT·REAR)을 따랐습니다.
- 제조사 원래 도면 두 장(`xdm-psu-front.webp`·`xdm-psu-rear.webp`)은 `Other` 역할로 사진 목록에 남겼습니다.
- 그림 생성 스크립트는 `scripts/tools/draw_xdm_psu_panels.cjs`입니다. Playwright로 SVG를 찍은 뒤 PIL로 WebP 품질 92로 저장합니다.
- 검증 규칙에 `portMap.basis`(비어 있지 않은 문자열)를 더했습니다.

## 검증

- 화면: `docs/qa/psu-panel-screens/`
  - `header-*`, `portmap-rear-*`, `portmap-front-*`, `list-card-*`(1280·390px)
  - 가로 스크롤은 0px입니다. 정면·후면 버튼이 동작하고, 번호 1~3이 모듈 묶음과 AC 입력을 가리킵니다.
- e2e 새 검사: 전원 아이콘, 앞면·뒷면 새 그림, 번호 3개, "제조사 도면 기준 그림"
- 기본 검증 결과는 PR 설명에 적었습니다.

## 되돌리기

병합 커밋을 revert하면 ㅁ-ㅁ 아이콘과 제조사 선 도면으로 돌아갑니다.
