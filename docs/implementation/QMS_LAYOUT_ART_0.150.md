# QMS-44UX·QMS-88UX 06 화면 구성 모드 분할 예시 그래픽 (0.150.0)

## 요청과 결정

- 2026-09-29 사용자: QMS-44UX 06 화면 구성 모드 캡처와 함께 "왜 랙마운트 형태의 그래픽 디자인이 아니지?" → "44,88모두 분할 부분구성 예시를 그래픽작업해달라는거야"
- 시안(`docs/qa/qms-layout-art/`) 확인 뒤 "메뉴얼을 기반으로 했다면 좋아"
- 처음에 잘못 이해해 만든 정면·후면 패널 그림(`scripts/tools/draw_qms_panels.cjs` 등)은 적용하지 않고 로컬 `git stash`에 보관했다(저장소에는 올리지 않음).

## 구현(`src/products.js` `layoutShapeSvg`, `src/styles.css`)

- 한 화면 분할(MATRIX 외 QUAD·DUAL 레이아웃): 200×134 모니터(베젤 `#1f2532`, 화면 188×106 ≈ 16:9, 스탠드). 칸 좌표(0~100)를 화면 크기로 늘려 입력 번호별 색(1 파랑·2 주황·3 초록·4 보라·5 빨강·6 청록·7 분홍·8 남색) 그라데이션으로 채우고 흰 번호를 올린다. 화면 바탕은 검정이라 칸이 덮지 않은 곳은 검은 여백.
- 비디오 월(WALL 카드의 레이아웃): 첫 칸 폭·높이로 열·행 수를 구해 16:9 디스플레이를 붙이고, 하늘·해·산 그림 한 장을 모든 화면에 걸쳐 클립해 베젤을 건너 이어지게 한다. 디스플레이마다 번호 배지.
- 미리보기 요소에 `data-layout-mode`(모드 이름)를 넘겨 레이아웃 버튼을 눌러도 같은 방식으로 다시 그린다.
- 칸 사각형에만 `rt-pg-cell` 클래스 → e2e 칸 수 검사 4곳을 이 클래스 기준으로 변경.

## 근거

- 칸 배치 변경 없음. QUAD: QMS-88UX 매뉴얼 KV.03/04 20~23쪽, QMS-44UX 매뉴얼 21~22쪽(0.146). WALL·DUAL: 매뉴얼에 도해가 없어 이름 뜻대로의 기존 도식.
- 색·모니터·풍경 그림은 이해를 돕는 장식이며 사양 값이 아니다.

## 검증

- `node --test tests/*.test.cjs` 62/62, `build-product-index --check` 31개, `package-site`, `e2e-smoke` 192/192, `git diff --check`
- 두 제품 레이아웃 41종 전체를 눌러 찍은 시안: `docs/qa/qms-layout-art/qms-44ux-layouts.png`, `qms-88ux-layouts.png`(main 0.147의 QMS-88UX 도해 재대조 반영 후 다시 찍음). 스크립트 오류 없음. main 0.147 e2e 검사(3-SIDE RIGHT 1번 폭 60·USER MODE 2 검은 여백)는 칸의 `data-w`와 화면 바탕의 `rt-pg-layout-letterbox` 클래스로 같은 뜻을 유지한다.

## 되돌리기

이 커밋의 `src/products.js`·`src/styles.css`·`scripts/e2e-smoke.cjs` 변경을 되돌리면 흰 칸 도식으로 돌아간다.
