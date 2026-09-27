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
