# 0.277.0 배포 기록 (2026-11-24)

- PR: #448 "0.277.0 다크 모드 ③ 3차: 시리즈 02 신호 구성·QMS 06 크로스포인트·WOS100 레이어 그림"
- 병합: squash, main `96d4957`
  - `expectedHeadSha` 6167e52로 고정했습니다.
  - GitHub `RTCOM checks / verify`는 최신 커밋에서 success였습니다.
  - 병합 직전 main은 `caef415`(0.276 배포 기록) 그대로였고, 열린 PR은 #448 하나뿐이었습니다.
- 경위: 사용자 요청 "3차 진행해줘"(2026-11-24). 시리즈 02 신호 구성·QMS 06 크로스포인트·XDM-WOS100 레이어 구성도의 다크 모드 흰 판을 없애 B단계 다크 모드 ③을 마쳤습니다.
- 같은 작업 중 0.276 배포 기록 PR #447을 병합하고 Pages를 다시 배포했습니다(run 45331099074, 414번, success).
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 45332843760(415번), success(build → deploy 두 작업 구조)

## 공개 주소 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 표기 | `CATALOG BASED · 0.277` |
| 공개 `index.html`·`src/products.js`·`src/styles.css`·`src/app.js` | main 빌드와 SHA-256 앞 16자리 일치(`be9529a68c0d2b36`·`7b8a4527cae7444a`·`37faec7d5e4baf87`·`a58aa3347252e8fb`) |
| 공개 `app.js`의 레이어 그림 다크 클래스 | `rt-layer-svg-wide rt-pg-dark-svg` 있음 |
| 공개 `styles.css`의 점선 칩 이름 규칙 | `text[fill="#3a3a3c" i]` 있음 |
| 공개 `CLAUDE.md` | 404 |
| 공개 `docs/` | 404 |

## 로컬 검증 메모

- 단위 시험 221개
- `build-product-index --check` 33개
- `e2e-smoke` 316/316
- `dark_tokens --check` 최신, 표기 통일 0건
- `check-version` 0.276 → 0.277
- 자세한 내용은 `docs/implementation/DARK_REST_0.277.md`에 있습니다.
- 공개 사이트를 브라우저로 직접 여는 시험은 이 환경의 프록시 인증서 때문에 하지 못했습니다. 대신 공개 파일 해시와 코드 검색으로 확인했습니다.

## 남은 확인 사항

- 없음(B단계 다크 모드 ③ 완료). 공통 토큰 파일 `svt-tokens.css`는 사용자 결정 후 따로 진행합니다(`docs/handoff/OPEN_ITEMS.md`).
