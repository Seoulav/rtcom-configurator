# 매트릭스 구성기 Analog Way 글래스 개편 — QA (0.37.0)

캡처: `docs/qa/configurator-aw-glass-screens/before/`(작업 전, 커밋 `6ace38d` 기준) · `docs/qa/configurator-aw-glass-screens/after/`(작업 후). 1280px·390px 두 폭.

## 1. 단계별 전후 비교

| 단계 | 1280px 전 | 1280px 후 | 390px 전 | 390px 후 |
|---|---|---|---|---|
| 01 제품군 | `before/01-family-1280.png` | `after/01-family-1280.png` | `before/01-family-390.png` | `after/01-family-390.png` |
| 02 섀시 | `before/02-chassis-1280.png` | `after/02-chassis-1280.png` | `before/02-chassis-390.png` | `after/02-chassis-390.png` |
| 03 카드 슬롯(XDM-36, 빈) | `before/03-cards-xdm36-1280.png` | `after/03-cards-xdm36-1280.png` | `before/03-cards-xdm36-390.png` | `after/03-cards-xdm36-390.png` |
| 03 카드 슬롯(XDM-36, 부분 장착) | `before/03-cards-xdm36-partial-1280.png` | `after/03-cards-xdm36-partial-1280.png` | `before/03-cards-xdm36-partial-390.png` | `after/03-cards-xdm36-partial-390.png` |
| 03 카드 슬롯(XDM-144) | `before/03-cards-xdm144-1280.png` | `after/03-cards-xdm144-1280.png` | `before/03-cards-xdm144-390.png` | `after/03-cards-xdm144-390.png` |
| 03 카드 슬롯(SPX-M3236) | `before/03-cards-spx-m3236-1280.png` | `after/03-cards-spx-m3236-1280.png` | `before/03-cards-spx-m3236-390.png` | `after/03-cards-spx-m3236-390.png` |
| 03 카드 슬롯(VDM-16X) | `before/03-cards-vdm16x-1280.png` | `after/03-cards-vdm16x-1280.png` | `before/03-cards-vdm16x-390.png` | `after/03-cards-vdm16x-390.png` |
| 04 전송기 | `before/04-extenders-1280.png` | `after/04-extenders-1280.png` | `before/04-extenders-390.png` | `after/04-extenders-390.png` |
| 05 구성 검토 | `before/05-review-1280.png` | `after/05-review-1280.png` | `before/05-review-390.png` | `after/05-review-390.png` |
| 06 내보내기 | `before/06-export-1280.png` | `after/06-export-1280.png` | `before/06-export-390.png` | `after/06-export-390.png` |

**바뀐 점(after 캡처로 확인)**: 단계 탭이 밑줄형(완료 ✓ + 파란 밑줄, 현재 파란 원)으로 바뀌었고, 01·02는 왼쪽 목록 + 오른쪽 고정 미리보기 구조가 됐습니다. 03은 빈 슬롯이 흰 배경(회색 테두리)이고, 카드를 넣지 않은 슬롯에 더 이상 블랭크 그림이 자동으로 씌워지지 않습니다(전: 전부 어두운 블랭크 그림 / 후: 전부 흰 빈칸). 범례·채우기 줄·완성도 막대가 새로 생겼습니다. 옛 큰 제목 블록("DESIGN TOOL · MATRIX")이 사라지고 머리 막대에 흡수됐습니다.

## 2. 390px 가로 스크롤 · 콘솔 오류

`node scripts/e2e-smoke.cjs` 결과(72/72)에 다음 확인이 포함됩니다:
- `390px 화면에서 페이지 가로 넘침 없음` — PASS (`document.documentElement.scrollWidth - innerWidth === 0`)
- `자바스크립트 오류 없음`(`pageerror` 기준) — PASS, 0건
- 참고: 스크린샷 스크립트(`/tmp/shot.js`, 저장소에는 없음)로 콘솔 `error` 레벨 메시지까지 넓게 잡아보면 1280px 세션 전체에서 `/favicon.ico` 404(브라우저 기본 동작) 1건이 찍히는데, **작업 전(before) 캡처에서도 동일하게 발생**해 이번 작업과 무관한 것으로 확인했습니다(`docs/qa/configurator-aw-glass-screens/{before,after}/_meta.json` 대조).

