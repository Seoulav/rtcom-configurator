# 연결 다이어그램 정확성 수정 — A1·A2·B1·B2 (0.30.0)

- 요청: 사용자 지시(2026-09-27), 근거 문서 `docs/audit/PRODUCT_DIAGRAM_REVIEW_2026-09-27.md`의 A1·A2·B1·B2, 카탈로그 원본 `docs/RTcom_catalogue_2026_46p.pdf`
- 기준 브랜치: `claude/relaxed-euler-mq1di9`(PR #23), 0.29.0(VDM 카드 문구·XDM-288 삭제) 다음 작업

## A1. XDM-CTR100 "조합 1" 배선 수정

- 위치: `src/products.js` `extenderDiagram()`의 `pseCombo` 분기(대상: `xdm-ctr100`)
- 문제: 제목이 "XDM-CIS100·COS100 카드에 직결"인데 실제 그림은 `소스 → CTR100(TX) → CTR100(RX) → 디스플레이`로 CTR100끼리 짝짓고 있어 매트릭스 카드가 그림에 없었다.
- 수정: 두 줄로 나눠 실제 배선대로 그렸다.
  - 입력 경로(위 줄): 소스 기기 → **XDM-CTR100**(TX · 전원 직접 연결) → HDBaseT(CATx) → **XDM-CIS100**(입력 카드)
  - 출력 경로(아래 줄): **XDM-COS100**(출력 카드) → HDBaseT(CATx) → **XDM-CTR100**(RX · 전원 직접 연결) → 디스플레이
  - 매트릭스 카드(XDM-CIS100·COS100)는 `deviceBox()`로 그린다(요청대로).
- 조합 2 제목을 "매트릭스 카드에 연결하지 않을 때"에서 "HDBaseT 카드 없이 연장할 때(XDM HDMI 카드 연장·단독 1:1)"로 바꿨다(근거: `src/core.js`의 `psePair`가 XDM-HI100/HIS100/HOS100/WOS100 HDMI 카드 연장에 쓰인다). 소스·디스플레이 아이콘과 화살표를 추가해 다른 조합과 같은 형태로 통일했다.
- 전송거리: `distanceSpec` 단수 조회를 `distanceSpecs` 배열 조회로 바꿔, "최대 전송거리" 사양 행이 여러 개면(XDM-CTR100은 BELDEN 10GXE02 CAT6A 100m·CI6522 CAT6 80m 두 행) 전부 이어 붙여("최대 100m / 80m") 보여준다. 다른 전송기 제품(행이 1개)은 그대로 한 줄만 나온다.
- "그 외 신호" 안내: 커넥터 원문(`shortConnector(port.connector)`, 예: "Female Phoenix connector 5p") 대신 `port.signal`(예: "RS-232 / Audio")을 보여준다. 모든 전송기 제품에 적용되는 공통 변경이다.

## A2. 제조사 원본 다이어그램과 사양표 불일치 경고

- 위치: `data/products/qms-88ux.json`·`qms-44ux.json`의 `images[]` Diagram 항목에 선택 필드 `diagramMismatch`를 추가했다. `src/products.js`의 `connectionDiagram()` 사진 분기가 이 필드가 있으면 다이어그램 아래에 주황색 "표기 다름" 배지와 함께 안내 문구를 보여준다.
- QMS-88UX: "제조사 원본 그림은 후면 라벨이 HDMI IN/OUT 1~8·DC+12V로, 실제 제품(출력 10포트[9·10번 쿼드뷰]·100-200 VAC)과 다른 섀시 그림으로 보입니다 — 포트 수·전원 표기는 제품사양 표 기준으로 확인하세요."
- QMS-44UX: "제조사 원본 그림의 전원 표기(+12V DC 5A)가 제품사양 표(DC 12V 2A)와 다릅니다 — 포트 수·전원 표기는 제품사양 표 기준으로 확인하세요."
- 기존 R2·R3(QMS-88UX)·R1(QMS-44UX) issue는 그대로 두었다(값 자체를 바꾸지 않았다). 이번 변경은 "그림과 사양표 중 사양표가 맞다"는 안내를 화면에 추가한 것뿐이다.

## B1. 제조사 다이어그램 출처 캡션(figcaption)

- `connectionDiagram()`의 사진 분기에서 `photo.note`를 `<p class="rt-product-diagram-caption">`로 보여준다("Diagram · " 접두어는 다른 이미지 캡션과 같은 방식으로 뗀다).
- SPX Series 페이지: 기존 `spx.json`의 note("카탈로그 46쪽판 13쪽 제조사 제공 시스템 구성도(SPX-M810 모델 기준)")가 이제 화면에 그대로 보여, SPX-M810 기준 구성도라는 사실이 다른 SPX 프레임(M1620~M24120)에도 똑같이 적용된다는 오해를 줄인다.
- 다른 9개 제조사 원본 다이어그램(HD 5종, QMS 2종 등)도 같은 방식으로 출처·쪽 번호가 화면에 보인다.

## B2. 다이어그램 재크롭

- 문제(원본 보고): HD-13U·HD-18U·HD-210U·HD-D102U·HDS-21U는 아래쪽 테두리가 잘림(HD-D102U는 모니터 받침까지), QMS-44UX·QMS-88UX는 위쪽에 카탈로그 표 경계선이 한 줄 남음, SPX는 아래쪽 여백이 과함.
- 원인: 이전 크롭은 "Color Key" 텍스트 위치를 기준으로 위쪽을 정하고 페이지 하단(쪽 번호 제외)까지를 크롭했는데, 다이어그램의 실제 테두리(사각형 벡터 도형)가 이 추정 범위보다 크거나(아래쪽이 잘림) 더 좁은데(위쪽에 표 선이 남음) 이를 반영하지 못했다.
- 수정: `docs/RTcom_catalogue_2026_46p.pdf`를 PyMuPDF(`pymupdf`)로 열어 `page.get_drawings()`로 다이어그램의 테두리 사각형(폭>150pt·높이>60pt인 도형 중 가장 큰 것)을 직접 찾고, 그 테두리에 여백 6pt를 더해 260dpi로 다시 렌더링했다.
  - HD-13U(46쪽판 34쪽)·HD-18U(36쪽)·HD-210U(37쪽)·HD-D102U(29쪽)·HDS-21U(32쪽)·QMS-44UX(27쪽)·QMS-88UX(28쪽): 이 방식으로 재크롭. 테두리 사각형 좌표가 여러 제품에서 정확히 같아(같은 템플릿 레이아웃) 6개는 `Rect(80.9, 596.1, 533.2, 801.3)`, HDS-21U만 `Rect(80.9, 625.9, 533.2, 801.3)`이었다.
  - SPX(13쪽): 이 페이지의 큰 사각형은 다이어그램 배경 패널이라 제목 텍스트("SPX-M810", PDF 텍스트 레이어 y=171.8)보다 아래에서 시작하고 실제 콘텐츠(Zone 영상 썸네일, y=701.9)보다 훨씬 아래(y=743.8)까지 내려가 여백이 과했다. 제목 텍스트 위치와 실제 콘텐츠 하단 위치를 직접 찾아 `Rect(56, 173, 539, 717)`로 수동 지정했다.
  - 렌더링 폭이 1600px를 넘으면 LANCZOS로 1600px에 맞춰 축소했다(기존 자산과 같은 크기 정책).
  - 파일명은 모두 그대로 유지했다(`<id>-diagram.webp`).

## 검증

- `node --test tests/*.test.cjs`, `node scripts/build-product-index.cjs --check`, `node scripts/package-site.cjs`, 전역 Playwright로 `node scripts/e2e-smoke.cjs` 모두 통과. 자세한 수치는 `docs/qa/PRODUCT_DIAGRAM_FIXES_A1_A2_B1_B2_QA.md` 참고.

## 되돌리는 방법

- 코드(`src/products.js`, `src/styles.css`)와 데이터(`qms-88ux.json`·`qms-44ux.json`의 `diagramMismatch` 필드)는 이 작업을 담은 커밋을 revert하면 원래대로 돌아간다.
- 이미지 파일(`output/design/assets/products/*.webp` 8장)은 git 히스토리에 이전 버전이 남아 있으므로, 되돌리려면 이 커밋 이전 시점의 해당 파일들을 `git checkout <이전 커밋> -- output/design/assets/products/<파일명>`으로 복원하면 된다.
