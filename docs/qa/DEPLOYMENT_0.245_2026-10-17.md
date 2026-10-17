# 0.245.0 배포 기록 (2026-10-17)

- PR: #383 "0.245.0: VDM-QOS4S-U 쿼드뷰 시뮬레이터, QMS 쿼드 뷰 칸 번호 안내, XDM 시뮬레이터 처음 화면 HOS100"
- 병합: squash, main `3740012` (`expectedHeadSha` 2272fa6 고정, GitHub `RTCOM checks / verify` success)
- 번호: 작업 중 main이 0.242(#371)·0.243(#377)·0.244(#378)로 올라가 0.244 → 0.245로 다시 정함
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 39001923501, success

## 공개 주소 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 표기 | `CATALOG BASED · 0.245` |
| 공개 `src/quad-view.js`·`layout-sim.js`·`products.js`·`app.js`·`styles.css` | 빌드 산출물과 SHA-256 앞 12자리 일치(`096817d8113a`·`68153c863c83`·`b3545bc1b6ad`·`02230697e671`·`ca562a5ff391`) |
| 공개 `CLAUDE.md` | 404 |
| 공개 `docs/qa/` | 404 |

## 로컬 검증 메모

- 단위 테스트 175개 통과, `build-product-index --check` 33개 통과, `e2e-smoke` 276/276 통과, 표기 통일 바뀔 곳 0건, `check-version` 0.244 → 0.245 일치.
- 알티컴 확인 대기: VDM-QOS4S-U C1~C4와 카드 출력 포트 대응, `OQ` 출력 번호의 뜻(질문 29번, `docs/handoff/OPEN_ITEMS.md`).