## 3. 0.14–0.18 모바일 버그 재확인

`docs/qa/MOBILE_BACK_AND_SLOTS_QA.md` 항목과 대조해 `scripts/e2e-smoke.cjs`의 다음 검사로 재확인했습니다(전부 PASS, 72/72 안에 포함):

| 버그(버전) | 재확인 검사 | 결과 |
|---|---|---|
| 슬롯 겹침(0.14) | `터치 휴대폰에서 SPX-M3236 입력 슬롯 4개가 겹치지 않고 사진이 화면 폭 안에 들어감` | PASS |
| 뒤로가기 동작(0.14) | `뒤로가기·앞으로가기로 이전·다음 단계를 오가며 주소는 바뀌지 않음` | PASS |
| VDM 전면 도면 슬롯 겹침(0.15) | VDM-16X·VDM-256X 03단계 슬롯 렌더 검사(겹침 없이 카드 장착) | PASS |
| 사진 슬롯 판넬 잘림(0.16) | `터치 휴대폰에서 세로 슬롯에 장착한 판넬이 슬롯을 꽉 채움(좌우 끝 잘림 없음)` | PASS |
| 장착 슬롯 번호표 숨김(0.17) | `장착한 카드 판넬 위의 슬롯 번호표는 숨겨져 첫 포트를 가리지 않음(빈 슬롯 번호표는 표시)` — 이번에 "블랭크"에서 "빈 슬롯"으로 대상을 바꿨을 뿐 동일한 opacity 규칙을 재확인 | PASS |
| XDM 판넬 손나사 잘림(0.18) | 이번 작업은 `output/design/assets/cards/*.webp` 이미지 파일을 전혀 건드리지 않았습니다(`git status`로 확인). 크롭은 자산 파일 자체의 문제였고 자산을 바꾸지 않았으므로 회귀 없음 | 해당 없음(자산 미변경으로 안전) |

## 4. 제품정보 화면(#products) 비교 — 건드리지 않았음을 확인

`before/products-hd-210u-*.png` vs `after/products-hd-210u-*.png`, `before/products-xdm-*.png` vs `after/products-xdm-*.png`를 픽셀 단위로 비교했습니다(Pillow로 같은 크기의 두 PNG를 픽셀별로 대조).

| 캡처 | 크기 일치 | 다른 픽셀 비율 |
|---|---|---|
| products-hd-210u-1280 | 예 | 0.146% |
| products-hd-210u-390 | 예 | 0.034% |
| products-xdm-1280 | 예 | 0.230% |
| products-xdm-390 | 예 | 0.031% |

다른 픽셀은 전부 머리 막대의 버전 표기 한 줄(`CATALOG BASED · 0.36` → `0.37`, 두 페이지에서 정확히 같은 픽셀 수 5097/550이 다름)에서 나왔습니다 — 제품정보 화면 자체(`.rt-products-view` 안쪽)는 이번 작업으로 바뀌지 않았습니다. `src/products.js`는 이번 세션에서 전혀 수정하지 않았습니다(`git status` 확인).

## 5. 새 e2e 시나리오(§5 요구)

- 흰 빈칸 → 팝업에서 BLANK 선택 → 저장·새로고침 복원: `팝업에서 블랭크 커버를 고르면 그 슬롯만 블랭크 판넬로 바뀜` + `블랭크 선택은 새로고침 후에도 복원됨`
- "남은 칸 블랭크로 채우기" → 완성 배너 → 실행 취소 시 되돌아감: `"남은 칸 블랭크로 채우기"는 빈 슬롯만 블랭크로 바꾸고 이미 넣은 카드는 그대로 둠` + `모든 슬롯을 채우면 완성 배너와 "선택 완료" 다음 버튼이 표시됨` + `실행 취소 1번으로 "채우기"가 통째로 되돌아감`
- 제품군 변경 시 초기화: `제품군을 바꾸면 카드·전송기 선택이 초기화됨`
- XDM-36·XDM-144·SPX-M3236·VDM-16X 03단계 캡처(1280·390): 위 1절 표에 모두 포함

