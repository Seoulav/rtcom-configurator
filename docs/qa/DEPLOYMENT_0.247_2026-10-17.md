# 0.247.0 배포 기록 (2026-10-17)

- PR: #387 "0.247.0: VDM 07 분할 화면 시뮬레이터 단계형 개선, 모듈 누락 시 다시 불러오기"
- 병합: squash, main `8ce1412` (`expectedHeadSha` ed99da8 고정, GitHub `RTCOM checks / verify` success)
- 경위: 첫 푸시(fc05164)의 검사가 실패했습니다. "고급 설정"을 펼친 직후 값을 바꾸면 펼침 상태 기록(toggle 이벤트)이 늦어 다시 그릴 때 접힌 채 그려지는 타이밍 문제였고(검사 서버에서만 드러남), 다시 그리기 직전에 실제 `open` 상태를 읽도록 고친 뒤 e2e를 3회 연속 통과시키고 다시 올려 검사 통과를 확인한 뒤 병합했습니다.
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 39032777687, success

## 공개 주소 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 표기 | `CATALOG BASED · 0.247` |
| 공개 `src/quad-view.js`·`vdm-wall.js`·`products.js`·`styles.css`·`index.html` | 빌드 산출물과 SHA-256 앞 12자리 일치(`0c4c18e900fd`·`541523c89140`·`37fbdf4a194e`·`901de9c99def`·`8113b1788431`) |
| 공개 `CLAUDE.md` | 404 |
| 공개 `docs/qa/` | 404 |

## 로컬 검증 메모

- 단위 테스트 180개 통과, `build-product-index --check` 33개 통과, `e2e-smoke` 281/281 통과(단계 구조·고급 설정 접힘·오래된 index.html 복구 시험 추가, 3회 연속), 표기 통일 바뀔 곳 0건, `check-version` 0.246 → 0.247 일치.
- 휴대폰 폭(416px) 화면으로 단계형 화면과, `index.html`에서 두 스크립트 태그를 지운 상태에서도 07이 채워지는 것을 확인했습니다.
