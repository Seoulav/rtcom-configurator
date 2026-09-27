# 제품정보 화면 글래스 디자인 구현 기록 — 6-A (0.33.0)

- 근거: `docs/handoff/PRODUCT_GLASS_REDESIGN_SPEC.md` "6. 작업 나눔" §6-A
- 범위: 1장 전체(폰트·토큰·글자 규칙) + 2-1·2-2·2-3·2-5·2-6(공통 머리·단일 제품·시리즈·목록·기록 영역) + HD-210U·XDM·VDM·SPX 데이터 + 4장 버그 수정
- 범위 밖(6-B 예정): 분배기·일체형 8·전송기 11·케이블 4종의 `lead`·`subtitle`·`portMap` 채우기, 2-4 케이블 템플릿 데이터 적용, QMS 화면 구성 모드(videoModes) 재도색

## 지킨 하드 제약(사용자 지시, 그대로 인용)

- "매트릭스 구성기 화면(#matrix-configurator)은 바꾸지 않는다. 새 토큰과 CSS는 .rt-products-view 범위 안에만 둔다" — `src/styles.css`의 새 규칙은 전부 `#rtcom-design .rt-products-view ...` 선택자 아래에서 선언했고, `rt-pg-*` 접두사만 씁니다. `grep`으로 새 블록의 모든 선택자를 확인한 결과 이 범위를 벗어난 것이 없습니다.
- "폰트 파일과 OFL 라이선스를 받지 못하면 멈추고 보고한다" — `https://hkkim0454.github.io/svt-led-calculator/src/fonts/PretendardVariable.woff2`(2,057,688바이트, WOFF2)와 `https://raw.githubusercontent.com/orioncactus/pretendard/main/LICENSE`(SIL Open Font License 1.1) 모두 정상적으로 받았습니다. `fonts/PretendardVariable.woff2`·`fonts/OFL.txt`로 저장소에 넣었습니다.
- "lead·subtitle은 JSON에 이미 있는 사실만으로 쓴다" — 아래 "데이터" 절 참고. 4개 제품 모두 `overview`·`features`·`korean`·`lineup`·`specifications`에 이미 있는 문장/숫자만 다듬어 썼습니다.
- "시리즈 카드·프레임 목록은 src/catalog.js·src/core.js와 대조하고, 어긋나면 멈추고 보고한다" — 아래 "구성기 데이터 대조" 절 참고. 어긋난 곳이 없어 계속 진행했습니다.
- "'견적 문의' 버튼은 넣지 않는다" — `headerBlock()`의 툴바에 넣지 않았습니다.
- "호환성 계약(CLAUDE.md)과 rtcom.products.v1 기존 필드는 바꾸지 않는다" — `lead`·`subtitle`·`portMap`·`lineup[].rackUnits`는 모두 새 **선택** 필드로 추가했고, 기존 필드는 값·형식을 바꾸지 않았습니다. `rtcom.configuration.v1`, JSON schema 3, `catalogVersion`, 슬롯 ID는 건드리지 않았습니다.

## 구성기 데이터 대조 (시리즈 카드·프레임 목록)

`src/catalog.js`의 `RtCatalog.{XDM,VDM,SPX}.models/input/output`과 시안(`docs/mockups/series-glass-style.html`)의 하드코딩된 목록, 그리고 제품 JSON의 `lineup`을 세 방향으로 대조했습니다.

| 항목 | XDM | VDM | SPX |
|---|---|---|---|
| 메인프레임 개수 | 6종(catalog.js) = 6종(시안) = lineup 중 rackUnits 있는 것 6개 | 10종 = 10종 = 10개 | 5종 = 5종 = 5개 |
| 입력 카드 개수·이름 | 6개, 이름 동일(순서만 다름) | 4개, 동일 | 1개, 동일 |
| 출력 카드 개수·이름 | 6개, 동일 | 6개, 동일 | 3개, 동일 |
| 랙 유닛(U) | 4/9/9/16/29/40(catalog.js에는 없는 값이라 명세 2-3 지정값 사용, lineup summary의 U 표기와 완전히 일치) | 3/7/12/19/24/27/37/38/39/38(명세 2-3 지정값, lineup summary에는 원래 U 표기가 없어 새로 추가) | 2/4/7/8/8(lineup summary의 U 표기와 완전히 일치) |
| 연동 전송기(카드→전송기) | CIS100↔CTR100 TX·CT103, COS100↔CTR100 RX·CR103, FIS100↔FT101, FOS100↔FR101 | CIS4-U↔CT104-U, COS4-U↔CR104-U, FIS4-U↔FT101-U, FOS4-U↔FR101-U | COS12↔SPX-RX |

