# 매트릭스 구성기 개편 명세 — Analog Way 구조 + LED 구성기 스킨 + 블랭크 커버 (프롬프트 7)

- 결정: 사용자 승인(2026-09-27). "모듈러 매트릭스 구성기의 기본 컨셉은 아날로그웨이와 동일", "아직 구성되지 않은 슬롯은 흰색", "블랭크 슬롯을 선택해 완성", "응 프롬프트 7 줘".
- 근거·규칙: `docs/audit/ANALOGWAY_CONFIGURATOR_RECHECK_2026-09-27.md`(구조 비교표, 블랭크 커버 절). **이 문서와 함께 읽습니다.**
- 정답 이미지: `docs/mockups/configurator-aw-*.png`, 시안 HTML `docs/mockups/configurator-aw-style.html?step=1|2|3|3m|3b|3c|4`
- 전제: 제품정보 개편 6-A가 먼저 반영돼 있어야 합니다(글꼴 `fonts/PretendardVariable.woff2`, 토큰). **없으면 멈추고 보고합니다.** 토큰은 6-A가 만든 것을 구성기 범위(`.rt-configurator-view`와 공통 머리)로 넓혀 다시 씁니다. 같은 값을 두 번 선언하지 않습니다.

## 1. 바꾸지 않는 것 (호환성 계약)
- `rtcom.configuration.v1`, schema 3, `catalogVersion`, 슬롯 ID, `#matrix-configurator` 주소와 옛 주소 이동, 구성기 3/21/26, 예전 논리 슬롯 변환
- `core.js` 계산 로직. 추가만 허용합니다: 아래 3장의 `BLANK` 처리, `SLOT_INCOMPLETE`, BOM 블랭크 행
- 기존 e2e가 쓰는 선택자: `[data-action="next"|"back"]`, `button[data-family]`, `button[data-model]`, `button[data-slot]`, `.rt-card-modal .rt-card-choice[data-card]`, `[data-owner][data-link-device]`, `[data-tool]`. 모양이 바뀌어도 이 속성들은 그대로 둡니다.
- 실행 취소/다시 실행, 자동 저장, JSON 백업·불러오기, CSV·인쇄·내보내기, 개인정보 입력 없는 내보내기

## 2. 화면 구조

### 2-1. 머리 막대
- 왼쪽: 앱 아이콘 타일 + `RTCOM Configurator` + 부제
- 오른쪽: **단계 탭 6개(밑줄형)**. 완료 단계는 ✓ + 파란 밑줄, 현재 단계는 번호 원 파랑 + 파란 글자 + 넓은 칸, 이후 단계는 회색입니다.
  - 기존 `.rt-nav`의 `button.rt-step[data-jump]` 동작(완료한 단계로 되돌아가기)은 유지하고 모양만 바꿉니다. `aria-current="step"`도 유지합니다.
  - 휴대폰(820px 이하): 현재 단계만 이름을 보이고, 나머지는 번호 원만 보입니다.
- "매트릭스 구성기 / 알티컴 제품정보" 보기 탭과 AV Portal 링크는 머리 막대 아래 줄 또는 오른쪽 끝에 둡니다. 없애지 않습니다.
- 도구 줄(실행 취소·다시 실행·JSON 백업·불러오기·새 구성 + 저장 상태 문구)은 얇은 글래스 줄로 머리 아래에 유지합니다.
- 큰 페이지 제목 블록(`DESIGN TOOL · MATRIX / 매트릭스 구성기`)은 머리 막대에 흡수하고 따로 두지 않습니다. `h1`은 접근성을 위해 시각적으로 숨겨 남깁니다.

