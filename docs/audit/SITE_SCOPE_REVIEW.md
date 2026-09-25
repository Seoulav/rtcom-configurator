# 사이트 범위 전반 검토 (구성기 외 제품정보 삭제 검토)

- 검토일: 2026-09-25
- 기준 커밋: `1d97f42` (main, 화면 버전 0.6)
- 계기: 사용자 요청 — "구성기를 제외한 제품정보는 AV portal과 중복되어 보여 삭제를 검토 중, 전반적인 검토 먼저"
- 이 문서는 검토 결과만 기록합니다. 코드와 데이터는 변경하지 않았습니다.
- 후속 결정(2026-09-25): 사용자가 제품정보 삭제와 PDF 배포 제외를 확정했습니다. 구현은 `docs/implementation/CONFIGURATOR_ONLY_SITE.md`, 검증은 `docs/qa/CONFIGURATOR_ONLY_QA.md`에 있습니다. 6절의 PHASE 3 보관본은 폐기했습니다.

## 1. 현재 사이트 구성

| 영역 | 경로 | 주요 파일 | 역할 |
|---|---|---|---|
| 포털 홈 | `/` | `index.html`, `src/portal.js` | 제품·구성기로 가는 입구 |
| 제품 라이브러리 | `/products` | `library.js`, `product-catalog.js`, `product-search.js`, `search-synonyms.js`, `catalog-validator.js`, `output/design/assets/library/`(236KB), 카탈로그 PDF(3.3MB) | 31개 제품 카드·검색·필터·상세 dialog |
| 매트릭스 구성기 | `/tools/matrix-configurator` | `catalog.js`, `core.js`, `app.js`, `output/design/assets/cards/`(248KB), 후면 사진 5장 | XDM·SPX·VDM 슬롯 구성, BOM, 저장·내보내기 |

## 2. 구성기와 제품정보의 의존 관계

- `app.js`·`core.js`·`catalog.js`는 `RtProductCatalog`, `RtProductSearch`, `library.js`를 **전혀 참조하지 않습니다.** 구성기는 자체 카탈로그(`catalog.js`)만 사용합니다.
- 반대로 제품 라이브러리는 "구성 시작" 버튼으로 구성기를 호출할 뿐입니다(단방향).
- 결론: 제품정보 영역을 제거해도 구성기 계산·저장·내보내기 로직은 영향을 받지 않습니다.

## 3. 발견한 결함

### P0 — 앱 안에서 구성기로 이동하면 이미지가 깨짐 (공개 사이트에서 재현)

- 증상: 홈 → "구성 시작하기"로 이동하면 XDM 후면 사진, 카드 이미지, 제품군 사진이 모두 깨집니다(사용자 제공 모바일 스크린샷과 일치).
- 재현: 로컬 `dist`를 `/rtcom-configurator/` 하위에 두고 390px 화면에서 확인.
  - 홈에서 클릭 이동: 깨진 이미지 7개, 404 요청 12건 (`/tools/output/design/assets/...`)
  - 구성기 주소 직접 접속: 깨진 이미지 0개, 404 0건
  - 공개 서버 확인: `/output/design/assets/xdm-144-rear.jpg`는 200, `/tools/output/design/assets/xdm-144-rear.jpg`는 404
- 원인: 이미지 주소가 상대경로(`output/design/...`)입니다. 앱 안 이동(`history.pushState`)으로 주소가 `/tools/matrix-configurator`로 바뀐 뒤 새로 그려지는 이미지는 `/tools/` 기준으로 찾게 됩니다. 직접 접속 시에는 `package-site.cjs`가 넣는 `<base href="../../">` 덕분에 정상입니다.
- 수정안: 포털 시작 시 저장소 기준 절대 `<base href="{basePath}/">`를 한 번 지정하거나, 제품정보 삭제로 구성기를 루트(`/`) 단일 화면으로 만들면 원인 자체가 사라집니다.
- 기존 route 테스트는 문자열 검사만 하므로 이 결함을 잡지 못했습니다. 브라우저 E2E 회귀 테스트가 필요합니다.

