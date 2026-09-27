# 매트릭스 구성기 Analog Way 글래스 개편 — QA (0.37.0)

캡처: `docs/qa/configurator-aw-glass-screens/before/`(작업 전, 커밋 `6ace38d` 기준) · `docs/qa/configurator-aw-glass-screens/after/`(작업 후). 1280px·390px 두 폭.

## 1. 단계별 전후 비교

| 단계 | 1280px 전 | 1280px 후 | 390px 전 | 390px 후 |
|---|---|---|---|---|
| 01 제품군 | `before/01-family-1280.png` | `after/01-family-1280.png` | `before/01-family-390.png` | `after/01-family-390.png` |
| 02 섀시 | `before/02-chassis-1280.png` | `after/02-chassis-1280.png` | `before/02-chassis-390.png` | `after/02-chassis-390.png` |
| 03 카드 슬롯(XDM-36, 빈) | `before/03-cards-xdm36-1280.png` | `after/03-cards-xdm36-1280.png` | `before/03-cards-xdm36-390.png` | `after/03-cards-xdm36-390.png` |
| 03 카드 슬롯(XDM-36, 부분 장착) | `before/03-cards-xdm36-partial-1280.png` | `after/03-cards-xdm36-partial-1280.png` | `before/03-cards-xdm36-partial-390.png` | `after/03-cards-xdm36-partial-390.png` |
| 03 카드 슬롯(XDM-144) | `before/03-cards-xdm144-1280.png` | `after/03-cards-xdm144-1280.png` | `before/03-cards-xdm144-390.png` | `after/03-cards-xdm144-390.png` |
| 03 카드 슬롯(SPX-M3236) | `before/03-cards-spx-m3236-1280.png` | `after/03-cards-spx-m3236-1280.png` | `before/03-cards-spx-m3236-390.png` | `after/03-cards-spx-m3236-390.png` |
| 03 카드 슬롯(VDM-16X) | `before/03-cards-vdm16x-1280.png` | `after/03-cards-vdm16x-1280.png` | `before/03-cards-vdm16x-390.png` | `after/03-cards-vdm16x-390.png` |
| 04 전송기 | `before/04-extenders-1280.png` | `after/04-extenders-1280.png` | `before/04-extenders-390.png` | `after/04-extenders-390.png` |
| 05 구성 검토 | `before/05-review-1280.png` | `after/05-review-1280.png` | `before/05-review-390.png` | `after/05-review-390.png` |
| 06 내보내기 | `before/06-export-1280.png` | `after/06-export-1280.png` | `before/06-export-390.png` | `after/06-export-390.png` |

**바뀐 점(after 캡처로 확인)**: 단계 탭이 밑줄형(완료 ✓ + 파란 밑줄, 현재 파란 원)으로 바뀌었고, 01·02는 왼쪽 목록 + 오른쪽 고정 미리보기 구조가 됐습니다. 03은 빈 슬롯이 흰 배경(회색 테두리)이고, 카드를 넣지 않은 슬롯에 더 이상 블랭크 그림이 자동으로 씌워지지 않습니다(전: 전부 어두운 블랭크 그림 / 후: 전부 흰 빈칸). 범례·채우기 줄·완성도 막대가 새로 생겼습니다. 옛 큰 제목 블록("DESIGN TOOL · MATRIX")이 사라지고 머리 막대에 흡수됐습니다.

## 2. 390px 가로 스크롤 · 콘솔 오류

`node scripts/e2e-smoke.cjs` 결과(72/72)에 다음 확인이 포함됩니다:
- `390px 화면에서 페이지 가로 넘침 없음` — PASS (`document.documentElement.scrollWidth - innerWidth === 0`)
- `자바스크립트 오류 없음`(`pageerror` 기준) — PASS, 0건
- 참고: 스크린샷 스크립트(`/tmp/shot.js`, 저장소에는 없음)로 콘솔 `error` 레벨 메시지까지 넓게 잡아보면 1280px 세션 전체에서 `/favicon.ico` 404(브라우저 기본 동작) 1건이 찍히는데, **작업 전(before) 캡처에서도 동일하게 발생**해 이번 작업과 무관한 것으로 확인했습니다(`docs/qa/configurator-aw-glass-screens/{before,after}/_meta.json` 대조).

## 3. 0.14–0.18 모바일 버그 재확인

`docs/qa/MOBILE_BACK_AND_SLOTS_QA.md` 항목과 대조해 `scripts/e2e-smoke.cjs`의 다음 검사로 재확인했습니다(전부 PASS, 72/72 안에 포함):

