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

## 0.16.0 — 세로 슬롯 판넬 좌우 끝 잘림

- 제보: XDM-20 출력 2에 FOS100 장착 시 "카드 좌우 끝이 미묘하게 잘려나가 있어"(휴대폰 스크린샷)
- 원인: `.rt-rack-photo .rt-rack-slot{border:1px solid …}`. 판넬 이미지는 테두리 안쪽(콘텐츠 영역) 크기로 그려져, 416px 휴대폰에서 슬롯 23.2px 대비 판넬 21.2px(양쪽 1px씩 테두리가 덮음)였습니다.
- 수정: 사진 슬롯 `border:0; border-radius:0`, hover는 `outline:2px solid #76a2f6; outline-offset:-2px`. 수정 후 판넬 23.2×220.8px = 슬롯 23.2×220.8px.
- 검사: e2e에 "터치 휴대폰에서 세로 슬롯에 장착한 판넬이 슬롯을 꽉 채움" 추가(슬롯·판넬 크기·위치 차이 0.6px 미만).
- 되돌리기: `src/styles.css`의 `.rt-rack-photo .rt-rack-slot`·`:hover` 두 줄을 이전 값으로 돌립니다.
