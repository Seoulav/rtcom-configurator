# 제품정보 화면 개편 명세 — LED 구성기 디자인 계승 (2026-09-27)

- 결정: 사용자(서울영상테크 SI사업본부)가 시안 4종을 승인했습니다("다 마음에 들어", 2026-09-27).
- 시안(정답 이미지): `docs/mockups/`
  - 단일 제품: `hd-210u-glass-style.html` / `.png` / `-mobile.png`
  - 시리즈: `series-glass-style.html?s=xdm|vdm|spx` / `series-{xdm,vdm,spx}-glass-style.png`
  - QMS 화면 모드: `qms-44ux-video-modes-desktop.png` 등. 이 시안은 옛 스타일이므로 **새 글래스 스타일로 다시 칠해서** 넣습니다.
- 디자인 원본: 사용자의 LED 구성기 https://hkkim0454.github.io/svt-led-calculator/src/index.html (`styles.css` v456)
- 적용 범위: **제품정보 화면(`#products`, `#products/<id>`)만** 바꿉니다. 매트릭스 구성기 화면은 이번 작업에서 바꾸지 않습니다.
- 이 명세는 `docs/audit/PRODUCT_DIAGRAM_REVIEW_2026-09-27.md`(검토)와 `docs/evidence/QMS_VIDEO_MODES.md`(근거)를 전제로 합니다.

## 1. 디자인 기반 (6-A)

### 1-1. 글꼴
- Pretendard Variable 가변 woff2 한 파일을 사이트에 직접 넣습니다(self-host).
  - 받을 곳: `https://hkkim0454.github.io/svt-led-calculator/src/fonts/PretendardVariable.woff2`(약 2MB)
  - 저장 위치: `fonts/PretendardVariable.woff2`
  - 라이선스: SIL Open Font License 1.1. `fonts/OFL.txt`를 함께 넣습니다(원문: github.com/orioncactus/pretendard의 LICENSE).
  - 둘 중 하나라도 받지 못하면 멈추고 보고합니다. 다른 폰트로 대체하지 않습니다.
- `@font-face{font-family:"Pretendard Variable";font-weight:45 920;font-display:swap;src:url(...) format("woff2-variations")}`
- `scripts/package-site.cjs` 배포 목록에 `fonts/` 두 파일을 추가하고, `tests/site.test.cjs`에 "폰트 파일 존재 + dist에 포함" 검사를 추가합니다.

### 1-2. 토큰
LED 구성기 `:root` 값을 그대로 씁니다. 다만 `#rtcom-design .rt-products-view` 범위에만 선언해 구성기 화면에 번지지 않게 합니다.
- 면: `--paper:#EEF1F6`, `--ink:#1C1C1E`, `--ink-2:#3A3A3C`, `--muted:#8A8A8E`, `--line:rgba(60,60,67,.12)`
- 강조: `--accent:#007AFF`, `--accent-2:#0057D8`, `--accent-tint:rgba(0,122,255,.12)`. 출력 계열 보조색: `#5E5CE6`, `#BF5AF2`, `#8944AB`
- 신호 종류별 색(신호 구성도·범례 공통): HDMI `#007AFF` · DisplayPort `#5E5CE6` · SDI `#E08A20` · HDBaseT/CATx `#1E9E52` · 광 `#30B0C7` · 쿼드 `#BF5AF2`
- 글래스 카드: `--glass-fill:rgba(255,255,255,.62)`, `backdrop-filter:saturate(180%) blur(30px)`, `border:1px solid rgba(255,255,255,.7)`, `--r-card:24px`, 안쪽 여백 22px, `--shadow-card:0 1px 2px rgba(20,26,40,.04),0 18px 48px -20px rgba(20,26,40,.28)`
- 입력칸·칩 배경: `--field-fill:rgba(118,118,128,.10)`, 모서리 13px. 알약 버튼은 `--r-pill:980px`, `font:600 13px`, 여백 `9px 16px`
- 배경 색 번짐: LED 구성기의 `.bg-orbs`(radial-gradient 4개)를 제품정보 화면 뒤에 깝니다. blur 필터는 쓰지 않습니다(크롬 합성 버그, LED 구성기 주석 참고).
- 다크 모드: 이번에는 **라이트만** 적용합니다. 사이트 전체가 현재 `color-scheme:light`이기 때문입니다. 다크 토큰은 주석으로만 남깁니다.

### 1-3. 글자 규칙
- 본문 14px/1.45, `font-variant-numeric:tabular-nums`
- 페이지 제목(제품명) 27px/800/-.02em. 부제는 11px, 대문자, `--muted`
- 카드 제목: `h2` 15px/700, `letter-spacing:.04em`, 대문자, `--muted`. 앞에 번호 `.idx`(14px/700, `--accent`)를 붙여 `01 한눈에 보기` 형식으로 씁니다. 보조 설명 `— …`은 대문자 변환 없이 500 굵기
- 표: `th` 10.5px 대문자 `--muted` + `--field-fill` 배경, `td` 12.5px. 첫 열은 `--muted` 600

