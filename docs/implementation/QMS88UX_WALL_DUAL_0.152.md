# 0.152.0 QMS-88UX 06 화면 구성 모드 WALL·DUAL 재검토

사용자 요청 2026-09-29: "QMS-88UX 06 화면 구성 모드에서 WALL·DUAL 도해를 재검토해 주세요. 매뉴얼에 도해가 없어 이름만 보고 그린 부분이 있습니다." 결과 보고 뒤 "추천하는대로 진행해줘".

## 자료

- 요청은 매뉴얼 KV.03 20~23쪽 기준이었으나 KV.03 원본(`.source-materials/`)이 작업 환경에 없어, 공개 폴더의 KV.04(`output/design/assets/docs/qms-88ux-manual.pdf`) 19~23·35·38쪽으로 대조했습니다. 0.147 문서에 적힌 KV.03 20~21쪽 도해 내용과 KV.04 20~21쪽은 같습니다.

## 비교표

| 모드 | 이전 화면 | 매뉴얼 KV.04 | 판정·조치 |
|---|---|---|---|
| WALL 도해 | 없음(아이콘·요약만) | 배치 도해 없음(19쪽은 터치 패널 화면) | 그대로 |
| WALL 요약 | 최대 3×3 비디오월, 베젤 조정 | 19쪽: 2×2 월 최대 2개, 월 1개면 최대 3×3 또는 2×5. 5쪽: Bezel 조정 | 요약 보완 |
| WALL 출력 포트 | 표기 없음 | 19쪽: 출력 9번을 월에 포함 가능. 35쪽 예시: 출력 5~10번 3×2 월 | 매뉴얼 안에서 다름 → OPEN_ITEMS |
| DUAL Horizontal PBP | 1·2 좌우 | 21쪽 Layout 5 | 일치 |
| DUAL Vertical PBP | 1·2 위아래 | 21쪽 Layout 6 | 일치 |
| DUAL Quad PBP, PIP | 큰 창 1·3, 작은 창 2·4 | 21쪽 Layout 7 | 일치 |
| DUAL 분류 | Layout 5~7을 듀얼로 묶음(0.90) | 20쪽 "8CH 멀티뷰 및 듀얼 디스플레이 설정"만 있고 듀얼 레이아웃을 따로 정의하지 않음 | 해석 유지(사용자 선택 "추천대로" = 방안 가) |
| DUAL 요약 | 한 화면 2분할(PBP)·PIP 구성 | Layout 7은 창 4개 | "2분할(PBP)·PIP 레이아웃"으로 정리 |

- 코드 주석이 말하던 "이름 뜻에 맞춰 만든 WALL·DUAL 도식"(`LAYOUT_SHAPES`의 2×2~FULL, PBP, PBP-FULL, PIP, USER MODE)은 QMS-44UX 데이터에서만 쓰입니다. 주석을 이 사실대로 고쳤습니다.
- 참고(바꾸지 않음): 21~22쪽의 User Mode 1)·2)·3)(RS-232C 전용 입력 레이어 13~15)과 23쪽 Output Option 3·6 배치는 화면에 그리지 않았습니다.

## 변경 파일

- `data/products/qms-88ux.json`: WALL `summary`·`page`(19), DUAL `summary`
- `src/products.js`: `LAYOUT_SHAPES` 위 주석만
- `scripts/e2e-smoke.cjs`: WALL 카드 문장·도해 칩 없음 확인 1건
- `docs/evidence/QMS_VIDEO_MODES.md`, `docs/handoff/OPEN_ITEMS.md`, 버전 표기(`index.html`·`README.md`·`CLAUDE.md`·`CHANGELOG.md`)

## 검증

단위 62/62, `build-product-index --check` 31종 통과, `package-site`, e2e 193/193(신규 1건), `git diff --check`. 화면: `docs/qa/qms88ux-wall-dual-0.152/`

## 되돌리기

병합 커밋을 되돌리면 이전 요약 문장으로 돌아갑니다. 저장 형식·주소·LocalStorage에는 영향이 없습니다.
