# 매트릭스 구성기 Analog Way 구조 + LED 글래스 스킨 + 블랭크 커버 (0.37.0)

- 명세: `docs/handoff/CONFIGURATOR_AW_GLASS_SPEC.md`(프롬프트 7)
- 근거/배경: `docs/audit/ANALOGWAY_CONFIGURATOR_RECHECK_2026-09-27.md`
- 시안: `docs/mockups/configurator-aw-*.png`, `docs/mockups/configurator-aw-style.html?step=1|2|3|3m|3b|3c|4`
- 사용자 결정(2026-09-27): "모듈러 매트릭스 구성기의 기본 컨셉은 아날로그웨이와 동일", "아직 구성되지 않은 슬롯은 흰색", "블랭크 슬롯을 선택해 완성"

## 무엇을 바꿨나

### 1. 화면 구조(§2)
- **머리 막대**: 단계 탭 6개를 밑줄형으로 바꿨습니다(완료 ✓ + 파란 밑줄, 현재 파란 원 + 넓은 칸, 이후 회색). `#rtcom-design .rt-nav .rt-step` 계열 규칙을 파일 맨 뒤에 덧붙여 옛 0.5절 필(pill) 스타일(그러데이션 배경)을 조상 선택자로 확실히 덮었습니다. `data-jump`·`aria-current="step"` 동작은 그대로입니다. 820px 이하에서는 현재 단계만 이름이 보이고 나머지는 번호 원만 보입니다(기존 480px 규칙 위에 820px 규칙을 추가). 큰 제목 블록("DESIGN TOOL · MATRIX")은 지우고 `<h1>`을 `.rt-visually-hidden`으로 접근성만 남겼습니다. `#matrix-configurator` id는 그대로입니다.
- **01 제품군 · 02 섀시**: `familyView()`·`chassisViewV2()`를 왼쪽 목록(`.rt-cg-row`, 기존 `data-family`/`data-model` 유지) + 오른쪽 고정 미리보기(`.rt-cg-preview`)로 다시 짰습니다. 02는 정면/후면 세그먼트 토글(`data-cg-side`)을 추가했습니다 — 이 토글은 실행 취소·자동 저장 대상이 아닌 순수 화면 상태(`previewSide` 변수)입니다. 목록 행의 사양 줄은 `catalog.js`에 이미 있는 검증된 값(모델 수, 슬롯 수, 태그)만 씁니다. 대역폭·해상도 같은 미확인 수치는 새로 만들지 않았습니다.
- **03 카드 슬롯**: `cardsViewV4()`의 슬롯 버튼을 다시 썼습니다. 빈 슬롯은 흰 배경 + `#c9ced6` 테두리(마우스 오버·포커스에서만 "+"), 카드는 실제 사진(그대로), 블랭크는 `blankPlates` 그림 + 짙은 회색 테두리(**사용자가 팝업에서 고른 슬롯에만**, 자동 적용 없음), 선택 중(팝업 열림)은 파란 테두리 + 옅은 파랑입니다. 범례, "남은 N칸 블랭크로 채우기" 줄(빈칸이 있을 때만), 완성 배너(모두 채웠을 때 제목 위), 오른쪽 요약의 슬롯 완성도(3색 막대 + 배지)를 추가했습니다. 다음 버튼 문구는 완성 여부에 따라 바뀌지만 이동은 막지 않습니다.
- **카드 선택 팝업**: 맨 위에 `data-card="BLANK"` 블랭크 커버(0포트) → 구분 제목("입력/출력 카드 N종 · M채널") → 카드 목록 순서로 바꿨습니다. 하단 버튼을 "슬롯 비우기(흰 칸)" / "닫기"로 다시 표기했습니다. `<dialog>` 포커스 규칙은 그대로입니다.
- **04 전송기(편차 — 0.38.0에서 해소)**: 0.37.0 당시에는 명세가 왼쪽 목록 + 오른쪽 고정 미리보기(체인 하나)를 요구했지만, RTCOM은 한 프레임에 원격 카드가 여러 장 있을 수 있어(각각 다른 전송기 규칙) 기존의 "카드별 섹션 + 인라인 선택 행" 구조를 유지하고 스킨만 파랑으로 다듬었습니다. 이미 파란 토큰(`#3978ee`)을 쓰고 있어 주황 제거 대상은 아니었습니다. 이 차이는 시안과 다르지만 명세가 다르면 명세보다 실제 동작을 우선한 판단이었고, Opus 검수(`docs/qa/CONFIGURATOR_AW_GLASS_QA.md` 맨 아래)가 시안과 다른 유일한 항목으로 남겨 사용자 결정을 요청했습니다.
  - **0.38.0 후속 조치**: 사용자가 이 편차를 검토한 뒤 "시안대로 만들어 달라"고 확정해, `linksViewV3()`를 01/02와 같은 `.rt-cg-split`/`.rt-cg-row`/`.rt-cg-preview`/`.rt-cg-dot`/`.rt-cg-seg` 틀로 다시 짠 `linksViewV4()`로 바꿨습니다. 왼쪽은 원격(CAT·광) 카드마다 묶음 제목(`IN 2 · XDM-CIS100 · 입력 4채널` + 채널 수 선택) 아래 선택 행(기존 `tile()`/`none()`의 `data-link-device`/`data-owner`/`aria-pressed`는 그대로, 모양만 `.rt-cg-row`/`.rt-cg-dot`로 교체) → HDMI 카드 연장 묶음 순서이고, 오른쪽은 세그먼트(`data-link-preview`, `previewSide`와 같은 성격의 순수 화면 상태 `linkPreviewSlot`)로 고른 슬롯의 연결 흐름(소스/디스플레이 ↔ 전송기 ↔ 케이블·거리 ↔ 카드, 케이블 문구는 `extenderInfo[device].specs`에서 그대로 뽑음)을 보여줍니다. 전송기 라인업(`extenderLineup`/`vdmExtenderLineup`)은 판 아래 `<details open>` 접이식 영역으로 옮겼습니다. 여러 카드가 있어도 문제가 되지 않은 이유는 "여러 체인"을 하나의 미리보기 안에서 세그먼트로 전환하는 방식으로 풀었기 때문입니다(체인을 하나만 두되 어느 체인을 보여줄지 선택). 자세한 구현·검증·스크린샷은 `docs/qa/CONFIGURATOR_AW_GLASS_QA.md`의 0.38.0 절.