## 6. 결과 요약

- `node --test tests/*.test.cjs`: 37/37
- `node scripts/build-product-index.cjs --check`: 27개
- `node scripts/package-site.cjs`: 통과
- `node scripts/e2e-smoke.cjs`: **72/72**(기존 61 + 신규 11)
- `git diff --check`: 통과(공백 오류 없음)

## Opus 검수 (2026-09-27, 0.37.0 반영 직후)

| 항목 | 결과 |
|---|---|
| `node --test` | 37/37 통과 |
| `build-product-index --check` | 27종 통과 |
| e2e(전역 playwright) | 73/73 통과(0.36 HD-104U 옛 주소 검사 포함, 병합 후 재실행) |
| `git diff --check` | 통과 |
| 단계 탭 | 실제 화면(1280·390px)은 밑줄형으로 정상입니다. `after/02·03·04·01-390` 캡처에 보이는 현재 단계의 파란 덩어리는 화면이 바뀌는 도중(전환 효과)에 찍힌 것입니다. 기능 문제는 아닙니다. |
| 주황 제거 | `src/`에 `#f4a46b`·`#bd591d`가 주석 말고는 남아 있지 않음을 확인했습니다. 원인이던 `applyDesign()` 제거도 확인했습니다. |
| 블랭크 커버 | XDM-12에서 카드 1장 + "남은 칸 블랭크로 채우기"를 누른 뒤 새로고침하면 블랭크 5개가 그대로 복원됩니다. 저장값에는 `"BLANK"`가 들어 있습니다. |
| 인쇄 보고서 | **수정**: 슬롯 표에 블랭크 슬롯이 빠져 있었습니다(BOM에는 수량만 표시). 이제 "블랭크 커버 · 0채널" 행으로 표시합니다. |
| 04 전송기 편차 | 승인 시안(왼쪽 목록 + 오른쪽 연결 흐름)과 다르게 기존 카드별 구조를 유지했습니다. 사용자 결정이 필요하므로 보고서에 선택지를 적었습니다. |
| 강조색 | 구성기의 주요 버튼·단계 탭은 기존 브랜드 파랑 `#3978ee`(주요 버튼은 파랑→보라 그라디언트)입니다. 제품정보 화면의 `#007AFF`와 약간 다르며, 통일 여부는 후속으로 남깁니다. |

## 7. 0.38.0 — 04 전송기 좌우 분할(편차 해소)

0.37.0 Opus 검수(위 6번 표 "04 전송기 편차")가 남긴 유일한 시안 편차를 사용자가 검토하고 "시안대로 만들어 달라"고 확정해, `linksViewV3()`(카드별 섹션 + 인라인 선택 행)를 01·02와 같은 `.rt-cg-split`/`.rt-cg-row`/`.rt-cg-preview` 틀을 쓰는 `linksViewV4()`로 다시 지었습니다.

### 7-1. 캡처 — 시안 대조

캡처: `docs/qa/configurator-aw-glass-screens/0.38-step04-links/`. 1280px·390px, 3가지 구성. 정지 상태를 보장하기 위해 각 캡처 전에 `waitForLoadState('networkidle')` → `document.getAnimations().every(a=>a.playState!=='running')`(진행 중인 CSS 트랜지션·애니메이션이 없을 때까지 대기, 추측성 `sleep` 대신 실제 애니메이션 상태를 확인) → 모든 `<img>`의 `complete` 대기 순서로 안정화했습니다.

