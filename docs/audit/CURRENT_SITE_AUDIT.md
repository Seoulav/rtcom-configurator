# RTCOM AV Design Library 현재 사이트 감사

- 감사일: 2026-09-20
- 기준 브랜치: `main`
- 기준 커밋: `f7951ef0bb5a4294c9e68debc43de333a3bea707`
- 소스 저장소 원격: `https://github.com/Seoulav/rtcom-configurator.git`
- 배포 사이트: `https://hkkim0454.github.io/rtcom-av-design/`
- 감사 시작 시 작업 트리: clean

## 1. 저장소 규칙과 기준 상태

`AGENTS.md`는 한국어 문장을 완결된 문장으로 작성하고, 기술 용어는 통상적인 용례를 따르도록 규정한다. `CLAUDE.md`는 존재하지 않는다. `README.md`는 외부 패키지 없이 Node.js 정적 서버로 실행하며, `scripts/build-from-draft.cjs`를 일반 개발에 사용하면 런타임 파일이 재생성될 수 있으므로 사용하지 말라고 설명한다.

저장소는 브라우저 전역 객체와 DOM API를 사용하는 정적 HTML/CSS/JavaScript 프로젝트다. 번들러, TypeScript, 프레임워크, 패키지 의존성은 없다. `package.json`의 스크립트는 `start`와 `test` 두 개뿐이다.

| 항목 | 현재 상태 |
|---|---|
| 런타임 | 브라우저 JavaScript, CommonJS Node.js 보조 스크립트 |
| 앱 진입점 | `index.html` |
| 로컬 실행 | `node scripts/serve.cjs`, `127.0.0.1:4173` |
| 테스트 | `node --test tests/*.test.cjs` |
| 빌드 | `node scripts/package-site.cjs`, 결과는 ignored `dist/` |
| 배포 | GitHub Actions가 `dist/`를 GitHub Pages에 배포 |
| 패키지 설치 | 불필요 |
| 소스 저장소와 배포 저장소 | 소스 원격은 `Seoulav/rtcom-configurator`, 현재 공개 사이트는 `hkkim0454/rtcom-av-design`에서 제공되는 별도 정적 배포본 |

소스 저장소의 `.github/workflows/pages.yml`은 수동 실행 방식이며 Node.js 22에서 테스트와 패키징을 수행한 뒤 Pages artifact를 배포한다. 현재 공개 사이트는 배포 전용 저장소를 사용하므로, 두 저장소 사이의 커밋 추적과 동기화 절차가 문서화되어 있지 않은 점은 운영 위험이다.

## 2. 핵심 파일 책임과 의존 관계

