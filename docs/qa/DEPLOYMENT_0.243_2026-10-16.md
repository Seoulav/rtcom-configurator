# 0.243.0 배포 기록 (2026-10-16)

- PR: #377 "0.243.0: QMS-88UX 쿼드 뷰·듀얼 입력 그룹 전환(Q1 입력 1~4, Q2 입력 5~8)"
- 병합: squash, main `c409558` (`expectedHeadSha` 74d0203 고정, GitHub `RTCOM checks / verify` success)
- 번호: 작업 중 다른 세션이 0.242.0(#371)을 먼저 병합해 0.242 → 0.243으로 다시 정함(`CHANGELOG.md`·`CLAUDE.md`·`index.html`·`README.md`·구현 문서 이름 정리)
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 38982634768, success

## 공개 주소 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 표기 | `CATALOG BASED · 0.243` |
| 공개 `src/products.js`·`src/styles.css` | 빌드 산출물과 SHA-256 앞 12자리 일치(`3cc3da7bbd5e`·`353ca7e6e826`), `data-layout-group-btn` 포함 |
| 공개 `CLAUDE.md` | 404 |
| 공개 `docs/qa/` | 404 |

## 로컬 검증 메모

- 단위 테스트 168개 통과, `build-product-index --check` 33개 통과, `e2e-smoke` 269/269 통과(Q1·Q2 전환 확인 1건 추가), 표기 통일 바뀔 곳 0건, `check-version` 0.242 → 0.243 일치.
