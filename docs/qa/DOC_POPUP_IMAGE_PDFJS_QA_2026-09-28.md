# HD-13U 문서 팝업: 카탈로그는 이미지, 매뉴얼은 PDF.js (2026-09-28, 테스트 단계)

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

## 병합할 때 할 일

사용자 테스트 뒤 승인되면 main을 다시 받아 버전(다음 번호)·CHANGELOG·CLAUDE.md 이력을 올리고 병합·배포합니다.

## 되돌리는 방법

`hd-13u.json`의 `preview`·`previewImages`를 지우면 두 버튼 모두 새 탭 방식으로 돌아갑니다.
