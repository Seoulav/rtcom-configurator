# 휴대폰 슬롯 겹침·뒤로가기 404 QA (0.14.0)

- 일시: 2026-09-26 · 환경: 로컬 build(`dist/`), Chromium(Playwright). 휴대폰 검사는 416×900, 배율 3, 터치(`isMobile`·`hasTouch`)

| 항목 | 결과 |
|---|---|
| `node --test tests/*.test.cjs` | 26/26 통과 (주소 변경 금지 테스트를 "`location.href` 유지 시 허용"으로 조정) |
| `node scripts/e2e-smoke.cjs` | 33/33 통과, 2회 반복 동일 |
| 수정 전 재현 | CSS 수정만 빼고 실행하면 새 휴대폰 검사가 실패(입력 슬롯 위치 -108~-64, -87~-43 … 겹침) → 수정 후 통과 |
| `git diff --check` | 통과 |

## 추가한 e2e 검사

1. 뒤로가기·앞으로가기로 이전·다음 단계를 오가며 주소는 바뀌지 않음 (XDM-12 카드 단계 → 섀시 → 카드)
2. 사이트 안의 없는 주소(`/rtcom-configurator/no-such-page/deep`)는 404.html이 구성기 첫 화면으로 보냄 (테스트 서버도 GitHub Pages처럼 404.html을 돌려줌)
3. 터치 휴대폰에서 SPX-M3236 입력 슬롯 4개가 겹치지 않고 사진이 화면 폭 안에 들어감
