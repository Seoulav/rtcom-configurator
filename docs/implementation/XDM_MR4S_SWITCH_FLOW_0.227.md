# 0.227 XDM-MR4S 랙 장착 스위치·Signal Flow

## 배경

- **사용자 요청(2026-10-16):** "다음 제안대로 해". 0.223 보고의 다음 단계 제안은 아래 세 가지였습니다.
  1. 사양 자료 제공: 사용자가 자료를 주어야 하는 일이라 이번 작업에서 뺐습니다.
  2. 구성기 BOM에 XDM-MR4S 반영
  3. XDM-MR4S 03 Signal Flow 그림
- **사용자 결정(질문 창):** "전송기 단계 선택 스위치 (권장)"
- **사용자 확인:**
  - "MR4S에 CTR100카드를 꽂아서 원격으로 전원공급 불가능해"
  - "MR4S는 슬롯카드를 통해서 전송기전원공급이 가능해 그러나 XDM-MR4S는 원격전원 공급이 불가능해 명심해"

## 반영 내용

### 구성기(`src/core.js`, `src/app.js`, `src/styles.css`)

- **상태 항목 `mr4s`(true/false, 기본 false):**
  - XDM 제품군에서만 켤 수 있습니다. 다른 제품군에서는 늘 꺼짐입니다.
  - 제품군을 바꾸면 꺼집니다.
  - 저장 파일(schema 3)에 들어가며, 이 항목이 없는 예전 파일은 꺼짐으로 읽습니다.
  - true/false가 아닌 값은 오류로 막습니다.
- **수량 계산 `RtCore.mr4sUnits(state)`:**
  - 포트에 배정한 XDM-CTR100(TX·RX)·XDM-FT101·XDM-FR101 대수를 셉니다.
  - 벽부형 XDM-CT103·CR103과 HDMI 카드 PSE 쌍은 MR4S 카드가 아니므로 세지 않습니다.
  - 켜져 있으면 프레임 수는 대수를 4로 나눈 올림값입니다.
- **BOM:** 켜져 있으면 "전송기 프레임 · XDM-MR4S (CTR100·FT101·FR101 카드 4장)" 행을 넣습니다.
- **전원:** 켜져 있으면 `ctrPower`가 0을 돌려줍니다. XDM-MR4S에 꽂은 CTR100은 원격 전원 공급이 되지 않으므로, XDM-PSU·POH·PHX를 BOM에 넣지 않고 XDM-PSU 전원 안내도 숨깁니다.
- **검증 안내:**
  - `XDM_MR4S`(VALID): 장착 대수, 프레임 수, 프레임 전원 사용을 안내합니다.
  - `XDM_MR4S_EMPTY`(WARNING): 켰지만 연결한 전송기가 없을 때 알립니다.
- **04 전송기 화면:** XDM 전송기가 있을 때 "XDM-MR4S 랙 장착" 스위치(`role="switch"`) 상자와 제품정보 링크가 나옵니다.

### 제품정보

- **XDM-MR4S 03 Signal Flow(`src/products.js` `mr4sDiagram`):**
  - 뒷면 사진의 장착 예대로 그렸습니다. XDM-FIS100 ↔ 광 ↔ FT101 ← 소스, FOS100 ↔ 광 ↔ FR101 → 디스플레이, CIS100 ↔ HDBaseT ↔ CTR100(TX 모드) ← 소스, COS100 ↔ HDBaseT ↔ CTR100(RX 모드) → 디스플레이입니다.
  - 아래쪽에 프레임 전원 POWER 1·2를 표시했습니다.
- **XDM-MR4S 데이터:**
  - 05 주요 기능에 "원격 전원 공급 불가(프레임 전원 사용)"를 추가했습니다.
  - 04 사양에 "원격 전원 공급: 불가" 행을 추가했습니다.
  - 개요에 MR-4S와의 차이를 적었습니다.
  - 출처 U2를 추가했습니다.
- **MR-4S 데이터:**
  - 05 주요 기능에 "슬롯 카드를 통해 전송기 전원 공급 지원"을 추가했습니다.
  - 04 사양에 "전송기 전원 공급: 가능 (슬롯 카드를 통해 공급)" 행을 추가했습니다.
  - 개요 문장과 출처 U3를 추가했습니다.

## 검증

- `node --test tests/*.test.cjs`: `tests/core.test.cjs`, `tests/site.test.cjs`에 0.227 검사를 추가했습니다.
- `node scripts/build-product-index.cjs --check`
- `node scripts/package-site.cjs`
- `node scripts/e2e-smoke.cjs`: Signal Flow 그림 검사와 04 스위치를 켰다 끄는 검사를 추가했습니다.
- `node scripts/tools/unify_notation.cjs`(바뀔 곳 0건)
- `node scripts/check-version.cjs --against origin/main`
- `git diff --check`

## 되돌리기

`git revert <0.227 커밋>`을 실행한 뒤 Pages 배포를 다시 실행합니다. 0.226 이전 판의 상태 검사(`checkState`)는 모르는 항목을 복사하지 않으므로, 스위치를 켜고 저장한 파일도 오류 없이 열리고 `mr4s`만 빠집니다(XDM-MR4S 행이 사라지고 XDM-PSU 계산이 돌아옴).
