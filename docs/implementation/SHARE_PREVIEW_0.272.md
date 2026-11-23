# 0.272.0 제품 링크 공유 미리보기 (2026-11-23)

## 1. 요청과 원인

- 사용자 요청 2026-11-23: "https://seoulav.github.io/rtcom-configurator/#products/hd-108u 링크 공유시 미리보기가 해당제품이 나오지 않아서 그러는데 이거 수정해줘", "모든 제품 링크 보냈을때 가능하게 만들어줘", "링크를 카카오톡으로 보냈을때 뭐를 공유했는지 나오게하고 싶은거야".
- 카카오톡·슬랙·페이스북 같은 곳은 링크를 붙이면 그 주소를 서버에서 읽어 `og:title`·`og:description`·`og:image`(Open Graph 메타 태그)로 미리보기를 만듭니다. 이 수집기는 자바스크립트를 실행하지 않습니다.
- 이 사이트는 주소의 `#` 뒤(`#products/hd-108u`)로 화면을 바꿉니다. `#` 뒤는 브라우저 안에서만 쓰이고 서버로 전달되지 않으므로, 수집기에는 어떤 제품 주소든 사이트 첫 화면(`index.html`)으로 보입니다. 첫 화면에는 제목·설명만 있고 미리보기 정보가 없었습니다.
- 그래서 `#` 주소 자체는 고칠 수 없고, **제품마다 `#`가 아닌 별도 주소를 만들어야** 합니다. 기존 `#` 주소 체계(호환성 계약)는 바꾸지 않았습니다.

## 2. 구현

| 위치 | 내용 |
|---|---|
| `scripts/build-share-pages.cjs` | `data/products/index.json`의 제품 33종마다 `dist/share/<id>/index.html`을 만든다. 미리보기 정보(제목 `제품이름 \| RTCOM 제품정보`, 설명 = 제품 `lead`에서 `**` 표시를 뺀 문장, `og:url`, `og:image` 절대 주소, 1200×630, `twitter:card=summary_large_image`)를 담고, 자바스크립트(`location.replace("../../#products/<id>")`)로 제품 상세에 보낸다. |
| `scripts/package-site.cjs` | 위 페이지를 생성하고 `output/design/assets/share/*`(미리보기 이미지)를 배포본에 복사한다. 공개 주소는 상수(`https://seoulav.github.io/rtcom-configurator/`)이고 환경 변수 `RTCOM_SITE_URL`로 바꿀 수 있다. |
| `scripts/tools/make_share_cards.cjs` | 제품마다 1200×630 JPEG를 만든다(Playwright, 사이트와 같은 Pretendard 글꼴·글래스 색감, 위쪽에 이름·분류·설명, 아래쪽 흰 판에 제품 사진을 잘리지 않게 맞춤). 제품 사진·이름·설명이 바뀌면 `NODE_PATH=$(npm root -g) node scripts/tools/make_share_cards.cjs`로 다시 만든다. 배포 빌드는 이 도구를 실행하지 않고 저장소에 둔 이미지만 복사한다. |
| `output/design/assets/share/` | 미리보기 이미지 34장(제품 33 + `site.jpg`), 합계 약 1.8MB, 장당 약 60~80KB. |
| `index.html` | 첫 화면 기본 미리보기(`og:*`, `twitter:*`, `site.jpg`). |
| `src/products.js` | 제품 상세·시리즈 상세 머리에 `🔗 링크 공유` 버튼(`data-share-link`). PC는 `share/<id>/` 주소를 복사하고 글자를 잠시 "✓ 링크를 복사했습니다"로 바꾼다(클립보드가 막힌 브라우저는 임시 입력칸 복사 → 주소 안내 창 순서로 대체). 터치 화면(`pointer: coarse`)에서 `navigator.share`가 있으면 기기 공유 창을 연다. |

- **이동을 자바스크립트로만 하는 이유:** `<meta http-equiv="refresh">`를 쓰면 일부 수집기가 따라가서 첫 화면 정보를 읽을 수 있어 쓰지 않았습니다(시험이 금지). 자바스크립트를 못 쓰는 환경을 위해 본문에 이동 링크를 남겼습니다.
- **사이트 규칙:** 새 페이지·이미지 어디에도 AV Portal·AV System Builder 언급이 없습니다(공개 사이트 검사 시험이 `dist/` 텍스트 파일 전체를 검사).

## 3. 사용 방법과 한계

- **공유할 때:** 제품 상세에서 `🔗 링크 공유`를 누르면 `https://seoulav.github.io/rtcom-configurator/share/<제품id>/`가 복사됩니다. 휴대폰은 기기 공유 창이 열립니다. 이 주소를 카카오톡에 보내면 제품 이름·설명·사진이 미리보기로 나옵니다.
- **한계 1:** 브라우저 주소창의 `…/#products/hd-108u`를 그대로 붙이면 이전처럼 첫 화면 정보가 나옵니다. `#` 뒤를 읽는 수집기는 없습니다.
- **한계 2(카카오톡 캐시):** 카카오톡은 한 번 읽은 주소의 미리보기를 기억합니다. 새 `share/<id>/` 주소는 처음 읽는 주소라 바로 나오지만, 이미 카카오톡에 보낸 적 있는 주소(사이트 첫 화면 포함)는 카카오 공유 디버거(https://developers.kakao.com/tool/debugger/sharing)에서 주소를 넣고 "초기화"해야 새 미리보기가 나옵니다.
- **한계 3:** 이 환경에서는 카카오톡 수집기로 직접 확인할 수 없어, 배포 뒤 공개 주소에서 미리보기 태그와 이미지 응답을 내려받아 확인했습니다(`docs/qa/DEPLOYMENT_0.272_*.md`).

## 4. 검증

- 단위 시험 3개: 33종 공유 페이지의 제목·설명(표시 기호 없음)·`og:url`·절대 주소 이미지·이동 스크립트·`meta refresh` 없음, 이미지 존재·JPEG 1200×630·500KB 미만, 첫 화면 `og:*`와 `site.jpg`, 버튼 소스(두 곳·`navigator.share`).
- 화면 시험 7개: 제품 상세 버튼, 복사된 주소(`share/hd-108u/`, `#` 주소 아님), 복사 안내 글 복귀, 시리즈(XDM) 버튼, 공유 페이지 정보, 이미지 응답(JPEG), 공유 주소로 들어오면 HD-18U(108U) 상세로 이동.
- 캡처: `docs/qa/share-preview-0.272/`(PC·휴대폰 버튼, 가로 넘침 0).

## 5. 되돌리기

PR을 revert하면 됩니다. 일부만 되돌릴 때: 버튼은 `src/products.js`의 `shareButton`·`shareProductLink`·`share:` 두 곳을, 공유 페이지는 `scripts/package-site.cjs`의 `writeSharePages` 호출을, 첫 화면 정보는 `index.html`의 `og:*` 태그를 지웁니다. 이미지 폴더는 배포 복사 목록(`shareAssets`)과 함께 지웁니다.
