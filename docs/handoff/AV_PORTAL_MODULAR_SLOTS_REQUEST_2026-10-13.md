# RTCOM 모듈형 장비 슬롯·카드 데이터 추가 요청

- 요청: AV Portal / AV System Builder 담당 (2026-10-13)
- 대상 저장소: `Seoulav/rtcom-configurator` — `data/products/xdm.json`, `spx.json`, `vdm.json` (우선), `spx-r6.json` (2순위)
- 목적: AV System Builder에서 XDM·SPX·VDM 프레임에 **슬롯 번호별로 카드를 장착**하고, 장착한 카드의 단자로 결선할 수 있게 한다.

## 1. 배경

AV Portal은 RTCOM 공개 제품정보(`https://seoulav.github.io/rtcom-configurator/data/products/index.json`)를 단일 원본으로 동기화한다. **AV Portal에서는 RTCOM 데이터를 고치지 않는다.** 그래서 이 데이터는 RTCOM 원본에 있어야 한다.

현재 시리즈 JSON에는 다음만 있다.

| 시리즈 | 카드 정보 | 슬롯 수 |
|---|---|---|
| XDM | `lineup[]`의 `summary` 문장(예: "HDMI v2.0 입력 4포트 · 오디오 병합/추출 4 …") | **없음.** 채널 수(12×12 …)와 `슬롯당 포트 4`만 있음 |
| SPX | 같음 | 메인프레임 `summary` 문장 안에만 있음(예: M3236 "입력 슬롯 4 · 출력 슬롯 3") |
| VDM | 같음 | **없음.** 채널 수와 `슬롯당 포트 4`만 있음 |

문장만으로는 기계가 카드 단자·슬롯 수를 알 수 없다. 그래서 Builder는 지금 이 프레임들을 **단자 없이** 놓고 "카드 구성 미정" 경고만 띄운다.

## 2. 요청 내용 — 필드 추가만

**기존 키(`model`, `kind`, `summary`, `rackUnits` 등)는 이름·값·순서를 바꾸지 않는다.** 아래 필드를 `lineup[]` 항목에 **추가**만 한다. AV Portal 동기화(`rtcom-adapter.mjs`)는 모르는 키를 무시하므로 추가만 하면 Portal 상세 화면은 그대로다.

### 2.1 메인프레임 항목(`kind: "메인프레임"`)에 `slots`

```json
{
  "model": "SPX-M3236",
  "kind": "메인프레임",
  "summary": "…기존 그대로…",
  "rackUnits": 7,
  "slots": {
    "input": 4,
    "output": 3,
    "source": "C",
    "verification": "VERIFIED"
  }
}
```

| 키 | 값 | 설명 |
|---|---|---|
| `slots.input` | 정수 ≥ 0 | 입력 카드 슬롯 수 |
| `slots.output` | 정수 ≥ 0 | 출력 카드 슬롯 수 |
| `slots.shared` | 정수 ≥ 0 (선택) | 입력·출력 카드를 **아무거나** 꽂을 수 있는 슬롯이 있으면 그 수. 없으면 키를 넣지 않는다 |
| `slots.source` | 이 저장소의 출처 기호 | `specifications[]`·`io[]`에서 쓰는 것과 같은 출처 표기 |
| `slots.verification` | `VERIFIED` / `FOUND` / `REVIEW REQUIRED` | 이 저장소의 기존 검증 표기와 같은 뜻 |
| `slots.note` | 문자열 (선택) | 예: "슬롯 번호는 후면 왼쪽부터 IN1~IN4" |

- Builder는 슬롯 번호를 `IN1…INn`, `OUT1…OUTm`(`shared`가 있으면 `S1…`)으로 매긴다. 후면 실제 번호와 다르면 `note`에 적어 달라.
- **채널 수 ÷ 슬롯당 포트로 계산해 넣지 않는다.** 예: XDM-12는 12×12·슬롯당 4포트라 3/3으로 보이지만, 매뉴얼·카탈로그로 확인한 값만 넣는다. 확인이 안 되면 `slots`를 넣지 않거나 `verification: "REVIEW REQUIRED"`로 둔다.
- XDM-288처럼 사양 자체가 없는 모델은 넣지 않는다.

### 2.2 카드 항목(`kind: "입력 카드"` / `"출력 카드"`)에 `slotType`, `compatibleFrames`, `io`

```json
{
  "model": "SPX-HOS10",
  "kind": "출력 카드",
  "summary": "…기존 그대로…",
  "slotType": "output",
  "compatibleFrames": ["SPX-M810", "SPX-M1620", "SPX-M3236", "SPX-M2472", "SPX-M24120"],
  "io": [
    { "group": "Video", "connector": "HDMI", "signal": "HDMI", "direction": "OUT", "quantity": "10", "protocol": "HDMI 2.0b", "condition": "", "source": "C", "verification": "VERIFIED" },
    { "group": "Audio", "connector": "3-pin 피닉스", "signal": "Analog Audio", "direction": "OUT", "quantity": "2", "protocol": "", "condition": "", "source": "C", "verification": "VERIFIED" }
  ]
}
```

