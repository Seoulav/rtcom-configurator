# 제품정보 화면 글래스 디자인 QA — 6-A (0.33.0)

- 일시: 2026-09-27 · 환경: 로컬 build(`dist/`), 전역 Playwright(`NODE_PATH=/opt/node22/lib/node_modules`), Chromium(`executablePath: /opt/pw-browsers/chromium`)
- 근거: `docs/handoff/PRODUCT_GLASS_REDESIGN_SPEC.md` 5장 "검증"
- 캡처 이미지: `docs/qa/glass-redesign-screens/`(구현 화면), `docs/mockups/`(승인 시안)

## 5장 검증 항목별 결과

| 항목 | 결과 |
|---|---|
| `node --test tests/*.test.cjs` | 30/30 통과(폰트 파일·OFL 라이선스 검사 포함 2건 신규) |
| `node scripts/build-product-index.cjs --check` | 27개 통과(lead·subtitle·portMap·rackUnits 형식 검사 포함) |
| `node scripts/package-site.cjs` | 정상 빌드(`fonts/` 2개 파일 포함) |
| `node scripts/e2e-smoke.cjs`(전역 playwright) | 55/55 통과(제품정보 관련 선택자를 rt-pg-*로 갱신) |
| `git diff --check` | 통과 |
| 390px에서 가로 스크롤 없음 | 확인(HD-210U 상세 `scrollWidth-clientWidth===0`, e2e에도 동일 검사 있음) |
| 콘솔 오류 0 | 확인(캡처 스크립트의 `pageerror` 리스너에 아무것도 기록되지 않음, e2e "자바스크립트 오류 없음" 통과) |
| 모든 이미지 200 | 확인(e2e "404 요청 없음" 통과 — VDM-288X처럼 사진이 없는 프레임은 애초에 `<img>`를 만들지 않아 요청 자체가 없음) |
| 구성기 화면(`#matrix-configurator`) 캡처가 작업 전과 같음 | 확인(`docs/qa/glass-redesign-screens/configurator-baseline-1280.png`, 새 CSS는 전부 `.rt-products-view` 범위 안이라 구성기 선택자에 닿지 않음 — grep으로 새 블록의 모든 선택자를 확인) |

## 화면별 시안 대조

### HD-210U 상세 (단일 제품 템플릿, 2-2)

- 시안: `docs/mockups/hd-210u-glass-style.png` / `docs/mockups/hd-210u-glass-style-mobile.png`
- 구현: `docs/qa/glass-redesign-screens/hd-210u-1280.png` / `docs/qa/glass-redesign-screens/hd-210u-390.png`
- 대조 결과: 토큰(색·글꼴·둥근 모서리·글래스 블러)·2열 레이아웃(360px|1fr)·01 카드(lead·핵심 수치 2×2)·04 제품 사양 표·05 체크 목록·03 단자 지도(사진 위 번호표+카드)까지 구조·색상·글자 크기가 시안과 일치합니다. 차이: (a) "02 신호 흐름" SVG는 시안의 손그림 대신 기존 자동 생성 로직(포트 4개까지 표시 후 "외 N대")을 재사용해 소스 2대·출력 10대를 더 단순하게 그립니다(6-B의 나머지 23종에도 같은 함수를 쓰기 위한 선택, CHANGELOG 0.33.0에 기록). (b) 시안의 "견적 문의" 버튼은 명세 지시대로 뺐습니다. (c) 휴대폰 폭에서 "02 신호 흐름"은 시안이 요구한 세로 배치 대신 가로 스크롤(0.28 패턴)을 씁니다.

### XDM/VDM/SPX 시리즈 (2-3)

- 시안: `docs/mockups/series-xdm-glass-style.png`·`series-vdm-glass-style.png`·`series-spx-glass-style.png`
- 구현: `docs/qa/glass-redesign-screens/xdm-1280.png`·`vdm-1280.png`·`spx-1280.png`
- 대조 결과: 01 한눈에 보기(최대 규모·해상도·대역폭·카드당 포트 4칸), 02 신호 구성(입력→메인프레임→출력, 신호 색·범례·연동 전송기 점선 알약), 03 메인프레임 그리드(사진·모델명·랙 높이 막대), 04 카드 라인업(입력·출력 2열), 05 시리즈 사양 표, 06 주요 기능(6개+더 보기)까지 배치·색상·수치가 시안과 일치합니다. VDM-288X는 사진이 없어 "사진 준비 중"으로 정확히 표시됩니다(시안과 동일). 차이: VDM의 포트 라벨을 "카드당"이 아닌 "보드당"으로 표시합니다(이유는 구현 문서·CHANGELOG 참고).

### 제품 목록 (2-5)

- 구현: `docs/qa/glass-redesign-screens/list-1280.png`(전용 시안 이미지는 없음 — 명세 2-5의 문장 설명만 있어 같은 머리·세그먼트 필터·글래스 카드로 새로 구성)
- 27개 제품이 모두 카드로 나오고, 분류 세그먼트·검색이 정상 동작합니다(e2e에서 전송기 11종, QMS 검색 2종 확인).

## 회귀 확인(구성기 화면)

- `docs/qa/glass-redesign-screens/configurator-baseline-1280.png`: 이번 작업 이후 캡처. 매트릭스 구성기 화면의 헤더·단계 탭·프레임 카드·슬롯 디자인은 이전 버전(0.32.0)과 같은 토큰(`--rt-accent` 등)을 그대로 씁니다. e2e-smoke.cjs의 구성기 관련 28개 항목(카드 6종, 슬롯 72개, 전송기 자동 연결 등)이 모두 그대로 통과했습니다.

## 남은 위험 / 다음 단계(6-B)

- 분배기·일체형 8종, 전송기 11종, 케이블 4종의 `lead`·`subtitle`·`portMap` 채우기.
- QMS-44UX·QMS-88UX "06 화면 구성 모드"(videoModes) 데이터 형식 정의 및 재도색.
- 케이블 템플릿(2-4)의 실제 데이터 적용(현재는 함수만 준비, 표시 문구는 폴백 상태).
