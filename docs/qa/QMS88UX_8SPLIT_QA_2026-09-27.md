# QMS-88UX 출력 9번 "8분할(비율무시)" 추가 — QA (2026-09-27)

## 요청

사용자 요청: "qms88ux 출력9에 비율무시8분할도 추가해줘"

## 근거

`.source-materials/RTcom_Manual_QMS-88UX_KV.03.pdf` 22~23쪽:

- **Layout List**(1~12번, 기존 `videoModes.modes[QUAD].layouts` 12종): Q1(입력 1~4)·Q2(입력 5~8) 각 그룹 내부의 4분할 배치 방식.
- **Output Option List**(0~8번, 이번에 반영): 출력 9(M1)·10(M2)에서 Q1·Q2를 어떻게 배치할지 결정. 이 중 2번("한 화면에 Q1, Q2가 좌측-우측 순으로 동시에 출력, 8개로 나뉨")과 3번(상단-하단 순)은 화면 비율(16:9) 언급이 없는 8분할이고, 5번·6번은 같은 배치에 "16:9 비율"을 명시해 구분한다. 즉 2·3번이 "비율무시 8분할"에 해당한다(23쪽 예시 이미지에서도 5·6번만 "16:9 비율" 캡션이 붙음).

## 반영

- `data/products/qms-88ux.json`: QUAD 모드 `layouts` 배열 끝에 `"8분할(비율무시)"`을 추가(13번째 항목). `detail` 문장에 출력 옵션 근거(매뉴얼 22~23쪽 Output Option 2·3)를 덧붙임.
- `src/products.js`: `LAYOUT_SHAPES`에 `'8분할(비율무시)'` 키로 4×2(가로 4·세로 2) 균등 8칸 도해를 추가. 기존 "레이아웃" 칩·미리보기 클릭 메커니즘을 그대로 재사용(새 UI 코드 없음).
- 16:9 비율을 유지하는 변형(Output Option 5·6)은 이번 요청 범위 밖이라 추가하지 않음(필요하면 후속 요청으로 별도 처리).

## 검증

- `node --test tests/*.test.cjs`: 39/39 통과.
- `node scripts/build-product-index.cjs --check`: 29종 통과.
- `node scripts/package-site.cjs`: 성공.
- `node scripts/e2e-smoke.cjs`: 128/128 통과(신규 확인 1건 — QMS-88UX 06 화면 구성 모드에 "8분할(비율무시)" 칩이 있고 클릭 시 8칸 도해로 미리보기됨).
- Playwright 스크린샷(1280px)으로 칩 13개 정상 노출, 클릭 시 1~8 번호가 매겨진 4×2 격자 도해로 전환되는 것을 확인. 모바일(390px)에서 카드 가로 넘침 없음(scrollWidth-clientWidth === 0, 4개 카드 전부).

## 되돌리기

이번 커밋을 `git revert`. `layouts` 배열에서 마지막 항목만 제거하고 `detail` 문장을 이전 버전으로 되돌리면 즉시 원복됨(다른 데이터·코드와 결합 없음).
