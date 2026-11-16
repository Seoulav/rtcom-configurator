# 0.268.0 배포 기록 (2026-11-16)

- PR: #428 "0.268.0 공개 사이트의 AV Portal 언급 제거"
- 병합: squash, main `387b06c` (`expectedHeadSha` c5b5495 고정, GitHub `RTCOM checks / verify` success)
  - 작업 중 다른 세션이 0.267.0(XDM-MR4S 크게 보기, #427)과 그 배포 기록(#429)을 먼저 병합해 main을 두 번 병합하고 번호를 0.267 → 0.268로 옮겼습니다(CHANGELOG·CLAUDE.md 충돌은 main 내용을 먼저 두고 이 변경을 새 번호로 다시 넣음). 병합 근거는 최신 커밋 `c5b5495`의 검사 성공만 썼고 이전 커밋의 통과는 쓰지 않았습니다.
  - 병합 직전 main은 `1929b5a` 그대로였고 열린 PR은 이 PR 하나뿐이었습니다.
- 경위: 사용자가 "알티컴 사이트에서 av포탈 연결되거나 언급되지 않게 전부 지워줘, 알티컴 사이트를 경쟁업체까지 오픈할 계획이야"(2026-11-16)라고 요청했습니다. 공개 사이트에서 AV Portal 언급을 지웠습니다(화면 문구 12곳과 공개 소스 주석, 상세는 `docs/implementation/REMOVE_PORTAL_MENTIONS_0.268.md`).
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 43854160853, success

## 공개 주소 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 표기 | `CATALOG BASED · 0.268` |
| 공개 `index.html`·`src/app.js`·`src/products.js`·`src/styles.css`·`src/core.js`·`src/control-example.js` | main 파일과 SHA-256 앞 16자리 모두 일치 |
| 공개 주소에서 직접 내려받은 텍스트 파일(`.html·.js·.mjs·.css·.json·.svg·.txt·.md·.xml`) 54개에서 `portal`·`포탈`·`포털` 검색 | 언급이 있는 파일 0개 |
| 공개 `CLAUDE.md` | 404 |
| 공개 `docs/` | 404 |

## 로컬 검증 메모

- main 병합 결과 기준으로 단위 테스트 209개, `build-product-index --check` 33개, 표기 통일 바뀔 곳 0건, `dark_tokens --check` 최신, `check-version` 0.267 → 0.268, `git diff --check`를 통과했고 화면 시험(`e2e-smoke`)은 294/294 통과했습니다. 변경 전에는 `dist/`에서 3개 파일이 걸렸고 변경 후 0개입니다.
- 레이어 비교 팝업 캡처는 `docs/qa/remove-portal-0.268/`에 있습니다.
- 공개 사이트를 브라우저로 직접 열어 보는 시험은 이 환경의 프록시 인증서 때문에 하지 못해, 공개 주소에서 파일을 내려받아 해시와 검색으로 확인했습니다.

## 남은 확인 사항

- 저장소 내부 문서(`docs/`, `CLAUDE.md`, `README.md`, `CHANGELOG.md`, `scripts/` 주석)의 AV Portal 언급은 공개 사이트에 올라가지 않아 이번 범위에서 제외했습니다. GitHub 저장소가 경쟁업체에 공개 상태인지 사용자 확인이 필요합니다.
- 구성기 04의 "AV 빌더에서 바로 열기"(별도 도구 AV System Builder로 가는 링크)는 이번 요청 범위가 아니라 그대로입니다. 숨길지 사용자 판단이 필요합니다.