### 2-2. 01 제품군 · 02 섀시 · 04 전송기 — 좌우 분할
- 한 장의 글래스 판을 `왼쪽 선택 목록 | 오른쪽 고정 미리보기`(대략 1 : 1.05)로 나눕니다. 820px 이하에서는 미리보기가 위, 목록이 아래로 쌓입니다(미리보기 최대 높이 260px).
- 목록 행: `button`(기존 data 속성 유지, `aria-pressed`) 안에 `이름 + 작은 부제 | 사양 2~3줄 | 상태 점`. 선택한 행은 흰 배경 + 파란 링 + 초록 점입니다.
- 왼쪽 아래: `← 이전`(알약) / `다음 단계 →`(파랑). 기존 `.rt-footer` 버튼을 이 자리로 옮기거나, footer를 판 안으로 넣습니다. `data-action`은 유지합니다.
- **01 제품군**: 행 = XDM/SPX/VDM(영문명, 해상도·대역폭, 규모·섀시 수, 신호). 미리보기 = 제품군 대표 사진 + 이름 + 한 줄 설명 + 태그
- **02 섀시**: 행 = 모델(랙 U, 입력·출력 슬롯, 최대 채널). 미리보기 = 선택 모델의 `정면 | 후면` 세그먼트(`output/design/assets/frames/*`). 사진이 없으면 "사진 준비 중"으로 둡니다. 랙 U 값은 `docs/handoff/PRODUCT_GLASS_REDESIGN_SPEC.md` 2-3과 같습니다. 슬롯 자료가 없는 모델의 경고 문구는 유지합니다.
- **04 전송기**: 왼쪽 = HDBaseT·광 카드마다 묶음 제목(`IN 2 · XDM-CIS100 · 입력 4채널`) + 선택 행(기존 `choices()` 결과, `연결하지 않음` 포함) + 연결 채널 수 선택. 이어서 HDMI 카드 연장(PSE 쌍) 묶음. 오른쪽 = 세그먼트로 고른 카드의 연결 흐름(`소스 → 전송기 → 케이블·거리 → 카드`, 출력은 반대 방향)과 전원 안내(`powerNotice`)
  - 전송기 라인업 카드(`extenderLineup`, `vdmExtenderLineup`)는 판 아래 접이식 영역 "연동 전송기 라인업"으로 옮깁니다.

### 2-3. 03 카드 슬롯 — Analog Way I/O
- 판 위쪽 가운데: `03` + 제목 "후면의 빈 칸을 눌러 카드를 장착하세요" + 모델·배치 설명
- 본문: `후면(흰 판 위 실제 사진·도면 + 슬롯) | 오른쪽 My configuration 요약(280px)`. 820px 이하는 위아래로 쌓습니다.
- 슬롯 상태별 모양:
  - 빈칸: 흰색, 테두리 `#c9ced6`, 회색 슬롯 번호. 마우스를 올리거나 포커스가 있을 때만 "+"
  - 카드: 실제 판넬 사진
  - 블랭크: 블랭크 판넬 그림(`blankPlates`) + 짙은 회색 테두리
  - 선택 중(팝업 열림): 파란 테두리 + 흰 바탕 위 옅은 파랑(사진 속 카드가 비치면 안 됨)
- 사진 아래 범례: 빈 슬롯 / 장착한 카드 / 블랭크 커버 / 선택 중
- 빈칸이 있으면 범례 아래 **채우기 줄**: "비어 있는 슬롯 N개 — 카드를 더 넣지 않을 슬롯은 블랭크 커버로 막아 구성을 완성하세요." + `남은 N칸 블랭크로 채우기`(파랑) 버튼
- 모두 채우면 제목 위 초록 배너 "✓ N개 슬롯을 모두 채웠습니다 · 구성 완성"
- 요약: 입력·출력 채널 막대 → **슬롯 완성도**(`N / 전체`, 3색 막대, 미완성·완성 배지) → 입력 카드 → 출력 카드 → 마감재(블랭크 ×N)
- 다음 버튼 문구: 완성이면 `선택 완료 · 전송기 연결 →`, 아니면 `빈칸 N개 남음 · 그래도 다음 →`. 이동을 막지는 않습니다.
- 이 규칙은 SPX·VDM의 사진 슬롯과 논리 슬롯(`bank`)에도 똑같이 적용합니다.

### 2-4. 카드 선택 팝업
- 기존 `<dialog>`의 포커스 규칙을 유지합니다.
- 맨 위에 `.rt-card-choice[data-card="BLANK"]` "블랭크 커버 · 커넥터 없음 · 빈 슬롯 마감 · 0포트"를 둡니다. 그 아래 구분 제목 "출력 카드 6종 · 4채널"(방향·제품군에 맞게)과 카드 목록이 옵니다.
- 아래 버튼: `슬롯 비우기(흰 칸)` / `닫기`

### 2-5. 05 구성 검토 · 06 내보내기
- 구조는 유지하고 스킨만 입힙니다. 검증 목록에 `SLOT_INCOMPLETE`가 보이게 합니다. 인쇄 보고서 후면 그림에서 빈칸은 흰색, 블랭크는 블랭크 그림입니다.

