# 0.259.0 배포 기록 (2026-10-20)

- PR: #411 "0.259.0 SPX-TX/RX Signal Flow에 PoC 전원 연결 표현"
- 병합: squash, main `90c7352` (`expectedHeadSha` 190ba71 고정, GitHub `RTCOM checks / verify` success, 병합 직전 main은 `caf8429` 그대로, 열린 PR은 이 PR 하나뿐)
- 경위: 사용자가 SPX-TX/RX 제품정보 화면 캡처와 함께 "poc기능이 있어서 tx또는 rx 한쪽에만 dc어댑터를 꽂으면 되 그 부분을 표현해줘"(2026-10-20)라고 요청했습니다. 03 Signal Flow에 방법 ① TX에만, 방법 ② RX에만 어댑터를 연결하는 그림을 더했습니다.
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 39418516300, success

## 공개 주소 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 표기 | `CATALOG BASED · 0.259` |
| 공개 `src/products.js`·`data/products/spx-rx-tx.json`·`index.html` | main 파일과 SHA-256 앞 16자리 일치(`6389a7c66edc6625`·`00bd69e46b3bb3ff`·`fc98624dea94bb6e`) |
| 공개 `products.js`의 PoC 그림 코드(`pocPair`) | 3곳 확인 |
| 공개 JSON의 PoC 문구(`한쪽에만 연결(PoC)`) | 확인 |
| 공개 `CLAUDE.md` | 404 |
| 공개 `docs/` | 404 |

## 로컬 검증 메모

- PR 병합 전 단위 테스트, `build-product-index --check`, `e2e-smoke`(PoC 확인 항목 추가), 표기 통일 바뀔 곳 0건, `dark_tokens --check`, `check-version` 0.258 → 0.259, `git diff --check`를 통과했습니다. 자세한 내용은 `docs/implementation/SPX_TXRX_POC_FLOW_0.259.md`에 있습니다.
- 화면 캡처는 `docs/qa/spx-poc-0.259/`에 있습니다.
- 공개 사이트를 브라우저로 직접 열어 보는 시험은 이 환경의 프록시 인증서 때문에 하지 못해, 공개 파일 해시와 PoC 코드·문구 존재 여부로 확인했습니다.

## 남은 확인 사항

- 없음.
