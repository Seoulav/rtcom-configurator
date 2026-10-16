# AMX 통합 제어 커맨드 예시 카드 (0.228)

사용자 요청 2026-10-16: "HDS-42MU 제품 정보페이지에 AMX 통합제어를 통해서 커맨드제어 예시 값을 나오게 하고 싶어 … 일단 HDS-42MU 먼저 하고 HDS-21U, 그다음 일체형 매트릭스, 모듈러 매트릭스까지 확장". 이어서 "in4을 out1로 경우수를 라우팅했을때 명령어가 나오는 구조로".

## 1. 무엇을 만들었나

- 제품정보 HDS-42MU 상세의 딥 스위치 카드 다음에 "08 AMX 통합 제어 커맨드 예시" 카드를 더했습니다.
- **입력·출력 드롭다운**(사용자 확인 2026-10-16 "입력 선택·출력 선택 드롭다운 좋아")과 표가 서로 연동됩니다. 드롭다운을 바꾸면 표의 선택 칸이 바뀌고, 표 칸을 누르면 드롭다운이 바뀝니다.
- **입력 4 × 출력 2 라우팅 표**: 8칸마다 그 경로의 명령어(예: IN 4 → OUT 1 = `*000CI04O01!`)가 바로 보입니다. 칸을 누르면 아래에 그 경로의 토큰 설명(시작·제품 ID·명령·입력·출력·끝), HEX, 복사 버튼이 나옵니다. "전체 8개 복사"도 있습니다.
- **볼륨 커맨드**: dB를 입력하면 `*000Vxx!`로 바뀝니다(50이 0dB, 코드 1당 0.5dB).
- **AMX NetLinx 예제**: 선택한 경로와 볼륨을 `SEND_STRING dv…,"'…',$0D"`로 보내는 코드를 만들어 줍니다.
- 선택은 이 브라우저에만 기억합니다(`rtcom.controlExample.<제품 id>`, 구성 저장 key와 무관).

## 2. 근거와 한계

- 근거: HDS-42MU 사용자 매뉴얼 9쪽 "RS-232C Control"(`output/design/assets/docs/hds-42mu-manual.pdf`). 9600bps, `*` + 제품 ID `000` + `C` + `Ixx` + `Oxx` + `!` + Enter(0x0D), 볼륨 `*000V54!`(0dB → 2dB).
- 매뉴얼에 없어 만들어 넣지 않은 것: 데이터 비트·패리티·스톱 비트(AMX 코드의 `N,8,1`은 일반값이라고 화면에 밝힘), 뮤트 명령, 볼륨 허용 범위(코드 00~99는 두 자리 형식에서 계산한 값), 제품 ID 변경 방법.
- AMX 코드는 문법 예시입니다. 장치 번호(`5001:1:0`)와 버튼 번호는 현장에 맞게 바꿔야 합니다(화면에도 안내).
- 참고: 기존 딥 스위치 카드 note에는 "뮤트할 수 있다"는 문장이 있으나 매뉴얼 9쪽에는 뮤트 명령이 없습니다(리모콘에는 MUTE 버튼). 이번에는 손대지 않았고 `docs/handoff/OPEN_ITEMS.md`에 확인 항목으로 남깁니다.

## 3. 구조(다음 제품으로 확장)

- `src/control-example.js`(`RtControlExample`): 순수 함수(`switchCommand`·`volumeCommand`·`volumeCode`·`toHex`·`amxCode`)와 화면 그리기.
- 제품 JSON의 `controlExample`(`productId`·`inputs`·`outputs`·`volume`·`serial`·`amxDevice`·`lead`·`source`)이 있으면 `src/products.js`의 `controlExampleSection()`이 카드 틀을 만들고, 제품정보 화면이 그려진 뒤 `RtControlExample.mountAll(body)`가 채웁니다.
- 확장 순서(사용자 지시): HDS-21U → 일체형 매트릭스(QMS-44UX·QMS-88UX) → 모듈러 매트릭스(XDM·SPX·VDM). HDS-21U 매뉴얼도 같은 프로토콜(9600bps, `*000CI02O01!`, `*000V54!`)이라 JSON 값만 더하면 됩니다. QMS·XDM 등은 명령 문법이 다를 수 있어 해당 제품 명령 가이드를 받은 뒤 `kind`별 생성기를 추가합니다.

## 4. 검증

- `tests/control-example.test.cjs` 6개(매뉴얼 예시 `*000CI02O02!`·`*000V54!`, 범위 보정, HEX, AMX 코드, 제품 데이터).
- `scripts/e2e-smoke.cjs`: 라우팅 표 8칸, IN 4 → OUT 1 선택 시 `*000CI04O01!`·-3dB `*000V44!`·AMX 코드 갱신, 카드 번호 08, 가로 넘침 없음.
- 화면: `docs/qa/control-example-0.228/`(PC), 휴대폰(390px) 가로 넘침 없음.

## 5. 되돌리기

`src/control-example.js`·`tests/control-example.test.cjs` 삭제, `data/products/hds-42mu.json`의 `controlExample` 삭제, `src/products.js`의 `controlExampleSection`·`mountAll` 호출, `index.html`·`scripts/package-site.cjs`·`tests/site.test.cjs`·`tests/layout-sim.test.cjs`의 스크립트 등록, `src/styles.css`의 `rt-ce-*` 블록을 되돌립니다.
