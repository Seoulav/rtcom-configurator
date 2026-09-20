# PHASE 0 완료 보고: Existing Site Repository & Data Audit

## A. 목표와 결과

- 목표: 현재 저장소, 배포 사이트, 제품 데이터, 저장 계약, 내보내기와 회귀 위험을 조사하고 점진적 전환 기준을 확정한다.
- 결과: PASS
- 범위 준수: 런타임 소스, 제품 데이터, 사용자 기능, 배포를 변경하지 않았다.

## B. 기준 상태

- Before 버전: 화면 표기 `0.6`
- After 버전: 화면과 런타임 변경 없음
- 기준 브랜치: `main`
- 기준 커밋: `f7951ef0bb5a4294c9e68debc43de333a3bea707`
- 감사 시작 시 git status: clean
- rollback 지점: 소스 `f7951ef`, 공개 배포 정적 커밋 `9b6f403`

## C. 조사 근거

- 규칙: `AGENTS.md`, `README.md`, `package.json`, `.gitignore`, `.github/workflows/pages.yml`
- 진입·UI: `index.html`, `src/library.js`, `src/app.js`, `src/styles.css`
- 데이터·로직: `src/catalog.js`, `src/core.js`
- 저장·내보내기: `app.js`의 LocalStorage, history, import/export, print와 `core.js`의 document/parse/csv/bom
- 빌드·배포: `scripts/serve.cjs`, `scripts/package-site.cjs`, `scripts/build-from-draft.cjs`
- 테스트: `tests/core.test.cjs`
- 자료: `docs/evidence/RTCOM_MATRIX_EVIDENCE_AND_GAPS.md`, 카탈로그 PDF, 제품·카드·후면 이미지
- 배포 사이트: 제품 카드 31개, 표시 탭 6개, 구성 단계 6개를 확인했다.
- 외부 벤치마크: Extron Products/Extenders/HDMI Extenders, Analog Way Products/Configurator 공식 페이지를 2026-09-20에 확인했다.

## D. 변경 파일

- `docs/audit/CURRENT_SITE_AUDIT.md`: 저장소, 기능, 코드 책임, 저장 계약, 내보내기, 위험을 기록했다.
- `docs/audit/CATALOG_DATA_GAPS.md`: 31개 inventory, 5개 실제 카테고리, 누락 필드, 중복, migration 요구사항을 기록했다.
- `docs/audit/BENCHMARK_EXTRON_ANALOGWAY.md`: 공식 벤치마크의 적용·제외 결정을 기록했다.
- `docs/adr/ADR-001-portal-information-architecture.md`: 점진적 포털 전환, 기능 분류, compatibility와 rollback을 결정했다.
- `docs/audit/PHASE_0_COMPLETION_REPORT.md`: PHASE 0 기준선과 Release Gate를 기록했다.

## E. 현재 기능과 분류

### 현재 기능

- 제품·시리즈 31개, 실제 데이터 카테고리 5개, `전체` 포함 표시 탭 6개
- 카테고리·검색, 제품 카드, 상세 dialog, 카탈로그 PDF
- XDM·SPX·VDM, 섀시 21개, 카드 26개
- XDM 문서화 모델의 실제 슬롯 수와 5개 후면 이미지
- 카드 배치, 채널 집계, 전송 장비, 검증, BOM
- Undo/Redo, 자동 저장, LocalStorage, JSON import/export
- CSV, 브라우저 인쇄/PDF

### 분류

- PRESERVE: 디자인, 제품·이미지, 상세 dialog, 카탈로그 링크, 구성기 전체 동작, 저장·복원·내보내기, 접근성 기반
- RELOCATE: 제품 라이브러리를 `/products`, 구성기를 `/tools/matrix-configurator`, 기술자료를 후속 `/documents`로 이동
- REFACTOR: 제품 데이터 중복, XDM 슬롯 수·TIP·전원 규칙 중복, app.js 결합, 문서·검증 모델을 후속 단계에서 내부 정리
- ADD: 전역 내비게이션, 최소 route/view, 독립 제품 URL, 비교, 문서 센터, Finder, Transmission Selector, 구조화 schema와 validator

