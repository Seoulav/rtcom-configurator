# 0.278.0 배포 기록 (2026-11-24)

- PR: #450 "0.278.0 다크 모드 제품 사진 받침·공통 디자인 토큰 파일(svt-tokens.css)"
- 병합: squash, main `6ec5b46`
  - `expectedHeadSha` 62e5920로 고정했습니다.
  - GitHub `RTCOM checks / verify`는 최신 커밋에서 success였습니다.
  - 병합 직전 main은 `237ce19`(0.277 배포 기록) 그대로였고, 열린 PR은 #450 하나뿐이었습니다.
- 경위: 사용자 요청 "2번 3번 진행해"(2026-11-24), 범위 확인 뒤 "2,3번 모두"
  - 2번: 다크 모드 제품 사진 받침을 옅은 회색으로 바꾸고 사진 밝기를 90%로 낮췄습니다.
  - 3번: 공통 디자인 토큰 파일 `src/svt-tokens.css`를 만들었습니다.
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 45361235700(417번), success(build → deploy 두 작업 구조)

## 공개 주소 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 표기 | `CATALOG BASED · 0.278` |
| 공개 파일 해시(SHA-256 앞 16자리) | main 빌드와 일치. 아래 5개 파일 |
| └ `index.html` | `4893c502248793cf` |
| └ `src/svt-tokens.css` | `e0e6472612954bff` |
| └ `src/styles.css` | `e158a6859832ceb0` |
| └ `src/products.js` | `7b8a4527cae7444a` |
| └ `product-hd-13u.html` | `6c6abd48ca9badd5` |
| 제품별 페이지의 토큰 파일 연결 | `product-hd-13u.html`에 `svt-tokens.css` 1곳 |
| 공개 `styles.css`의 사진 밝기 규칙 | `brightness(.9)` 있음 |
| 공개 `CLAUDE.md` | 404 |
| 공개 `docs/` | 404 |

## 로컬 검증 메모

- 단위 시험 225개, `build-product-index --check` 33개, `e2e-smoke` 317/317
- `dark_tokens --check` 최신, 표기 통일 0건, `check-version` 0.277 → 0.278
- 토큰화 전후 20개 화면의 계산 스타일 12,976개 요소가 같았습니다.
  - 다른 값은 LED 깜빡임 애니메이션 2곳뿐입니다.
  - 자세한 내용은 `docs/implementation/PHOTO_DIM_TOKENS_0.278.md`에 있습니다.
- 공개 사이트를 브라우저로 직접 여는 시험은 이 환경의 프록시 인증서 때문에 하지 못했습니다. 대신 공개 파일 해시와 코드 검색으로 확인했습니다.

## 남은 확인 사항

- 지시서 원문(`rtcom-configurator-design-touch.md`)을 받으면 토큰 값이 원문과 같은지 대조합니다(`docs/handoff/OPEN_ITEMS.md`).
