# XDM-CTR100·XDM-CTR100 PSE "최대 전송거리" 사양 통합 QA (2026-09-28)

## 요청

- "최대 전송거리 3가지를 모두 합쳐줘"(XDM-CTR100 PSE "04 제품 사양" 화면 캡처, 100m·80m·150m 3행이 따로 표시됨)
- "05 주요기능에 PSE 관련 내용도 함축하고 케이블 사양은 삭제"
- "CTR100은 XDM-CT103 / CR-103 동일하게 같은 내용은 정리해" → XDM-CTR100 PSE에만 적용하던 정리를 XDM-CTR100(PSE 아닌 기본 모델)에도 동일하게 적용해 두 파일을 일관되게 유지

## 변경 내용

### `data/products/xdm-ctr100-pse.json`, `data/products/xdm-ctr100.json` (두 파일 동일하게 적용)

1. **`specifications` "최대 전송거리" 3행 → 1행 통합**
   - 기존: 100m(BELDEN 10GXE02 케이블 기준, source C) · 80m(CI6522 케이블 사용 시, source U) · 150m(Long Reach 모드, source M1) 3개 행
   - 변경: `value: "100"`, `unit: "m"`, `condition: "4K60Hz 4:4:4 기준(케이블별 상이, 최대 80~100m) · Long Reach 모드(딥 스위치 3번 ON) 시 1920x1080p 최대 150m"`, `source: "C"` 1개 행
   - 150m(Long Reach) 사실의 출처(M1)는 `dipSwitch.rows`(3번 스위치)에 그대로 남아 있어 근거를 잃지 않음
2. **`specifications` "권장 케이블"(CAT6a, CAT7) 행 삭제** — "케이블 사양은 삭제" 반영
3. **XDM-CTR100 PSE `features`만: PSE 관련 3개 항목 → 1개로 압축**
   - 기존 3개(PoE 전원 공급 지원 / XDM-CTR100·CT103·CR103과 짝 사용 / PSE-CTR100 연결 방향, 케이블 모델 인용 포함)를 "PoE 전원 공급(PSE) 지원 — CAT 케이블로 XDM-CTR100·벽부형 XDM-CT103/CR103에 신호·전원 동시 공급(CTR100은 PD 모드로 전원 케이블 불필요, CIS100·COS100 카드 직결은 불가), TX·RX 방향 모두 연결 가능"(source M1) 1개로 합쳤습니다. 케이블 모델(BELDEN 10GXE02 등) 인용은 뺐습니다.
   - XDM-CTR100(PSE 아님)의 `features`는 이미 PSE 관련 항목이 1개(PD 모드)뿐이라 추가 압축 대상이 없었습니다.

## 데이터 구조 확인 사항(작업 전 점검)

`src/products.js`의 "03 SIGNAL FLOW" 다이어그램(`extenderDiagram`)은 `specifications`에서 이름이 "전송거리"인 행을 모두 찾아 캡션을 만듭니다(`distanceSpecs`/`cableLabelFor`/`distanceLines`). 통합 전에는 3개 행이 각각 캡션 한 줄씩을 만들어 범례에 `join(' · ')`로 이어 붙였습니다. 통합 후에는 행이 1개이므로 캡션도 "최대 100m" 한 줄로 단순해집니다(Long Reach 150m 정보는 04 제품 사양 표의 condition과 06 딥 스위치 카드에는 남아 있고, 03 SIGNAL FLOW 범례에서만 빠짐). 이는 사용자가 요청한 "합치기"의 자연스러운 결과로 판단해 그대로 반영했습니다.

## 검증

- `python3 -c "json.load(...)"` 두 파일 JSON 유효성 확인
- `node scripts/build-product-index.cjs --check` → 제품 30개 검증 통과
- `node --test tests/*.test.cjs` → 43/43 통과
- `node scripts/package-site.cjs` → `dist/` 재생성
- `git diff --check` → 통과
- Playwright로 `#products/xdm-ctr100`, `#products/xdm-ctr100-pse` 전체 페이지 스크린샷 확인: 04 제품 사양에 "최대 전송거리" 1행만 표시, "권장 케이블" 행 없음, 03 SIGNAL FLOW 다이어그램·범례("최대 100m") 정상 렌더링, 06 딥 스위치 설정 카드(3번 Long Reach 150m) 그대로 유지

## 되돌리는 방법

이 문서와 짝인 커밋을 `git revert`하면 3행 분리 구조와 "권장 케이블" 행, PSE `features` 3항목이 복원됩니다.
