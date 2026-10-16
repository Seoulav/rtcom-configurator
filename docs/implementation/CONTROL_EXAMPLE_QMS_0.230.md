# QMS-44UX·QMS-88UX AMX 통합 제어 커맨드 예시 카드 (0.230)

사용자 요청 2026-10-16: "QMS 시리즈도 다 진행해줘"(0.229 HDS-42MU·HDS-21U 카드의 확장, `docs/implementation/CONTROL_EXAMPLE_0.229.md`).

## 1. 무엇을 만들었나

제품정보 QMS-44UX·QMS-88UX 상세 맨 아래(06 화면 구성 모드 다음, 번호 07)에 "AMX 통합 제어 커맨드 예시" 카드를 더했습니다.

- **입력 × 출력 라우팅 표**: 44UX 4×4, 88UX 10×10(입력 01~08과 Q1·Q2, 출력 01~10). 칸을 여러 개 눌러 경로를 고르면 매뉴얼 형식의 명령 한 줄로 합칩니다.
  - 여러 경로는 콤마로 잇습니다: `*255CI04O01,I02O02!`
  - 같은 입력에서 이어진 출력 3개 이상은 범위로 줄입니다: `*255CI01O01-10!`(2개는 따로 적습니다)
  - 44UX는 한 입력이 모든 출력에 이어지면 `A` 명령으로 바꿉니다: `*01AI01!`
- 도구 줄: "모든 출력에 연결"(입력 선택), "선택 지우기", "매뉴얼 예시"(`I04O01, I02O02` 복원). 88UX는 "동작" 선택으로 연결(C)·연결 해제(D)를 바꿉니다.
- 선택한 경로의 토큰 색 설명, HEX(Enter 0x0D 포함), 복사 버튼.
- 88UX 프리셋 번호(01~20)를 고르면 불러오기(`PC`)·저장(`PS`)·삭제(`PR`) 커맨드가 나옵니다.
- AMX NetLinx 예제: `SET BAUD 115200,N,8,1 485 DISABLE`과 경로·프리셋 불러오기 버튼 이벤트.
- 선택은 이 브라우저에만 기억합니다(`rtcom.controlExample.<제품 id>`).

## 2. 근거와 한계

| 항목 | QMS-44UX | QMS-88UX |
|---|---|---|
| 형식 | `*` + 제품 ID + 명령 + 데이터 + `!` + Enter(CR) (25쪽) | 같음(28쪽) |
| 제품 ID | `01`(01~99) | `255`(01~255) |
| 통신 | 115200bps, 패리티 None, 데이터 8비트·스톱 1비트 고정(15쪽) | 115200bps 8N1이 공장 출고값, 보레이트·데이터 비트·스톱 비트·패리티 변경 가능(14쪽) |
| 연결 | `C` 여러 경로, 예 `*01CI04O01, I02O02!`(28쪽) | `C` 여러 경로·범위, 예 `*255CI04O01, I02O02!`·`*255CI01O01-10!`(31쪽) |
| 한 입력 → 전체 | `A`, 예 `*01AI01!`(28쪽) | 범위로 표현 |
| 연결 해제 | 확인 못 함 | `D`, 예 `*255DI04O01!`(31쪽) |
| 프리셋 | 확인 못 함 | `PC`·`PS`·`PR` 01~20(36·37쪽) |

- 넣지 않은 것: 멀티뷰(Q)·월(OW)·화면 모드(WM)·해상도(TC)·OSD·테스트 패턴·네트워크·보레이트(@) 등 나머지 명령(44UX 26~32쪽 코드표, 88UX 30~40쪽). 화면에 한계로 밝혔습니다.
- 입력 Q1·Q2는 88UX 31쪽 데이터 형식("Input Number 01~08, Q1, Q2")에 맞춰 `IQ1`·`IQ2`로 적었습니다. 장비에서의 동작은 확인이 필요하다고 화면에 적었습니다.
- 콤마 앞 공백은 매뉴얼 예시에 있는 경우(`I04O01, I02O02`)와 없는 경우(`I01O01,I02O02`)가 모두 있어, 공백 없는 쪽으로 만들었습니다.
- 매뉴얼은 이미지형 PDF라 글자 추출이 되지 않아, 해당 쪽을 이미지로 렌더링해 직접 읽었습니다.
- QMS 제품은 딥 스위치·EDID 로터리 카드가 없어 카드 번호가 07입니다(HDS는 08).

## 3. 구조

`src/control-example.js`의 `mount()`가 제품 JSON `controlExample.kind === "matrix"`이면 `mountMatrix()`로 가고, 아니면 HDS 방식(드롭다운 + 볼륨)입니다. 순수 함수 `routeCommand`·`presetCommand`는 Node 테스트에서도 씁니다. 데이터 필드: `productId`·`productIdNote`·`inputCodes`·`outputCodes`·`defaultRoutes`·`commands`(`disconnect`·`oneToAll`·`preset.max`)·`serial`(`baud`·`parity`·`dataBits`·`stopBits`·`confirmed`)·`amxDevice`·`manualExample`·`lead`·`source`·`limits`.

## 4. 검증

- `tests/control-example.test.cjs` 15개(기존 10 + QMS 5: 매뉴얼 예시 일치, 범위 묶기, 프리셋, 44UX A 명령, 통신 설정).
- `scripts/e2e-smoke.cjs`: 두 제품에서 예시 경로, 칸 추가, "모든 출력에 연결"(88UX `*255CI01O01-10!`, 44UX `*01AI01!`), 프리셋 3종(88UX만), AMX 115200, 가로 넘침 없음.
- 화면: `docs/qa/control-example-0.230/`(PC·휴대폰 390px).

## 5. 되돌리기

`src/control-example.js`의 `mountMatrix`와 매트릭스 순수 함수·`mount()` 분기를 지우고, `data/products/qms-44ux.json`·`qms-88ux.json`의 `controlExample`, `src/styles.css`의 `rt-ce-grid-matrix` 이하 블록, 테스트·e2e 추가분을 되돌립니다(HDS 카드는 영향 없음).
