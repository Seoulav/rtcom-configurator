# 0.258.0 배포 기록 (2026-10-20)

- PR: #409 "0.258.0 XDM 07 시뮬레이터 출력 카드 선택 버튼 색 구분"
- 병합: squash, main `78b37d7` (`expectedHeadSha` e66da97 고정, GitHub `RTCOM checks / verify` success, 병합 직전 main은 `d39cf9a` 그대로, 열린 PR은 이 PR 하나뿐)
- 경위: 사용자가 XDM "07 화면 연출 시뮬레이터" 화면 캡처와 함께 "XDM-WOS100과 XDM-HOS100 선택 버튼의 색상을 서로 다르게해서 눈에 띄게 해줘"(2026-10-20)라고 요청했습니다. WOS100은 파랑, HOS100은 주황으로 구분하고, 선택하지 않은 버튼도 자기 색 글자와 옅은 배경으로 보이게 했습니다.
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 39378541296, success

## 공개 주소 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 표기 | `CATALOG BASED · 0.258` |
| 공개 `src/styles.css`·`index.html`·`src/layout-sim.js` | main 파일과 SHA-256 앞 16자리 일치(`7daf3f250492f5d0`·`1238f19628c89257`·`c466a657b831389c`) |
| 공개 `styles.css`의 카드 선택 색 규칙(`data-ls-card="WOS100"].rt-pg-on`) | 1줄 확인 |
| 공개 `CLAUDE.md` | 404 |
| 공개 `docs/` | 404 |

## 로컬 검증 메모

- 단위 테스트 200개 통과(다크 블록 점검 포함), `build-product-index --check` 33개 통과, `e2e-smoke` 289/289 통과(카드 선택 색 확인 항목 새로 추가), 표기 통일 바뀔 곳 0건, `dark_tokens --check` 최신, `check-version` 0.257 → 0.258, `git diff --check` 통과.
- 라이트·다크 캡처는 `docs/qa/layout-sim-card-colors-0.258/`에 있습니다.
- 공개 사이트를 브라우저로 직접 열어 보는 시험은 이 환경의 프록시 인증서 때문에 하지 못해, 공개 파일 해시와 색 규칙 존재 여부로 확인했습니다.

## 남은 확인 사항

- 없음.
