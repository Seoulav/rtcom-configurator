# 0.274.0·0.275.0 배포 기록 (2026-11-24)

## 0.274.0 (전 제품 Signal Flow 크게 보기) — 배포 실패 후 0.275와 함께 공개

- PR: #431, squash 병합 main `9596778`
  - `expectedHeadSha` 8b4be4a로 고정했고, GitHub `RTCOM checks / verify`는 success였습니다.
  - 처음에는 0.269로 올렸으나 병합 전에 멈췄습니다. 그 사이 main이 0.273까지 나아가 main을 병합하고 번호를 옮겼습니다.
- Pages 배포 run 410은 두 번 모두 실패했습니다(1차 01:38, 재실행 01:50 UTC). 공개 사이트는 0.273으로 남았습니다.
  - 시험·패키징·사이트 묶음 업로드(약 67MB)는 성공했습니다.
  - 업로드 0.4초 뒤 `actions/deploy-pages@v4`의 묶음 조회 결과가 "Found 0 artifact(s)"였습니다.
  - 같은 시각 실행 기록에는 묶음(`github-pages`)이 정상으로 남아 있었고, GitHub 상태 페이지는 Actions·Pages·API 모두 정상이었습니다.
- 조치: 0.275에서 `pages.yml`을 GitHub 공식 예시처럼 `build` → `deploy`(`needs: build`) 두 작업으로 나눴습니다(`docs/implementation/DARK_FLOW_0.275.md`).

## 0.275.0 (다크 모드 ③ 1차 + 배포 작업 분리)

- PR: #444, squash 병합 main `19ab129`
  - `expectedHeadSha` 1edcbfd로 고정했고, GitHub `RTCOM checks / verify`는 success였습니다.
  - 병합 직전 main은 `9596778` 그대로였고, 열린 PR은 #444 하나뿐이었습니다.
- Pages 배포 run 411이 새 구조(build → deploy)로 success했습니다.

## 공개 주소 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 표기 | `CATALOG BASED · 0.275` |
| 공개 `index.html`·`src/products.js`·`src/styles.css` | main 빌드와 SHA-256 앞 16자리 일치(`c9c0b2bb2b96ab13`·`b36e3e6fb8cfdd06`·`5eac104bc70ba43e`) |
| 공개 `products.js`의 크게 보기·그림 표시 코드 | `withFlowZoom`·`rt-pg-flow-svg` 4곳 |
| 공개 `styles.css`의 Signal Flow 다크 규칙 | `svg.rt-pg-flow-svg` 24곳 |
| 공개 `CLAUDE.md` | 404 |
| 공개 `docs/` | 404 |

## 로컬 검증 메모

- 0.274: 단위 시험 217개, `build-product-index --check` 33개, `e2e-smoke` 313/313, `check-version` 0.273 → 0.274
- 0.275: 단위 시험 219개, `build-product-index --check` 33개, `e2e-smoke` 314/314, `dark_tokens --check` 최신, `check-version` 0.274 → 0.275
- 공개 사이트를 브라우저로 직접 여는 시험은 이 환경의 프록시 인증서 때문에 하지 못했습니다. 대신 공개 파일 해시와 코드 검색으로 확인했습니다.

## 남은 확인 사항

- 다크 모드 ③ 2·3차(`docs/handoff/OPEN_ITEMS.md`)