XDM-288은 `src/catalog.js`(0.29.0에서 삭제)와 시안 모두에 없어 메인프레임 카드에도 넣지 않았습니다(lineup에는 남아 있지만 `rackUnits` 필드를 주지 않아 자동으로 빠집니다).

**연동 전송기 표(`CARD_EXTENDER_LABEL`)**는 `src/app.js`의 `extenderInfo`·`extenderLineup`(각 항목의 `pair` 필드)과 대조해 만든 고정 표입니다. 구성기가 실시간으로 계산하는 값을 매 순간 다시 읽어오지는 않고, 이번 세션에 grep으로 직접 대조해 값을 확정했습니다(6-B나 이후 구성기 쪽 연동이 바뀌면 이 표도 같이 갱신해야 합니다 — 아래 "남은 위험" 참고).

어긋난 곳이 없어 "멈추고 보고" 절차를 밟지 않고 계속 진행했습니다.

## 데이터(선택 필드) — "이미 있는 사실만" 확인

| 제품 | 필드 | 값 | 근거 |
|---|---|---|---|
| HD-210U | `subtitle` | "2×10 HDMI 2.0 Splitter · 입력 선택형" | `series`·`korean` 필드 |
| HD-210U | `lead` | "두 개의 HDMI 소스 중 **하나를 골라 10대의 디스플레이에 똑같이** 보냅니다. 4K 60Hz 4:4:4를 손실 없이 분배합니다." | `overview`("두 개의 입력 신호 중 하나의 HDMI 입력신호를 선택하여... 10개의 동일한 출력으로 분배") |
| HD-210U | `portMap` | Rear 사진 4개 번호표(HDMI IN 1·2, AUDIO IN, HDMI OUT 1–10, DC 12V) | `io`(입력 2·출력 10)·`specifications`(전원 DC 12V 2A)·`overview`(오디오 병합)·후면 사진(해상도 1007×156, 좌표 근거) |
| XDM | `subtitle`/`lead` | "eXtreme Digital Matrix · ..." / "...12×12부터 216×216까지 확장합니다." | `series` 필드, `specifications`(입력·출력 채널 12~216) |
| VDM | `subtitle`/`lead` | "Variety Digital Matrix · ..." / "...8×8부터 288×288까지 10가지 프레임..." | `series` 필드, `lineup`(메인프레임 10개) |
| SPX | `subtitle`/`lead` | "Signal Processing eXpert · ..." / "...8포트 입력 보드와 10~12포트 출력 보드로..." | `series` 필드, `lineup`(SPX-HIS8 8포트, SPX-HOS10/12), `overview`(Sports Bar 등) |
| XDM·VDM·SPX | `lineup[].rackUnits` | 위 표 참고 | 명세 2-3이 지정한 카탈로그 46쪽판 값(XDM은 lineup summary와도 일치) |

새로운 기능·수치·용도는 만들지 않았습니다. 시안(`docs/mockups/*.html`)에 이미 있던 lead·subtitle 문장도 검증해 보니 모두 위 JSON 필드에서 그대로 나온 사실이라, 사용자가 이미 승인한 시안 문구를 그대로 썼습니다(단, `<b>`는 `**`로 바꿔 데이터 형식에 맞췄습니다).

## 화면 구조 구현 메모