## 2. 화면 구조

### 2-1. 공통 머리(모든 상세)
- 왼쪽: 52px 앱 아이콘 타일(그라디언트 `#0A84FF → #5E5CE6 → #BF5AF2` + 윗부분 광택) + 제품군별 흰 선 아이콘(분배기 = 가지치기, 매트릭스 = 교차, 전송기 = 두 상자와 선, 케이블 = 선) + 제품명 + 부제(영문 한 줄 요약)
- 오른쪽 알약 버튼: `← 제품 목록`, (있으면) `제조사 원본 다이어그램`, `인쇄 / PDF`
- 주요 버튼(파랑)은 **시리즈에서만** 둡니다: `○○ 구성기에서 구성하기 →`(기존 `data-configure-family` 동작 유지)
- **"견적 문의" 버튼은 넣지 않습니다.** 연결할 곳이 아직 없습니다.

### 2-2. 단일 제품 템플릿 (분배기·일체형·전송기) — 시안 `hd-210u-glass-style`
2열(`360px | 1fr`, 1000px 이하에서는 1열):
- 왼쪽: `01 한눈에 보기`(lead + 핵심 수치 2×2 + "카탈로그 46쪽판 N쪽 대조" 알약) → `04 제품 사양`(표, 크기·무게 포함) → `05 주요 기능`(파란 체크 목록)
- 오른쪽: `02 신호 흐름`(자동 생성 SVG) → `03 단자 지도`(정면/후면 세그먼트 + 번호표 사진 + 단자 카드) → 출처 한 줄
- 휴대폰(720px 이하)에서는 **01→02→03→04→05 순서**로 쌓습니다(CSS `order` 사용). 신호 흐름 SVG는 세로 배치로 바꿔 글자가 11px 아래로 작아지지 않게 합니다.
- 핵심 수치 칸: 대역폭·해상도·입력·출력 중 있는 것만 보여 줍니다. 숫자는 18px/800, 단위는 12px. **"8 HDMI 19-Pin Female 입력"처럼 커넥터 원문을 쓰지 않습니다.** 숫자와 짧은 신호명(`8 HDMI`)만 씁니다. 라벨과 값이 겹치는 표기("입력 / 입력")도 없앱니다.
- 전송기 신호 흐름: `소스 → TX → [케이블 종류 · 거리] → RX → 디스플레이`
  - 케이블별 거리 행이 여러 개면 모두 표시합니다(예: CTR100의 CAT6A 100m / CAT6 CI6522 80m).
  - XDM-CTR100은 0.30.0에서 고친 두 조합(①카드 직결: 소스→CTR100 TX→XDM-CIS100 / XDM-COS100→CTR100 RX→디스플레이, ②PSE 쌍)을 그대로 옮깁니다.
- QMS-44UX·QMS-88UX: `videoModes`가 있으면 `05 주요 기능` 아래에 `06 화면 구성 모드` 카드를 둡니다. 왼쪽에 "Video Mode" 타일, 오른쪽에 모드 카드 4장이고, 새 토큰으로 칠합니다.

### 2-3. 시리즈 템플릿 (XDM·VDM·SPX) — 시안 `series-glass-style`
- 왼쪽: `01 한눈에 보기` → `05 시리즈 사양` → `06 주요 기능`(6개만 보이고 나머지는 "기능 N개 더 보기" 펼침)
- 오른쪽: `02 신호 구성`(입력 카드 → 메인프레임 → 출력 카드, 신호 색, 연동 전송기는 점선 알약) → `03 메인프레임`(사진 + 채널 + 랙 높이 막대 + 특이사항 배지) → `04 카드 라인업`(카드 사진·설명·포트 수·연동 전송기)
- 카드·프레임 목록은 **구성기 데이터(`src/catalog.js`, `src/core.js`의 슬롯·전송기 연동)와 제품 JSON lineup을 대조**해 씁니다. 어긋나면 멈추고 보고합니다. XDM-288은 구성기에서 뺐으므로(0.29.0) 메인프레임 카드에도 넣지 않습니다.
- 랙 높이(U): 카탈로그 46쪽판 값을 씁니다. XDM 4/9/9/16/29/40U, VDM 3/7/12/19/24/27/37/38U, 256X 39U(매뉴얼), 288X 38U, SPX 2/4/7/8/8U. `lineup[].rackUnits`로 JSON에 넣습니다.
- VDM 프레임 중 사진 대신 매뉴얼 선 도면인 것은 그대로 쓰되, 사진 칸 배경을 흰색으로 통일합니다. 사진이 없는 VDM-288X는 "사진 준비 중"으로 둡니다.

