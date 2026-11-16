# 0.267.0 배포 기록 (2026-11-16)

- PR: #427 "0.267.0 XDM-MR4S 03 Signal Flow 크게 보기"
- 병합: squash, main `5d95bdc` (`expectedHeadSha` aeb1844 고정, GitHub `RTCOM checks / verify` success)
  - 병합 직전 main은 `f3315c7` 그대로였습니다.
  - 병합 직전 열린 PR에 다른 세션의 #428(초안, 같은 0.267.0 번호, 공개 사이트 AV Portal 언급 제거)이 있었습니다. 겹치는 파일은 버전 기록 파일과 `src/products.js`의 서로 다른 줄뿐이라 먼저 검사를 통과한 #427을 병합했습니다. #428은 병합 직전 규칙대로 0.268.0으로 번호를 옮겨야 합니다.
- 경위: 사용자 요청 "XDM-MR4S Singal Flow도 크게 보기 넣어줘"(2026-11-16). XDM-PSU·XDM-CTR100 PSE와 같은 CAD식 확대 창을 XDM-MR4S 03 Signal Flow에 넣었습니다.
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 43852904271(394번), success

## 공개 주소 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 표기 | `CATALOG BASED · 0.267` |
| 공개 `index.html`·`src/products.js`·`src/styles.css` | main 빌드와 SHA-256 앞 16자리 일치(`62a15bea3dfddbf0`·`21eeb593c2b1302a`·`29dcb8045261c390`) |
| 공개 `products.js`의 "크게 보기" 버튼 | 3곳(XDM-PSU·XDM-CTR100 PSE·XDM-MR4S) |
| 공개 `CLAUDE.md` | 404 |
| 공개 `docs/` | 404 |

## 로컬 검증 메모

- 단위 테스트 208개, `build-product-index --check` 33개, `e2e-smoke` 294/294(MR4S 크게 보기 항목 추가), 표기 통일 0건, `dark_tokens --check` 최신, `check-version` 0.266 → 0.267, `git diff --check`
- 공개 사이트를 브라우저로 직접 여는 시험은 이 환경의 프록시 인증서 때문에 하지 못했습니다. 공개 파일 해시와 코드 검색으로 확인했습니다.

## 남은 확인 사항

- 없음.