- **공통 머리(2-1)**: `headerBlock()`이 목록·단일 제품·시리즈 세 화면 모두에 같은 아이콘 타일+제목+부제+툴바를 그립니다. "제조사 원본 다이어그램" 버튼은 `images[]`에 `role:"Diagram"` 항목이 있을 때만 보이고, 누르면 `<details class="rt-pg-record">`를 열고 그 안의 사진으로 스크롤합니다.
- **단일 제품(2-2)**: `singleDetailView()`. "02 신호 흐름"은 항상 자동 생성 SVG(기존 `splitterDiagram`·`extenderDiagram`·새 `cableDiagram`)를 보여주고, 제조사 원본 사진은 기록 영역으로 옮겼습니다(이전 버전은 사진이 있으면 SVG 대신 사진만 보여줬는데, 이번 명세는 "02는 항상 자동 생성 SVG"라고 못 박아 동작이 달라졌습니다 — 의도된 변경입니다).
- **단자 지도(3장 portMap)**: `portMapDiagram()`이 `images[].resolution`(원본 픽셀 크기)을 기준으로 좌표를 스케일링해 사진 위에 번호표 SVG를 겹칩니다. `portMap`이 없는 제품은 `portCards()`가 `io` 배열에서 카드를 만듭니다.
- **시리즈(2-3)**: `seriesDetailView()` + `seriesSignalSvg()`(입력 카드→메인프레임→출력 카드 신호 구성도, 시안의 배치 수식을 그대로 옮김). "06 주요 기능"은 6개까지 보이고 `기능 N개 더 보기` 버튼으로 나머지를 펼칩니다.
- **기록 영역(2-6)**: `recordSection()`이 입출력 표·확인 사항·출처를 한 `<details>`로 모읍니다. `packageStatus==='REVIEW REQUIRED'`이면 기본으로 펼쳐 둡니다(검토 필요 정보를 숨기지 않기 위함 — 명세에 없는 판단이라 보수적으로 안전한 쪽을 택했습니다. 문제가 있으면 알려주세요).
- **휴대폰 순서(2-2)**: 1000px 이하에서 `.rt-pg-col`을 `display:contents`로 지우고 `.rt-pg-cols`를 세로 flex로 바꿔, 서로 다른 두 칸에 있던 카드들을 하나의 흐름으로 합친 뒤 `order`로 01→02→03→04→05 순서를 만듭니다.
- **버그 수정(4장)**: 개요 첫 문장 분리 정규식을 `/(?<=다\.)\s+/`로 좁혔습니다(QMS-88UX의 "HDMI Ver. 2.0"에서 더 이상 끊지 않음). `lead`가 있으면 이 분리 로직 대신 `lead`를 그대로 씁니다.

## 시안과 다르게 정한 부분(보고)

CHANGELOG 0.33.0 항목에 7가지를 적었습니다(라벨 문구, 대시 표기, 아이콘 2종 새로 그림, 연동 전송기 표의 소스, 신호 흐름 SVG 재사용, 휴대폰 세로 배치 생략, QMS videoModes 보류). 모두 구조적 핵심(레이아웃·데이터 근거·상호작용)에는 영향이 없는 표현·세부 구현 차이입니다.

## 남은 위험

- `CARD_EXTENDER_LABEL`(products.js)은 `src/app.js`의 `extenderInfo`/`extenderLineup`과 별도로 관리하는 고정 표입니다. 구성기 쪽 연동(pair)이 바뀌면 이 표도 같이 고쳐야 합니다. 자동 동기화는 하지 않습니다(두 파일이 각자 독립 실행 컨텍스트라 런타임에 공유할 수 없음).
- 휴대폰 폭 "02 신호 흐름"은 세로 배치 대신 가로 스크롤(기존 0.28 패턴)을 씁니다. 실제로 화면 밖으로 넘치지 않고 안내 문구가 있어 동작에는 문제가 없습니다.
- QMS-44UX·QMS-88UX의 "06 화면 구성 모드" 카드는 아직 구현하지 않았습니다(videoModes 데이터 형식이 이번 명세에 없음). 6-B에서 형식이 정해지면 추가합니다.
- 6-B가 나머지 23종에 `lead`·`subtitle`·`portMap`을 채울 때, 이번 6-A의 폴백 로직(개요 첫 문장, io 표 기반 단자 카드)이 그 전까지 그대로 쓰입니다.

## 6-B (0.34.0) — 나머지 23종 데이터 + 신호 흐름 재설계 + QMS 화면 구성 모드

- 근거: `docs/handoff/PRODUCT_GLASS_REDESIGN_SPEC.md` 6-B, `docs/qa/PRODUCT_GLASS_REDESIGN_QA.md`의 "Opus 검수"·"6-B로 넘기는 시안 차이", `docs/evidence/QMS_VIDEO_MODES.md`
- 범위: 분배기·일체형 8·전송기 11·케이블 4종 `lead`·`subtitle` 채우기, 사진 있는 10종 `portMap` 채우기, 분배기·일체형 "02 신호 흐름" 승인 시안 방식 재설계(HD-210U 포함 9종), 핵심 수치 해상도 축약 표기, QMS `videoModes` 데이터·UI

