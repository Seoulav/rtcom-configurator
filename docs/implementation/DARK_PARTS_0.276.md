# 0.276 다크 모드 ③ 2차: EDID 로터리·딥 스위치·오디오 설정·오토 셀렉팅 그림

## 요청

- 사용자 요청(2026-11-24): "2차 진행해줘". 0.275 보고의 다음 단계 제안 1번입니다.
- 작업 중 사용자 질문: "제품 사진도 다크모드 지원하게 변경하니?" 답: 바꾸지 않습니다(아래 "바꾸지 않은 것").

## 방식(0.275와 같음)

- `src/products.js`의 그림 함수 6개가 바깥 `<svg>`에 `class="rt-pg-dark-svg"`를 붙입니다.
  - `rotaryGraphic`(EDID 로터리)
  - `setButtonGraphic`·`ledGraphic`(HD-13U 오디오 설정 칸)
  - `dipGraphic`(딥 스위치)
  - `autoSelectGraphic`·`autoOutputsGraphic`(오토 셀렉팅)
  - 아이콘 안쪽의 작은 svg는 제외합니다.
- `scripts/tools/dark_tokens.cjs`
  - `PLATES`의 `.rt-pg-rotary svg`·`.rt-pg-dip-state svg`에 `:not(.rt-pg-dark-svg)`를 붙여 흰 판 고정에서 뺐습니다.
  - 0.275 `FLOW_DARK` 바꿈표를 `svg.rt-pg-flow-svg`와 `svg.rt-pg-dark-svg` 두 범위(`DARK_SCOPES`)에 적용합니다.
  - 이 그림들에만 있는 색은 `DARK_PARTS`와 `DIP_BODY_RULE`에 둡니다.
- 규칙은 다크 블록(`@media screen and (prefers-color-scheme:dark)`) 안에만 있습니다. 라이트 화면과 인쇄는 그대로입니다.

## 이 그림들만의 색

| 대상 | 라이트 | 다크 | 이유 |
| --- | --- | --- | --- |
| 딥 스위치 검은 몸체(`.rt-pg-dip-state` 안 `rect` `#2c2c2e`) | `#2C2C2E` | `#48484A` | 짙은 카드(`#1C1C1E`)와 같은 색이 되어 윤곽이 사라짐. 오토 셀렉팅 장비 그림의 같은 색은 그대로 |
| 오토 셀렉팅 빨간 × | `#D70015` | `#FF6961` | 어두운 바탕에서 묻힘 |
| 오토 셀렉팅 회색 이름표(HDMI IN 등) | `#6A6A6F` | `#AEAEB2` | 짙은 판 위 대비 부족 |
| EDID 로터리 가운데 손잡이 | `#E9F2FF` | 그대로 | 실물 손잡이처럼 밝게 두어 바늘이 잘 보이게 함 |

0.275 표에서 그대로 적용되는 색도 있습니다. 로터리 번호(`#8a8a8e` → `#AEAEB2`), 흰 칸(`#fff` → `#3A3A3C`), 본문 글자(`#1c1c1e` → `#F5F5F7`)입니다.

## 바꾸지 않은 것: 제품 실물 사진

- Port Map·사진 확대 팝업·제품 머리의 실물 사진은 흰 배경이 사진 안에 함께 찍혀 있습니다. 그래서 다크에서도 밝은 받침(`--rt-photo`)을 유지합니다(0.178·0.238 결정).
- 사진을 어둡게 하거나 색을 뒤집으면 은색·검은색 몸체와 실크 글자 색이 실제와 달라집니다.
- 받침을 조금 어둡게 하는 정도의 조정은 사용자 결정이 있으면 별도로 합니다.

## 검증

- 다크 화면 확인(1280px)
  - HDS-42MU: EDID·딥 스위치·오토 셀렉팅
  - HD-13U: 오디오 설정
  - XDM-CTR100: 딥 스위치
  - OBUX-1C: Tx Mode 딥 스위치
- 자동 대비 검사(다크, 33종, `svg.rt-pg-dark-svg`): 어두운 글자 0건. 밝은 면은 로터리 손잡이(의도)만 남음. Signal Flow(0.275) 검사도 0건 유지
- 시험
  - `tests/dark-mode.test.cjs` "0.276 다크 모드 ③ 2차…"
  - `scripts/e2e-smoke.cjs` "다크 모드에서 HDS-42MU EDID 로터리·딥 스위치 그림은 흰 판 없음…"(다크·라이트 전환)
- 기본 검증
  - 단위 시험 220개, `build-product-index --check` 33개, `e2e-smoke` 315/315
  - 그 밖에 `dark_tokens --check`, `unify_notation`, `check-version`, `git diff --check`(PR에 기록)

## 남은 일(3차)

- 06 화면 구성 모드(`rt-pg-layout-matrix` 등)
- 시리즈 02 신호 구성
- WOS100 레이어 팝업(`rt-layer-svg-*`)
- 구성기 그림(`src/app.js`)

## 되돌리기

- 이 PR의 squash 커밋을 `git revert`합니다.
- 그림 클래스만 되돌리려면 `src/products.js`의 `class="rt-pg-dark-svg"` 6곳을 지우고 `dark_tokens.cjs`의 `PLATES` `:not(.rt-pg-dark-svg)`를 지운 뒤 `--apply`합니다(0.275 모습).
