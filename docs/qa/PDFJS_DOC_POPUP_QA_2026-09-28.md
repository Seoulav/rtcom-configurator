# HD-13U 카탈로그 팝업 PDF.js 전환 QA (2026-09-28, 0.112.0)

## 요청

- "HD-13U 카탈로그 팝업 샘플 pdf파일 다운로드 뜨지 않게 카탈로그를 직접 보이게해줘 뭐가 제안해줘"
- 제안(이미지 변환 / PDF.js) 비교 후 "PDF.js이 방식은 비용이 드니?" → 무료(Apache 2.0) 확인 → "PDF.js로 HD-13U 적용해줘"

## 원인

0.108 샘플 팝업(`openDocPreview`)은 `<iframe src="…hd-13u-catalog.pdf">`로 PDF를 넣었습니다. iframe 안의 PDF는 브라우저 자체 PDF 보기 기능에 기대기 때문에, 그 기능이 없는 브라우저(휴대폰 크롬, 카카오톡 등 인앱 브라우저, "PDF 파일을 열지 않고 다운로드" 설정을 켠 크롬)에서는 화면에 보이지 않고 파일 다운로드로 넘어갑니다. 공개 서버 응답(`content-type: application/pdf`, `content-disposition` 없음)은 정상이었습니다.

## 수정

- `src/vendor/pdfjs/`: pdfjs-dist 4.10.38 legacy 빌드의 `pdf.min.mjs`(389KB)·`pdf.worker.min.mjs`(1.38MB)와 `LICENSE`(Apache 2.0)를 원본 그대로 넣었습니다(`VERSION.txt`에 출처). legacy 빌드를 고른 이유는 휴대폰·인앱 브라우저처럼 오래된 엔진에서도 돌아가게 하기 위해서입니다. HD-13U 카탈로그 PDF는 한글 글꼴(Noto Sans CJK 등)이 PDF 안에 들어 있어 CMap·기본 글꼴 파일(약 2.5MB)은 넣지 않았습니다.
- `src/products.js` `openDocPreview()`: 팝업을 처음 열 때만 PDF.js를 불러오고(`import()`를 `Function`으로 감싸 옛 브라우저가 products.js 전체를 못 읽는 일을 막음), 쪽마다 canvas에 화면 폭 맞춤으로 그립니다. 화면 배율(devicePixelRatio)만큼 선명하게 그리되 canvas 한 변은 4096px 이하로 제한합니다. 확대 버튼(100·150·200·300%)을 누르면 다시 그리고, 연속으로 누르면 앞선 그리기는 버립니다. 머리에 "원본"(새 탭)·⤓ 내려받기·닫기를 두고, 불러오기에 실패하면 "PDF 원본 열기" 링크를 보여 줍니다.
- `src/styles.css`: 팝업 본문을 회색 바탕 위 흰 쪽 카드로 바꾸고 가로·세로 스크롤을 허용했습니다. 560px 이하에서는 제목을 위 줄, 버튼을 아래 줄로 나눴습니다.
- `scripts/package-site.cjs`: PDF.js 파일 3개를 배포 목록에 넣었습니다.
- `scripts/serve.cjs`, `scripts/e2e-smoke.cjs`: 로컬·검사 서버가 `.mjs`를 자바스크립트로 보내게 했습니다(없으면 모듈 불러오기가 막혀 팝업에 실패 안내만 나옴 — 실제로 e2e에서 먼저 이 증상을 재현하고 고쳤습니다).

## 검증

```
node --test tests/*.test.cjs                    # 46/46 pass (0.112 테스트 추가)
node scripts/build-product-index.cjs --check    # 제품 30개 검증 통과
node scripts/package-site.cjs                   # dist/src/vendor/pdfjs/ 포함 확인
node scripts/e2e-smoke.cjs                       # 154/154 passed
git diff --check
```

- e2e: 팝업을 열면 canvas 1쪽이 그려지고 iframe이 없으며, + 를 누르면 150%로 canvas 폭이 1.3배 넘게 커지고, 원본·내려받기 링크가 모두 `hd-13u-catalog.pdf`이며, 닫기로 닫힘.
- Playwright 화면 확인: PC(1280px)와 휴대폰(Pixel 7 에뮬레이션) 모두 카탈로그 34쪽이 팝업 안에 바로 그려지고 다운로드 이벤트가 생기지 않음. 사양 표·연결도 글자까지 읽힘.

## 남은 위험

- 공개 사이트는 팝업을 처음 열 때 약 1.8MB를 더 받습니다(휴대폰에서 1~2초). 평소 페이지 로딩에는 영향이 없습니다.
- 다른 제품·매뉴얼 PDF는 아직 기존 방식(새 탭)입니다. 넓힐지는 `docs/handoff/OPEN_ITEMS.md` "사용자 확인 대기"에 적었습니다.

## 되돌리는 방법

이 커밋을 `git revert`하면 iframe 팝업으로 돌아갑니다. `src/vendor/pdfjs/`만 지우면 팝업은 "미리보기를 불러오지 못했습니다 · PDF 원본 열기" 안내로 바뀝니다.