| 구성 | 1280px | 390px | 시안 참고 |
|---|---|---|---|
| XDM-36 · IN2 CIS100 + OUT2 COS100 + IN1 HDMI(CTR100 PSE 연장) | `0.38-step04-links/xdm-cis100-cos100-hdmi-1280.png` | `0.38-step04-links/xdm-cis100-cos100-hdmi-390.png` | `docs/mockups/configurator-aw-4links.png` |
| SPX-M3236 · OUT1 COS12(SPX-RX 자동 연결) | `0.38-step04-links/spx-cos12-1280.png` | `0.38-step04-links/spx-cos12-390.png` | `docs/mockups/configurator-aw-style.html?step=4` |
| VDM-16X · IN2 CIS4-U + OUT1 FOS4-U(CT104-U·FR101-U 자동 연결) | `0.38-step04-links/vdm-cis4u-fos4u-1280.png` | `0.38-step04-links/vdm-cis4u-fos4u-390.png` | `docs/mockups/configurator-aw-style.html?step=4` |

**시안과 대조한 결과**: 왼쪽 묶음 제목("IN 2 · XDM-CIS100 · 입력 4채널")·선택 행(이름+부제/스펙 2줄/상태 점)·오른쪽 세그먼트("IN 2 | OUT 2 | IN 1 (HDMI)")·연결 흐름(소스 → 전송기 사진 → 케이블·거리 → 카드 사진)이 시안과 같은 모양으로 나옵니다. 라인업은 판 아래 펼쳐진 `<details open>`으로 옮겨졌고 사진이 정상 로드됩니다. 390px에서는 미리보기가 위, 목록이 아래로 쌓이고 가로 스크롤이 생기지 않습니다.

### 7-2. 명세 대비 판단(편차 — 시안 픽셀보다 명세 문장을 따른 지점)

| 항목 | 시안(픽셀) | 이번 구현 | 판단 근거 |
|---|---|---|---|
| 채널 수 선택 컨트롤 위치 | 시안 PNG에는 묶음 제목 줄에 `<select>`가 보이지 않음 | 묶음 제목 오른쪽에 `연결 채널` `<select data-link="count">`를 그대로 둠 | 명세 본문(`CONFIGURATOR_AW_GLASS_SPEC.md` 2-2 "04 전송기")이 "선택 행 + 연결 채널 수 선택"을 명시적으로 요구함 — 명세 문장이 시안 픽셀보다 우선 |
| 전원 안내(`powerNotice`) 위치 | 명세는 "흐름 아래에 채널 N/M과 전원 안내를 둔다"고 서술 | 채널 수(`채널 N/M 연결`)는 미리보기 안에 두고, 전원 안내는 판 전체 아래 한 번만 유지 | `powerNotice()`는 링크 전체 합산값(예: "XDM-CTR100 8대에 전원 직접 연결")이라 세그먼트를 바꿀 때마다 슬롯 미리보기 안에 반복해서 보여주면 같은 문장이 계속 다시 나와 어색함. 명세도 "먼저 시도하고, 어색하면 근거를 남기고 벗어나도 된다"고 허용해 이 쪽을 택함 |
| "HDBaseT·광 카드가 없습니다" 안내 범위 | 명세는 04 전체의 빈 상태만 언급 | `remote.length===0`일 때만 뜨고, HDMI 카드 연장 묶음은 있으면 별도로 계속 표시 | 과제 지시가 "empty state"를 "no CAT/FIBER cards" 조건으로 좁혀 정의했고, 0.37.0 이전에도 두 안내가 함께 있을 수 있었던 동작을 그대로 유지하는 쪽이 더 안전하다고 판단 |
| 오른쪽 세그먼트 위치(모바일) | 01/02는 `.rt-cg-seg`를 이미지 위에 절대 위치로 겹침 | 04는 세그먼트를 일반 흐름 안에 두고 여러 개면 줄바꿈(`.rt-cg-seg-link{position:static}`) | 01/02는 세그먼트가 항상 2개뿐이라 구석에 겹쳐도 되지만, 04는 카드 수만큼(원격 + HDMI 연장) 늘어날 수 있어 절대 위치로 겹치면 820px 이하에서 `.rt-cg-preview{max-height:260px}`의 `justify-content:center`와 상호작용해 흐름 그림이 위로 넘쳐 머리글과 겹치는 문제를 실제로 재현·확인함(수정: `.rt-cg-preview.rt-link-preview{max-height:none;justify-content:flex-start}`을 820px 이하에 추가) |
| 전송기 사진 없이 이름만 있는 옵션 | — | 목록 선택 행에서는 사진을 빼고(01/02의 `.rt-cg-row`처럼 이름+부제/스펙만), 오른쪽 미리보기에만 사진을 둠 | 과제 지시("status dot, not the current .rt-ext-option-state text badge")가 목록 행을 01/02 모양으로 바꾸라고 명시했고, 사진은 미리보기의 "흐름" 쪽 역할이라 판단 |

