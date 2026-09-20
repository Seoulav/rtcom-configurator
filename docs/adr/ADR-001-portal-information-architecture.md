# ADR-001: 기존 사이트를 유지하는 통합 포털 정보구조

- 상태: Proposed
- 결정일: 2026-09-20
- 기준 커밋: `f7951ef0bb5a4294c9e68debc43de333a3bea707`

## Context

현재 사이트는 31개 제품·시리즈 라이브러리와 6단계 매트릭스 구성기가 한 문서에 이어진 정적 사이트다. 제품 라이브러리는 `library.js`의 로컬 배열을 사용하고 구성기는 `catalog.js`, `core.js`, `app.js`를 사용한다. 화면 연결은 스크롤이지만 데이터 계약은 분리되어 있다.

사이트에는 이미 제품 이미지, 상세 dialog, 카탈로그 PDF, 실제 XDM 후면과 슬롯, 카드 배치, 검증, Undo/Redo, LocalStorage, JSON·CSV·인쇄/PDF라는 중요한 사용자 계약이 있다. 정보구조를 바꾸면서 이 계약을 다시 구현하면 저장 데이터와 현행 구성기를 손상시킬 위험이 크다.

## Decision

기존 정적 사이트를 점진적으로 통합 포털로 전환한다. PHASE 1에서는 새 프레임워크, 서버, 데이터베이스, 패키지를 도입하지 않는다. 현행 제품 라이브러리와 매트릭스 구성기 DOM을 각각 독립 view에 배치하되 렌더링 로직, 상태 객체, LocalStorage key, JSON schema, 내보내기를 유지한다.

목표 경로는 다음과 같지만 PHASE 1에서는 최소 경로만 활성화한다.

```text
/
/products
/products/:category          후속 확장
/product/:slug               PHASE 3
/compare                     PHASE 4
/tools
/tools/matrix-configurator
/tools/product-finder        PHASE 5
/tools/transmission-selector PHASE 7
/documents                   PHASE 4
/saved                       후속 확장
```

GitHub Pages 정적 배포를 유지하기 위해 PHASE 1의 route/view는 서버 rewrite를 전제로 하지 않는다. 직접 접근과 새로고침을 보장할 수 있는 hash route 또는 정적 fallback이 가능한 최소 router를 선택한다. 구체적인 방식은 구현 전에 Pages 직접 접근 검증 fixture로 결정한다.

## 기능 분류

### PRESERVE

- 현재 밝은 배경, 블루·퍼플 Accent, 둥근 Panel과 Shadow를 사용하는 디자인 시스템
- 31개 제품·시리즈와 모든 현행 제품 이미지
- 카테고리 탭, 텍스트 검색, 제품 카드, 상세 dialog
- 카탈로그 페이지 표시, 원문 PDF 보기와 다운로드
- XDM·SPX·VDM 제품군과 섀시 선택
- 실제 XDM 후면 이미지, 슬롯 클릭, 카드 이미지 장착
- 카드 수와 입력·출력 채널 집계
- 전송 장비 선택, 검증 결과, BOM과 POE 전원 경고
- 6단계 진행 흐름
- Undo/Redo 100개, 자동 저장, LocalStorage 복원
- LocalStorage key `rtcom.configuration.v1`
- JSON schema 3과 schema 1·2 읽기
- JSON·CSV·인쇄/PDF 내보내기
- 키보드 button/tab/dialog와 `aria-live` 기반

### RELOCATE

- 제품 라이브러리: `/products` view로 이동한다.
- 매트릭스 구성기: `/tools/matrix-configurator` view로 이동한다.
- 기존 홈: 두 view로 이동하는 포털 진입점으로 축소하되 기존 내용을 한 번에 제거하지 않는다.
- 상세 dialog: 제품 목록의 빠른 보기로 유지하고 PHASE 3의 독립 상세 페이지와 병행한다.
- 기술 근거 링크: 향후 `/documents`로 이동하되 기존 직접 링크를 유지한다.

### REFACTOR

- route/view shell과 기존 화면 렌더 함수를 분리하되 내부 동작은 바꾸지 않는다.
- `library.js`와 `catalog.js`의 중복은 adapter로 읽기만 통합하고 원본 데이터를 즉시 이동하지 않는다.
- `app.js`의 저장·history·export 모듈화는 회귀 fixture가 준비된 뒤 수행한다.
- XDM 슬롯 수, 카드 TIP, CTR 전원 규칙의 중복은 단일 데이터 소스로 옮기되 PHASE 1 범위에서 제외한다.
- 문서 registry와 공통 verification model은 PHASE 2에서 도입한다.

### ADD

- 전역 내비게이션과 현재 view 표시
- 직접 접근과 뒤로가기를 지원하는 최소 route/view 계층
- 제품별 독립 URL, category filter, structured search
- 비교 센터, 문서 센터, Product Finder, Transmission Selector
- 공통 Product schema, 관계, verification, document registry
- catalog validator, UI E2E, 시각 회귀

ADD 중 PHASE 1 범위는 전역 내비게이션과 최소 route/view 계층뿐이다.

## PHASE 1 최소 전환 전략

