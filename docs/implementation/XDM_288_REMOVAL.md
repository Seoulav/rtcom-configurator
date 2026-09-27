# XDM-288 삭제 및 VDM 출력 카드 스위칭 방식 표기 (0.29.0)

- 요청: 사용자 결정(서울영상테크 SI사업본부, 2026-09-27)
  1. VDM 출력 카드 HOS4-U는 "일반 스위칭" HDMI 출력 카드, HOS4S-UW는 "심리스 스위칭" HDMI 출력 카드다. 두 카드 모두 현행이므로 유지한다.
  2. XDM-288은 구성기에서 삭제한다. 46쪽판 카탈로그 LINE-UP에서 빠졌고 사양도 없기 때문이다. 제품정보(`data/products/xdm.json` lineup)는 이번에 건드리지 않는다.
- 근거: `docs/audit/PRODUCT_DIAGRAM_REVIEW_2026-09-27.md` §2 B3, 새 카탈로그(46쪽판) `docs/RTcom_catalogue_2026_46p.pdf`
- 기준 브랜치: `claude/relaxed-euler-mq1di9`(PR #23), 기준 커밋 `ccd37c4`(0.28.0 병합 + 검토 문서)

## A. VDM 출력 카드 문구 정리

- `src/catalog.js`의 VDM `output` 배열에서 카드 id는 그대로 두고 설명 문구만 바꿨다.
  - `HOS4-U`: `'HDMI'` → `'HDMI · 일반 스위칭'`
  - `HOS4S-UW`: `'HDMI · Scaling / Wall'` → `'HDMI · 심리스 스위칭 / 스케일링 / 월'`
- `data/products/vdm.json`
  - `lineup`의 HOS4-U 요약 맨 앞에 "일반 스위칭"을, HOS4S-UW 요약 맨 앞에 "심리스 스위칭"을 넣었다.
  - `issues`의 R6("HOS4-U가 46쪽판에서 빠짐")을 `status: "INFO"`로 바꾸고, 사용자 확인(2026-09-27)과 두 카드 모두 현행이라는 근거를 detail에 추가했다. 원래 조사 내용(48쪽판·46쪽판 대조 결과)은 지우지 않고 그대로 남겼다.
  - `sources`에 `{"code":"U","name":"서울영상테크 SI사업본부 확인", ...}`를 추가했다(`xdm-ctr100.json`의 U 항목과 같은 형식).
  - `packageStatus`는 그대로 `REVIEW REQUIRED`다(R1~R5는 이 결정과 무관한 별개 항목이라 남아 있음).

## B. XDM-288 삭제

### 호환성 계약 변경

| 항목 | 이전 | 이후 |
|---|---|---|
| 제품군·섀시·카드 | 3/22/26 | 3/21/26 |
| `catalogVersion` | `2026-09-18-draft.1` | 변경 없음 |
| JSON schema, LocalStorage key | 3, `rtcom.configuration.v1` | 변경 없음 |
| 슬롯 ID·`#matrix-configurator` 주소 | 변경 없음 | 변경 없음 |

- `catalogVersion`을 올리지 않았다. 모델을 지우는 변경이라 저장된 파일이 있으면 아래 호환성 처리로 안전하게 받는다.

### 코드 변경

- `src/catalog.js`: `XDM.models`에서 `'XDM-288'`을 지우고, `modelNotes`에서 같은 위치(마지막 항목)의 `'상세 사양 확인 예정'`을 함께 지웠다. 두 배열은 여전히 6개씩 1:1로 맞는다.
- `src/core.js`
  - `validate()`의 `if (state.model==='XDM-288') add('XDM_288_SPEC', ...)` 줄을 지웠다(더 이상 선택할 수 없는 모델이라 경고가 필요 없다).
  - `checkState(input)` 맨 앞에 XDM-288 호환성 처리를 추가했다: `input.family==='XDM' && input.model==='XDM-288'`이면 `input`을 `{...input, model:null, placements:{}, links:{}, portAssignments:{}, step:0, maxStep:0, slot:'in-a'}`로 바꿔치기하고, 알림 문구(`notice`)를 준비해 뒀다가 `checkState`가 반환하는 `result`에 `result.notice`로 붙인다.
  - 이 경로가 아니면(정상적인 모델이거나 다른 제품군) 기존 `제품군과 섀시 모델이 일치하지 않습니다` 검증을 그대로 통과한다 — 즉 XDM-288 **한 가지 모델명만** 예외로 다루고, 다른 잘못된 모델명은 여전히 거부된다.
- `src/app.js`
  - 로컬 저장 복원(`initialize()`)과 JSON 파일 불러오기(`#import-file` change 핸들러) 두 곳에서, `RtCore.parse()`가 반환한 state에 `notice`가 있으면 그 문구를 우선 보여주도록 고쳤다(`message=state.notice||'이 브라우저에 저장된 구성을 복원했습니다.'`, `announce(candidate.notice||'JSON 구성을 불러왔습니다. ...')`).

### 동작

- **새로 구성**: 섀시 선택 화면에 XDM 프레임이 6개(XDM-12/20/36/72/144/216)만 보인다. XDM-288을 고를 방법이 없다.
- **예전에 저장한 XDM-288 구성 복원**(로컬 저장·JSON 백업 모두 동일):
  1. 제품군은 XDM으로 유지된다.
  2. 섀시(모델)는 미선택 상태(`null`)로 바뀐다.
  3. 카드 배치·전송기 연결·포트 배정은 모두 비운다(예전 값은 버린다).
  4. 화면 상단 안내 문구에 "XDM-288은 구성기에서 제외되었습니다. 섀시를 다시 선택하세요."가 뜬다.
  5. 이전처럼 "제품군과 섀시 모델이 일치하지 않습니다" 오류로 복원 자체가 실패하지 않는다.
- **XDM-288이 아닌 다른 지원하지 않는 모델명**(예: 오타, 다른 제품군의 모델을 XDM에 넣은 경우)은 지금처럼 그대로 거부된다 — 이번 변경은 XDM-288 한 가지만 겨냥한 예외다.

## 되돌리는 방법

이 커밋(또는 이 작업을 담은 병합 커밋)을 revert하면 `src/catalog.js`의 XDM-288 모델, `src/core.js`의 XDM_288_SPEC 검증과 호환성 처리, `src/app.js`의 notice 표시가 모두 원래대로 돌아간다. `data/products/vdm.json`의 R6은 REVIEW REQUIRED로 되돌아가고 사양 문구도 원래대로 복원된다. XDM-288로 저장한 구성을 이 변경 이후에 새로 만든 사용자는 없으므로(모델 자체를 고를 수 없어졌기 때문) revert로 인한 데이터 손실 위험은 없다.
