# 0.218 용어 검토 행 결정: 믹스 → 병합, Touch Screen → 터치스크린, 영문 원문 유지

## 요청

사용자 요청(2026-10-14): "다른 세션에서 이것저것 답변을 했는데 혹시 정리해서 다시 물어볼 게"

0.216(SPX-R6 크기·무게·어댑터)과 0.217(MR-4S 장착 카드)은 다른 세션이 이미 반영했으므로 빼고, 남은 결정 4건을 질문 창으로 물었습니다. 이 문서는 그중 0.189 용어 통일의 검토 행 3건을 다룹니다(`docs/implementation/TERMS_UNIFICATION_0.189.md` §3, `docs/audit/TERMS_REVIEW_2026-10-01_decisions.md` A01·A04·A08·A09). 나머지 1건(03 카드 슬롯 시안 C)은 다음 버전에서 반영합니다.

| 질문 | 답 |
|---|---|
| HD-13U·HD-210U 오디오 "믹스" 3곳 | 병합으로 통일 |
| SPX "Touch Screen" 6곳 | 터치스크린 |
| 짧은 영문 원문(QMS-88UX QUAD 모드명, "Fiber Optical Input"·"Pass-Through" 등) | 원문 유지 |

## 반영

| 파일 | 바뀐 문구 |
|---|---|
| `data/products/hd-13u.json` | 오디오 조건 "HDMI OUTPUT 1번에 믹스" → "HDMI OUTPUT 1번에 병합" |
| `data/products/hd-210u.json` | 05 주요 기능 "모든 출력에 믹스" → "모든 출력에 병합", 07 딥 스위치 설명 "믹스되어 나간다" → "병합되어 나간다" |
| `data/products/spx.json` | 05 주요 기능 "전면 Touch Screen으로 쉽게 제어" → "전면 터치스크린으로 쉽게 제어", 메인프레임 5종 요약의 `4.3"`·`7" Touch Screen` → `터치스크린` |

XDM·QMS-88UX의 "전면 LCD 터치 패널"은 조작부 전체를 가리키므로 그대로 둡니다(기준 A08: 조작부 전체는 터치 패널, 화면 자체는 터치스크린).

영문 원문 유지 결정에 따라 QMS-88UX 모드명 QUAD·WALL·DUAL과 사양 값 "Fiber Optical Input"(FT101-U·FT103-U-H), "Pass-Through"(CT104-U) 같은 짧은 영문 값은 바꾸지 않습니다. 이것으로 0.189 검토 40행은 모두 결정했습니다. 영문 분류명(1x4 HDMI 18Gbps Splitter 등)과 모델명 축약은 이전 "pass" 결정대로 그대로 둡니다.

`scripts/tools/unify_notation.cjs` 7번 규칙에 `Touch Screen` → `터치스크린`, "출력…에 믹스" → "출력…에 병합"을 더해, 같은 표기가 새로 들어오면 표기 검사가 "바뀔 곳"으로 알려 줍니다. `tests/site.test.cjs`에 두 규칙 검사를 더했습니다.

## 화면 영향

- HD-13U 04 제품 사양 오디오 조건, HD-210U 05 주요 기능·07 딥 스위치 설정, SPX 05 주요 기능·03 메인프레임 타일 요약 문구가 바뀝니다.
- 구성기 화면과 저장 형식(LocalStorage key, schema 3)은 바뀌지 않습니다.

## 검증

| 명령 | 결과 |
|---|---|
| `node --test tests/*.test.cjs` | 100개 통과(표기 규칙 검사 2줄 추가) |
| `node scripts/build-product-index.cjs --check` | 제품 32개 검증 통과 |
| `node scripts/package-site.cjs` | `dist/` 생성 |
| `node scripts/e2e-smoke.cjs` | 238/238 통과 |
| `node scripts/tools/unify_notation.cjs` | 바뀔 곳 0건 |
| `node scripts/check-version.cjs --against origin/main` | 0.218(main 0.217 + 1) |
| `git diff --check` | 문제 없음 |

## 되돌리기

이 PR의 병합 커밋을 `git revert`하면 0.217 문구로 돌아갑니다. 데이터 값과 저장 형식은 바뀌지 않으므로 되돌려도 다른 영향이 없습니다.
