# PHASE 2 QA

## 자동 검증

- 기존 테스트 19개와 PHASE 2 테스트 7개를 함께 실행하여 **26/26 PASS**를 확인했습니다.
- 제품 수, ID·slug 중복, 카테고리 스키마, 이미지·문서 참조, 관계 대상, 검증 상태를 검사했습니다.
- 동의어와 `1x4`, `1×4`, `100m`, `100 m`, `4K60`, `4K 60Hz` 검색을 검사했습니다.
- 단일·복수 필터, 검색어와 필터 결합, 결과 수와 카드 수 일치를 검사했습니다.
- URL query 직렬화·복원과 알 수 없는 필터 제거를 검사했습니다.
- 기존 XDM 구성 저장, JSON schema 3, LocalStorage 계약 테스트가 계속 통과했습니다.
- `scripts/validate-catalog.cjs` 결과는 31 products / 5 categories / 0 errors / 0 warnings입니다.
- 정적 패키지 생성과 `git diff --check`가 통과했습니다.

## 브라우저 확인 항목

`/products`에서 31개 카드와 6개 탭을 확인하고, 카테고리 선택, 필터 체크, 검색, 새로고침, 뒤로/앞으로 탐색으로 query 상태가 유지되는지 확인합니다. `/tools/matrix-configurator`와 기존 `#matrix-configurator` 앵커의 구성 동작도 기준 테스트로 회귀를 확인합니다.

PHASE 2에서는 GitHub Pages 공개 배포를 수행하지 않았습니다. 배포 전에는 `dist/`의 직접 경로 항목과 base path를 별도 검증해야 합니다.
