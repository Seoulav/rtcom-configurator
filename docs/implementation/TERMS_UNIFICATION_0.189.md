# 용어 통일 (0.189)

## 1. 근거
- ChatGPT Work 검수(2026-10-01): 0.188 화면 문구 5,070행 전체, 기준 26개, 후보 389행(확정 349·검토 40).
  - 원본 보관: `docs/audit/TERMS_REVIEW_2026-10-01_standard.csv`(기준표), `…_candidates.csv`(변경 후보), `…_decisions.md`(판단 필요 항목)
- Claude 대조: 후보 389행의 "현재 문구"·항목 경로가 0.188 원본과 모두 일치(불일치 0).

## 2. 사용자 결정(2026-10-01)과 적용 범위
| 기준 | 결정 | 처리 |
|---|---|---|
| T05 오디오 병합 → 삽입 | "병합 유지" | 미적용. 오히려 소수 표기 "삽입" 11곳(HDS-21U·HDS-42MU "추출·삽입", XDM-FT101 등)을 "병합"으로 맞춤 |
| T21 전송거리 | "전송 거리 띄어 쓰기" | 화면 문구 전체(약 39곳) 적용. `src/products.js` 사양 이름 찾기 규칙을 `/전송\s?거리/`로 변경. 사용자 지시 인용문·코드 주석은 원문 유지 |
| T10·T11 Splitter·Switcher·선택기 | "pass" | 미적용 |
| T24 모델명 축약 복원 | "pass" | 미적용 |
| 나머지 확정 기준(T01~T04, T07~T09, T12~T20, T22, T23, T25, T26) | ChatGPT 추천 채택 | 적용 207건 + 수작업 1건(XDM-HOS100 쿼드뷰) |

## 3. 적용하지 않은 확정 후보와 이유
- 구성기 `catalog.js`의 신호 키 `FIBER` 4곳(T07): 신호 배지 색·종류를 정하는 내부 값.
- `MODE 로터리` 짧은 이름표 3곳(T17, OBHD-2C·XDM-FT101 rotaryName, FT103-U-H Port Map 라벨): 로터리 그림·태그 안 글자 길이.
- OBUX-1C 개요 "추출(De-embedded)"(T06): "병합(Embedded)"과 짝이라 한쪽만 바꾸지 않음.
- 머리글 `series` 분류명의 `1x4` 등(T25): 영문 분류명 "pass" 결정과 같은 범위.
- 검토 판정 40행 전부: `docs/handoff/OPEN_ITEMS.md`로 넘김.

## 4. 함께 고친 테스트
- `tests/site.test.cjs` 0.157(SPX 비디오 월 배열 `2×2, 3×3, 3×4`: 0.157 "지금 표기 유지"는 배열 종류에 대한 결정이라 기호만 바뀜), 0.166(`4K/60 실효 전송 거리`), 0.180(`CATx 카드 전송 거리`, `최대 8×10 I/O`).
- `scripts/e2e-smoke.cjs` XDM-PSU Signal Flow 이름표 `TX · 송신기`·`RX · 수신기`.

## 5. 검증
- 기본 검증 명령 통과(단위 79, e2e 219/219), `unify_notation.cjs` 0건.

## 6. 되돌리기
- 이 PR의 squash 커밋을 revert한 뒤 `node scripts/build-product-index.cjs`. 저장 형식(schema 3)·LocalStorage 키·카드 ID·신호 키는 바뀌지 않았습니다.