### 7-3. e2e·검증

- `node --test tests/*.test.cjs`: 37/37(변경 없음)
- `node scripts/build-product-index.cjs --check`: 27개
- `node scripts/package-site.cjs`: 통과
- `node scripts/e2e-smoke.cjs`(전역 playwright, `/opt/pw-browsers/chromium`): **76/76**(기존 73 + 신규 3: "04 세그먼트로 IN 2를 고르면 오른쪽 흐름이 XDM-CIS100을 보여줌"(전환 전 상태 확정용) · "04에서 오른쪽 세그먼트를 바꾸면 흐름이 해당 카드로 바뀐다" · "390px에서 04 카드 폭이 화면 안에 들어간다")
- `git diff --check`: 통과(공백 오류 없음)
- 기존 04 검사(HDBaseT·광 카드 자동 연결, CTR100 PSE 쌍, 전송기 라인업 사진, 전원 경고)는 선택자(`button[data-owner][data-link-device]`, `select[data-owner][data-link="count"]`, `.rt-ext-lineup`, `.rt-ext-lineup-card img`, `.rt-power-notice strong`)를 그대로 써서 모두 회귀 없이 통과했습니다.
- 01·02·03·05·06 단계와 제품정보(`#products`) 화면은 이번 세션에서 `src/app.js`·`src/styles.css`의 04 관련 부분과 문서/버전 표기만 바꿨고, `git status`로 그 외 파일이 바뀌지 않았음을 확인했습니다.

## Opus 검수 (2026-09-27, 0.38.0 반영 직후)

### 기능 확인(직접 조작)

| 제품군 | 구성 | 결과 |
|---|---|---|
| XDM-36 | HDMI 카드 CTR100 PSE 연장 + CIS100·COS100 | CTR100 TX/RX 자동 연결, 전원 경고 "8대", BOM에 CTR100 8대와 전원 장비 1개가 나옵니다. 0.37과 같습니다. |
| SPX-M3236 | OUT1 COS12 | SPX-RX 12대가 자동으로 연결됩니다. |
| VDM-16X | IN2 CIS4-U + OUT1 FOS4-U | CT104-U 4대와 FR101-U 4대가 자동으로 연결됩니다. |

전송기 연동, 채널 수 선택, 전원 안내, BOM 수량은 0.38 재구축 뒤에도 바뀌지 않았습니다.

### 찾은 문제와 수정(`src/styles.css` 끝, "0.38 검수(Opus)" 주석 블록)

