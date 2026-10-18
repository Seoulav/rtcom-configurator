# 알티컴 제품 직렬 8N1 공통 확정: XDM·HDS 반영 (0.250.0)

## 1. 요청과 결정

- 사용자 확인 2026-10-18: 질의서 23번(XDM 통신 데이터 비트가 8비트가 맞는지)에 "8비트 맞아 알티컴은 전부 동일해"라고 답했습니다.
- 알티컴에 보낼 질문을 한 통으로 합치는 중이었고(통합 메일 D-1~D-4 포함), 이 답으로 23번과 26번 ②(HDS 데이터 비트·패리티·스톱 비트)는 질문에서 뺍니다.
- 해석: "알티컴은 전부 동일"을 알티컴 제품의 직렬 형식이 모두 같다(8N1)는 뜻으로 읽었습니다. 다른 제품은 이미 매뉴얼로 8N1이 확인되어 있고(QMS-44UX·QMS-88UX·VDM·SPX), XDM은 패리티 None·스톱 1비트가 가이드 67쪽에 있었으므로 데이터 비트만 비어 있었습니다. HDS 두 제품은 직렬 설정 전체가 비어 있어 같은 확인으로 8N1을 적었습니다.

## 2. 변경

- `data/products/xdm.json`: `controlExample.serial.confirmed`를 "데이터 8비트는 사용자 확인 2026-10-18(알티컴 제품 공통), 패리티 None·스톱 1비트는 가이드 67쪽 …"으로 바꿨습니다("가이드에 없어 일반값으로 적음" 삭제).
- `data/products/hds-21u.json`·`hds-42mu.json`: `serial`에 `parity: N`·`dataBits: 8`·`stopBits: 1`·`confirmed`("8N1은 알티컴 제품 공통(사용자 확인 2026-10-18)")를 더했습니다. 통신 속도 9600은 매뉴얼 값 그대로입니다.
- `src/control-example.js`: HDS 제품 화면의 "매뉴얼에 적혀 있지 않아 넣지 않은 것: 데이터 비트·패리티·스톱 비트(코드의 8N1은 일반값), …" 안내를 `serial.confirmed`가 없는 제품에만 보여 주도록 바꾸고, 근거 줄에 "통신 속도 9600bps(8N1은 알티컴 제품 공통(사용자 확인 2026-10-18))"을 더했습니다. 뮤트 명령(42MU)·볼륨 허용 범위 안내는 그대로 남습니다.
- 테스트: `tests/control-example.test.cjs`에 알티컴 7개 제품이 모두 8N1이고 AMX 코드에 같은 통신 설정이 들어가는지 확인하는 시험 1건, `scripts/e2e-smoke.cjs`에 HDS·XDM 화면 안내 문구 시험 2건을 더했습니다.
- 문서: `docs/handoff/RTCOM_QUESTIONS_2026-10-16.md`(23번 삭제, 26번 ② 삭제, 현황표 13건), `docs/RTCOM_MANUFACTURER_DATA_REQUEST.md` §5 "답" 칸, `docs/handoff/OPEN_ITEMS.md`.

## 3. 경계

- 알티컴이 직접 답한 것이 아니라 사용자 확인입니다. 화면 문구와 문서에 "사용자 확인"으로 적었고, 알티컴 회신이 다르면 이 값을 고칩니다.
- 남은 확인: HDS-42MU 뮤트 코드와 해제 방법, 볼륨 허용 범위(질문 26번 ①·②).
- 바뀌지 않은 것: QMS·VDM·SPX 제품 데이터(이미 매뉴얼 근거로 8N1 확인됨), 통신 속도 값.

## 4. 검증

- `node --test tests/*.test.cjs`, `node scripts/build-product-index.cjs --check`, `node scripts/package-site.cjs` 후 e2e, `node scripts/tools/unify_notation.cjs`, `check-version.cjs --against origin/main`, `git diff --check`(병합 직전 결과는 PR 설명에 적습니다).

## 5. 되돌리기

- 이 PR을 되돌리면 XDM은 "가이드에 없어 일반값", HDS 두 제품은 "일반값(8N1) 현장 확인" 안내로 돌아갑니다. 변경은 위 데이터 3개 파일과 `src/control-example.js`의 안내 문구 두 줄에 한정됩니다.
