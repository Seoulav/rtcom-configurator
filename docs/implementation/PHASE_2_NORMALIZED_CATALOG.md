# PHASE 2 구현 기록: 정규화 카탈로그와 카테고리 필터

기준 브랜치는 `codex/phase-2-normalized-catalog`이며 기준 커밋은 PHASE 1의 `1034c45`입니다. PHASE 1 브랜치에 직접 커밋하지 않고, 기존 카탈로그와 구성기를 어댑터로 연결했습니다.

## 구현 범위

- `src/product-catalog.js`가 기존 31개 제품 데이터를 공통 `Product` 계약으로 노출합니다.
- 5개 실제 카테고리에 `categoryRegistry`, 확장 스키마, 필터 정의를 등록했습니다. 빈 미래 카테고리는 등록하지 않았습니다.
- `VerificationStatus`와 `VerificationRecord`를 모든 제품에 부여했습니다. 확인되지 않은 정보는 `CATALOG_ONLY`, `NEEDS_REVIEW`, `CONFLICTED`로 남겼습니다.
- 관계는 `targetProductId` 기반으로만 기록했습니다. 확인된 CTR-100, CT-103의 XDM 관계만 등록했습니다.
- `src/search-synonyms.js`와 `src/product-search.js`가 동의어, `1×4`/`1x4`, `100m`/`100 m`, `4K60`/`4K 60Hz` 정규화와 URL 상태를 제공합니다.
- `src/catalog-validator.js`와 `scripts/validate-catalog.cjs`가 ID, 카테고리, 참조, 포트 방향, 관계, 검증 상태를 검사합니다.
- 제품 라이브러리는 정규화 데이터를 사용하고, 결과 수와 동적 필터를 표시합니다. `q`, `category`, 반복 `f` query parameter를 새로고침과 뒤로/앞으로 탐색에 사용합니다.

구성기 코드, 슬롯 ID, 저장 키, JSON 구조, 카탈로그 버전은 변경하지 않았습니다. `src/library.js`에는 기존 정적 테스트와 마이그레이션 추적을 위한 제품 ID 목록 주석만 남겼고, 실행 시 데이터는 정규화 카탈로그에서 한 번만 읽습니다.
