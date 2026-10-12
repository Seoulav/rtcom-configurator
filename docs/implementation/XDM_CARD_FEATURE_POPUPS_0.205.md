# XDM-WOS100·HOS100 기능 팝업 확장 · HOS100 멀티뷰 레이아웃 (0.205.0)

## 요청 (사용자, 2026-10-12)

1. "https://seoulav.github.io/rtcom-configurator/#products/xdm 이 페이지 XDM-WOS100 팝업에도 동일하게 해주고 버튼이 살짝 눈에 띄게해줘"
2. "02 신호구성에 WOS카드와 HOS카드 버튼눌러서 팝업이 뜨는것도 좋겠다"
3. "HOS도 4분할 2분할 원하는 레이어 구성을 할 수 있어 단 카드 리소스 소모되어서 레이어2개하면 1~2번 중 2번은 사용불가 4개 레이어 사용하면2~4는 1번 동일화면 출력되서 사실상 사용불가해 이런내용을 너가 요약해서 팝업시 나오게 해주고 HOS100출력카드 설명에 추가해줘"

## 처리

### 1. 기능 팝업 버튼을 한 곳에서 만들기 (`src/app.js`)

- `cardFeatures`에 WOS100(`layer-compare`, 0.203 레이어 구성도·비교표)과 HOS100(`hos-multiview`, 이번에 추가)을 정의하고, `featureButton(id)`·`featureCta(id)`로 버튼과 안내 상자를 만듭니다.
- `globalThis.RtCardFeature`(`cards`, `cta`)로 내보내 제품정보(`src/products.js`)도 같은 버튼을 씁니다. 0.143의 `RtCardTips` 공유 방식과 같습니다.
- 버튼은 `data-card-feature` 속성을 달고, `#rtcom-design` 루트의 전용 클릭 처리기가 팝업을 엽니다. `<button>`이 아닌 칸(02 신호 구성 SVG의 `role="button"` 칸)은 Enter·Space 키로도 열립니다. 0.203·0.204의 `data-action="layer-compare"`는 이 속성으로 바꿨습니다.
- 쓰는 곳:
  - 구성기 02 프레임 선택의 "XDM-WOS100 · 레이어" 카드
  - 구성기 출력 카드 선택 팝업 팁(HOS100·WOS100 둘 다)
  - 구성기 카드 상세 팝업(`openCardInfo`)
  - 제품정보 04 카드 상세 팝업(`openProductCardInfo`)
  - 제품정보 02 신호 구성 그림

### 2. 버튼을 살짝 눈에 띄게 (`src/styles.css`)

