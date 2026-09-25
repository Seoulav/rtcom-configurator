# 구성기 단일 사이트 전환 (0.7.0)

- 결정: 사용자 확정(2026-09-25) — "삭제 확정, PDF도 빼고 진행"
- 근거: `docs/audit/SITE_SCOPE_REVIEW.md`
- 기준 커밋: `f569d0b`

## 무엇을 바꿨나

| 구분 | 내용 |
|---|---|
| 삭제한 코드 | `src/library.js`, `src/product-catalog.js`, `src/product-search.js`, `src/search-synonyms.js`, `src/catalog-validator.js`, `src/portal.js`, `scripts/validate-catalog.cjs`, `tests/catalog-phase2.test.cjs` |
| 삭제한 자산 | `output/design/assets/library/` 제품 이미지 28장 |
| 배포 제외 | 카탈로그 PDF. 원본 PDF는 `docs/`에 제품 근거 자료로 남겨 두었고 배포본에만 넣지 않습니다. |
| `index.html` | 포털 홈·제품 화면·전역 메뉴 제거. 구성기가 첫 화면입니다. 스크립트는 `catalog.js`, `core.js`, `app.js` 세 개만 불러옵니다. |
| `src/styles.css` | 제품 라이브러리·포털·필터 전용 선택자 123개를 제거했습니다(56KB → 43KB). 구성기 선택자와 섞인 규칙은 해당 선택자만 지웠습니다. |
| `scripts/package-site.cjs` | 구성기 파일만 복사합니다. `/products/`, `/tools/matrix-configurator/`에는 앱을 넣지 않고 첫 화면으로 보내는 이동 페이지만 만듭니다. `#matrix-configurator` 같은 주소 뒤 표시는 그대로 전달합니다. |
| `scripts/serve.cjs` | 로컬 서버도 옛 주소를 `/`로 302 이동시켜 배포본과 동작을 맞췄습니다. |
| 테스트 | `tests/routes.test.cjs` → `tests/site.test.cjs`로 교체했습니다(아래 참고). `scripts/e2e-smoke.cjs` 브라우저 검사를 추가했습니다. |
| 문서 | README, CLAUDE.md 호환성 계약·검증 명령, CHANGELOG 0.7.0, 화면 버전 0.7 |

## 이미지 깨짐 결함이 사라지는 이유

0.6은 앱 안에서 화면을 바꿀 때 주소를 `/tools/matrix-configurator`로 바꿨습니다(`history.pushState`). 그 뒤 새로 그린 이미지는 상대경로 `output/design/...`를 `/tools/` 기준으로 찾아 404가 났습니다. 0.7은 한 화면이라 주소를 바꾸지 않으므로 상대경로가 항상 사이트 루트 기준으로 해석됩니다. `site.test.cjs`가 런타임 코드에 `pushState`·`replaceState`가 다시 들어오면 실패하도록 막습니다.

## 유지한 계약

- LocalStorage key `rtcom.configuration.v1`, JSON schema 3, `catalogVersion`, 슬롯 ID: 코드 변경 없음
- 구성기 제품군·섀시·카드 3/21/26: 테스트로 확인
- `#matrix-configurator` 주소: 첫 화면에 같은 id가 있고, 옛 주소에서 이동해도 유지

## 테스트 구성

`tests/site.test.cjs`

1. `index.html`이 구성기 전용이고 기존 id(`rtcom-design`, `matrix-configurator`, `print-report`, `rtcom-assets`)를 유지
2. 런타임 코드에 주소 변경 코드가 없음
3. 제품 라이브러리 파일과 카탈로그 PDF 참조가 남아 있지 않음
4. XDM 카드 12종과 후면 사진 5장의 이미지 파일이 존재
5. 배포본에 PDF·제품 이미지가 없고, `index.html`이 참조하는 파일이 모두 있으며, 옛 주소 이동 페이지가 앱을 불러오지 않음
6. 구성기 카탈로그·저장 계약 불변

`scripts/e2e-smoke.cjs`는 `dist/`를 `/rtcom-configurator/` 하위 경로로 띄워 GitHub Pages와 같은 조건에서 390px 화면으로 검사합니다.

## 되돌리는 방법

이 변경의 커밋을 `git revert`하면 0.6 상태(포털·제품 라이브러리·PDF 배포)로 돌아갑니다. 구성기 저장 형식을 바꾸지 않았으므로 어느 쪽에서 저장한 구성도 서로 불러올 수 있습니다.

## 남은 일

- AV Portal 헤더 링크는 추가했습니다(`https://seoulav.github.io/AV-Portal/`). 2026-09-25 기준 AV Portal `llms.txt`에 RTCOM 제품이 없어 제품별 연결은 RTCOM 제품 등록 후 진행합니다.
- 모바일에서 XDM-72 이상 슬롯 라벨 잘림, 후면 사진 캡션 겹침(감사 문서 P2)
- 공개 Pages 위치 정리: `seoulav.github.io/rtcom-configurator`와 `rtcom-av-design`
- 원본 `docs/*.pdf`와 `rtcom-source.zip`을 저장소에서도 뺄지 결정(현재 배포에는 미포함)
