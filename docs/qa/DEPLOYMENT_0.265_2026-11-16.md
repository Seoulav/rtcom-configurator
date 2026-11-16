# 0.265.0 배포 기록 (2026-11-16)

- PR: #423 "0.265.0 Signal Flow 크게 보기 CAD식 이동·확대"
- 병합: squash, main `66d19a6` (`expectedHeadSha` 05e40cf 고정, GitHub `RTCOM checks / verify` success)
  - 병합 직전 main 변화는 없었고, 열린 PR은 이 PR 하나뿐이었습니다.
- 경위: 사용자 요청(2026-11-16 "XDM PSU에서 03 시그널 플로우를 확대했을 때 … 화면을 이동하는 게 좀 불편한데", "캐드처럼 가능할까?")
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 43806042362, success

## 공개 주소 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 표기 | `CATALOG BASED · 0.265` |
| 공개 `index.html`·`src/products.js`·`src/styles.css` | main 빌드와 SHA-256 앞 16자리 일치(`7eb6bca97b2baa70`·`f18bb8b7c64dce84`·`d49a71198713085b`) |
| 공개 `products.js`의 CAD식 조작 코드(`bindFlowPan`) | 확인 |
| 공개 `CLAUDE.md` | 404 |

## 로컬 검증 메모

- PR 병합 전에 다음 검사를 모두 통과했습니다. 자세한 내용은 `docs/implementation/FLOW_ZOOM_CAD_0.265.md`에 있습니다.
  - 단위 테스트 209개
  - `build-product-index --check` 33개
  - `e2e-smoke` 294/294(휠 기준점·끌기·맞춤·두 손가락 확대)
  - 표기 통일 0건, `dark_tokens --check` 최신
  - `check-version` 0.264 → 0.265
- 공개 사이트를 브라우저로 직접 여는 시험은 이 환경의 프록시 인증서 때문에 하지 못했습니다. 대신 공개 파일 해시와 코드가 있는지로 확인했습니다.

## 남은 확인 사항

- 실제 휴대폰에서 두 손가락 확대를 써 보는 확인(브라우저 시험은 가짜 터치로만 확인)