| 키 | 값 | 설명 |
|---|---|---|
| `slotType` | `"input"` / `"output"` | 꽂히는 슬롯 종류. `kind`와 같은 뜻이지만 기계 판정용으로 따로 둔다 |
| `compatibleFrames` | 메인프레임 `model` 배열 | 장착 가능한 프레임. 시리즈 전체에 호환되면 시리즈의 모든 메인프레임을 나열한다(생략·와일드카드 금지) |
| `io` | **제품 상세의 `io[]`와 같은 행 형식** | 카드 **1장**의 물리 단자. 영상 단자뿐 아니라 오디오 추출·제어(RS-232)·PoE 등 카드 패널에 있는 단자를 모두 적는다 |

- `io` 행은 단품 제품(`hd-104u.json` 등)의 `io[]`와 **키·표기 방식을 똑같이** 쓴다. Portal의 단자 변환 규칙이 그 형식을 그대로 읽는다.
- `quantity`는 카드 1장 기준 개수다. 모르면 빈 문자열로 두고 지어내지 않는다.
- `direction`은 `IN` / `OUT` / `BIDIR`. 예: XDM-CIS100의 RS-232 패스스루처럼 방향이 매뉴얼로 정해지면 그대로, 모르면 `verification: "REVIEW REQUIRED"`.
- 카드가 다른 시리즈 카드와 호환되면(예: VDM 카드를 다른 프레임에 장착) `compatibleFrames`에 그 프레임 모델도 넣는다.

### 2.3 (2순위) `spx-r6.json` 모듈 칸

`spx-r6`는 `itemType: PRODUCT`이고 `io[]`에 "모듈 칸마다 1개" 행(HDMI ×6, RJ-45 ×6)이 있다. Portal은 이 행을 슬롯으로 분류해 단자를 만들지 않는다. 가능하면 같은 방식으로 표현해 달라.

```json
"slots": { "shared": 6, "source": "S1", "verification": "VERIFIED", "note": "모듈 칸 1~6. SPX-TX 또는 SPX-RX 모듈 장착" }
```

- 최상위에 `slots`를 추가하고, 장착 가능한 모듈 모델(`SPX-RX/TX`의 TX·RX 각각)과 모듈 1개의 `io`를 알려 주면 된다. 모듈이 별도 제품(`spx-rx-tx.json`)이므로 그 파일의 `io`를 재사용해도 된다는 메모만 있어도 충분하다.
- 기존 `io[]` 행은 지우지 않는다.

## 3. 지켜 줄 것

1. **지어내지 않는다.** 근거(카탈로그·매뉴얼·제조사 제공 자료)로 확인한 값만 넣는다. 모르면 비우거나 `REVIEW REQUIRED`.
2. **기존 키·값을 바꾸지 않는다.** 추가만 한다. 특히 `summary`는 Portal 상세 "제품군 구성" 표에 그대로 나온다.
3. 이 저장소의 기존 검증 스크립트·테스트·`index.json` 생성 절차를 그대로 통과시킨다. 공개 경로(`data/products/*.json`) 형식이 바뀌면 안 된다.
4. 모델명은 문서의 표기를 직접 읽고 쓴다. 이름이 비슷한 다른 모델(예: `HOS4-U`와 `HOS4S-UW`)의 값을 옮기지 않는다.

## 4. 완료 조건

- [ ] XDM·SPX·VDM 메인프레임마다 `slots`(확인 불가 모델은 사유를 PR에 기록)
- [ ] XDM·SPX·VDM 입력·출력 카드마다 `slotType`, `compatibleFrames`, `io`
- [ ] (2순위) `spx-r6.json` 모듈 칸 `slots`
- [ ] 이 저장소 검증 통과, Pages 공개 JSON에서 새 필드 확인
- [ ] PR 본문에 근거 자료(문서명·쪽)와 확인하지 못한 항목 목록

## 5. 이후 AV Portal 쪽 일 (참고)

1. `node beta/sync-rtcom.mjs`로 동기화 → 새 필드가 `beta/site/rtcom/raw/products/`에 들어온다.
2. Builder 라이브러리 생성기가 `slots`·카드 `io`를 읽어 프레임 슬롯 정보와 카드 단자를 `builder-library.json`에 싣는다.
3. Builder 장비 설정 창에서 슬롯 번호별로 카드를 고르면 카드 단자가 노드에 생긴다.

질문이나 형식 변경 제안은 AV Portal 담당에게 전달해 달라. 형식을 바꿀 필요가 있으면 **바꾸기 전에** 합의한다.
