# 0.269.0 AV System Builder 연동 삭제 (2026-11-16)

## 1. 요청과 배경

- 사용자 요청 2026-11-16: "AV System Builder연동도 전부 삭제해줘". 같은 날 "알티컴 사이트에서 av포탈 연결되거나 언급되지 않게 전부 지워줘, 알티컴 사이트를 경쟁업체까지 오픈할 계획이야"(0.268)에 이어, 같은 계열의 내부 도구 연동도 공개 사이트에서 없애 달라는 요청입니다.
- 0.173(파일 내려받기)과 0.174(새 탭으로 바로 열기)에서 만든 기능입니다. 0.268 보고에서 "AV 빌더 링크는 AV Portal이 아니라 별도 도구라서 그대로 두었다"고 알렸고, 사용자가 이를 포함하도록 정했습니다.

## 2. 지운 것

| 파일 | 지운 내용 |
|---|---|
| `src/core.js` | `avBuilder(state)`(AV 빌더 구성도 JSON을 만드는 함수 약 60줄)와 `RtCore` 내보내기 항목, 관련 주석(AV 빌더 주소 포함) |
| `src/app.js` | AV 빌더 주소·origin 상수, `openInAvBuilder()`(새 탭 `?import=rtcom`을 열고 10초 안에 준비 신호가 없으면 파일 다운로드), 창 사이 메시지 처리(`window.addEventListener('message')`), "AV 빌더로 보내기" 안내 상자(`avBuilderPanel()`)와 03 ② 신호 입력·06 내보내기 두 곳의 호출, 버튼 동작 `av-builder-open`·`av-builder` |
| `src/styles.css` | `.rt-avb`·`.rt-avb-actions` 스타일 8줄과 다크 모드 덮어쓰기(다크 블록은 `scripts/tools/dark_tokens.cjs --apply`로 다시 생성, 선언 43개 → 41개) |
| `tests/core.test.cjs` | AV 빌더용 구성도 시험(약 18줄) |
| `scripts/e2e-smoke.cjs` | "AV 빌더용 파일 내려받기"와 "AV 빌더에서 바로 열기"(가짜 AV 빌더 화면으로 창 사이 메시지 흐름을 확인하던 18줄) |

- 공개 파일(`dist/`)에서 `av-system-builder`·`seoul-visual-tech`·"AV 빌더" 문구가 모두 없어졌습니다. 화면에서는 03 ② 신호 입력 아래와 06 내보내기 아래의 안내 상자와 버튼 2개가 사라집니다.
- 기능이 쓰던 데이터 저장 형식(`rtcom.configuration.v1`, schema 3)은 바꾸지 않았습니다. `portAssignments`의 신호명(`assignedDevice`)은 AV 빌더 연동 전용이 아니라 03 ② 신호 입력·보고서·장비 목록에서 쓰므로 남깁니다.

## 3. 그대로 둔 것(사용자 판단 필요)

- **공개 제품 데이터의 슬롯 정보**: 0.208에서 AV Portal·AV System Builder 요청으로 `data/products/xdm.json`·`spx.json`·`vdm.json`에 `slots`, 카드에 `slotType`·`compatibleFrames`·`io`를 더했습니다. 이 필드에는 두 도구의 이름이 없고 구성기·제품정보도 같은 값을 씁니다. "연동"이 이 데이터 제공까지 포함하는지 확인이 필요해 이번에는 건드리지 않았습니다.
- **내부 문서**: `docs/`, `CLAUDE.md`, `CHANGELOG.md`, `scripts/` 주석에는 AV 빌더·AV Portal 언급이 남아 있습니다(공개 사이트에는 올라가지 않음). 0.173·0.174 기록 문서(`SIGNAL_INPUT_0.173.md`, `docs/handoff/AV_BUILDER_RTCOM_IMPORT.md`)에는 "0.269에서 삭제됨" 표시를 달았고, `OPEN_ITEMS.md`의 "AV 빌더 쪽 작업 대기" 항목은 지웠습니다. GitHub 저장소가 경쟁업체에 공개 상태인지 확인이 필요합니다(0.268 보고와 같은 질문).
- AV Builder 저장소(`seoul-visual-tech/av-system-builder`) 쪽에 넣었을 수 있는 "rtcom 구성 받기" 코드는 이 저장소에서 알 수 없어 건드리지 않았습니다.

## 4. 재발 방지

- `tests/site.test.cjs`에 배포본(`dist/`) 전체 텍스트 파일에 AV 빌더 연동 흔적(`av-builder`·`AV 빌더`·`seoul-visual-tech`·`rt-avb`·`avbSession`)이 있으면 실패하는 시험을 더했고, 앱 소스에 `data-action="av-builder…"`와 창 메시지 수신기(`addEventListener('message')`)가 다시 생기지 않는지도 확인합니다.
- `tests/core.test.cjs`에 `RtCore.avBuilder`가 없고 `syncPorts`·`parse`·`csv`는 그대로인지 확인하는 시험을 더했습니다.
- 화면 시험에 03 ② 신호 입력과 06 내보내기 화면에 AV 빌더 안내 상자·버튼·문구가 없는지 확인하는 항목을 더했습니다.
- CLAUDE.md "저장소 역할"의 규칙을 "AV Portal을 언급·연결하지 않고 AV System Builder 연동도 두지 않는다"로 넓혔습니다.

## 5. 검증

- 단위 테스트 210개 통과(새 시험 2개 추가, 삭제한 시험 1개), `build-product-index --check` 33개 통과, 표기 통일 바뀔 곳 0건, 다크 블록 최신, 버전 검사 0.268 → 0.269, `git diff --check` 통과.
- 배포본(`dist/`)에서 AV 빌더·AV Portal·포털·포탈 언급 검색 결과 0개 파일.
- 화면 시험(`e2e-smoke`) 294/294 통과(삭제한 AV 빌더 확인 2개, 추가한 "AV 빌더 연동 없음" 확인 2개 포함).

## 6. 되돌리기

PR을 revert하면 0.173·0.174 기능이 그대로 돌아옵니다. 일부만 되살릴 때는 `src/core.js`의 `avBuilder`, `src/app.js`의 `avBuilderPanel`·`openInAvBuilder`·메시지 처리와 두 호출 위치, `src/styles.css`의 `.rt-avb` 규칙이 필요하며 다크 블록은 `dark_tokens.cjs --apply`로 다시 만듭니다.