- **05·06**: 구조는 그대로 두고 검증 목록에 `SLOT_INCOMPLETE`가 자연히 표시됩니다(별도 마크업 변경 불필요, `validationView()`가 `result.issues`를 그대로 렌더링).
- **스킨**: `--pg-*` 토큰(6-A/6-B가 만든 것)을 `#rtcom-design .rt-products-view`에서 `#rtcom-design`(공통 조상) 스코프로 넓혀 구성기·제품정보·공통 머리가 값을 두 번 선언하지 않고 공유합니다. 주황 강조색을 지웠습니다: `src/styles.css` 2행의 옛 `--rt-accent:light-dark(#bd591d,#f4a46b)`를 28행과 같은 파랑(`#3978ee`)으로 정리하고(28행이 항상 덮어써 실제 화면은 이미 파랑이었습니다 — 동작 변화 없음), 리터럴 `#f4a46b` 3곳(`.rt-visual-slot[aria-pressed=true]`, `.rt-hardware-slot[aria-pressed=true]`, `.rt-empty-slot b`)은 그 규칙이 속한 죽은 함수(`chassisVisual`·`cardsViewV2`, 아래 "함께 정리" 참고)와 함께 지웠습니다.

### 2. 데이터 계층(§3, `core.js`)
- `placements[slotId]="BLANK"`를 모든 제품군·방향 슬롯에 허용(`checkState`). `catalog.js`에는 추가하지 않았습니다(구성기 3/21/26 계약 그대로).
- `syncPorts`/BOM/검증에서 BLANK는 0채널·전송기 연결 대상 제외입니다(기존 `card()` 조회가 `catalog`에 없는 "BLANK"에 대해 `undefined`를 돌려주는 것을 그대로 활용했고, 이 undefined를 안전하게 건너뛰도록 3곳에 가드를 추가했습니다).
- `completionFor(state)`(순수 함수): `{cards, blanks, empty, total}`.
- `fillBlanks(state)`(순수 함수): 빈 슬롯만 BLANK로 채운 새 상태. 화면에서는 `data-action="fill-blanks"` 한 번 클릭 = 실행 취소 1단계.
- `validate()`에 `SLOT_INCOMPLETE`(WARNING) 추가: "빈 슬롯 N개에 카드나 블랭크 커버가 지정되지 않았습니다." / 근거 "사용자 결정 2026-09-27".
- `bom()`에 마감재 행 추가: `블랭크 커버 (XDM|SPX|VDM) · 부품번호·기본 포함 여부 제조사 확인 필요 × N`.
- `csv()`에 완성도 행을 추가하고, `document()`에 `completion` 필드를 추가했습니다.
- **호환성 계약에 한 줄 추가**(CLAUDE.md): `placements` 예약값 `"BLANK"`(0.37부터). 이전 버전(0.36 이하)은 이 값을 읽지 못함(구버전에서 만든 파일은 새 버전에서 문제없이 열립니다. 반대 방향은 호환되지 않습니다).

