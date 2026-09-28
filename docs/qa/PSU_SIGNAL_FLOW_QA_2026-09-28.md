# XDM-PSU 03 Signal Flow 장비 그림·연결 애니메이션 QA (0.98.0, 2026-09-28)

## 요청

- 사용자 요청: "XDM-PSU 03 SINGAL 구성에 딥스위치를 이미지화 했던 것처럼 해당 제품을 그렇게 애니메이션 이미지화해서 실제 연결처럼 표현해줘"
- 참고 자료(사용자 제공 캡처 2장)
  - 제조사 MAX2-POE-PSU 연결도: MAX2-20X 프레임의 CIS100·COS100 카드, POE-PSU, CTR100 Tx·Rx와 CAT·2 Pin Power Cable 경로가 나옵니다.
  - HDS-42MU 07 딥 스위치 설정 화면: 평면 그림 방식의 예시입니다.

## 그림 구성 (`src/products.js` `psuDiagram`)

| 위치 | 장비 | 표현 |
|---|---|---|
| 위 | XDM 매트릭스 프레임 | 카드 칸 12개 중 XDM-CIS100(1번 칸)·XDM-COS100(7번 칸)을 파랗게 강조합니다. RJ45 4개씩, COS100에는 2핀 전원 단자가 있습니다 |
| 가운데 | XDM-PSU 후면 | POH 6칸(위 CIS Card·아래 Extender RJ45), PHX 4칸(2핀 +/−), AC 인렛·스위치. 쓰는 칸만 강조합니다 |
| 아래 | XDM-CTR100 Tx·Rx 뒷면 | RJ45·HDMI 2·피닉스 단자, 깜빡이는 상태 LED, "전원 어댑터 불필요" 안내 |
| 양 끝 | 소스 기기·디스플레이 | 기존 모니터 아이콘 |

## 케이블과 흐름 방향 (제품 데이터 overview·io 근거)

| 케이블 | 경로 | 흐름 |
|---|---|---|
| CAT · 신호 | POH CIS Card ↔ XDM-CIS100 | 초록, PSU → CIS100 |
| CAT · 신호+전원 | XDM-CTR100 Tx ↔ POH Extender | 초록 Tx → PSU, 주황 PSU → Tx(역방향) |
| 2핀 전원선 | PHX → XDM-COS100 | 적·흑 두 가닥 위 주황 흐름 |
| CAT · 신호+전원 | XDM-COS100 → XDM-CTR100 Rx | 초록·주황 모두 Rx 방향 |
| HDMI | 소스 → Tx, Rx → 디스플레이 | 파랑(입력)·보라(출력) |

- 흐름은 케이블 위 점선의 `stroke-dashoffset` CSS 애니메이션입니다(`.rt-psu-flow`, 역방향은 `.rt-psu-rev`). CTR100 LED도 깜빡입니다(`.rt-psu-led`).
- `prefers-reduced-motion: reduce`에서는 애니메이션이 멈추고 점선만 남습니다.
- 기존 안내 두 줄(모듈 16칸·수량 규칙·본체 전원, CIS100·COS100 구성에서 CTR100 PSE 불가)과 범례는 그대로 둡니다.
- 기존 테스트가 확인하는 `'XDM-PSU · POH'`·`'XDM-PSU · PHX'`는 PSU 모듈 묶음 이름표로 남겼습니다.

## 검증

- 화면: `docs/qa/psu-flow-screens/psu-flow-1280.png`, `psu-flow-390.png`
  - 휴대폰에서는 다른 Signal Flow 그림처럼 좌우로 밀어서 봅니다(최소 폭 560px). 페이지 가로 스크롤은 0px입니다.
  - 첫 캡처에서 Rx 상태 LED가 RJ45와, 두 번째 HDMI가 피닉스와 겹쳤고, HDMI 선이 안내 글자를 가로질렀습니다. 모두 고친 뒤 다시 찍었습니다.
- `scripts/e2e-smoke.cjs`에 새 검사를 넣었습니다.
  - 흐름 선 8가닥 중 역방향 1가닥이 있는지 확인합니다.
  - 애니메이션 이름이 `rt-psu-dash`인지, 장비 이름표 7개가 모두 있는지 확인합니다.
  - 움직임 줄이기 설정에서 애니메이션이 `none`인지 확인합니다.
- 기본 검증 결과는 PR 설명에 적었습니다.

## 되돌리기

병합 커밋을 revert하면 이전 상자 도식으로 돌아갑니다.

## 0.99.0 추가: COS100 피닉스 전원 연결 정정과 "크게 보기"

- 사용자 확인: "COS카드 쪽만 수정하면 될거 같아 COS PHNIX픽에 전원연결되는거 이거든"(카탈로그 XDM-COS100 사진 첨부)
  - 카드 사양: 피닉스 5핀 암(오디오 추출 및 PoE), `src/card-specs.js` XDM-COS100
  - COS100 그림을 포트 4개마다 RJ45 + 아래 피닉스 5핀으로 바꿨습니다. 이전에는 카드 아래쪽에 따로 2핀 단자를 그렸습니다.
  - PHX 2핀 전원선이 1번 포트 피닉스 단자(`.rt-psu-cos-pin`)에 꽂히게 했습니다. 경로는 빈 8번 칸 위를 지납니다.
  - 전원선과 COS100 → Rx CAT 케이블은 프레임 위에 그려, 카드에 꽂히는 곳이 보이게 했습니다.
  - CIS100 쪽은 사용자 지시대로 그대로 두었습니다.
- 사용자 요청: "xdm-psu만 03 Singal flow 확대해서 볼 수 있게해줘", "이것만 확대 버튼이 만드는건 어때?"
  - XDM-PSU `psuDiagram`에만 "⤢ 크게 보기" 버튼(`data-flow-zoom`)을 넣었습니다. 그림을 눌러도 창이 열립니다.
  - 창(`dialog.rt-flow-zoom`)은 그림을 그대로 복사해 화면 폭에 맞춘 100%에서 시작하고, −/+로 150·200·300%까지 키웁니다. 창 안에서 스크롤하거나 손가락으로 옮겨 봅니다.
  - Esc·×·바깥 누르기로 닫힙니다. 인쇄할 때는 버튼을 숨깁니다.
- 화면: `docs/qa/psu-flow-screens/psu-flow-*.png`(1280·390), `psu-zoom-1280-100/200.png`, `psu-zoom-390-100/200.png`
- e2e 새 검사 확인 사항
  - COS100 피닉스 전원 연결 1곳
  - 창에서 +1번에 150%, 그림이 창보다 넓어짐
  - Esc로 닫힘
  - XDM-CTR100에는 확대 버튼 0개