### lead·subtitle (23종)

overview·features·specifications·korean·english에 이미 있는 문장·숫자만 다듬어 썼습니다. 예: HD-13U lead "하나의 HDMI 입력을 **손실 없이 3개의 동일한 출력**으로 분배합니다. 4K 60Hz 4:4:4를 지원합니다." — overview의 "하나의 HDMI 입력신호를 신호의 손실 없이 3개의 동일한 출력으로 분배한다"를 그대로 씁니다. 케이블 4종은 specifications(비디오 대역폭·지원 해상도·케이블 길이)에서만 뽑았습니다.

### portMap (10종) — 좌표 확인 방법과 결과

각 제품의 Rear(또는 Front) webp를 파이썬 PIL로 열어 원본 픽셀 위에 20px/10px 격자선과 좌표 숫자를 그려 저장한 뒤, 그 격자 이미지를 직접 보고 각 단자의 좌우 경계(x1·x2)를 읽었습니다. 저해상도 사진(QMS-88UX 626×129)은 밝기·대비를 높이고 4~5배 확대해서 다시 읽었습니다.

| 제품 | 사진 | 확인 방식 | 신뢰도 |
|---|---|---|---|
| HD-13U | Rear 716×178 | 25px→10px 격자 재확인 | 높음(1280px 캡처로 번호표가 각 단자 정중앙에 위치 확인) |
| HD-14U | Rear 693×169 | 10px 격자, 라벨 텍스트 직접 읽음 | 높음 |
| HD-18U | Rear 1016×160 | 10px 격자, 라벨 텍스트 직접 읽음 | 높음 |
| HDS-21U | Rear 783×171 | 20px 격자, 라벨 텍스트 직접 읽음 | 높음 |
| HDS-42MU | Rear 950×167 | 20px 격자, HDS-21U와 같은 레이아웃 패턴으로 대조 | 높음 |
| QMS-44UX | Rear 938×104 | 20px 격자 + 좌측 제어단자 확대 크롭, INPUT/OUTPUT 괄호선을 직접 추적 | 높음 |
| QMS-88UX | Rear 626×129 | 밝기·대비 보정 + 4배 확대. 18개 HDMI 포트가 매우 촘촘해(핀치 20px) 개별 포트 대신 INPUT 1–8 · OUTPUT 1–10 구간으로 묶음 | **낮음(재확인 필요)** — 아래 "Opus 확인 요청" 참고 |
| MR-4S | Rear 1147×178 | 20px 격자. 모듈 4개가 반복되는 구조라 개별 모듈 구분 대신 "모듈 슬롯 1–4" 구간으로 묶음. 좌측 전원 커넥터 2개는 features의 "단일 전원" 문구와 사진이 어긋나 정확한 명칭을 단정하지 않고 "DC 전원"으로만 표기 | 중간 |
| XDM-FT101/FR101 | Rear 515×191 | 20px 격자, io 데이터(TX 전용 커넥터 구성)와 대조 | 높음 |
| HD-210U | (6-A에서 이미 완료) | — | — |

**portMap을 넣지 않은 결정(사진은 있지만)**: XDM-CTR100(Rear 563×350)은 사진이 위쪽 DIP 스위치 상판과 아래쪽 커넥터 패널 두 장면을 세로로 합친 구도입니다. `portMapDiagram()`은 사진 맨 위에 번호표를 그리는 구조라 이 사진을 쓰면 번호표가 실제로는 빈 상판 위를 가리키게 됩니다. 잘못된 위치 표시보다 생략이 낫다고 판단해 portMap을 넣지 않고 io 표 기반 단자 카드로 남겼습니다.

### Opus 확인 요청

QMS-88UX의 portMap(INPUT 1–8, OUTPUT 1–10 구간)은 원본 사진 해상도가 낮고 18개 포트가 매우 촘촘히 붙어 있어, 다른 제품보다 낮은 신뢰도로 추정했습니다. 1280px 캡처(`docs/qa/glass-redesign-screens-6b/qms-88ux-1280.png`)에서 번호표 대괄호가 실제 INPUT/OUTPUT 그룹 위에 대략 올라가 있는 것은 확인했지만, 개별 포트 하나하나가 맞는지는 확인하지 못했습니다. 필요하면 좌표를 다시 검수해 주세요.

