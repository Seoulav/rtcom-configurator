# 문서 팝업: 카탈로그는 이미지, 매뉴얼은 PDF.js (2026-09-28, 0.124.0에서 전 제품 병합)

## 요청

- "PDF.js 방식으로 메뉴얼처리하는건 어때?", "13u 메뉴얼은 pdf.js으로 카탈로그는 이미지 방식으로 구현해줘"
- "test만해보고 올리지는 마", "test내가 해보개해줘" → **main 병합·공개 배포하지 않음.** 작업 브랜치에만 올리고 사용자 테스트를 기다립니다.

## 변경

- `data/products/hd-13u.json`: 카탈로그 문서에 `"preview": "image"`, `"previewImages": ["hd-13u-catalog-p1.webp"]`, 매뉴얼 문서에 `"preview": "pdfjs"`. 팝업 여부를 코드의 HD-13U 고정 조건 대신 데이터로 정합니다. 다른 제품은 `preview`가 없어 기존처럼 새 탭으로 엽니다.
- `scripts/tools/render_doc_previews.py`(신규): `preview: "image"` 문서의 쪽을 200dpi WebP로 그리고 `previewImages`를 채웁니다. HD-13U 카탈로그 1쪽 = 1654×2339px, 96KB. 카탈로그를 다시 자르면 이 스크립트도 다시 실행합니다.
- `scripts/build-product-index.cjs`: `preview`는 `image`·`pdfjs`만, `image`는 `previewImages` 그림 파일이 있어야 하고, 쪽 지정(`page`) 문서에는 쓸 수 없게 검사합니다.
- `src/products.js`: 팝업이 두 방식을 모두 처리합니다. 이미지 방식은 PDF.js를 불러오지 않고 그림을 바로 보여 주며 확대는 표시 폭만 바꿉니다. PDF.js 방식은 첫 쪽이 그려지는 대로 먼저 보여 주고 나머지 쪽을 이어 붙이며 "n / 11쪽 그리는 중…"을 표시합니다.
- `src/styles.css`: 쪽 그림(img)에도 canvas와 같은 흰 쪽 카드 모양.

## 검증

```
node --test tests/*.test.cjs                    # 46/46
node scripts/build-product-index.cjs --check    # 30개 통과
node scripts/package-site.cjs
node scripts/e2e-smoke.cjs                       # 155/155
git diff --check
```

- e2e: 카탈로그 팝업은 img 1장(1654px)만 쓰고 PDF.js 요청이 없으며 확대 시 1.3배 넘게 커짐. 매뉴얼 팝업은 PDF.js로 11쪽 canvas를 그리고 확대·원본·내려받기 동작.
- 화면 확인(PC 1280px·휴대폰 Pixel 7): 카탈로그는 사양 표·연결도까지 선명, 매뉴얼은 한글 본문·목차가 깨지지 않음(PDF에 없는 Arial은 PDF.js 대체 글꼴로 표시). 매뉴얼 첫 쪽 약 0.9초, 11쪽 전체 약 2.2초(로컬 서버 기준). 다운로드 이벤트 없음.

## 전 제품 확대(0.124.0)

사용자가 테스트 링크를 보고 "이거 좋아", 이어서 "전체 제품으로 넓혀서 올리기"를 골랐습니다.

- 데이터: 쪽 지정(`page`)이 없는 제품별 카탈로그 29개 문서에 `preview: "image"`, 매뉴얼 17개 문서에 `preview: "pdfjs"`를 넣었습니다(HD-13U 포함 44개 추가). `render_doc_previews.py`로 카탈로그 41쪽을 그렸습니다(모두 1654×2339px, 79~195KB, 합계 약 5.2MB). XDM 6쪽, SPX·VDM 4쪽, UMC 2쪽, 나머지 1쪽입니다.
- 긴 매뉴얼 처리: VDM 103쪽, XDM 55쪽, QMS-88UX 54쪽, QMS-44UX 39쪽처럼 쪽이 많아 0.113 테스트판처럼 모든 쪽을 차례로 그리면 휴대폰 메모리가 부족해질 수 있습니다. 그래서 `src/products.js`를 다음처럼 바꿨습니다.
  - 문서를 열면 모든 쪽의 크기만 먼저 읽어 쪽마다 빈 자리(`.rt-doc-page`)를 만듭니다. 스크롤바 길이가 처음부터 맞습니다.
  - `IntersectionObserver`(화면에 들어온 요소를 알려 주는 브라우저 기능)로 보이는 쪽과 앞뒤 한 화면만 골라, 화면 가운데에 가까운 쪽부터 한 장씩 그립니다.
  - 멀어진 쪽의 canvas는 크기를 0으로 줄여 비우고, 팝업을 닫으면 관찰을 멈추고 PDF 문서를 풀어 줍니다.
  - 확대하면 쪽 자리 크기를 새 배율로 바꾸고, 읽던 위치 비율을 유지한 채 보이는 쪽만 다시 그립니다.
- 검사 추가: `tests/site.test.cjs` 0.124 테스트(모든 제품별 카탈로그가 image·쪽 그림 파일 존재, 모든 매뉴얼이 pdfjs, 지연 그리기·비우기·문서 풀기 코드 존재). e2e에 XDM 카탈로그 6쪽 그림, VDM 매뉴얼 103쪽(첫 화면 canvas 10장 이하, 끝으로 내리면 103쪽이 그려지고 1쪽은 비워짐)을 더했습니다. VDM 매뉴얼 첫 쪽 표시 약 0.46초(로컬 서버).

```
node --test tests/*.test.cjs                    # 48/48
node scripts/build-product-index.cjs --check    # 31개 통과
node scripts/package-site.cjs                   # 쪽 그림 41장 포함
node scripts/e2e-smoke.cjs                       # 168/168
git diff --check
```

## 되돌리는 방법

제품 JSON의 `preview`·`previewImages`를 지우면 그 문서 버튼은 새 탭 방식으로 돌아갑니다. 전체를 되돌리려면 0.124.0 병합 커밋을 revert합니다.