## F. 저장 호환 위험

- LocalStorage key는 `rtcom.configuration.v1`이며 변경하면 안 된다.
- JSON schema는 3이고 schema 1·2를 읽지만 catalogVersion은 정확히 일치해야 한다.
- PHASE 1에서 catalogVersion을 변경하면 기존 LocalStorage와 JSON을 읽지 못할 수 있다.
- 기존 validation과 BOM은 import에서 재계산되므로 이 동작을 유지해야 한다.
- schema 2의 requirements가 폐기되는 현행 정책은 호환성 부채로 남는다.

## G. 검증

- unit test: PASS, 14/14
- build/package: PASS, `dist/` 57개 파일
- 정적 링크·경로: PASS, 확인 참조 45개, 누락 0
- 배포 화면 기준선: PASS, 31 cards / 6 tabs / 6 steps
- typecheck: N/A
- catalog validation: N/A
- E2E: N/A
- visual regression: N/A

## H. 위험과 부채

### P0

- catalogVersion 변경 시 기존 저장 데이터 복원 중단 위험
- 카드 튜플·슬롯 ID·모델명 변경 시 구성과 BOM 손실 위험
- 소스 저장소와 공개 배포 저장소의 대응 관계가 자동화되지 않은 위험

### P1

- 제품 카드와 구성기 데이터 중복
- 단일 app.js의 UI·상태·저장·내보내기 결합
- UI E2E와 PDF 시각 회귀 부재
- 모든 이미지의 초기 로딩
- 공개 PDF·이미지 권한 미확정
- PDF 배포 소스 선택의 비결정성

### P2

- 미사용 legacy 렌더 함수와 workspace 조각
- 제품 상태 용어 불일치
- 문자열 기반 검색과 사양
- 독립 URL과 browser history 부재

## I. PHASE 0 Release Gate

- [x] 현재 화면과 기능 inventory가 작성되었다.
- [x] 핵심 코드의 책임과 의존 관계가 작성되었다.
- [x] 전체 제품·시리즈가 실제 데이터 기준으로 목록화되었다.
- [x] 기존 저장 형식과 LocalStorage 호환 위험이 작성되었다.
- [x] 기존 기능별 PRESERVE / RELOCATE / REFACTOR / ADD가 결정되었다.
- [x] 카탈로그 데이터의 중복·누락·검증 문제가 작성되었다.
- [x] Extron·Analog Way 벤치마크 적용/제외 항목이 작성되었다.
- [x] PHASE 1 최소 변경 범위와 rollback 지점이 제안되었다.
- [x] 사용자 코드와 기존 동작을 변경하지 않았다.

판정은 PASS다. 자동 E2E, catalog validator, visual regression이 없는 사실은 기록했으며 PHASE 0 문서화 Gate를 막지는 않는다. PHASE 1 구현 전에는 저장 fixture와 최소 브라우저 회귀 시나리오를 먼저 고정해야 한다.

## J. PHASE 1 최소 범위

1. 현재 제품 라이브러리와 구성기를 그대로 마운트하는 view shell만 추가한다.
2. `/`, `/products`, `/tools/matrix-configurator`의 최소 route/view만 제공한다.
3. 기존 DOM ID와 CTA 스크롤 fallback을 compatibility layer로 유지한다.
4. LocalStorage key, schemaVersion, catalogVersion, 슬롯 ID, 제품 데이터는 수정하지 않는다.
5. 제품 schema 정규화, 카테고리 필터, 상세 페이지, 비교, 문서 센터는 시작하지 않는다.
6. 직접 접근, 새로고침, 뒤로가기, LocalStorage 복원, JSON round-trip을 회귀 검증한다.

PHASE 0 RESULT: PASS
NEXT RECOMMENDED PHASE: PHASE 1 — Portal Information Architecture
USER APPROVAL REQUIRED: YES