### 3. 함께 정리(§4)
- 삭제한 죽은 화면 함수(호출자 0, grep 확인 후 삭제): `legacyCardsView`, `cardsView`, `cardsViewV2`, `chassisVisual`, `requirementEditor`, `portEditor`, `requirementSummaryView`, `linksView`, `linksViewV2`, `reviewView`. `linksView`의 CT102-U·FT102-U 문구도 함께 사라졌습니다. 이와 함께 오직 이 함수들만 쓰던 최상단 `const slots=[...]`(예전 4칸 논리 슬롯 배열)도 지웠습니다.
- CSS 정리: app.js·products.js·index.html에서 클래스 이름이 실제로 나오는지 단어 경계 기준으로 자동 대조하는 스크립트를 만들어(부분 문자열 오탐 방지, 예: `rt-link`는 `rt-link-card`의 일부처럼 보이지만 실제로는 어디서도 단독으로 안 쓰임) 102개 죽은 클래스를 확인하고, 그 클래스만 쓰는 규칙(또는 콤마로 묶인 규칙 중 죽은 부분)을 제거했습니다. 총 167개 규칙을 통째로 지우고 2개 규칙은 살아있는 선택자만 남기고 다듬었습니다. 옛 전송기·후면 다크 패널 체계(`.rt-manual-rear`, `.rt-rear-scroll`, `.rt-rear-panel`, `.rt-rack-handle`, `.rt-slot-side`, `.rt-side-title`, `.rt-side-grid`, `.rt-rear-center`, `.rt-vent`, `.rt-rear-caption`, `.rt-rear-dense`, `.rt-rear-vertical`, `.rt-input-side`, `.rt-output-side`, `.rt-selected-card-summary` 등)도 이미 죽어 있었고 이번에 함께 지웠습니다(감사 문서 §2-6이 지적한 `.rt-rear-scroll #10161d` 배경도 이 안에 포함됩니다). `rt-product-*`/`rt-products-*`/`rt-pg-*`(제품정보 화면 전용)는 손대지 않았습니다.
- 애매해서 남긴 것: 없음 — 자동 대조 결과를 여러 차례 수작업으로 재검증(문자열 부분집합 오탐 6건 확인)했고, 최종적으로 살아있는 마크업이 없는 것만 지웠습니다. 남긴 CSS 규칙은 전부 `app.js`/`products.js`/`index.html`에서 실제로 참조를 찾을 수 있었습니다.

### 4. `applyDesign()` 제거(발견)
- app.js에 있던 `design={tone:'warm',density:'comfortable'}` 및 `applyDesign()`이 매 렌더링마다 `--rt-accent`를 인라인 스타일로 주황(`light-dark(#bd591d,#f4a46b)`)으로 **강제로 덮어쓰고 있었습니다**(CSS 토큰이 이미 파랑이어도 인라인 스타일이 항상 이깁니다). `design.tone`은 어디서도 'blue'로 바뀌지 않는 죽은 토글이었습니다. 이 함수와 변수를 완전히 제거했습니다 — 이것이 화면에 남아 있던 주황의 실제 원인이었습니다.

## 영향 범위
- `src/core.js`, `src/app.js`, `src/styles.css`, `index.html`(제목 블록·버전 표기), `scripts/e2e-smoke.cjs`, `tests/core.test.cjs`, `docs/*`.
- `src/catalog.js`, `src/products.js`는 건드리지 않았습니다.
- 저장 키(`rtcom.configuration.v1`), 스키마 3, `catalogVersion`, 슬롯 ID, 옛 주소 이동, 논리 슬롯 이전은 바꾸지 않았습니다.

## 검증
- `node --test tests/*.test.cjs` — 37/37
- `node scripts/build-product-index.cjs --check` — 27개
- `node scripts/package-site.cjs`
- `node scripts/e2e-smoke.cjs`(전역 playwright + `/opt/pw-browsers/chromium`) — 72/72
- `git diff --check` — 통과
- 1280px·390px 캡처(작업 전/후) — `docs/qa/configurator-aw-glass-screens/{before,after}/`
- `#products/hd-210u`·`#products/xdm` 전후 픽셀 대조(머리글 버전 표기 한 줄 제외 동일) — 아래 QA 문서 참고

## Rollback
- 이 버전 커밋을 되돌리면 됩니다(원본 소스 `main`에는 아직 병합 전이므로 `git revert` 또는 이 브랜치에서 해당 커밋 제거).
- **주의**: `placements`에 `"BLANK"`가 든 저장 파일(JSON 백업, 브라우저 자동 저장)은 0.36 이하 버전에서 열리지 않습니다("지원하지 않는 슬롯 또는 카드입니다" 오류). 되돌리기 전에 블랭크로 채운 슬롯을 빈 슬롯(카드 제거)으로 되돌려 저장한 뒤 구버전을 쓰도록 안내하세요.