| 파일 | 담당 역할과 공개 계약 | 의존 관계 | 재사용 판단 | 변경 시 주요 회귀 위험 |
|---|---|---|---|---|
| `index.html` | 앱 셸, 제품 라이브러리와 구성기 마운트 지점, 도구 모음, 단계 내비게이션, 인쇄 영역, 스크립트 로드 순서를 정의한다. | `styles.css`, `catalog.js`, `core.js`, `app.js`, `library.js`를 순서대로 로드한다. | PRESERVE 후 RELOCATE | 스크립트 순서, DOM ID, `data-*` 계약이 깨지면 전체 앱이 초기화되지 않는다. |
| `src/catalog.js` | `globalThis.RtCatalog`에 XDM·SPX·VDM 제품군, 섀시, 카드 튜플을 제공한다. | `core.js`, `app.js`, Node 테스트가 직접 참조한다. | PRESERVE 후 REFACTOR | 카드 튜플 인덱스 `[0..3]` 또는 모델명이 바뀌면 저장 JSON 검증과 BOM이 깨진다. |
| `src/core.js` | 상태 정규화, 슬롯 계산, 카드·전송기 허용 관계, 포트 동기화, 검증, BOM, JSON 문서, import, CSV를 제공한다. 공개 API는 `globalThis.RtCore`다. | `RtCatalog` 전역이 먼저 존재해야 한다. 브라우저 앱과 Node 테스트가 함께 사용한다. | PRESERVE | `schemaVersion`, `catalogVersion`, 슬롯 ID, `checkState`를 변경하면 기존 저장 데이터가 손실될 수 있다. |
| `src/app.js` | 6단계 구성기 UI, 상태 전환, 후면 슬롯, 카드 선택, 전송기, 검토, Undo/Redo, LocalStorage, import/export, 인쇄를 담당한다. | `RtCatalog`, `RtCore`, `index.html`의 DOM 구조와 이미지 템플릿에 의존한다. | PRESERVE 후 RELOCATE/REFACTOR | 단일 파일 안에 렌더링과 상태·저장·이벤트가 결합되어 있어 부분 이동 시 회귀 범위가 넓다. |
| `src/library.js` | 31개 제품·시리즈 배열, 카테고리 탭, 검색, 제품 카드, 상세 dialog, 공통 카탈로그 PDF 링크를 담당한다. | `#equipment-library`와 정적 이미지·PDF 경로에 의존한다. `RtCatalog`와 직접 연결되지 않는다. | PRESERVE 후 RELOCATE/REFACTOR | 제품 카드와 구성기의 중복 데이터가 서로 달라질 수 있다. 재렌더링 때 dialog DOM이 교체된다. |
| `src/styles.css` | 기존 밝은 배경, 블루·퍼플 강조색, 제품 카드, 상세 dialog, 구성기, 후면 슬롯, 반응형, 인쇄 전 화면 스타일을 제공한다. | 대부분 `#rtcom-design` 아래 클래스와 상태 속성에 결합된다. | PRESERVE | 클래스명이나 DOM 계층을 바꾸면 전체 디자인과 모바일 배치가 회귀한다. |
| `src/workspace.inc.js`, `src/workspace.css` | 초기 이관용 작업 공간 조각으로 보인다. 현재 `index.html`에서 로드하지 않으며, 현행 `app.js`와 일부 로직이 중복된다. | 초기 생성 스크립트와 과거 DOM에 의존한다. | REFACTOR 후보, PHASE 1 수정 금지 | 현행 코드로 오인해 수정하면 실제 앱과 결과가 달라질 수 있다. |
| `scripts/package-site.cjs` | 런타임 파일, 이미지, 근거 문서, 카탈로그 PDF를 `dist/`로 복사한다. | 현재 파일 경로와 `docs`에서 처음 발견되는 PDF에 의존한다. | PRESERVE 후 REFACTOR | PDF가 여러 개가 되면 `readdirSync().find()` 선택이 비결정적일 수 있다. |
| `scripts/build-from-draft.cjs` | 과거 디자인 초안에서 앱 파일을 재생성한다. | `output/design/rtcom-configurator-draft.html`에 의존한다. | PRESERVE하되 실행 금지 | 실행하면 현행 `app.js`, `styles.css`, `index.html`을 덮어쓸 수 있다. |
| `tests/core.test.cjs` | 슬롯, 카드 채널, JSON round-trip·migration, 검증, BOM, CSV를 검사한다. | `catalog.js`, `core.js`만 로드한다. DOM/UI는 검사하지 않는다. | PRESERVE 및 후속 확장 | UI·LocalStorage·dialog·PDF 인쇄 회귀를 탐지하지 못한다. |

의존 관계는 `index.html → catalog.js → core.js → app.js`와 `index.html → library.js`로 나뉜다. 제품 라이브러리와 구성기는 화면에서는 연결되지만 데이터 계층에서는 분리되어 있다.

## 3. 현재 화면과 기능 inventory

### 제품 라이브러리

- 제품·시리즈 카드 31개를 한 화면에 표시한다.
- 표시 탭은 `전체 장비`를 포함해 6개이며, 실제 제품 데이터 카테고리는 5개다.
- 제품명, 영문 유형, 기능 문자열을 대상으로 대소문자 무시 검색을 제공한다.
- 카테고리별 개수를 동적으로 표시한다.
- 제품 이미지를 보여주고 카탈로그 페이지를 표시한다.
- 상세 dialog에서 기능, 상태, 카탈로그 페이지, 원문 PDF 보기와 다운로드를 제공한다.
- XDM Series 카드에서 구성기 위치로 부드럽게 스크롤한다.
- 제품별 독립 URL, 비교, 정렬, 구조화 필터, 설계 추가는 없다.

### 매트릭스 구성기

- XDM·SPX·VDM 제품군과 총 21개 섀시 모델을 선택할 수 있다.
- XDM 6개 문서화 모델은 입력·출력 슬롯 수 3/5/9/18/36/54를 사용한다.
- XDM-12/20/36/72/144는 실제 후면 이미지를 표시한다.
- 슬롯을 선택하고 방향에 맞는 카드를 배치하며 카드 이미지를 후면 슬롯에 표시한다.
- 카드 채널 합계와 장착 카드 수를 계산한다.
- CAT/Fiber 카드에 허용된 전송 장비와 연결 채널 수를 지정한다.
- 검증 상태, 근거, BOM, 별도 POE Power Supply 경고를 표시한다.
- 6단계 진행 상태와 이전/다음 이동을 제공한다.
- Undo/Redo는 메모리 내 최대 100개 상태를 저장한다.
- 자동 저장, LocalStorage 복원, JSON 백업·불러오기를 제공한다.
- JSON, UTF-8 BOM CSV, 브라우저 인쇄 기반 PDF를 제공한다.
- 상태 영역에 `aria-live`를 사용하고 주요 선택 요소는 button, tab, dialog로 구현되어 있다.