1. 기준 커밋 `f7951ef`에 rollback tag 또는 branch를 만든다.
2. 현행 `index.html`의 제품 라이브러리와 구성기 마운트 지점을 유지한 채 view container를 추가한다.
3. URL을 읽어 어느 기존 section을 표시할지만 결정하는 얇은 route/view adapter를 추가한다.
4. `/products`에서 기존 `library.js`를 그대로 실행한다.
5. `/tools/matrix-configurator`에서 기존 `app.js`를 그대로 실행한다.
6. 기존 `/` 진입은 현재 콘텐츠 또는 두 view로 이동하는 호환 진입점을 제공한다.
7. `rtcom.configuration.v1`, JSON schema 3, catalogVersion, slot ID를 변경하지 않는다.
8. 기존 `data-open-config` CTA를 route adapter에 연결하되, adapter 실패 시 기존 `#matrix-configurator` 스크롤이 동작하는 compatibility layer를 유지한다.
9. 직접 접근, 새로고침, 뒤로가기, LocalStorage 복원, JSON round-trip을 회귀 검사한다.
10. 기능이 안정된 뒤에만 기존 한 페이지 노출을 feature flag로 끈다.

## Compatibility layer

PHASE 1에는 임시 compatibility layer가 필요하다.

- 기존 DOM ID `equipment-library`, `matrix-configurator`, `rtcom-design`을 유지한다.
- 기존 CTA의 스크롤 fallback을 유지한다.
- 기존 LocalStorage key와 JSON import/export를 그대로 호출한다.
- 제품 ID는 새 URL slug 후보로 사용할 수 있지만 기존 객체 ID를 변경하지 않는다.
- 알 수 없는 경로는 기존 `/` view로 안전하게 돌아가며 저장 상태를 지우지 않는다.

## PHASE 1에서 수정하지 않을 영역

- `RtCore`의 상태 검증, BOM, migration, CSV
- `RtCatalog` 모델·카드 튜플
- `app.js`의 슬롯 계산과 카드 배치
- LocalStorage key와 JSON schema/catalogVersion
- 제품 사양과 verification 값
- 이미지와 카탈로그 PDF
- 구성기 단계 수와 내보내기 형식
- 제품 카테고리 분할과 구조화 필터

## 회귀 테스트

1. `/`에서 제품 카드 31개와 구성기 진입이 보인다.
2. `/products` 직접 접근과 새로고침에서 제품 카드 31개가 보인다.
3. 카테고리 탭과 검색 결과 수가 현재와 같다.
4. 상세 dialog와 PDF page fragment가 동작한다.
5. `/tools/matrix-configurator` 직접 접근과 새로고침이 동작한다.
6. XDM-12/20/36/72/144/216 슬롯 수가 유지된다.
7. 카드 배치, 전송기, BOM, POE 경고가 유지된다.
8. Undo/Redo와 자동 저장이 유지된다.
9. 기존 LocalStorage 문서와 schema 1·2·3 JSON fixture를 복원한다.
10. JSON export/import round-trip, CSV, 인쇄/PDF가 유지된다.
11. 브라우저 뒤로가기가 view 이동과 일치한다.
12. 모바일에서 제품 목록과 구성기 기본 조작이 유지된다.

## Rollback

코드 rollback 지점은 `f7951ef0bb5a4294c9e68debc43de333a3bea707`이다. PHASE 1은 기존 런타임을 제거하지 않고 route/view adapter와 shell만 추가한다. 문제가 발생하면 새 router와 view 표시 규칙을 비활성화하고 현재 `index.html`의 단일 페이지 노출로 돌아갈 수 있어야 한다. rollback은 LocalStorage를 삭제하거나 schema를 되돌리는 작업을 포함하지 않는다.

배포 rollback은 마지막 정상 Pages artifact 또는 배포 전용 저장소의 `9b6f403` 정적 배포 커밋으로 되돌리는 방식으로 수행한다. 소스와 배포 저장소의 대응 커밋을 PHASE 1부터 완료 보고에 함께 기록한다.

## Alternatives considered

### 새 프레임워크로 전면 재작성

배제한다. 현행 DOM, 저장 계약, 인쇄, 슬롯 상호작용을 동시에 다시 구현해야 하며 회귀 위험이 크다.

### 제품 데이터를 먼저 완전히 정규화

배제한다. schema와 catalogVersion을 먼저 바꾸면 기존 구성 저장 데이터가 복원되지 않을 수 있다. 제품 데이터 정규화는 PHASE 2에서 adapter와 migration test 뒤에 수행한다.

### 서버·데이터베이스 도입

배제한다. 현재 정적 배포로 제품 탐색과 로컬 구성이 가능하며 계정 동기화 요구가 확정되지 않았다.

### 한 번에 목표 URL 전체 구현

배제한다. 제품 상세, 비교, 문서, Finder는 데이터 계약이 준비되지 않아 빈 화면이나 추정 데이터를 만들 위험이 있다.

## Consequences

장점은 기존 사용자 기능과 저장 데이터를 보존하면서 제품 포털 구조를 검증할 수 있다는 점이다. 단점은 PHASE 1 동안 기존 데이터 중복과 legacy 함수가 남아 일시적으로 구조가 더 복잡해진다는 점이다. 이 부채는 PHASE 2 이후의 명시적 Release Gate에서만 제거한다.
