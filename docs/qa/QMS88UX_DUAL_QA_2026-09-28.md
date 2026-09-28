# QMS-88UX 06 화면 구성 모드 DUAL 카드 보완 QA (0.90.0, 2026-09-28)

## 요청

사용자 질문(2026-09-28, QMS-88UX 06 화면 구성 모드 휴대폰 캡처와 함께): "QMS-88Ux도 듀얼 출력되지 않아??"

## 확인한 문제

- QMS-88UX 06 화면 구성 모드의 DUAL 카드는 "듀얼 모드" 한 마디뿐이었습니다. 레이아웃·방법 설명이 없었습니다.
- QMS-44UX DUAL 카드에는 출력 쌍(1·2, 3·4)별 레이아웃 4종(PBP·PBP-Full·PIP·User Mode)이 있습니다.

## 매뉴얼 근거 (QMS-88UX 사용자 매뉴얼 KV.04, 공개 PDF `output/design/assets/docs/qms-88ux-manual.pdf`)

| 쪽 | 내용 |
|---|---|
| 5 | 주요 기능: "4가지 다양한 모드 지원 – 매트릭스, 최대 3x3 비디오 월, 쿼드 뷰, 듀얼 모드" |
| 9 | 1-4 주요 특징: "Seamless Switching, 최대 3x3 Video Wall, 8CH Quad 그리고 Dual 모드 기능" |
| 10 | 터치 패널 메뉴는 System Info·Create·Preset·I/O Config·EDID·Wall Mode·Multiview·Subtitle·Function입니다. 별도 Dual 메뉴는 없습니다 |
| 20 | "7) Multi view – 입력 Q1, Q2 Layer 및 출력 M1(9), M2(10) Multi-view 모드 설정 · 이 섹션에서는 출력 포트에서 8CH 멀티 뷰 및 듀얼 디스플레이 설정을 할 수 있습니다" |
| 21 | Layout 5) Horizontal PBP(좌우 2분할), 6) Vertical PBP(위아래 2분할), 7) Quad PBP, PIP(좌우 2분할 + 각 PIP) 도해 |

판단: QMS-88UX의 듀얼 화면은 출력 9·10번 Multiview 설정에서 2분할 레이아웃을 골라 만듭니다. QMS-44UX처럼 출력 쌍마다 여는 별도 메뉴는 없습니다. 2분할 레이아웃은 Layout 5~7입니다.

## 변경

- `data/products/qms-88ux.json` `videoModes.modes[DUAL]`
  - summary: "출력 9·10번 멀티뷰 설정에서 한 화면 2분할(PBP)·PIP 구성."
  - detail: "별도 듀얼 메뉴 없이 8CH 멀티뷰와 같은 Multiview 설정에서 2분할 레이아웃을 골라 입력 그룹(Q1·Q2)마다 구성(매뉴얼 KV.04 20~21쪽 Layout 5~7)."
  - layouts: Horizontal PBP · Vertical PBP · Quad PBP, PIP. 도해는 기존 `LAYOUT_SHAPES`(매뉴얼 21쪽을 옮긴 것)를 그대로 씁니다.
- `scripts/e2e-smoke.cjs`
  - DUAL 카드 검사를 추가했습니다: 칩 3종, Vertical PBP를 누르면 2칸 도해로 바뀜, QUAD 카드 미리보기는 그대로임.
  - 기존 QUAD 미리보기 검사 2개는 화면 전체가 아니라 첫 미리보기(QUAD 카드)의 칸만 세도록 고쳤습니다. DUAL 카드에도 미리보기가 생겨 전체 칸 수가 늘었기 때문입니다.

## 검증

- `node --test tests/*.test.cjs`: 43/43
- `node scripts/build-product-index.cjs --check`: 30개 통과
- `node scripts/package-site.cjs`: 통과
- `node scripts/e2e-smoke.cjs`: 148/148
- `git diff --check`: 통과
- 화면: `docs/qa/qms88ux-dual-screens/dual-1280.png`, `dual-390.png`. 두 폭 모두 카드 밖으로 넘치는 부분이 0px입니다.

## 되돌리기

이 PR의 병합 커밋을 revert하면 DUAL 카드가 "듀얼 모드" 한 마디로 돌아갑니다.