### 구현되어 있으나 현행 화면에서 사용하지 않는 코드

`app.js`에는 `legacyCardsView`, `requirementEditor`, `portEditor`, `chassisVisual`, `cardsView`, `cardsViewV2`, `linksView`, `reviewView`가 남아 있지만 현재 `render()`는 `cardsViewV3`, `linksViewV2`, `reviewViewV2`를 사용한다. `requirements`와 세부 포트 편집 상태는 초기 객체와 코어에 남아 있으나 현행 6단계 UI에서는 편집 화면이 노출되지 않는다.

## 4. 제품·이미지·문서 현황

실제 `library.js` 기준으로 제품·시리즈는 31개다. 데이터 카테고리는 모듈형 매트릭스 3, 일체형 매트릭스 3, 분배기·선택기 9, 전송기·확장 12, 케이블 4다. 중복 product ID와 중복 모델명은 없고, 31개 제품 이미지 경로는 모두 존재한다.

구성기 카탈로그에는 제품군 3개, 섀시 모델 21개, 카드 26개가 있다. XDM 카드 12개에는 개별 카드 이미지가 있고, SPX·VDM 카드는 제품군 이미지를 대신 사용한다. 실제 후면 이미지는 XDM 5개 모델에만 있다.

모든 제품 상세는 하나의 48페이지 카탈로그 PDF를 공유하고 `#page=` fragment로 시작 페이지를 전달한다. 제품별 데이터시트·매뉴얼 registry, 문서 버전, 발행일, 언어, 최신 여부, 제품별 복수 문서는 없다. `docs/evidence/RTCOM_MATRIX_EVIDENCE_AND_GAPS.md`는 구성기 검증 근거를 제공하지만 제품 라이브러리 데이터와 구조적으로 연결되지 않는다.

`scripts/package-site.cjs`는 현재 카탈로그 PDF를 공개 패키지에 포함하지만 `README.md`에는 제공 PDF를 제외한다고 적혀 있어 문서와 실제 배포가 일치하지 않는다. 공개 권한 확인 항목 G14도 해결되지 않았다.

## 5. LocalStorage와 JSON 계약

### LocalStorage

- key: `rtcom.configuration.v1`
- 저장 값: `RtCore.document(state)`의 JSON 문자열
- 저장 범위: 브라우저 origin별 LocalStorage다. 경로가 달라도 origin이 같으면 공유되지만 로컬 주소와 GitHub Pages는 서로 공유되지 않는다.
- 저장 시점: 대부분의 상태 변경, Undo/Redo, import 후 변경에 저장한다.
- 복원 실패 시 저장 값을 삭제하지 않고 오류 문구를 표시한다.

### JSON document schema

최상위 필드는 다음과 같다.

```text
schemaVersion
catalogVersion
status
savedAt
state
validation
bom
```

`state`는 `step`, `maxStep`, `family`, `model`, `requirements`, `placements`, `physicalSlots`, `portAssignments`, `links`, `slot`, `format`을 포함한다. 현재 `schemaVersion`은 3이고 `catalogVersion`은 `2026-09-18-draft.1`이다.

import는 schema 1, 2, 3을 허용하지만 `catalogVersion`은 현재 값과 정확히 일치해야 한다. XDM 문서화 모델의 구형 슬롯 `in-a`, `in-b`, `out-a`, `out-b`는 `in-1`, `in-2`, `out-1`, `out-2`로 변환한다. 저장 파일의 `validation`과 `bom`은 신뢰하지 않고 현재 로직으로 재계산한다. schema 2의 기존 `requirements`는 의도적으로 빈 배열로 바뀐다.

### 호환성 분류

| 항목 | 분류 | 결정 |
|---|---|---|
| LocalStorage key | KEEP | PHASE 1에서 변경하지 않는다. |
| schemaVersion 3 document | KEEP | 최상위와 `state` 필드 이름을 유지한다. |
| 새 포털 UI 상태 | EXTEND | 기존 `state`에 넣지 않고 별도의 optional 또는 별도 key를 사용한다. |
| schema 1·2 읽기 | ADAPT | 현행 adapter 동작을 보존하고 fixture를 추가한다. |
| 향후 catalogVersion 변경 | MIGRATE | exact match 거부 전에 호환 가능한 catalog version adapter를 도입해야 한다. |
| `requirements` 폐기 정책 | DEPRECATE 검토 | 과거 데이터 손실을 문서화하고 필요하면 schema별 adapter로 보존한다. |

