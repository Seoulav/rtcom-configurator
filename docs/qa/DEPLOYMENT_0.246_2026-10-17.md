# 0.246.0 배포 기록 (2026-10-17)

- PR: #385 "0.246.0: VDM 비디오 월 시뮬레이터(W11·W21·B01·B02, 매뉴얼 85~88쪽)"
- 병합: squash, main `8112e7b` (`expectedHeadSha` 805473e 고정, GitHub `RTCOM checks / verify` success)
- 번호: main 0.245 + 1 (병합 직전 main 변경 없음)
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 39011335570, success

## 공개 주소 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 표기 | `CATALOG BASED · 0.246` |
| 공개 `src/vdm-wall.js`·`products.js`·`styles.css` | 빌드 산출물과 SHA-256 앞 12자리 일치(`783fdfc4b2d4`·`b95b2e9f2bc0`·`f615e1eb2985`), `index.html`에 `src/vdm-wall.js` 포함 |
| 공개 `CLAUDE.md` | 404 |
| 공개 `docs/qa/` | 404 |

## 로컬 검증 메모

- 단위 테스트 180개 통과, `build-product-index --check` 33개 통과, `e2e-smoke` 279/279 통과(탭 전환·프리셋 명령·베젤·AMX 구성 담기·256 초과 오류 3건 추가), 표기 통일 바뀔 곳 0건, `check-version` 0.245 → 0.246 일치.
- 알티컴 확인 대기: VDM 비디오 월 월 끄기 형식·3자리 번호·제품 ID 999/255(질문 30번, `docs/handoff/OPEN_ITEMS.md`).