| 문제 | 원인 | 수정 |
|---|---|---|
| PC(1280px)에서 04 연결 흐름(소스 → 전송기 → 케이블 → 카드)이 두 줄로 꺾여, 카드 사진이 둘째 줄 왼쪽으로 떨어집니다. | 흐름 노드와 케이블 칸의 폭이 고정값이고 `flex-wrap:wrap`이라, 오른쪽 미리보기 폭이 좁으면 줄이 바뀝니다. | 821px 이상에서 `flex-wrap:nowrap`으로 두고, 노드(최대 132px)와 케이블 칸(64~96px)이 줄어들 수 있게 했습니다. |
| 왼쪽 목록이 길면 오른쪽 미리보기가 세로 가운데에 떠서, 화면 위쪽에서는 흐름이 보이지 않습니다. | 미리보기가 `justify-content:center`이고 목록 높이만큼 늘어납니다. | 821px 이상에서 미리보기를 위쪽 정렬하고 `position:sticky; top:12px`로 두었습니다. 부모의 `overflow:hidden`은 sticky를 막기 때문에, 04 판에서만 `overflow:clip`으로 바꿨습니다(모서리 잘림은 그대로 유지됩니다). |
| 390px에서 흐름 4칸이 가로로 눌려 글자가 겹칩니다. | 좁은 화면용 흐름 규칙이 없습니다. | 560px 이하에서 흐름을 세로로 쌓고, 화살표를 90도 돌리고, 케이블 칸을 세로 점선으로 바꿨습니다. |

캡처로 확인한 내용:

- 1280px에서 흐름이 한 줄로 나옵니다. 스크롤하면 미리보기 top이 12px에 고정됩니다.
- 세그먼트를 OUT 2로 바꾸면 흐름이 COS100 카드로 바뀝니다.
- 390px에서는 세로 배치로 나오고 가로 스크롤이 생기지 않습니다.

### 검증

- `node --test tests/*.test.cjs`: 37/37
- `node scripts/build-product-index.cjs --check`: 27개 통과
- `node scripts/package-site.cjs`: 통과
- `node scripts/e2e-smoke.cjs`(전역 playwright): 76/76
- `git diff --check`: 통과

되돌리는 방법: `src/styles.css` 끝의 "0.38 검수(Opus)" 블록을 지우면 0.38.0 화면으로 돌아갑니다. 데이터와 저장 형식은 바뀌지 않았습니다.

## 0.38 검수(Opus) e2e 회귀 검사 추가 (2026-09-27)

위 "찾은 문제와 수정" 표의 세 가지가 다시 생기지 않도록 `scripts/e2e-smoke.cjs`에 검사 3개를 추가했습니다.

### 추가한 검사 3개

1. **`PC(1280px) 04 연결 흐름 노드가 한 줄로 나옴(세로 중심 차이 2px 이하)`** — 별도의 1280×900 컨텍스트를 열어 XDM-36의 입력 9칸을 모두 CIS100, 출력 9칸을 모두 COS100으로 채운 뒤 04 단계로 가서, `.rt-link-flow .rt-link-flow-node`들의 세로 중심(`top + height/2`)이 서로 2px 이내인지 봅니다.
   - **지시받은 값(top 자체 비교)에서 바꾼 점**: `.rt-link-flow`는 `align-items:center`라서 노드마다 사진·글자 높이가 달라도(엔드포인트·전송기·카드 노드의 실제 높이가 제각각) 정상적으로 한 줄일 때도 `top` 값 자체는 서로 다릅니다(직접 만들어서 확인: 정상 상태에서 top이 [-25, -64, -47]로 39.4px씩 벌어져 있었는데, 세 노드의 세로 중심은 모두 15.3으로 정확히 같았습니다). `top`을 그대로 비교하면 고친 코드에서도 항상 FAIL이 나서, 의도(한 줄인지)에 맞게 "세로 중심"으로 바꿨습니다.