### 2-6. 스킨
- `docs/mockups/configurator-aw-style.html`의 CSS 값을 따릅니다. 글래스 판(24px), 목록 행(16px), 알약 버튼, `#007AFF`, 배경 색 번짐입니다.
- **옛 주황 강조색을 모두 없앱니다**: `.rt-radio` 체크, 다음 버튼 화살표, `.rt-hardware-slot[aria-pressed=true]`·`.rt-visual-slot[aria-pressed=true]`의 `#f4a46b`, `.rt-empty-slot b` 등. `src/styles.css` 2행의 옛 `--rt-accent`(light-dark 주황)가 원인이면 토큰부터 정리합니다.
- 후면 판넬 영역은 사진을 흰 판 위에 올립니다. 기존의 짙은 배경(`.rt-rear-scroll` #10161d)은 쓰지 않습니다. 사진이 없는 모델의 그림 랙은 짙은 톤을 유지해도 됩니다.

## 3. 블랭크 커버 데이터 (`core.js`)
- `placements[slotId] = "BLANK"`를 모든 제품군·방향에 허용합니다(`validate`/`parse`). `catalog.js`에는 추가하지 않습니다.
- 채널 계산에서 BLANK는 0채널입니다. 전송기 연결 대상(`remote` 카드)에서도 제외합니다.
- `fillBlanks(state)`: 빈 슬롯만 BLANK로 바꾼 새 상태를 돌려주고, 화면에서 실행 취소 1단계로 기록합니다.
- 완성도: `{cards, blanks, empty, total}`를 순수 함수로 만들고 테스트합니다.
- 검증: 빈 슬롯이 하나라도 있으면 `SLOT_INCOMPLETE`(WARNING) — "빈 슬롯 N개에 카드나 블랭크 커버가 지정되지 않았습니다." 출처 표기는 "사용자 결정 2026-09-27"입니다.
- BOM: `마감재 · 블랭크 커버 (XDM|SPX|VDM) × N` + 비고 "부품번호·기본 포함 여부 제조사 확인 필요"(UNVERIFIED)
- CSV·JSON 내보내기에 블랭크 수량과 완성도를 넣습니다.
- CLAUDE.md 호환성 계약에 한 줄을 추가합니다: "`placements` 예약값 `BLANK`(0.3x부터). 이전 버전은 이 값을 읽지 못함(신버전은 구파일 호환)."

## 4. 함께 정리
- `src/app.js`에서 쓰지 않는 옛 화면 함수(`cardsView`, `cardsViewV2`, `linksView`, `linksViewV2`, `reviewView` 등. 삭제 전 호출 여부를 grep으로 확인)를 지웁니다. `linksView`의 CT102-U·FT102-U 문구도 함께 사라집니다.
- 옛 화면 전용 CSS 선택자 중 확실히 쓰이지 않는 것만 지웁니다. 애매하면 남기고 목록만 보고합니다.

## 5. 검증
- `node --test tests/*.test.cjs` / `node scripts/build-product-index.cjs --check` / `node scripts/package-site.cjs` / `git diff --check`
- e2e: `scripts/e2e-smoke.cjs`에 로컬 playwright가 없으면 전역(`npm root -g`)과 `executablePath:/opt/pw-browsers/chromium`으로 폴백하게 고치고 **반드시 실제로 실행**합니다. 추가 시나리오:
  - 흰 빈칸 → 팝업에서 BLANK 선택 → 저장·새로고침 복원
  - "남은 칸 블랭크로 채우기" → 완성 배너 → 실행 취소 시 되돌아감
  - 제품군 변경 시 초기화
  - XDM-36·XDM-144·SPX-M3236·VDM-16X 03 단계 캡처(1280·390)
- 전후 비교: 01~06 단계를 1280·390에서 작업 전(`git stash` 없이 기준 커밋을 따로 빌드)과 작업 후로 캡처해 `docs/qa/CONFIGURATOR_AW_GLASS_QA.md`에 나란히 둡니다. 390px 가로 스크롤 없음, 콘솔 오류 0을 확인합니다.
- 휴대폰에서 예전에 고친 버그(슬롯 겹침, 뒤로 가기, XDM 판넬 손나사 잘림, 사진 슬롯 판넬 잘림, 0.14~0.18)가 다시 생기지 않았는지 해당 QA 문서 항목을 다시 확인합니다.

## 6. 기록
- 버전: push 직전 `git pull` 후 CHANGELOG 최상단 다음 빈 마이너 번호를 씁니다.
- `docs/implementation/CONFIGURATOR_AW_GLASS.md`(변경 이유, 영향, rollback), QA 문서, CHANGELOG, README, `index.html` 버전 표기, CLAUDE.md(버전 문단 + 계약 한 줄)
- Rollback: 이 버전 커밋을 revert합니다. BLANK가 든 저장 파일은 revert한 버전에서 열리지 않으므로, 되돌릴 때는 "블랭크를 흰 칸으로 바꿔 저장하는" 안내를 문서에 적습니다.