### 02 신호 흐름 재설계

`ioFlowDiagram()`(신 함수, 옛 `splitterDiagram()` 대체)이 승인 시안(HD-210U)의 배치를 일반화합니다.

- 입력 칩은 `io`의 HDMI IN quantity만큼 개별로 그립니다(최대 8개).
- 오디오 입력 칩은 `io`에 Audio·IN 행이 있거나, 없어도 overview에 "오디오 병합/삽입" 문구가 있으면 그립니다(HD-210U·HD-13U는 후자 — 이미 6-A/이번에 확인한 사실이라 새로 만든 값이 아닙니다).
- 노드 종류: 입력 1개면 노드 없이 바로 띠로 연결(순수 분배기). 입력·출력이 모두 2개 이상이면 "매트릭스" 사각 노드(QMS 2종, 그리고 HDS-42MU도 4입력·2출력이라 매트릭스로 판단). 입력이 여럿이고 출력이 1개면 원형 "N개 중 1개 선택" 노드(HDS-21U).
- 띠 위 굵은 글씨는 `shortResolution()` + 대역폭 사양을 합친 것이고, 띠 아래 작은 글씨는 프로토콜(io의 protocol 필드)·HDCP 사양·오디오 병합 여부를 합친 것입니다.
- 출력은 최대 5열 격자로 화면 아이콘을 그리고, 분배기는 "OUT 1–N · 같은 영상", 매트릭스는 "OUT 1–N · 독립 출력"으로 캡션을 답니다.

### 핵심 수치 해상도 축약

`shortResolution(item)`이 해상도 사양 행에서 4K/8K 여부와 Hz를 뽑고, 크로마(4:4:4 등)는 같은 행에 없으면 overview·korean·english를 추가로 검색합니다(모두 같은 제품이 이미 밝힌 사실). "01 한눈에 보기" 핵심 수치 칸과 "02 신호 흐름" 띠 라벨에 공통으로 씁니다.

### QMS 화면 구성 모드

`docs/evidence/QMS_VIDEO_MODES.md`의 표를 그대로 `videoModes` 필드로 옮겼습니다. QMS-44UX는 매뉴얼(M-Q44) 기준 4모드(MATRIX·QUAD·WALL·DUAL)에 레이아웃 목록(QUAD 12종·WALL 8종·DUAL 4종)까지 포함하고, QMS-88UX는 카탈로그(C2) 기준 요약 문장만(레이아웃 목록 없음, 매뉴얼 미확보). "06 화면 구성 모드" 카드는 `videoModes`가 있을 때만 "05 주요 기능" 아래(구조상 두 칸 레이아웃을 벗어난 전체 폭 카드로, `.rt-pg-cols` 다음에 옵니다)에 나타나며, 왼쪽 어두운 "Video Mode" 타일에 있는 모드만 아이콘으로 보여주고 오른쪽에 모드별 카드(제목·영문명·요약·레이아웃 칩)를 grid로 나열합니다.

### 시안과 다르게 정한 부분(6-B 추가분)

CHANGELOG 0.34.0에 적었습니다. 요약: (1) QMS-88UX·MR-4S portMap은 포트를 구간으로 묶었습니다(개별 포트가 너무 촘촘하거나 반복 구조라). (2) XDM-CTR100은 사진 구도 문제로 portMap을 아예 넣지 않았습니다. (3) HDS-42MU는 "그룹"이 아니라 "distribution"이지만 4입력·2출력이라 매트릭스 노드로 그립니다(사용자 지시 "일체형(QMS)은 매트릭스"를 "입력·출력이 모두 여럿이면 매트릭스"로 일반화한 것 — 실제 동작과 더 맞다고 판단했습니다. 문제가 있으면 알려주세요).

### 남은 위험(6-B)

- QMS-88UX portMap은 위 "Opus 확인 요청" 참고.
- MR-4S 좌측 전원 커넥터 2개의 정확한 명칭(POWER1/POWER2 등)은 확인하지 못해 "DC 전원"으로만 표기했습니다.
- `isMatrix` 판정을 `item.group==='integrated'`에서 `inN>1&&outN>1`로 바꿨습니다. 6-A의 QMS 2종은 그대로지만, HDS-42MU(group=distribution)도 이제 매트릭스 노드로 그려집니다 — 위 "시안과 다르게 정한 부분" 참고, 의도된 변경입니다.
