# PHASE 1 구현 기록: Portal Information Architecture

- 작업일: 2026-09-20
- 기준 브랜치/커밋: `main` / `f7951ef0bb5a4294c9e68debc43de333a3bea707`
- 작업 브랜치: `codex/phase-1-portal-ia`
- PHASE 0 문서 보존 커밋: `66f5d90`
- PHASE 1 구현 커밋: `aeae96d69614a88bfc91258fad56e20d4d5add3f`

## 1. 구현 범위

기존 제품 라이브러리와 매트릭스 구성기의 DOM, 렌더링 코드와 데이터 계약을 유지하고 다음 세 view를 추가했다.

| 경로 | 역할 | 재사용 범위 |
|---|---|---|
| `/` | 포털 진입 화면 | 기존 디자인 토큰, 버튼, 패널 표현 |
| `/products` | 제품 라이브러리 | 기존 `#equipment-library`와 `library.js` 전체 |
| `/tools/matrix-configurator` | 매트릭스 구성기 | 기존 `#matrix-configurator`, `app.js`, `core.js`, `catalog.js` 전체 |

공통 헤더에는 홈, 제품, 설계 도구 링크와 현재 화면의 `aria-current="page"` 표시를 추가했다. 홈은 실제 제공 중인 제품 라이브러리와 매트릭스 구성기 두 진입점 및 현재 5개 데이터 카테고리만 안내한다.

## 2. 라우팅 방식

`src/portal.js`가 URL pathname을 읽고 기존 DOM section의 `hidden` 상태만 바꾸는 History API view router를 제공한다. 경로 이동은 `pushState`, 브라우저 뒤로/앞으로는 `popstate`로 처리한다. 제품과 구성기 스크립트는 한 번만 초기화되므로 화면 이동으로 이벤트가 중복 바인딩되거나 진행 상태가 초기화되지 않는다.

기존 `#matrix-configurator` 해시 링크는 구성기 경로로 한 번 변환한다. 알 수 없는 로컬 앱 경로는 홈으로 교체하며 저장 상태를 삭제하지 않는다.

## 3. GitHub Pages base path와 direct load

배포 서버 rewrite에 의존하지 않는다. `scripts/package-site.cjs`가 다음 정적 entry를 만든다.

- `dist/index.html`
- `dist/products/index.html` with `<base href="../">`
- `dist/tools/matrix-configurator/index.html` with `<base href="../../">`

router는 실행 중인 `src/portal.js` URL에서 base path를 계산한다. 따라서 루트 미리보기와 `/rtcom-av-design/` Pages 경로에서 같은 코드가 각각 올바른 링크를 만든다. GitHub Pages가 clean path를 해당 디렉터리의 `index.html`로 연결하므로 direct load와 refresh가 동작한다.

로컬 `scripts/serve.cjs`는 두 clean path와 trailing slash 경로에 현재 `index.html`을 제공하고 개발 환경용 `<base href="/">`를 주입한다.

## 4. Compatibility layer

- DOM ID `rtcom-design`, `equipment-library`, `matrix-configurator`를 유지했다.
- 제품 카드의 기존 `data-open-config` 동작은 `RtPortal.navigate()`를 우선 사용하고 router가 없으면 기존 `scrollIntoView()`로 돌아간다.
- 기존 제품 상세 dialog, PDF page fragment, 검색과 카테고리 필터를 그대로 사용한다.
- `src/catalog.js`와 `src/core.js`는 수정하지 않았다.
- `library.js`의 제품 배열은 byte-level SHA-256 비교에서 기준 커밋과 동일하다.
- LocalStorage와 JSON import/export 로직은 수정하지 않았다.

## 5. 변경 파일

| 파일 | 변경 |
|---|---|
| `index.html` | 공통 nav, 홈 view, 제품 view, 구성기 view를 추가하고 기존 DOM을 해당 view에 배치 |
| `src/portal.js` | base path 인식, view 표시, History API, 해시 호환 계층 추가 |
| `src/library.js` | 구성기 CTA를 router에 연결하고 기존 스크롤 fallback 유지 |
| `src/styles.css` | 현행 디자인을 재사용한 포털 shell과 320px 대응 추가 |
| `scripts/serve.cjs` | 로컬 clean path direct load 지원 |
| `scripts/package-site.cjs` | router와 두 정적 deep entry 패키징 |
| `tests/routes.test.cjs` | 경로, DOM anchor, 데이터 개수, 저장 계약 회귀 검사 추가 |

## 6. 의도적으로 수행하지 않은 작업

제품 schema 정규화, 신규 카테고리 필터, 독립 제품 상세 URL, 비교, 문서 센터, Finder, Transmission Selector, 프레임워크 도입, 패키지 설치, 공개 배포와 PHASE 2 작업은 수행하지 않았다.