### P2 — 모바일 구성기 표시

- XDM-72 이상 슬롯 라벨이 잘립니다("입력 슬롯 1" → "입력 슬롯"). 390px에서 18열이 한 줄이라 슬롯 폭이 좁습니다.
- 후면 사진 영역에 매뉴얼 본문 글자가 함께 잘려 보이고 출처 배지와 겹칩니다.
- 페이지 전체 가로 넘침은 없습니다(후면 영역 내부 가로 스크롤은 의도된 동작).

## 4. 운영·문서 불일치

- CLAUDE.md는 공개 배포 저장소를 `hkkim0454/rtcom-av-design`으로 정의하지만, 실제로 `seoulav.github.io/rtcom-configurator/`(원본 저장소 Pages)도 공개되어 있습니다. HANDOFF.md의 "비공개 유지" 방침과도 다릅니다.
- 저장소 루트의 `rtcom-source.zip`(2.6MB)은 런타임에 쓰이지 않는 이관용 보관 파일입니다.
- 호환성 계약의 "제품·시리즈 31개와 데이터 카테고리 5개"는 제품정보를 삭제하면 계약 자체를 변경해야 합니다.

## 5. 제품정보 삭제 시 영향 범위

| 구분 | 대상 |
|---|---|
| 삭제 | `library.js`, `product-catalog.js`, `product-search.js`, `search-synonyms.js`, `catalog-validator.js`, `scripts/validate-catalog.cjs`, `output/design/assets/library/`, `/products` route와 홈의 제품 입구, `tests/catalog-phase2.test.cjs` |
| 수정 | `index.html`, `portal.js`(또는 제거), `package-site.cjs`, `tests/routes.test.cjs`(31개 제품 검사), CLAUDE.md 호환성 계약·기본 검증 명령, README, CHANGELOG, `.github/workflows/pages.yml` |
| 판단 필요 | 카탈로그 PDF 3.3MB: 구성기는 사용하지 않으나 제품 근거 원문입니다. AV portal에 있으면 링크로 대체 가능 |
| 유지 | `catalog.js`, `core.js`, `app.js`, 카드·후면 이미지, `docs/evidence/RTCOM_MATRIX_EVIDENCE_AND_GAPS.md`, LocalStorage key `rtcom.configuration.v1`, JSON schema 3, `#matrix-configurator` 주소 |

- 예상 효과: 배포 용량 약 4.3MB → 약 0.7MB(PDF 제외 시), 유지보수 대상이 구성기 하나로 집중.
- 사용자 저장 데이터: 구성기 LocalStorage·JSON 파일은 그대로 읽힙니다.
- 되돌리기: 삭제 커밋을 revert하면 0.6 상태로 복구됩니다.

## 6. 보류한 작업

- PHASE 3 제품 상세 페이지(`/product/:slug`) 구현을 진행하던 중 이 검토 요청을 받아 커밋하지 않고 `git stash`로 보관했습니다(`phase3-product-detail-wip (보류)`). 제품정보를 유지하기로 하면 이어갈 수 있고, 삭제하기로 하면 폐기합니다. stash는 이 클라우드 세션 컨테이너에만 있으므로 세션이 종료되면 사라집니다.

## 7. 권고

1. 제품정보는 삭제하고, 구성기를 사이트의 유일한 기능으로 만듭니다. 필요하면 헤더나 카드 설명에 AV portal 제품 페이지 링크만 둡니다.
2. 같은 작업에서 P0 이미지 결함을 수정하고 브라우저 E2E 테스트(앱 내 이동·직접 접속 모두)를 추가합니다.
3. 공개 Pages 위치(원본 저장소 vs `rtcom-av-design`)를 하나로 정리합니다.