| 버그(버전) | 재확인 검사 | 결과 |
|---|---|---|
| 슬롯 겹침(0.14) | `터치 휴대폰에서 SPX-M3236 입력 슬롯 4개가 겹치지 않고 사진이 화면 폭 안에 들어감` | PASS |
| 뒤로가기 동작(0.14) | `뒤로가기·앞으로가기로 이전·다음 단계를 오가며 주소는 바뀌지 않음` | PASS |
| VDM 전면 도면 슬롯 겹침(0.15) | VDM-16X·VDM-256X 03단계 슬롯 렌더 검사(겹침 없이 카드 장착) | PASS |
| 사진 슬롯 판넬 잘림(0.16) | `터치 휴대폰에서 세로 슬롯에 장착한 판넬이 슬롯을 꽉 채움(좌우 끝 잘림 없음)` | PASS |
| 장착 슬롯 번호표 숨김(0.17) | `장착한 카드 판넬 위의 슬롯 번호표는 숨겨져 첫 포트를 가리지 않음(빈 슬롯 번호표는 표시)` — 이번에 "블랭크"에서 "빈 슬롯"으로 대상을 바꿨을 뿐 동일한 opacity 규칙을 재확인 | PASS |
| XDM 판넬 손나사 잘림(0.18) | 이번 작업은 `output/design/assets/cards/*.webp` 이미지 파일을 전혀 건드리지 않았습니다(`git status`로 확인). 크롭은 자산 파일 자체의 문제였고 자산을 바꾸지 않았으므로 회귀 없음 | 해당 없음(자산 미변경으로 안전) |

## 4. 제품정보 화면(#products) 비교 — 건드리지 않았음을 확인

`before/products-hd-210u-*.png` vs `after/products-hd-210u-*.png`, `before/products-xdm-*.png` vs `after/products-xdm-*.png`를 픽셀 단위로 비교했습니다(Pillow로 같은 크기의 두 PNG를 픽셀별로 대조).

| 캡처 | 크기 일치 | 다른 픽셀 비율 |
|---|---|---|
| products-hd-210u-1280 | 예 | 0.146% |
| products-hd-210u-390 | 예 | 0.034% |
| products-xdm-1280 | 예 | 0.230% |
| products-xdm-390 | 예 | 0.031% |

다른 픽셀은 전부 머리 막대의 버전 표기 한 줄(`CATALOG BASED · 0.36` → `0.37`, 두 페이지에서 정확히 같은 픽셀 수 5097/550이 다름)에서 나왔습니다 — 제품정보 화면 자체(`.rt-products-view` 안쪽)는 이번 작업으로 바뀌지 않았습니다. `src/products.js`는 이번 세션에서 전혀 수정하지 않았습니다(`git status` 확인).

## 5. 새 e2e 시나리오(§5 요구)

- 흰 빈칸 → 팝업에서 BLANK 선택 → 저장·새로고침 복원: `팝업에서 블랭크 커버를 고르면 그 슬롯만 블랭크 판넬로 바뀜` + `블랭크 선택은 새로고침 후에도 복원됨`
- "남은 칸 블랭크로 채우기" → 완성 배너 → 실행 취소 시 되돌아감: `"남은 칸 블랭크로 채우기"는 빈 슬롯만 블랭크로 바꾸고 이미 넣은 카드는 그대로 둠` + `모든 슬롯을 채우면 완성 배너와 "선택 완료" 다음 버튼이 표시됨` + `실행 취소 1번으로 "채우기"가 통째로 되돌아감`
- 제품군 변경 시 초기화: `제품군을 바꾸면 카드·전송기 선택이 초기화됨`
- XDM-36·XDM-144·SPX-M3236·VDM-16X 03단계 캡처(1280·390): 위 1절 표에 모두 포함

## 6. 결과 요약

- `node --test tests/*.test.cjs`: 37/37
- `node scripts/build-product-index.cjs --check`: 27개
- `node scripts/package-site.cjs`: 통과
- `node scripts/e2e-smoke.cjs`: **72/72**(기존 61 + 신규 11)
- `git diff --check`: 통과(공백 오류 없음)

## Opus 검수 (2026-09-27, 0.37.0 반영 직후)

| 항목 | 결과 |
|---|---|
| `node --test` | 37/37 통과 |
| `build-product-index --check` | 27종 통과 |
| e2e(전역 playwright) | 73/73 통과(0.36 HD-104U 옛 주소 검사 포함, 병합 후 재실행) |
| `git diff --check` | 통과 |
| 단계 탭 | 실제 화면(1280·390px)은 밑줄형으로 정상입니다. `after/02·03·04·01-390` 캡처에 보이는 현재 단계의 파란 덩어리는 화면이 바뀌는 도중(전환 효과)에 찍힌 것입니다. 기능 문제는 아닙니다. |
| 주황 제거 | `src/`에 `#f4a46b`·`#bd591d`가 주석 말고는 남아 있지 않음을 확인했습니다. 원인이던 `applyDesign()` 제거도 확인했습니다. |
| 블랭크 커버 | XDM-12에서 카드 1장 + "남은 칸 블랭크로 채우기"를 누른 뒤 새로고침하면 블랭크 5개가 그대로 복원됩니다. 저장값에는 `"BLANK"`가 들어 있습니다. |
| 인쇄 보고서 | **수정**: 슬롯 표에 블랭크 슬롯이 빠져 있었습니다(BOM에는 수량만 표시). 이제 "블랭크 커버 · 0채널" 행으로 표시합니다. |
| 04 전송기 편차 | 승인 시안(왼쪽 목록 + 오른쪽 연결 흐름)과 다르게 기존 카드별 구조를 유지했습니다. 사용자 결정이 필요하므로 보고서에 선택지를 적었습니다. |
| 강조색 | 구성기의 주요 버튼·단계 탭은 기존 브랜드 파랑 `#3978ee`(주요 버튼은 파랑→보라 그라디언트)입니다. 제품정보 화면의 `#007AFF`와 약간 다르며, 통일 여부는 후속으로 남깁니다. |
