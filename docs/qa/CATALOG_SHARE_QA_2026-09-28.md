# 전체 카탈로그 공유 QA (0.94.0, 2026-09-28)

## 요청과 결정

- 사용자 요청: "카다로그도 일괄 공유할 수 있게해줘"
- Claude 제안: 제품별 발췌 PDF는 AI가 만들 수 없으므로, 전체 카탈로그 한 파일을 모든 제품이 함께 쓰고 버튼이 제품 쪽에서 열리게 합니다.
- 사용자 결정: "전체 카탈로그 공개해도 돼, 진행해"
- 자동 모드 검사가 공개 작업을 두 번 막았습니다. 사용자가 자동 모드를 끄고 승인하는 방식으로 진행했습니다.

## 공개 파일

| 원본 | 공개 위치 | 크기 | 확인 |
|---|---|---|---|
| `docs/RTcom_catalogue_2026_46p.pdf`(46쪽, InDesign 2026-03-20) | `output/design/assets/docs/rtcom-catalog-2026.pdf` | 3,226,094 byte | Git blob `2e71793`이 원본과 같아 새 내용이 저장소 기록에 추가되지 않음 |

- 내부 정보 확인: 본문 46쪽에서 단가·견적·대외비 같은 단어를 찾지 못했습니다. "가격"은 14쪽 SPX 소개의 "합리적인 가격의 미디어 분산 솔루션" 한 곳뿐입니다.

## 제품별 쪽 번호 (46쪽판 본문 대조)

`catalogPages`의 첫 쪽을 `page`로 썼습니다. 모델명이 그 쪽 본문에 있는지 스크립트로 확인했습니다.

| 제품 | 쪽 | 제품 | 쪽 |
|---|---|---|---|
| XDM Series | 4 | HDS-21U | 32 |
| XDM-CTR100 · CTR100 PSE | 10 | HDS-42MU | 33 |
| XDM-CT103/CR103 | 11 | HD-13U | 34 |
| XDM-FT101/FR101 | 12 | HD-104U(본문 표기 HD-14U) | 35 |
| SPX Series | 13 | HD-108U(본문 표기 HD-18U) | 36 |
| SPX-TX/SPX-RX | 16(본문 "SPX-RX/TX"가 16쪽에만 있어 catalogPages 15–16 대신 16) | HD-210U | 37 |
| VDM Series | 17 | MR-4S | 38 |
| CT101-U/CR101-U | 21 | OBHD-2C | 39 |
| CT103-U-H/CR103-U | 22 | OBUX-1C | 40 |
| CT104-U/CR104-U | 23 | HOC-UX | 41 |
| FT101-U/FR101-U | 24 | LHOC | 42 |
| FT103-U-H/FR103-U | 25 | AHOC | 43 |
| QMS-44UX | 27 | UMC | 44 |
| QMS-88UX | 28 | HD-D102U | 29 |

XDM-PSU는 카탈로그 쪽이 없어 버튼을 두지 않았습니다(제품 목록의 전체 카탈로그 버튼으로 봄).

## 변경

- `data/products/*.json` 29개: Catalog 문서에 `file: "rtcom-catalog-2026.pdf"`·`page`를 넣고 `note`를 "카탈로그 46쪽판 N쪽 · 전체 카탈로그 공개본"으로 바꿨습니다. 예전 note에는 "36쪽"처럼 옛 판 쪽 번호가 남은 곳이 있었습니다.
- `scripts/build-product-index.cjs`: 공용 문서 예외 `SHARED_DOCS`(Catalog에만, `page` 1~46)를 더했습니다.
- `src/products.js`
  - 새 탭 링크에 `#page=N`을 붙이고, 버튼에 "34쪽"처럼 쪽을 표시합니다. 내려받기는 전체 파일을 받습니다.
  - 제품 목록 상단에 "전체 카탈로그 PDF" 버튼을 넣었습니다.
- `src/styles.css`: 쪽 표시 글자 크기를 정했습니다.
- `tests/site.test.cjs`
  - 0.7 때 넣은 `rtcom-catalog-2026` 금지 문자열을 뺐습니다.
  - dist에 공용 카탈로그가 있는지 확인합니다. `docs/` 원본 경로는 계속 배포되지 않아야 합니다.
  - 공용 문서 검증 테스트 3개를 더했습니다.
- `scripts/e2e-smoke.cjs`: HD-13U 버튼 주소(`#page=34`)·쪽 표시·PDF 응답과 제품 목록의 전체 카탈로그 버튼을 확인합니다.
- 문서: `CLAUDE.md` 호환성 문단·버전 문장, `docs/implementation/PRODUCT_DOCUMENT_DOWNLOADS.md`, `output/design/assets/docs/README.md`, `CHANGELOG.md`

## 검증

- `node --test tests/*.test.cjs`: 43/43
- `node scripts/build-product-index.cjs --check`: 30개 통과
- `node scripts/package-site.cjs`: 통과(dist에 `rtcom-catalog-2026.pdf` 포함)
- `node scripts/e2e-smoke.cjs`: 149/149
- `git diff --check`: 통과
- 화면: `docs/qa/catalog-share-screens/`(`list`·`hd-13u` × 1280·390px). 가로 스크롤 0px입니다.

## 남은 위험

- `#page=N`은 Chrome·Edge·Firefox·Android PDF 뷰어에서 해당 쪽으로 이동합니다. 아이폰 Safari는 1쪽부터 열 수 있습니다.

## 되돌리기

- 병합 커밋을 revert하고 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다. 사이트에서는 파일과 버튼이 사라집니다.
- 이 PDF는 이미 공개 저장소 `docs/`에 있었으므로 Git 기록에서는 계속 받을 수 있습니다.