### 2-4. 케이블 템플릿 (AHOC·HOC-UX·LHOC·UMC)
- 단일 제품 템플릿에서 `03 단자 지도`를 빼고, `02 신호 흐름`을 `소스 → [케이블 · 최대 길이·대역폭] → 디스플레이` 한 줄로 그립니다.

### 2-5. 목록 화면(`#products`)
- 같은 머리(아이콘 타일 + "알티컴 제품정보" 27px + 부제)를 씁니다.
- 분류 필터는 LED 구성기의 세그먼트 컨트롤(`.seg`) 모양으로 바꿉니다.
- 제품 카드는 글래스 카드(사진 + 분류·쪽 번호 + 제품명 + 한 줄 lead)로 만듭니다.

### 2-6. 기록·원본 영역
- 입출력 표, 확인 사항(issues), 출처 목록은 페이지 맨 아래 `<details>` 하나에 모읍니다. 제목은 "자료 출처·검토 기록 (N건)"이고 기본은 접힘입니다.
- 제조사 원본 다이어그램은 머리의 `제조사 원본 다이어그램` 버튼을 누르면 같은 `<details>` 안의 해당 그림으로 이동해 펼쳐집니다. 0.30.0의 캡션과 "표기 다름" 배지는 그대로 둡니다.
- "검토 필요" 배지는 제품명 옆이 아니라 이 기록 영역 안에서만 보입니다. 단, 사양 표 칸 안의 배지는 유지합니다.

## 3. 데이터 (rtcom.products.v1 선택 필드 추가 — 기존 필드는 바꾸지 않음)

| 필드 | 형식 | 설명 |
|---|---|---|
| `lead` | 문자열, `**굵게**` 한 곳까지 허용 | 01 카드의 두 문장 요약. **overview·features에 있는 사실만** 쓰고, 새 기능·수치·용도는 만들지 않습니다. |
| `subtitle` | 문자열 | 머리 부제. 예: `2×10 HDMI 2.0 Splitter · 입력 선택형` |
| `portMap` | `{image:"Rear"|"Front", items:[{n, label, desc, x1, x2}]}` | 단자 지도 번호표. x1·x2는 **해당 사진 원본 픽셀 가로 좌표**입니다. 사진을 직접 열어 확인합니다. |
| `lineup[].rackUnits` | 숫자 | 시리즈 전용 |
| `videoModes` | 프롬프트 5 명세 | QMS 전용 |

- `scripts/build-product-index.cjs` validator에 새 필드 형식 검사를 추가합니다. `lead`와 `desc`도 금지어 검사 대상입니다.
- `docs/handoff/AV_PORTAL_RTCOM_PRODUCT_DATA.md`에 "선택 필드 추가, 없어도 동작"이라고 적습니다.
- `portMap`은 Rear 또는 Front 사진이 있는 제품에만 넣습니다. 사진이 없는 전송기(CT101-U 등)는 `03 단자 지도` 대신 io 표에서 뽑은 단자 카드만 보여 줍니다.

## 4. 함께 고칠 버그
- 개요 첫 문장 분리 정규식 `(?<=[.다])\s+`가 "HDMI Ver. 2.0"의 점에서 끊습니다(QMS-88UX). `lead` 필드가 생기면 개요 굵은 첫 줄은 없애고, 분리 로직도 제거하거나 "다." 뒤에서만 끊도록 고칩니다.

## 5. 검증
- `node --test tests/*.test.cjs` / `node scripts/build-product-index.cjs --check` / `node scripts/package-site.cjs` / `git diff --check`
- 전역 playwright(`npm root -g`, executablePath `/opt/pw-browsers/chromium`)로 대상 제품을 1280px·390px로 캡처하고 `docs/mockups/` 시안과 나란히 비교합니다. 비교 이미지는 `docs/qa/`에 저장합니다.
- 확인 항목: 390px에서 가로 스크롤 없음, 콘솔 오류 0, 모든 이미지 200, 구성기 화면(`#matrix-configurator`) 캡처가 작업 전과 같음.

## 6. 작업 나눔

- 버전 번호는 push 직전에 `git pull` 후 CHANGELOG 최상단을 보고 다음 빈 번호를 씁니다. 다른 세션과 같은 번호를 쓰면 안 됩니다.
- **6-A (기반 + 대표 4종)**: 1장 전체 + 2-1·2-2·2-3·2-5·2-6 + HD-210U·XDM·VDM·SPX 데이터 + 4장 버그 → **작업 시점의 다음 빈 마이너 버전**(0.31.0은 프롬프트 3이 사용함)
- **6-B (나머지 23종)**: 분배기·일체형 8, 전송기 11, 케이블 4에 `lead`·`subtitle`·`portMap`을 채우고 2-4 적용, QMS 화면 모드 재도색 → 6-A 다음 번호
- Rollback: 버전 커밋 단위로 revert합니다. 새 필드는 선택 필드라 데이터만 남아도 옛 화면이 깨지지 않습니다.