가장 큰 위험은 PHASE 1에서 제품 카탈로그를 정리하면서 `catalogVersion`을 변경하는 경우다. 현재 구현은 기존 LocalStorage를 자동 복원하지 못하므로, 버전을 바꾸기 전에 기존 문서를 읽는 compatibility adapter와 회귀 fixture가 필요하다.

## 6. 내보내기 구조

| 형식 | 구현 | 데이터 범위 | 위험 |
|---|---|---|---|
| JSON | `RtCore.document()`와 Blob 다운로드 | 상태, 검증, BOM, 버전 | strict catalogVersion 때문에 이후 버전에서 import가 거부될 수 있다. |
| CSV | `RtCore.csv()`와 UTF-8 BOM Blob | BOM과 `UNVERIFIED_DRAFT` 상태 | 화면 표와 같은 `RtCore.bom()`을 사용하므로 일관성이 좋지만 제품 라이브러리 항목은 포함하지 않는다. |
| PDF | `report()`가 `#print-report`를 만들고 `window.print()` 실행 | 프레임, BOM, 슬롯, 전송 장비, 검증 | 실제 PDF 생성기가 아니라 브라우저 인쇄 결과에 의존하며 자동 회귀 테스트가 없다. |

## 7. 회귀 위험

### P0

1. `catalogVersion` exact match를 유지한 채 값만 변경하면 기존 LocalStorage와 JSON 백업을 복원할 수 없다.
2. `RtCatalog` 카드 튜플 위치, 슬롯 ID, 모델명을 변경하면 `checkState`, import, BOM, 저장 데이터가 동시에 깨진다.
3. 소스 저장소와 공개 배포 저장소가 분리되어 있으므로, 같은 버전 표기 아래 다른 코드가 서비스될 수 있다.

### P1

1. 제품 카드 데이터와 구성기 데이터가 분리되어 XDM·SPX·VDM 명칭·기능·문서 근거가 달라질 수 있다.
2. `app.js`의 상태, 렌더링, 저장, 이벤트, 내보내기가 결합되어 화면 이동만으로도 구성기 회귀가 발생할 수 있다.
3. DOM/UI E2E와 PDF 시각 회귀가 없어 단위 테스트 통과만으로 사용자 기능을 보장할 수 없다.
4. 제품 이미지가 모두 초기 DOM에 생성되고 lazy loading이 없어 제품 증가 시 초기 성능이 악화된다.
5. 배포 스크립트의 PDF 선택이 파일명 대신 “첫 PDF”에 의존한다.
6. 카탈로그 공개 권한이 미확정인데 PDF와 추출 이미지가 공개 배포본에 포함된다.

### P2

1. 미사용 legacy 렌더 함수와 별도 workspace 조각이 유지보수 혼선을 만든다.
2. 상태 라벨 체계가 자유 문자열과 `VALID/WARNING/UNVERIFIED/ERROR`로 나뉘어 있다.
3. 검색은 구조화 필드가 아니라 표시 문자열만 검색한다.
4. 독립 제품 URL과 브라우저 history 상태가 없다.

## 8. 기준선 검증 결과

| 검증 | 결과 |
|---|---|
| unit test | PASS, 14/14 |
| build/package | PASS, `dist/` 정적 파일 57개 생성 |
| 정적 경로 검사 | PASS, 확인한 내부 참조 45개 중 누락 0 |
| 배포 화면 | PASS, 제품 카드 31개, 탭 6개, 구성 단계 6개 확인 |
| typecheck | N/A, TypeScript와 typecheck 스크립트가 없다. |
| catalog validator | N/A, 전용 validator가 없다. |
| E2E | N/A, 자동화 E2E가 없다. |
| visual regression | N/A, 자동 시각 회귀 기준이 없다. |

빌드는 ignored `dist/`만 갱신했으며 추적 소스는 변경하지 않았다.

## 9. 보존 기준

현재 디자인 시스템, 31개 제품·시리즈 데이터, 제품 이미지, 상세 dialog, 카탈로그 PDF 링크, 6단계 구성기, XDM 실제 후면·슬롯 표시, 카드 배치, 채널 집계, 검증, BOM, Undo/Redo, 자동 저장, LocalStorage 복원, JSON·CSV·인쇄/PDF 내보내기를 기준 동작으로 보존한다. PHASE 1은 이 기능을 새로 구현하지 않고 기존 DOM과 함수가 새 정보구조 안에서도 그대로 실행되도록 배치만 변경해야 한다.
