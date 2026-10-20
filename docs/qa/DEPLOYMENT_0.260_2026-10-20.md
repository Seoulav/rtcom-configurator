# 0.260.0 배포 기록 (2026-10-20)

- PR: #413 "0.260.0 전 제품 사진 확대 팝업과 원형 돋보기(B안)"
- 병합: squash, main `84266c6` (`expectedHeadSha` 7379036 고정, GitHub `RTCOM checks / verify` success)
  - 병합 직전 main에 배포 기록(#412, 문서만)이 들어와 작업 브랜치에 병합한 뒤 다시 검사했습니다.
  - 이전 커밋 `35abc22`의 검사 성공 알림은 병합 근거로 쓰지 않았습니다.
  - 열린 PR은 이 PR 하나뿐이었습니다.
- 경위: 사용자가 "알티컴 전 제품에 적당한 크기의 돋보기"(2026-10-20)를 요청하고 두 방식 중 B안(확대 버튼 → 팝업 안에서 돋보기)을 골랐습니다. 제품 상세 머리와 02 Port Map 사진 칸에 🔍 버튼을 넣어 사진 확대 팝업을 열고, 팝업 안에서 원형 돋보기를 쓰게 했습니다.
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 39420986975, success

## 공개 주소 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 표기 | `CATALOG BASED · 0.260` |
| 공개 `index.html`·`src/products.js`·`src/styles.css` | main 빌드와 SHA-256 앞 16자리 일치(`4173cedb867cb9a9`·`6d81c3e9541fbf1f`·`a379628cf798404c`) |
| 공개 `products.js`의 돋보기 코드 | `openPhotoZoom`, `PHOTO_LENS={mouse:{size:180,mag:2.5,lift:0},touch:{size:130,mag:2.5,lift:28}}` 확인 |
| 공개 `styles.css`의 돋보기 스타일 | `rt-photo-lens` 3곳 확인 |
| 공개 `CLAUDE.md` | 404 |
| 공개 `docs/` | 404 |

## 로컬 검증 메모

- PR 병합 전에 다음 검사를 모두 통과했습니다. 자세한 내용은 `docs/implementation/PHOTO_LOUPE_0.260.md`에 있습니다.
  - 단위 테스트 201개
  - `build-product-index --check` 33개
  - `e2e-smoke` 291/291(사진 확대 팝업 항목 추가)
  - 표기 통일 바뀔 곳 0건, `dark_tokens --check` 최신
  - `check-version` 0.259 → 0.260, `git diff --check`
- 공개 사이트를 브라우저로 직접 여는 시험은 이 환경의 프록시 인증서 때문에 하지 못했습니다. 대신 공개 파일 해시와 돋보기 코드·스타일이 있는지로 확인했습니다.

## 남은 확인 사항

- 없음.