2. **`PC(1280px) 04 왼쪽 목록이 미리보기보다 길면 스크롤해도 미리보기가 8~16px에 붙어있음(sticky)`** — 같은 1280px 구성(9+9칸)으로 왼쪽 목록 높이(약 8112px)가 오른쪽 미리보기(약 422px)보다 훨씬 길게 만든 뒤, 목록 높이의 절반만큼 스크롤해서 미리보기의 `getBoundingClientRect().top`이 8~16px 범위인지 봅니다. 목록이 미리보기보다 짧으면 조건 자체가 안 맞는 것이므로 저절로 통과시키지 않고 FAIL로 처리합니다.
   - **스크롤 지점을 바꾼 점**: 처음에는 `document.body.scrollHeight`(문서 맨 아래)까지 스크롤했는데, sticky는 부모(`.rt-cg-split`, 높이 = 목록 높이)를 벗어나는 순간 풀리는 것이 정상 동작이라 문서 맨 아래까지 가면 그 경계를 지나쳐 정상 상태에서도 top이 -340px로 나와 FAIL이 났습니다(직접 스크롤 위치를 1000~8488까지 훑어 top이 8000까지는 12px로 고정되고 8488(맨 아래)에서만 -340으로 풀리는 것을 확인). 목록 높이의 절반만 스크롤하도록 고쳐 이 오탐을 없앴습니다.
   - 사용한 구성: XDM-36, 입력 9칸 전부 XDM-CIS100 + 출력 9칸 전부 XDM-COS100(왼쪽 목록을 확실히 길게 만들기 위해서입니다. XDM-36의 in-1만 CIS100을 넣은 기존 검사 구성으로는 목록이 미리보기보다 짧았습니다).
3. **`휴대폰(390px) 04에서 연결 흐름이 세로로 쌓임(flex-direction:column)`** — 기존 04 검사가 쓰던 390px 컨텍스트(`page`, XDM-144 + CIS100 구성) 그대로, `.rt-link-flow`의 `getComputedStyle(...).flexDirection`이 `'column'`인지 봅니다.

### 기존 "390px에서 04 카드 폭" 검사 확인

지시대로 이 검사가 실제로 390px에서 도는지 확인했습니다. `page` 컨텍스트는 파일 맨 앞에서 `viewport:{width:390,height:844}`로 만들어져 04 단계까지 한 번도 크기를 바꾸지 않으므로, **실제로 390px에서 돌고 있었습니다**(정상, 고칠 것 없음). 확인용으로 실패 메시지에 `뷰포트 ${page.viewportSize().width}px`를 덧붙여 앞으로도 눈으로 바로 확인할 수 있게 했습니다.

### 검사가 제대로 잡는지 확인(일부러 망가뜨리기)

`src/styles.css` 끝의 "0.38 검수(Opus)" 블록(741~758행)을 통째로 지우고 `node scripts/package-site.cjs` + `NODE_PATH=$(npm root -g) node scripts/e2e-smoke.cjs`를 다시 돌렸습니다.

| 결과 | 값 |
|---|---|
| 새로 추가한 검사 3개 | **모두 FAIL** — 흐름 세로 중심 차이 141.2px(정상 0.0px), sticky 검사는 "목록 8112px <= 미리보기 8112px"로 전제 조건 자체가 깨져 FAIL(블록을 지우면 미리보기가 목록과 같이 늘어나 버리기 때문), 휴대폰 흐름은 `flex-direction:row`(정상 `column`) |
| 나머지 76개 | 그대로 PASS(다른 검사에 영향 없음) |
| 전체 | 76/79 |

블록을 원래대로 되돌린 뒤(`git diff -- src/styles.css`에 아무 출력 없음, 완전히 원래 파일과 동일함을 확인) 다시 돌려 **79/79** 전부 PASS를 확인했습니다.

### 검증

- `node --test tests/*.test.cjs`: 37/37
- `node scripts/build-product-index.cjs --check`: 27개 통과
- `node scripts/package-site.cjs`: 통과
- `NODE_PATH=$(npm root -g) node scripts/e2e-smoke.cjs`: **79/79**(기존 76 + 신규 3)
- `git diff --check`: 통과(출력 없음)

바꾼 파일: `scripts/e2e-smoke.cjs`(검사 3개 추가 + 기존 04 폭 검사에 뷰포트 값 표시), `docs/qa/CONFIGURATOR_AW_GLASS_QA.md`(이 절), `CHANGELOG.md`(0.38.0 항목에 한 줄 추가). `src/`·`data/`·`index.html`은 건드리지 않았습니다. 버전 번호도 그대로 0.38.0입니다.