- `.rt-feature-open`: 남색 단색(0.203 `.rt-layer-open`) 대신 사이트 강조색 그러데이션(#3978ee → #5b5ce6)을 쓰고, 레이어 아이콘·→ 화살표·옅은 그림자를 더했습니다. 마우스를 올리면 1px 떠오르고 화살표가 오른쪽으로 움직입니다.
- 카드 상세 팝업에서는 `.rt-feature-cta`라는 연한 파랑 안내 상자 안에 넣습니다. 상자 안에는 기능 태그("4레이어"·"멀티뷰")와 한 줄 설명이 같이 들어갑니다.
- 카드 선택 팝업의 보라색 팁 안에서는 흰 바탕 변형(`.rt-feature-open-tip`)을 씁니다.
- 쓰지 않게 된 `.rt-layer-open`·`.rt-layer-cta`·`.rt-layer-open-tip` 규칙은 지웠습니다.
- 버튼 안 글자가 02 프레임 선택 카드의 머리글 규칙(`.rt-xdm-feature-note span`, 9px 파랑)을 물려받아 보이지 않던 문제는 `.rt-feature-open>span`으로 막았습니다.

### 3. 제품정보 02 신호 구성 (`src/products.js` `seriesSignalSvg`)

- 기능 팝업이 있는 출력 카드 칸(WOS100·HOS100)의 처리:
  - 칸 폭을 140에서 160으로 넓혔습니다.
  - 신호 색 테두리와 오른쪽 › 원을 더했습니다.
  - `<g role="button" tabindex="0" data-card-feature>`로 감쌌습니다.
- 범례 끝에 "HOS100·WOS100 칸을 누르면 멀티뷰·레이어 그림"을 더했습니다.

### 4. HOS100 멀티뷰 레이아웃 팝업 (`openHosMultiview`)

- 레이아웃 6종은 매뉴얼 KV08 32~34쪽(인쇄 쪽 번호, PDF 33~35쪽) Multiview 예시 그림의 배치를 따랐습니다(아래 표).
  - 매뉴얼 그림은 4:3 칸입니다. 팝업은 16:9 화면 틀에 같은 배치로 다시 그렸습니다.
  - 칸 번호 1~4는 매뉴얼 그림의 "입력 1~4번"입니다.

| 레이아웃 | 매뉴얼 예시 | 팝업 그림 | 레이어 |
|---|---|---|---|
| Full 1~4 | 그림 없음("n번 입력 영상 소스를 Full 화면으로") | 전체 화면 한 칸("1~4") | 1 |
| Quad | 4분할 2×2 | 같음 | 4 |
| Bottom | 위 큰 화면(좌우 검은 여백) + 아래 작은 화면 3 | 같음 | 4 |
| Right | 왼쪽 큰 화면(위아래 검은 여백) + 오른쪽 작은 화면 3 | 같음 | 4 |
| PIP | 큰 화면 1 + 오른쪽 아래 작은 화면 2 | 같음 | 2 |
| PBP | 좌우 2분할 | 같음 | 2 |

- 포트 사용 제한은 매뉴얼에 없고, **사용자 확인**(2026-10-12)을 따랐습니다.
  - 레이어 2개(PIP·PBP): 1·2번 포트 중 2번은 사용할 수 없습니다.
  - 레이어 4개(Quad·Bottom·Right): 2~4번 포트에 1번과 같은 화면이 나와 사실상 사용할 수 없습니다.
- 팝업에서는 위 내용을 노란 안내 상자로 요약하고, 레이아웃마다 포트 1~4를 "사용 / 불가 / 1번 동일"로 표시합니다. 근거 줄에는 "포트 사용 제한은 서울영상테크 확인(2026-10-12)"이라고 적었습니다.
  - 매뉴얼에 없는 내용을 넣지 않으려고, Full 1~4에는 포트 표시를 두지 않았습니다. 레이어 1개일 때의 포트 사용은 확인되지 않았기 때문입니다.
  - 그 대신 "Timing OFF = 매트릭스 모드"(매뉴얼 32쪽)에서 4포트를 각각 출력한다는 점을 아래 안내에 적었습니다.
- 아래 안내의 근거는 모두 매뉴얼입니다.
  - 설정 순서(Timing → Layer → Output 슬롯 → Enter), Timing OFF = 매트릭스 모드: 32쪽
  - User config mode: 34쪽
  - Genlock을 켜면 Multiview 제한: 35쪽
- 매뉴얼 33쪽은 "기본 Layer로 총 8가지"라고 쓰고, 표에는 9개(Full1~4, Quad, Bottom, Right, PIP, PBP)를 적었습니다. 그래서 팝업에서는 개수를 말하지 않습니다.

### 5. HOS100 카드 설명

- 카드 설명 문장(`cardTips`): "HDMI 4채널 출력 또는 4분할·2분할 등 원하는 레이어(멀티뷰) 화면 구성에 활용할 수 있습니다. 레이어를 쓰면 일부 출력 포트를 쓸 수 없습니다."
- `src/card-specs.js`:
  - "특징"에 "(4분할·2분할 등 레이어 구성)"을 더했습니다.
  - 새 행 "멀티뷰 포트 제한"(두 줄)과 note를 넣었습니다. 사양표 칸은 `white-space:pre-line`으로 줄을 나눕니다.
- 구성기 출력 카드 선택 팝업의 HOS100 팁에도 같은 제한을 한 줄로 적었습니다.

## 검증

- `node --test tests/*.test.cjs`, `node scripts/build-product-index.cjs --check`, `node scripts/package-site.cjs`, `node scripts/e2e-smoke.cjs`(235/235), `node scripts/check-version.cjs --against origin/main`, `git diff --check`, `node scripts/tools/unify_notation.cjs`
- e2e에 4개 항목을 더했습니다.
  - 출력 카드 선택 팝업 팁 버튼
  - 제품정보 카드 상세 WOS·HOS 버튼과 "멀티뷰 포트 제한" 행
  - HOS 팝업 레이아웃 6종·포트 표시
  - 02 신호 구성 칸 클릭·Enter
- 화면: `docs/qa/xdm-card-feature-popups-0.205/`(PC 1280px, 휴대폰 390px)

## 영향 범위

- 다음 항목은 바뀌지 않습니다.
  - 저장 형식(`rtcom.configuration.v1`, JSON schema 3)
  - 카탈로그(제품군·프레임·카드 수)
  - 슬롯 ID와 주소
- 새 배포 파일은 없습니다.
- AI 검색 자료 묶음(`dist/data/ai-context.json`)은 빌드 때 `card-specs.js`에서 다시 만들어지므로, HOS100 포트 제한 행이 함께 들어갑니다.

## 되돌리기

`git revert <0.205 커밋>`으로 되돌립니다. 데이터 이전은 없습니다.
