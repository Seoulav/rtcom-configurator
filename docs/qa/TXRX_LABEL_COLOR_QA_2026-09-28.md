# 송신기·수신기 라벨 색상 구분 QA (2026-09-28)

## 배경

사용자가 FT103-U-H/FR103-U 제품 상세 "02 PORT MAP"의 "송신기 FT103-U-H" 라벨(흰 배경 흰 카드 위 검은 글자)이 눈에 띄지 않는다며 색을 넣어 구분해 달라고 요청했습니다. 색상 기준을 확인한 결과 "송신기=파랑, 수신기=주황"으로 확정했습니다(구성기 슬롯 번호표의 입력 파랑(#007AFF)·출력 주황(#E8590C)과 같은 색).

## 영향 범위

`src/products.js`의 `portMapBlock()`이 `map.title`이 있을 때(송신기/수신기 사진이 짝으로 나오는 화면) 그리는 `<span class="rt-pg-on">` 라벨에, 제목이 "송신기"로 시작하면 `rt-pg-on-tx`, "수신기"로 시작하면 `rt-pg-on-rx` 클래스를 추가로 붙였습니다. 같은 `rt-pg-on` 클래스를 쓰는 "정면/후면" 전환 버튼(`<button>` 요소, `map.title`이 없는 화면)은 셀렉터가 `span.rt-pg-on-tx`/`span.rt-pg-on-rx`라 영향받지 않습니다.

`map.title`이 "송신기"/"수신기"로 시작하는 제품 9종(18곳):

- xdm-ft101-fr101, ft101-u-fr101-u, ft103-u-h-fr103-u
- ct101-u-cr101-u, ct103-u-h-cr103-u, ct104-u-cr104-u
- obux-1c, obhd-2c, spx-rx-tx

## 검증

```
node --test tests/*.test.cjs                    # 41/41 pass
node scripts/build-product-index.cjs --check    # 제품 30개 검증 통과
node scripts/package-site.cjs                   # dist/ 생성 성공
node scripts/e2e-smoke.cjs                       # 143/143 passed
git diff --check                                 # 공백 충돌 없음
```

로컬 서버 + Playwright로 FT103-U-H/FR103-U 상세 화면의 두 라벨을 각각 스크린샷으로 확인해, "송신기 FT103-U-H"는 파랑 배경·흰 글자, "수신기 FR103-U"는 주황 배경·흰 글자로 표시되는 것을 확인했습니다.

## 롤백 방법

이 커밋만 되돌리면 라벨이 흰 배경으로 복원됩니다(`git revert <commit>`). 스키마·호환성 계약 변경 없음(CSS·렌더링 클래스만 추가).
